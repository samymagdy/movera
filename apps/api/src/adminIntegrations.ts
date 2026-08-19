import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import nodemailer from "nodemailer";
import { createClient } from "redis";
import { prisma, hashPassword } from "./adminAuth";

const packageRequire = createRequire(__filename);
const SETTINGS_ID = "default";
const allowedProtectedPaths = ["homepage", "contact", "newsletter", "careers", "chat"] as const;
export type ProtectedPath = typeof allowedProtectedPaths[number];

function integrationKey() {
  const value = process.env.INTEGRATION_SECRET_KEY;
  if (!value) throw new Error("INTEGRATION_SECRET_KEY is not configured");
  return createHash("sha256").update(value).digest();
}

function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", integrationKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptSecret(value: string) {
  const [ivValue, tagValue, encryptedValue] = value.split(".");
  if (!ivValue || !tagValue || !encryptedValue) throw new Error("Invalid encrypted integration secret");
  const decipher = createDecipheriv("aes-256-gcm", integrationKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64url")), decipher.final()]).toString("utf8");
}

type SettingsRecord = Awaited<ReturnType<typeof readRecord>>;
async function readRecord() {
  return prisma.adminIntegrationSettings.findUnique({ where: { id: SETTINGS_ID } });
}

function protectedPaths(value?: string | null): ProtectedPath[] {
  try {
    const parsed = JSON.parse(value || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is ProtectedPath => allowedProtectedPaths.includes(item as ProtectedPath)) : [];
  } catch { return []; }
}

function safeConnectionUrl(value?: string | null) {
  if (!value) return "";
  try { const parsed = new URL(value); if (parsed.password) parsed.password = ""; return parsed.toString().replace(/:@/, "@"); } catch { return "configured"; }
}

export async function publicIntegrationSettings() {
  const row = await readRecord();
  return {
    smtp: { configured: Boolean(row?.smtpPasswordCiphertext || row?.smtpHost), host: row?.smtpHost || "", port: row?.smtpPort || 587, secure: row?.smtpSecure ?? true, username: row?.smtpUsername || "", senderName: row?.smtpSenderName || "", senderEmail: row?.smtpSenderEmail || "", testRecipient: row?.smtpTestRecipient || "", passwordConfigured: Boolean(row?.smtpPasswordHash) },
    newsletter: { enabled: row?.newsletterEnabled ?? false, provider: row?.newsletterProvider || "webhook", endpoint: row?.newsletterEndpoint || "", listId: row?.newsletterListId || "", apiKeyConfigured: Boolean(row?.newsletterApiKeyHash) },
    recaptcha: { enabled: row?.recaptchaEnabled ?? false, siteKey: row?.recaptchaSiteKey || "", protectedPaths: protectedPaths(row?.recaptchaProtectedPaths) },
    redis: { enabled: row?.redisEnabled ?? Boolean(process.env.REDIS_URL), configured: Boolean(row?.redisUrl || process.env.REDIS_URL), url: safeConnectionUrl(row?.redisUrl || process.env.REDIS_URL), username: row?.redisUsername || "", database: row?.redisDatabase ?? 0, passwordConfigured: Boolean(row?.redisPasswordHash || process.env.REDIS_URL?.match(/:\S+@/)) },
    updatedAt: row?.updatedAt || null,
  };
}

export async function publicRecaptchaSettings() {
  const row = await readRecord();
  return { enabled: row?.recaptchaEnabled ?? false, siteKey: row?.recaptchaSiteKey || "", protectedPaths: protectedPaths(row?.recaptchaProtectedPaths) };
}

export async function verifyRecaptcha(path: ProtectedPath, token?: string, remoteIp?: string) {
  const row = await readRecord();
  if (!row?.recaptchaEnabled || !protectedPaths(row.recaptchaProtectedPaths).includes(path)) return;
  if (!token || !row.recaptchaSecretCiphertext) throw new Error("RECAPTCHA_REQUIRED");
  const body = new URLSearchParams({ secret: decryptSecret(row.recaptchaSecretCiphertext), response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new Error("RECAPTCHA_UNAVAILABLE");
  const result = await response.json() as { success?: boolean };
  if (!result.success) throw new Error("RECAPTCHA_FAILED");
}

export async function updateIntegrationSettings(input: {
  smtp?: { host?: string; port?: number; secure?: boolean; username?: string; password?: string; senderName?: string; senderEmail?: string; testRecipient?: string; clearPassword?: boolean };
  newsletter?: { enabled?: boolean; provider?: string; endpoint?: string; listId?: string; apiKey?: string; clearApiKey?: boolean };
  recaptcha?: { enabled?: boolean; siteKey?: string; secretKey?: string; protectedPaths?: ProtectedPath[]; clearSecretKey?: boolean };
  redis?: { enabled?: boolean; url?: string; username?: string; password?: string; database?: number; clearPassword?: boolean };
}) {
  const existing = await readRecord();
  const now = new Date().toISOString();
  const smtp = input.smtp;
  const newsletter = input.newsletter;
  const recaptcha = input.recaptcha;
  const redis = input.redis;
  const data = {
    id: SETTINGS_ID,
    smtpHost: smtp?.host ?? existing?.smtpHost,
    smtpPort: smtp?.port ?? existing?.smtpPort ?? 587,
    smtpSecure: smtp?.secure ?? existing?.smtpSecure ?? true,
    smtpUsername: smtp?.username ?? existing?.smtpUsername,
    smtpSenderName: smtp?.senderName ?? existing?.smtpSenderName,
    smtpSenderEmail: smtp?.senderEmail ?? existing?.smtpSenderEmail,
    smtpTestRecipient: smtp?.testRecipient ?? existing?.smtpTestRecipient,
    smtpPasswordHash: smtp?.clearPassword ? null : smtp?.password ? hashPassword(smtp.password) : existing?.smtpPasswordHash,
    smtpPasswordCiphertext: smtp?.clearPassword ? null : smtp?.password ? encryptSecret(smtp.password) : existing?.smtpPasswordCiphertext,
    newsletterEnabled: newsletter?.enabled ?? existing?.newsletterEnabled ?? false,
    newsletterProvider: newsletter?.provider ?? existing?.newsletterProvider,
    newsletterEndpoint: newsletter?.endpoint ?? existing?.newsletterEndpoint,
    newsletterListId: newsletter?.listId ?? existing?.newsletterListId,
    newsletterApiKeyHash: newsletter?.clearApiKey ? null : newsletter?.apiKey ? hashPassword(newsletter.apiKey) : existing?.newsletterApiKeyHash,
    newsletterApiKeyCiphertext: newsletter?.clearApiKey ? null : newsletter?.apiKey ? encryptSecret(newsletter.apiKey) : existing?.newsletterApiKeyCiphertext,
    recaptchaEnabled: recaptcha?.enabled ?? existing?.recaptchaEnabled ?? false,
    recaptchaSiteKey: recaptcha?.siteKey ?? existing?.recaptchaSiteKey,
    recaptchaSecretHash: recaptcha?.clearSecretKey ? null : recaptcha?.secretKey ? hashPassword(recaptcha.secretKey) : existing?.recaptchaSecretHash,
    recaptchaSecretCiphertext: recaptcha?.clearSecretKey ? null : recaptcha?.secretKey ? encryptSecret(recaptcha.secretKey) : existing?.recaptchaSecretCiphertext,
    recaptchaProtectedPaths: recaptcha?.protectedPaths ? JSON.stringify(recaptcha.protectedPaths) : existing?.recaptchaProtectedPaths,
    redisEnabled: redis?.enabled ?? existing?.redisEnabled ?? Boolean(process.env.REDIS_URL),
    redisUrl: redis?.url ?? existing?.redisUrl,
    redisUsername: redis?.username ?? existing?.redisUsername,
    redisDatabase: redis?.database ?? existing?.redisDatabase ?? 0,
    redisPasswordHash: redis?.clearPassword ? null : redis?.password ? hashPassword(redis.password) : existing?.redisPasswordHash,
    redisPasswordCiphertext: redis?.clearPassword ? null : redis?.password ? encryptSecret(redis.password) : existing?.redisPasswordCiphertext,
    updatedAt: now,
  };
  const { id: _id, ...update } = data;
  await prisma.adminIntegrationSettings.upsert({ where: { id: SETTINGS_ID }, update, create: data });
  return publicIntegrationSettings();
}

export async function sendSmtpTest(recipient?: string) {
  const row = await readRecord();
  if (!row?.smtpHost || !row.smtpSenderEmail) throw new Error("SMTP host and sender email are required");
  const to = recipient || row.smtpTestRecipient;
  if (!to) throw new Error("A test recipient is required");
  const auth = row.smtpUsername && row.smtpPasswordCiphertext ? { user: row.smtpUsername, pass: decryptSecret(row.smtpPasswordCiphertext) } : undefined;
  const transporter = nodemailer.createTransport({ host: row.smtpHost, port: row.smtpPort || 587, secure: row.smtpSecure, auth });
  await transporter.verify();
  await transporter.sendMail({ from: row.smtpSenderName ? `"${row.smtpSenderName}" <${row.smtpSenderEmail}>` : row.smtpSenderEmail, to, subject: "MOVERA SMTP test", text: "This is a configuration test from MOVERA Admin." });
  return { recipient: to };
}

export async function testRedisConnection() {
  const row = await readRecord();
  const configuredUrl = row?.redisUrl || process.env.REDIS_URL;
  if (!configuredUrl) throw new Error("Redis URL is required");
  const parsed = new URL(configuredUrl);
  const password = row?.redisPasswordCiphertext ? decryptSecret(row.redisPasswordCiphertext) : parsed.password || undefined;
  if (row?.redisPasswordCiphertext) parsed.password = "";
  const client = createClient({ url: parsed.toString(), username: row?.redisUsername || parsed.username || undefined, password, database: row?.redisDatabase ?? 0 });
  try { await client.connect(); return { pong: await client.ping(), host: parsed.hostname, database: row?.redisDatabase ?? 0 }; } finally { await client.quit().catch(() => undefined); }
}

export async function forwardNewsletter(payload: { name: string; email: string; locale: string; source: string }) {
  const row = await readRecord();
  if (!row?.newsletterEnabled || !row.newsletterEndpoint) return "not_configured" as const;
  const endpoint = new URL(row.newsletterEndpoint);
  const localAllowed = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(endpoint.hostname);
  if (endpoint.protocol !== "https:" && !localAllowed) throw new Error("Newsletter endpoint must use HTTPS");
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (row.newsletterApiKeyCiphertext) headers.authorization = `Bearer ${decryptSecret(row.newsletterApiKeyCiphertext)}`;
  const response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ ...payload, listId: row.newsletterListId || undefined }) });
  if (!response.ok) throw new Error(`Newsletter provider returned ${response.status}`);
  return "sent" as const;
}

export async function testNewsletterConnection(recipient: string) {
  return forwardNewsletter({ name: "MOVERA integration test", email: recipient, locale: "en", source: "admin-test" });
}

function directDependencies(manifest: Record<string, unknown>) {
  return Object.keys({ ...(manifest.dependencies as Record<string, string> || {}), ...(manifest.devDependencies as Record<string, string> || {}) });
}

async function packageInfo(name: string, declared: string, root: string) {
  try {
    let packagePath = "";
    const localManifest = path.join(root, "node_modules", ...name.split("/"), "package.json");
    try {
      await fs.access(localManifest);
      packagePath = localManifest;
    } catch { /* resolve through package exports below */ }
    try {
      if (!packagePath) packagePath = packageRequire.resolve(`${name}/package.json`);
    } catch {
      let current = path.dirname(packageRequire.resolve(name));
      while (current !== path.dirname(current)) {
        const candidate = path.join(current, "package.json");
        try {
          await fs.access(candidate);
          packagePath = candidate;
          break;
        } catch {
          current = path.dirname(current);
        }
      }
    }
    if (!packagePath) throw new Error("Package manifest not found");
    const installed = JSON.parse(await fs.readFile(packagePath, "utf8")) as { version: string };
    let latest: string | null = null;
    try { const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`, { signal: AbortSignal.timeout(1500) }); if (response.ok) latest = ((await response.json()) as { version?: string }).version || null; } catch { /* offline inventory remains useful */ }
    return { name, declared, installed: installed.version, latest, status: latest ? latest === installed.version ? "current" : "outdated" : "not_checked" };
  } catch { return { name, declared, installed: null, latest: null, status: "missing" }; }
}

type ComponentInventory = { generatedAt: string; packages: Awaited<ReturnType<typeof packageInfo>>[]; runtime: { node: string; database: string; cache: string }; assetPolicy: { publicAssets: string; fonts: string; externalExceptions: string[] } };
let inventoryCache: { expiresAt: number; value: ComponentInventory } | null = null;

export async function componentInventory(): Promise<ComponentInventory> {
  if (inventoryCache && inventoryCache.expiresAt > Date.now()) return inventoryCache.value;
  const root = process.env.APP_ROOT || path.resolve(__dirname, "../../../");
  const manifests = await Promise.all(["package.json", "apps/web/package.json", "apps/admin/package.json", "apps/api/package.json"].map(async file => JSON.parse(await fs.readFile(path.join(root, file), "utf8")) as Record<string, unknown>));
  const entries = new Map<string, string>();
  manifests.forEach(manifest => { const deps = { ...(manifest.dependencies as Record<string, string> || {}), ...(manifest.devDependencies as Record<string, string> || {}) }; Object.entries(deps).forEach(([name, version]) => entries.set(name, version)); });
  const packages = await Promise.all(Array.from(entries, ([name, declared]) => packageInfo(name, declared, root)));
  const value = { generatedAt: new Date().toISOString(), packages: packages.sort((a, b) => a.name.localeCompare(b.name)), runtime: { node: process.version, database: "PostgreSQL via Prisma", cache: process.env.REDIS_URL ? "Redis configured" : "Redis not configured" }, assetPolicy: { publicAssets: "local filesystem", fonts: "local/system", externalExceptions: ["Azure", "Google reCAPTCHA", "configured newsletter endpoint"] } };
  inventoryCache = { expiresAt: Date.now() + 5 * 60 * 1000, value };
  return value;
}
