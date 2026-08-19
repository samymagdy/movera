import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import sharp, { type Metadata as SharpMetadata } from "sharp";
import { z } from "zod";
import type { ContentItem, Locale, MediaVariant } from "@company/contracts";
import { createCareerApplication, createContactSubmission, createNewsletterSubmission, ensureCEOMessage, findBySlug, permanentlyDeleteTrashItems, publicCollections, readPublicSite, readSite, reorderItem, restoreTrashItem, searchSite, trashItem, upsertItem, writeSite } from "./store";
import { ADMIN_ROLES, adminPublicUser, audit, ensureAdminBootstrap, hashPassword, login, logout, prisma, requireAdmin } from "./adminAuth";
import { componentInventory, forwardNewsletter, publicIntegrationSettings, publicRecaptchaSettings, sendSmtpTest, testNewsletterConnection, testRedisConnection, updateIntegrationSettings, verifyRecaptcha } from "./adminIntegrations";
import { invalidatePublicSiteCache } from "./cache";

const app = Fastify({ logger: true, bodyLimit: 1_000_000 });
const port = Number(process.env.API_PORT || 4000);
const storageRoot = process.env.STORAGE_ROOT || path.resolve(__dirname, "../../../storage");
const origins = [process.env.WEB_ORIGIN || "http://localhost:3000", process.env.ADMIN_ORIGIN || "http://localhost:3001"];
const localHostnames = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
const uploadMaxBytes = 32 * 1024 * 1024;
const uploadMaxPixels = 100_000_000;
const uploadMaxDimension = 2400;
const uploadVariantWidths = [320, 640, 960, 1280, 1920, uploadMaxDimension];
const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
function isAllowedOrigin(origin?: string) {
  if (!origin) return true;
  try {
    const requested = new URL(origin);
    return origins.some(configured => {
      const expected = new URL(configured);
      if (requested.protocol !== expected.protocol || requested.port !== expected.port) return false;
      if (requested.hostname === expected.hostname) return true;
      return localHostnames.has(requested.hostname) && localHostnames.has(expected.hostname);
    });
  } catch {
    return false;
  }
}
const locales = ["en", "ar", "fr", "nl"] as const;
const localized = z.object({ en: z.string(), ar: z.string(), fr: z.string(), nl: z.string() });
const mediaUrl = z.string().refine(value => value.startsWith("/") && !value.startsWith("//"), "Media must be served locally");
const mediaVariantSchema = z.object({ url: mediaUrl, width: z.number().int().positive(), height: z.number().int().positive(), mimeType: z.string().optional(), sizeBytes: z.number().int().nonnegative().optional() });
const mediaSchema = z.object({ id: z.string(), url: mediaUrl, alt: localized, caption: localized.optional(), credit: z.string().optional(), focalX: z.number().optional(), focalY: z.number().optional(), zoom: z.number().optional(), width: z.number().int().positive().optional(), height: z.number().int().positive().optional(), mimeType: z.string().optional(), sizeBytes: z.number().int().nonnegative().optional(), variants: z.array(mediaVariantSchema).optional() });
const documentSchema = z.object({ id: z.string(), name: z.string(), url: z.string().url(), mimeType: z.string().optional() });
const aboutSectionSchema = z.object({ id: z.string(), eyebrow: localized.optional(), title: localized, body: localized, bullets: z.array(localized).optional(), media: mediaSchema.optional() });
const timelineEntrySchema = z.object({ id: z.string(), label: localized, title: localized, body: localized, media: mediaSchema.optional() });
const leadershipProfileSchema = z.object({ id: z.string(), name: localized, role: localized, summary: localized, portrait: mediaSchema.optional() });
const credentialSchema = z.object({ id: z.string(), title: localized, issuer: localized, description: localized, media: mediaSchema.optional() });
const itemSchema = z.object({
  id: z.string().optional(), slug: localized.optional(), title: localized.optional(), summary: localized.optional(), body: localized.optional(),
  category: z.string().optional(), date: z.string().optional(), featured: z.boolean().optional(), client: z.string().optional(), sector: z.string().optional(), icon: z.string().optional(),
  region: z.enum(["hub-a", "hub-b", "hub-c"]).optional(), videos: z.array(z.string().url()).optional(), documents: z.array(documentSchema).optional(), cover: mediaSchema.optional(), gallery: z.array(mediaSchema).optional(), relatedIds: z.array(z.string()).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(), displayOrder: z.number().optional(), tags: z.array(z.string()).optional(), aboutLayout: z.enum(["story", "timeline", "vision", "leadership", "certificates"]).optional(), sections: z.array(aboutSectionSchema).optional(), timeline: z.array(timelineEntrySchema).optional(), profiles: z.array(leadershipProfileSchema).optional(), credentials: z.array(credentialSchema).optional(),
  seo: z.object({ title: localized, description: localized, keywords: localized }).optional(),
});
const ceoMessageSchema = z.object({ slug: z.string(), title: localized, name: localized, position: localized, message: z.array(localized).min(1), pullQuote: localized.optional(), portrait: mediaSchema, seo: z.object({ title: localized, description: localized, keywords: localized }), status: z.enum(["draft", "published"]).optional() });
const assistantSchema = z.object({ label: localized, icon: mediaSchema });
const brandSchema = z.object({ logo: mediaSchema.optional(), logoLight: mediaSchema.optional(), logoDark: mediaSchema.optional(), mark: mediaSchema, markLight: mediaSchema.optional(), markDark: mediaSchema.optional(), wordmark: mediaSchema, wordmarkLight: mediaSchema.optional(), wordmarkDark: mediaSchema.optional(), wordmarkText: localized, aiLabel: localized, aiEnabled: z.boolean() });
const socialUrl = z.string().trim().max(500).refine(value => value === "" || /^https?:\/\//i.test(value), "Social links must use http:// or https://");
const footerSchema = z.object({ contactLabel: localized, locationLabel: localized, workingHoursLabel: localized, phone: z.string().max(80), email: z.string().email().max(240), address: localized, hours: localized, socialLinks: z.object({ facebook: socialUrl, instagram: socialUrl, youtube: socialUrl, linkedin: socialUrl }) });
const appearanceSchema = z.object({ defaultTheme: z.enum(["dark", "light"]) });
const homepageBandSchema = z.object({ id: z.enum(["locations", "news", "products", "projects", "careers", "customers"]), visible: z.boolean(), itemIds: z.array(z.string().min(1)).max(100), eyebrow: localized, title: localized, body: localized, viewLabel: localized });
const homepageSchema = z.object({
  hero: z.object({ eyebrow: localized, title: localized, description: localized, primaryLabel: localized, primaryHref: z.string().min(1).max(500), secondaryLabel: localized, secondaryHref: z.string().min(1).max(500), background: mediaSchema }),
  intro: z.object({ title: localized, body: localized }),
  stats: z.array(z.object({ value: z.string().max(80), label: localized })).max(12),
  featuredServices: z.array(z.string().min(1)).max(100),
  featuredProjects: z.array(z.string().min(1)).max(100),
  latestNews: z.array(z.string().min(1)).max(100),
  bands: z.array(homepageBandSchema).max(10),
  cta: z.object({ title: localized, body: localized, label: localized, href: z.string().min(1).max(500) }),
});
const contactSchema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().email().max(180), phone: z.string().max(50).optional(), company: z.string().max(120).optional(), subject: z.string().trim().min(2).max(180), message: z.string().trim().min(10).max(5000), locale: z.enum(locales), privacy: z.literal(true), honeypot: z.string().max(0).optional(), recaptchaToken: z.string().max(4000).optional() });
const newsletterSchema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().email().max(180), locale: z.enum(locales), consent: z.literal(true), source: z.string().max(80).default("website"), recaptchaToken: z.string().max(4000).optional() });
const protectedPathSchema = z.enum(["homepage", "contact", "newsletter", "careers", "chat"]);
const integrationSettingsSchema = z.object({
  smtp: z.object({ host: z.string().max(240).optional(), port: z.number().int().min(1).max(65535).optional(), secure: z.boolean().optional(), username: z.string().max(240).optional(), password: z.string().max(500).optional(), senderName: z.string().max(160).optional(), senderEmail: z.string().email().max(240).optional(), testRecipient: z.string().email().max(240).optional(), clearPassword: z.boolean().optional() }).partial().optional(),
  newsletter: z.object({ enabled: z.boolean().optional(), provider: z.string().max(80).optional(), endpoint: z.string().url().max(1000).optional(), listId: z.string().max(180).optional(), apiKey: z.string().max(500).optional(), clearApiKey: z.boolean().optional() }).partial().optional(),
  recaptcha: z.object({ enabled: z.boolean().optional(), siteKey: z.string().max(300).optional(), secretKey: z.string().max(500).optional(), protectedPaths: z.array(protectedPathSchema).max(5).optional(), clearSecretKey: z.boolean().optional() }).partial().optional(),
  redis: z.object({ enabled: z.boolean().optional(), url: z.string().max(1000).optional(), username: z.string().max(240).optional(), password: z.string().max(500).optional(), database: z.number().int().min(0).max(255).optional(), clearPassword: z.boolean().optional() }).partial().optional(),
});
const collectionType = (value: string): value is ContentItem["type"] => publicCollections.includes(value as ContentItem["type"]);

async function start() {
  await ensureCEOMessage();
  await ensureAdminBootstrap();
  await app.register(cors, { origin: (origin, cb) => cb(null, isAllowedOrigin(origin)), credentials: true });
  await app.register(rateLimit, { global: false, hook: "onRequest", errorResponseBuilder: (_request, context) => ({ statusCode: context.statusCode, ok: false, error: { code: "RATE_LIMITED" }, retryAfter: context.after }) });
  await app.register(multipart, { limits: { fileSize: uploadMaxBytes, files: 1, fields: 12 } });
  await app.register(fastifyStatic, {
    root: path.join(storageRoot, "uploads"),
    prefix: "/uploads/",
    setHeaders: response => {
      response.header("Cache-Control", "public, max-age=31536000, immutable");
    },
  });
  app.addHook("onSend", async (_request, reply) => { reply.header("X-Content-Type-Options", "nosniff"); reply.header("Referrer-Policy", "no-referrer"); reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()"); });

  app.get("/health", async () => ({ ok: true, data: { service: "company-api", database: "postgresql/prisma", timestamp: new Date().toISOString() } }));
  app.get("/api/v1/site", async () => ({ ok: true, data: await readPublicSite() }));
  app.get("/api/v1/public/security", async () => ({ ok: true, data: { recaptcha: await publicRecaptchaSettings() } }));

  app.post("/api/v1/admin/auth/login", { config: { rateLimit: { max: 10, timeWindow: "5 minutes" } } }, async (request, reply) => {
    const parsed = z.object({ email: z.string().email(), password: z.string().min(8).max(200) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR" } });
    const user = await login(parsed.data.email, parsed.data.password, reply);
    if (!user) return reply.code(401).send({ ok: false, error: { code: "INVALID_CREDENTIALS" } });
    await audit(user.id, "login", "session");
    return { ok: true, data: { user: adminPublicUser(user) } };
  });
  app.get("/api/v1/admin/auth/me", async (request, reply) => { const user = await requireAdmin(request, reply); return user ? { ok: true, data: { user: adminPublicUser(user) } } : undefined; });
  app.post("/api/v1/admin/auth/logout", async (request, reply) => { const user = await requireAdmin(request, reply); if (user) await audit(user.id, "logout", "session"); await logout(request, reply); return { ok: true }; });

  app.get("/api/v1/admin/site", async (request, reply) => { const user = await requireAdmin(request, reply); return user ? { ok: true, data: await readSite() } : undefined; });
  app.get("/api/v1/admin/ceo-message", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin", "Content Editor", "Publisher", "Viewer"]); if (!user) return undefined; const site = await readSite(); return site.ceoMessage ? { ok: true, data: site.ceoMessage } : reply.code(404).send({ ok: false, error: { code: "CEO_MESSAGE_NOT_FOUND" } }); });
  app.put("/api/v1/admin/ceo-message", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin", "Content Editor", "Publisher"]);
    if (!user) return undefined;
    const parsed = ceoMessageSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } });
    const site = await readSite();
    site.ceoMessage = parsed.data;
    await writeSite(site);
    await audit(user.id, "save-draft", "ceo-message", parsed.data.slug);
    return { ok: true, data: parsed.data };
  });
  app.patch("/api/v1/admin/ceo-message/status", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin", "Publisher"]);
    if (!user) return undefined;
    const parsed = z.object({ status: z.enum(["draft", "published"]) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR" } });
    const site = await readSite();
    if (!site.ceoMessage) return reply.code(404).send({ ok: false, error: { code: "CEO_MESSAGE_NOT_FOUND" } });
    site.ceoMessage = { ...site.ceoMessage, status: parsed.data.status };
    await writeSite(site);
    await audit(user.id, parsed.data.status === "published" ? "publish" : "restore", "ceo-message", site.ceoMessage.slug);
    return { ok: true, data: site.ceoMessage };
  });
  app.get("/api/v1/admin/settings/assistant", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin", "Content Editor", "Publisher", "Viewer"]); if (!user) return undefined; return { ok: true, data: (await readSite()).assistant }; });
  app.put("/api/v1/admin/settings/assistant", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin"]);
    if (!user) return undefined;
    const parsed = assistantSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } });
    const site = await readSite();
    site.assistant = parsed.data;
    await writeSite(site);
    await audit(user.id, "update", "assistant-settings", parsed.data.icon.id);
    return { ok: true, data: site.assistant };
  });
  app.get("/api/v1/admin/settings/brand", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin", "Content Editor", "Publisher", "Viewer"]); if (!user) return undefined; return { ok: true, data: (await readSite()).brand }; });
  app.put("/api/v1/admin/settings/brand", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin"]);
    if (!user) return undefined;
    const parsed = brandSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } });
    const site = await readSite();
    site.brand = parsed.data;
    await writeSite(site);
    await audit(user.id, "update", "brand-settings", parsed.data.logo?.id || parsed.data.mark.id);
    return { ok: true, data: site.brand };
  });
  app.get("/api/v1/admin/settings/footer", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin", "Content Editor", "Publisher", "Viewer"]); if (!user) return undefined; return { ok: true, data: (await readSite()).footer }; });
  app.put("/api/v1/admin/settings/footer", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin"]);
    if (!user) return undefined;
    const parsed = footerSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } });
    const site = await readSite();
    site.footer = parsed.data;
    await writeSite(site);
    await audit(user.id, "update", "footer-settings", "social-links");
    return { ok: true, data: site.footer };
  });
  app.get("/api/v1/admin/settings/appearance", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin", "Content Editor", "Publisher", "Viewer"]); if (!user) return undefined; return { ok: true, data: (await readSite()).appearance }; });
  app.put("/api/v1/admin/settings/appearance", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin"]);
    if (!user) return undefined;
    const parsed = appearanceSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } });
    const site = await readSite();
    site.appearance = parsed.data;
    await writeSite(site);
    await audit(user.id, "update", "appearance-settings", parsed.data.defaultTheme);
    return { ok: true, data: site.appearance };
  });
  app.get("/api/v1/admin/content/:type", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin", "Content Editor", "Publisher", "Viewer"]);
    if (!user) return undefined;
    const type = (request.params as { type: string }).type;
    if (!collectionType(type)) return reply.code(400).send({ ok: false, error: { code: "UNKNOWN_CONTENT_TYPE" } });
    return { ok: true, data: (await readSite())[type] };
  });
  app.patch("/api/v1/admin/content/:type/:id/status", async (request, reply) => {
    const actor = await requireAdmin(request, reply, ["Super Admin", "Publisher"]);
    if (!actor) return undefined;
    const { type, id } = request.params as { type: string; id: string };
    if (!collectionType(type)) return reply.code(400).send({ ok: false, error: { code: "UNKNOWN_CONTENT_TYPE" } });
    if (type === "pages") return reply.code(409).send({ ok: false, error: { code: "PAGE_LIFECYCLE_LOCKED" } });
    const parsed = z.object({ status: z.enum(["draft", "published", "archived"]) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR" } });
    const site = await readSite();
    const current = site[type].find(item => item.id === id);
    if (!current) return reply.code(404).send({ ok: false, error: { code: "CONTENT_NOT_FOUND" } });
    const updated = await upsertItem(type, { ...current, status: parsed.data.status });
    await audit(actor.id, parsed.data.status === "published" ? "publish" : parsed.data.status === "archived" ? "archive" : "restore", type, id, { newsBar: type === "news" });
    return { ok: true, data: updated };
  });
  app.get("/api/v1/admin/audit", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin", "User Manager", "Viewer"]);
    if (!user) return undefined;
    const rows = await prisma.adminAuditEvent.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { name: true, email: true } } } });
    return { ok: true, data: rows };
  });
  app.get("/api/v1/admin/trash", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin"]);
    if (!user) return undefined;
    const trash = [...((await readSite()).trash || [])].sort((left, right) => right.deletedAt.localeCompare(left.deletedAt));
    return { ok: true, data: trash };
  });
  app.post("/api/v1/admin/trash/:type/:id/restore", async (request, reply) => {
    const actor = await requireAdmin(request, reply, ["Super Admin"]);
    if (!actor) return undefined;
    const { type, id } = request.params as { type: string; id: string };
    if (!collectionType(type) || type === "pages") return reply.code(409).send({ ok: false, error: { code: "TRASH_RESTORE_NOT_ALLOWED" } });
    const restored = await restoreTrashItem(type, id);
    if (!restored) return reply.code(404).send({ ok: false, error: { code: "TRASH_ITEM_NOT_FOUND" } });
    await audit(actor.id, "restore", type, id, { from: "trash" });
    return { ok: true, data: restored };
  });
  app.delete("/api/v1/admin/trash/:type/:id", async (request, reply) => {
    const actor = await requireAdmin(request, reply, ["Super Admin"]);
    if (!actor) return undefined;
    const { type, id } = request.params as { type: string; id: string };
    if (!collectionType(type) || type === "pages") return reply.code(409).send({ ok: false, error: { code: "TRASH_DELETE_NOT_ALLOWED" } });
    const removed = await permanentlyDeleteTrashItems([`${type}:${id}`]);
    if (!removed.length) return reply.code(404).send({ ok: false, error: { code: "TRASH_ITEM_NOT_FOUND" } });
    await audit(actor.id, "delete-permanent", type, id, { from: "trash" });
    return { ok: true, data: { id } };
  });
  app.delete("/api/v1/admin/trash", async (request, reply) => {
    const actor = await requireAdmin(request, reply, ["Super Admin"]);
    if (!actor) return undefined;
    const parsed = z.object({ ids: z.array(z.string().min(1)).optional() }).safeParse(request.body || {});
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR" } });
    const removed = await permanentlyDeleteTrashItems(parsed.data.ids);
    await audit(actor.id, parsed.data.ids?.length ? "delete-permanent" : "empty-trash", "trash", "all", { count: removed.length });
    return { ok: true, data: { ids: removed.map(entry => entry.trashId), count: removed.length } };
  });
  app.get("/api/v1/admin/users", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin", "User Manager", "Viewer"]);
    if (!user) return undefined;
    const query = String((request.query as { q?: string }).q || "").toLowerCase();
    const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "desc" } });
    return { ok: true, data: users.filter(row => !query || `${row.name} ${row.email} ${row.role}`.toLowerCase().includes(query)).map(adminPublicUser), meta: { roles: ADMIN_ROLES } };
  });
  app.post("/api/v1/admin/users", async (request, reply) => {
    const actor = await requireAdmin(request, reply, ["Super Admin", "User Manager"]);
    if (!actor) return undefined;
    const parsed = z.object({ name: z.string().trim().min(2).max(120), email: z.string().email(), password: z.string().min(12).max(200), role: z.enum(ADMIN_ROLES), forcePasswordReset: z.boolean().default(true) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } });
    const now = new Date().toISOString();
    try {
      const created = await prisma.adminUser.create({ data: { id: randomUUID(), name: parsed.data.name, email: parsed.data.email.toLowerCase(), passwordHash: hashPassword(parsed.data.password), role: parsed.data.role, forcePasswordReset: parsed.data.forcePasswordReset, active: true, createdAt: now, updatedAt: now } });
      await audit(actor.id, "create", "admin-user", created.id, { role: created.role });
      return { ok: true, data: adminPublicUser(created) };
    } catch { return reply.code(409).send({ ok: false, error: { code: "USER_ALREADY_EXISTS" } }); }
  });
  app.patch("/api/v1/admin/users/:id", async (request, reply) => {
    const actor = await requireAdmin(request, reply, ["Super Admin", "User Manager"]);
    if (!actor) return undefined;
    const { id } = request.params as { id: string };
    const parsed = z.object({ active: z.boolean().optional(), role: z.enum(ADMIN_ROLES).optional(), forcePasswordReset: z.boolean().optional(), password: z.string().min(12).max(200).optional() }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR" } });
    const existing = await prisma.adminUser.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ ok: false, error: { code: "USER_NOT_FOUND" } });
    if (existing.role === "Super Admin" && parsed.data.active === false && (await prisma.adminUser.count({ where: { role: "Super Admin", active: true } })) <= 1) return reply.code(400).send({ ok: false, error: { code: "LAST_SUPER_ADMIN" } });
    const updated = await prisma.adminUser.update({ where: { id }, data: { active: parsed.data.active, role: parsed.data.role, forcePasswordReset: parsed.data.forcePasswordReset, ...(parsed.data.password ? { passwordHash: hashPassword(parsed.data.password), forcePasswordReset: false } : {}), updatedAt: new Date().toISOString() } });
    await audit(actor.id, "update", "admin-user", id, { changed: Object.keys(parsed.data).filter(key => key !== "password") });
    return { ok: true, data: adminPublicUser(updated) };
  });
  app.get("/api/v1/admin/settings/identity", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin"]); if (!user) return undefined; const settings = await prisma.adminIdentitySettings.findUnique({ where: { id: "default" } }); return { ok: true, data: settings || { id: "default", localEnabled: true, entraEnabled: false } }; });
  app.put("/api/v1/admin/settings/identity", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin"]); if (!user) return undefined;
    const parsed = z.object({ localEnabled: z.boolean(), entraEnabled: z.boolean(), confirmation: z.literal(true) }).safeParse(request.body);
    if (!parsed.success || (!parsed.data.localEnabled && !parsed.data.entraEnabled)) return reply.code(400).send({ ok: false, error: { code: "ONE_PROVIDER_REQUIRED" } });
    const settings = await prisma.adminIdentitySettings.upsert({ where: { id: "default" }, update: { localEnabled: parsed.data.localEnabled, entraEnabled: parsed.data.entraEnabled, updatedAt: new Date().toISOString() }, create: { id: "default", localEnabled: parsed.data.localEnabled, entraEnabled: parsed.data.entraEnabled, updatedAt: new Date().toISOString() } });
    await audit(user.id, "update", "identity-settings", "default", { localEnabled: settings.localEnabled, entraEnabled: settings.entraEnabled });
    return { ok: true, data: settings };
  });
  app.get("/api/v1/admin/identities", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin", "User Manager", "Viewer"]); if (!user) return undefined; return { ok: true, data: await prisma.adminExternalIdentity.findMany({ orderBy: { createdAt: "desc" } }) }; });
  app.post("/api/v1/admin/identities", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin", "User Manager"]); if (!user) return undefined; const parsed = z.object({ providerId: z.string().min(1), email: z.string().email(), displayName: z.string().min(1), role: z.enum(ADMIN_ROLES) }).safeParse(request.body); if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR" } }); const now = new Date().toISOString(); const identity = await prisma.adminExternalIdentity.upsert({ where: { provider_providerId: { provider: "entra", providerId: parsed.data.providerId } }, update: { ...parsed.data, provider: "entra", enabled: true, updatedAt: now }, create: { id: randomUUID(), provider: "entra", ...parsed.data, enabled: true, createdAt: now, updatedAt: now } }); await audit(user.id, "add", "entra-identity", identity.id, { role: identity.role }); return { ok: true, data: identity }; });
  app.get("/api/v1/admin/settings/integrations", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin"]); if (!user) return undefined; return { ok: true, data: await publicIntegrationSettings() }; });
  app.put("/api/v1/admin/settings/integrations", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin"]); if (!user) return undefined;
    const parsed = integrationSettingsSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } });
    try { const settings = await updateIntegrationSettings(parsed.data as Parameters<typeof updateIntegrationSettings>[0]); await audit(user.id, "update", "integration-settings", "default", { smtp: Boolean(parsed.data.smtp), newsletter: Boolean(parsed.data.newsletter), recaptcha: Boolean(parsed.data.recaptcha), redis: Boolean(parsed.data.redis) }); return { ok: true, data: settings }; } catch (error) { request.log.error(error); return reply.code(503).send({ ok: false, error: { code: "INTEGRATION_SECRET_NOT_CONFIGURED" } }); }
  });
  app.post("/api/v1/admin/settings/integrations/smtp/test", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin"]); if (!user) return undefined; const parsed = z.object({ recipient: z.string().email().optional() }).safeParse(request.body || {}); if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR" } }); try { const result = await sendSmtpTest(parsed.data.recipient); await audit(user.id, "test", "smtp", "default", { recipient: result.recipient }); return { ok: true, data: { recipient: result.recipient } }; } catch (error) { request.log.warn(error); return reply.code(400).send({ ok: false, error: { code: "SMTP_TEST_FAILED" } }); } });
  app.post("/api/v1/admin/settings/integrations/newsletter/test", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin"]); if (!user) return undefined; const parsed = z.object({ recipient: z.string().email() }).safeParse(request.body || {}); if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR" } }); try { const result = await testNewsletterConnection(parsed.data.recipient); await audit(user.id, "test", "newsletter", "default", { recipient: parsed.data.recipient, result }); return { ok: true, data: { result } }; } catch (error) { request.log.warn(error); return reply.code(400).send({ ok: false, error: { code: "NEWSLETTER_TEST_FAILED" } }); } });
  app.post("/api/v1/admin/settings/integrations/redis/test", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin"]); if (!user) return undefined; try { const result = await testRedisConnection(); await audit(user.id, "test", "redis", "default", result); return { ok: true, data: result }; } catch (error) { request.log.warn(error); return reply.code(400).send({ ok: false, error: { code: "REDIS_TEST_FAILED" } }); } });
  app.post("/api/v1/admin/settings/cache/reset", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin"]); if (!user) return undefined; const deleted = await invalidatePublicSiteCache(); await audit(user.id, "reset", "public-site-cache", "default", { deleted }); return { ok: true, data: { cleared: deleted > 0, resetAt: new Date().toISOString() } }; });
  app.get("/api/v1/admin/system/components", async (request, reply) => { const user = await requireAdmin(request, reply, ["Super Admin"]); if (!user) return undefined; return { ok: true, data: await componentInventory() }; });

  app.get("/api/v1/content/:type", async request => {
    const type = (request.params as { type: string }).type;
    if (!collectionType(type)) return { ok: false, error: { code: "UNKNOWN_CONTENT_TYPE" } };
    const site = await readPublicSite();
    return { ok: true, data: site[type] };
  });
  app.get("/api/v1/content/:type/:slug", async request => {
    const { type, slug } = request.params as { type: string; slug: string };
    const locale = ((request.query as { locale?: string }).locale || "en") as Locale;
    if (!collectionType(type) || !locales.includes(locale)) return { ok: false, error: { code: "INVALID_ROUTE" } };
    const item = findBySlug(await readPublicSite(), type, slug, locale);
    return item ? { ok: true, data: item } : { ok: false, error: { code: "NOT_FOUND" } };
  });
  app.get("/api/v1/search", async request => {
    const query = request.query as { q?: string; locale?: string };
    const locale = (locales.includes(query.locale as Locale) ? query.locale : "en") as Locale;
    const results = searchSite(await readPublicSite(), query.q || "", locale);
    return { ok: true, data: results, meta: { query: query.q || "", locale, groups: publicCollections.filter(type => results.some(result => result.type === type)) } };
  });
  app.post("/api/v1/content/:type", async (request, reply) => {
    const type = (request.params as { type: string }).type;
    if (!collectionType(type)) return { ok: false, error: { code: "UNKNOWN_CONTENT_TYPE" } };
    const parsed = itemSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } });
    if (type === "pages" && parsed.data.status === "archived") return reply.code(409).send({ ok: false, error: { code: "PAGE_LIFECYCLE_LOCKED" } });
    const user = await requireAdmin(request, reply, ["Super Admin", "Content Editor", "Publisher"]);
    if (!user) return undefined;
    const data = await upsertItem(type, { ...parsed.data, status: parsed.data.status || "draft" });
    await audit(user.id, "save-draft", type, data.id);
    return { ok: true, data };
  });
  app.put("/api/v1/content/:type/:id", async (request, reply) => {
    const { type, id } = request.params as { type: string; id: string };
    if (!collectionType(type)) return { ok: false, error: { code: "UNKNOWN_CONTENT_TYPE" } };
    const parsed = itemSchema.safeParse({ ...(request.body as object), id });
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } });
    if (type === "pages" && parsed.data.status === "archived") return reply.code(409).send({ ok: false, error: { code: "PAGE_LIFECYCLE_LOCKED" } });
    const user = await requireAdmin(request, reply, ["Super Admin", "Content Editor", "Publisher"]);
    if (!user) return undefined;
    const data = await upsertItem(type, parsed.data);
    await audit(user.id, "save-draft", type, data.id);
    return { ok: true, data };
  });
  app.patch("/api/v1/content/:type/:id/order", async (request, reply) => {
    const { type, id } = request.params as { type: string; id: string };
    if (!collectionType(type)) return reply.code(400).send({ ok: false, error: { code: "UNKNOWN_CONTENT_TYPE" } });
    const parsed = z.object({ direction: z.enum(["up", "down"]) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR" } });
    const user = await requireAdmin(request, reply, ["Super Admin", "Content Editor", "Publisher"]);
    if (!user) return undefined;
    const result = await reorderItem(type, id, parsed.data.direction);
    if (!result) return reply.code(404).send({ ok: false, error: { code: "CONTENT_NOT_FOUND" } });
    await audit(user.id, "reorder", type, id, { direction: parsed.data.direction });
    return { ok: true, data: result };
  });
  app.delete("/api/v1/content/:type/:id", async (request, reply) => {
    const { type, id } = request.params as { type: string; id: string };
    if (!collectionType(type)) return { ok: false, error: { code: "UNKNOWN_CONTENT_TYPE" } };
    if (type === "pages") return reply.code(409).send({ ok: false, error: { code: "PAGE_LIFECYCLE_LOCKED" } });
    const user = await requireAdmin(request, reply, ["Super Admin"]);
    if (!user) return undefined;
    const entry = await trashItem(type, id, user.name);
    if (!entry) return reply.code(404).send({ ok: false, error: { code: "CONTENT_NOT_FOUND" } });
    await audit(user.id, "delete", type, id, { destination: "trash", trashId: entry.trashId });
    return { ok: true, data: entry };
  });
  app.put("/api/v1/homepage", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin", "Content Editor", "Publisher"]);
    if (!user) return undefined;
    const parsed = homepageSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } });
    const site = await readSite();
    site.homepage = parsed.data;
    await writeSite(site);
    await audit(user.id, "update", "homepage", "site", { bands: parsed.data.bands.map(band => ({ id: band.id, visible: band.visible, itemCount: band.itemIds.length })) });
    return { ok: true, data: site.homepage };
  });

  app.post("/api/v1/contact", { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } }, async (request, reply) => {
    const parsed = contactSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } });
    try { await verifyRecaptcha("contact", parsed.data.recaptchaToken, request.ip); } catch { return reply.code(400).send({ ok: false, error: { code: "RECAPTCHA_FAILED" } }); }
    const { privacy: _privacy, honeypot: _honeypot, recaptchaToken: _recaptchaToken, ...payload } = parsed.data;
    const saved = await createContactSubmission(payload);
    return { ok: true, data: { id: saved.id, status: saved.status } };
  });
  app.post("/api/v1/newsletter", { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } }, async (request, reply) => {
    const parsed = newsletterSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } });
    try { await verifyRecaptcha("newsletter", parsed.data.recaptchaToken, request.ip); } catch { return reply.code(400).send({ ok: false, error: { code: "RECAPTCHA_FAILED" } }); }
    const { consent: _consent, recaptchaToken: _recaptchaToken, ...payload } = parsed.data;
    const saved = await createNewsletterSubmission(payload);
    let integration = "not_configured";
    try { integration = await forwardNewsletter(payload); } catch (error) { request.log.warn(error); integration = "failed"; }
    return { ok: true, data: { id: saved.id, status: "captured", integration } };
  });
  app.post("/api/v1/careers/:jobId/apply", { config: { rateLimit: { max: 3, timeWindow: "10 minutes" } } }, async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const site = await readPublicSite();
    if (!site.jobs.some(item => item.id === jobId || Object.values(item.slug).includes(jobId))) return reply.code(404).send({ ok: false, error: { code: "JOB_NOT_FOUND" } });
    if (!String(request.headers["content-type"] || "").toLowerCase().startsWith("multipart/form-data")) return reply.code(415).send({ ok: false, error: { code: "MULTIPART_REQUIRED" } });
    const fields: Record<string, string> = {};
    let cvPath = "";
    let cvName = "";
    for await (const part of request.parts()) {
      if (part.type === "file") {
        const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowed.includes(part.mimetype)) return reply.code(400).send({ ok: false, error: { code: "INVALID_CV_TYPE" } });
        const safeName = part.filename.replace(/[^a-z0-9._-]+/gi, "-").slice(-120);
        const privateRoot = path.join(storageRoot, "private/cv");
        await fs.mkdir(privateRoot, { recursive: true });
        cvName = safeName;
        cvPath = path.join(privateRoot, `${randomUUID()}-${safeName}`);
        await fs.writeFile(cvPath, await part.toBuffer());
      } else fields[part.fieldname] = String(part.value || "");
    }
    const parsed = z.object({ name: z.string().trim().min(2).max(120), email: z.string().email().max(180), phone: z.string().max(50).optional(), coverNote: z.string().trim().min(10).max(5000), locale: z.enum(locales), recaptchaToken: z.string().max(4000).optional() }).safeParse(fields);
    if (!parsed.success || !cvPath) {
      if (cvPath) await fs.rm(cvPath, { force: true });
      return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR", details: parsed.success ? { cv: ["CV is required"] } : parsed.error.flatten() } });
    }
    try {
      await verifyRecaptcha("careers", parsed.data.recaptchaToken, request.ip);
    } catch {
      await fs.rm(cvPath, { force: true });
      return reply.code(400).send({ ok: false, error: { code: "RECAPTCHA_FAILED" } });
    }
    const { recaptchaToken: _recaptchaToken, ...careerPayload } = parsed.data;
    const saved = await createCareerApplication({ ...careerPayload, jobId, cvPath, cvName });
    return { ok: true, data: { id: saved.id, status: saved.status } };
  });

  app.post("/api/v1/chat", { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } }, async (request, reply) => {
    const parsed = z.object({ locale: z.enum(locales), message: z.string().min(1).max(500), recaptchaToken: z.string().max(4000).optional() }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ ok: false, error: { code: "VALIDATION_ERROR" } });
    try { await verifyRecaptcha("chat", parsed.data.recaptchaToken, request.ip); }
    catch { return reply.code(400).send({ ok: false, error: { code: "RECAPTCHA_FAILED" } }); }
    const site = await readPublicSite();
    const text = parsed.data.message.toLowerCase();
    const locale = parsed.data.locale;
    const service = site.services.find(item => text.includes(item.title[locale].toLowerCase().split(" ")[0]));
    const fallback = {
      en: "I can help you explore MOVERA services, Belgian mobility programmes, products, and perspectives. Ask what you want to understand.",
      ar: "يمكنني مساعدتك في استكشاف خدمات موفيرا وبرامج التنقل في بلجيكا ومنتجاتها ورؤاها. اسأل عمّا تريد فهمه.",
      fr: "Je peux vous guider dans les services, programmes belges, produits et points de vue de MOVERA. Dites-moi ce que vous cherchez à comprendre.",
      nl: "Ik help je wegwijs in MOVERA-diensten, Belgische mobiliteitsprogramma’s, producten en inzichten. Vertel wat je wilt begrijpen.",
    } satisfies Record<Locale, string>;
    const answer = service ? service.summary[locale] : fallback[locale];
    return { ok: true, data: { answer, links: service ? [`/${locale}/services/${service.slug[locale]}`] : [`/${locale}/services`, `/${locale}/projects`] } };
  });
  app.post("/api/v1/media", async (request, reply) => {
    const user = await requireAdmin(request, reply, ["Super Admin", "Content Editor", "Publisher"]);
    if (!user) return undefined;
    for await (const part of request.parts()) {
      if (part.type !== "file") continue;
      if (!allowedImageMimeTypes.has(part.mimetype)) return reply.code(400).send({ ok: false, error: { code: "INVALID_MEDIA_TYPE", message: "Upload a JPEG, PNG, WebP, GIF, or AVIF image." } });
      let sourceBuffer: Buffer;
      try {
        sourceBuffer = await part.toBuffer();
      } catch {
        return reply.code(413).send({ ok: false, error: { code: "MEDIA_TOO_LARGE", message: "The original image is larger than the 32 MB upload limit." } });
      }
      if (sourceBuffer.length > uploadMaxBytes) return reply.code(413).send({ ok: false, error: { code: "MEDIA_TOO_LARGE", message: "The original image is larger than the 32 MB upload limit." } });
      let sourceMetadata: SharpMetadata;
      try {
        sourceMetadata = await sharp(sourceBuffer, { limitInputPixels: uploadMaxPixels, failOn: "error" }).metadata();
      } catch {
        return reply.code(400).send({ ok: false, error: { code: "INVALID_MEDIA", message: "The uploaded file is not a readable raster image." } });
      }
      if (!sourceMetadata.width || !sourceMetadata.height || !sourceMetadata.format) return reply.code(400).send({ ok: false, error: { code: "INVALID_MEDIA", message: "The uploaded file has no readable image dimensions." } });
      if (sourceMetadata.width * sourceMetadata.height > uploadMaxPixels) return reply.code(413).send({ ok: false, error: { code: "MEDIA_TOO_LARGE", message: "The image contains too many pixels to process safely." } });
      const assetId = `media-${randomUUID()}`;
      const uploadRoot = path.join(storageRoot, "uploads");
      await fs.mkdir(uploadRoot, { recursive: true });
      const scale = Math.min(1, uploadMaxDimension / Math.max(sourceMetadata.width, sourceMetadata.height));
      const outputWidth = Math.max(1, Math.round(sourceMetadata.width * scale));
      const outputHeight = Math.max(1, Math.round(sourceMetadata.height * scale));
      const widths = [...new Set(uploadVariantWidths.map(width => Math.min(width, outputWidth)).filter(width => width > 0))].sort((a, b) => a - b);
      const variants: MediaVariant[] = [];
      const createdFiles: string[] = [];
      try {
        for (const width of widths) {
          const fileName = `${assetId}-${width}.webp`;
          const output = await sharp(sourceBuffer, { limitInputPixels: uploadMaxPixels, failOn: "error" })
            .rotate()
            .resize({ width, withoutEnlargement: true })
            .webp({ quality: width <= 640 ? 80 : 84, effort: 4, alphaQuality: 90 })
            .toBuffer({ resolveWithObject: true });
          await fs.writeFile(path.join(uploadRoot, fileName), output.data);
          createdFiles.push(fileName);
          variants.push({ url: `/uploads/${fileName}`, width: output.info.width, height: output.info.height, mimeType: "image/webp", sizeBytes: output.data.length });
        }
      } catch {
        await Promise.all(createdFiles.map(fileName => fs.rm(path.join(uploadRoot, fileName), { force: true })));
        return reply.code(400).send({ ok: false, error: { code: "MEDIA_PROCESSING_FAILED", message: "The image could not be optimized." } });
      }
      const full = variants[variants.length - 1];
      if (!full) return reply.code(400).send({ ok: false, error: { code: "MEDIA_PROCESSING_FAILED" } });
      const totalOutputBytes = variants.reduce((total, variant) => total + (variant.sizeBytes || 0), 0);
      await audit(user.id, "upload", "media", assetId, { sourceMimeType: part.mimetype, sourceBytes: sourceBuffer.length, sourceWidth: sourceMetadata.width, sourceHeight: sourceMetadata.height, outputBytes: totalOutputBytes, outputFormat: "webp", outputMaxDimension: uploadMaxDimension, variantWidths: variants.map(variant => variant.width) });
      return { ok: true, data: { id: assetId, url: full.url, width: full.width, height: full.height, mimeType: full.mimeType, sizeBytes: full.sizeBytes, variants } };
    }
    return { ok: false, error: { code: "NO_FILE" } };
  });

  await app.listen({ port, host: "0.0.0.0" });
}

start().catch(error => { app.log.error(error); process.exit(1); });
