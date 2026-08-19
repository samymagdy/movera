import { randomUUID } from "node:crypto";
import { normalizeBrandText, type ContentItem, type MediaAsset, type SiteData, type TrashItem } from "@company/contracts";
import { PrismaClient } from "@prisma/client";
import { defaultData } from "./defaultData";
import { getCachedPublicSite, invalidatePublicSiteCache, setCachedPublicSite } from "./cache";

const prisma = new PrismaClient();
const retiredContentIds = new Set<string>();
const localOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.WEB_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.NEXT_PUBLIC_API_BASE_URL,
  process.env.API_PUBLIC_URL,
  "http://localhost:4000",
  "http://127.0.0.1:4000",
].filter((origin): origin is string => Boolean(origin)).map(origin => origin.replace(/\/$/, ""));

const canonicalPublicAssetUrls: Record<string, string> = {
  "/starter-media/movera-hero-field.svg": "/starter-media/movera-hero-field.svg",
  "/starter-media/assistant.svg": "/starter-media/movera-chatbot.webp",
  "/starter-media/movera-chatbot.png": "/starter-media/movera-chatbot.webp",
  "/starter-media/movera-chatbot.webp": "/starter-media/movera-chatbot.webp",
  "/starter-media/movera-autonomy-hero.png": "/starter-media/movera-autonomy-hero.webp",
  "/starter-media/portrait.svg": "/starter-media/portrait.svg",
};

function normalizePublicAssetUrls<T>(value: T): T {
  if (typeof value === "string") {
    let normalized = value as string;
    for (const origin of localOrigins) {
      if (normalized === origin) normalized = "/";
      else if (normalized.startsWith(`${origin}/`)) normalized = normalized.slice(origin.length);
    }
    if (normalized.startsWith("/starter-media/") && normalized.endsWith(".png")) {
      normalized = normalized.replace(/\.png$/i, ".webp");
    }
    return (canonicalPublicAssetUrls[normalized] || normalized) as T;
  }
  if (Array.isArray(value)) return value.map(item => normalizePublicAssetUrls(item)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizePublicAssetUrls(item)])) as T;
  return value;
}

function normalizeLocalMediaAssets<T>(value: T): T {
  if (Array.isArray(value)) return value.map(item => normalizeLocalMediaAssets(item)) as T;
  if (!value || typeof value !== "object") return value;
  const normalized = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeLocalMediaAssets(item)])) as Record<string, unknown>;
  if (typeof normalized.url === "string" && "alt" in normalized) {
    if (!normalized.url.startsWith("/") || normalized.url.startsWith("//")) normalized.url = "/starter-media/movera-hero-field.svg";
    if (Array.isArray(normalized.variants)) normalized.variants = normalized.variants.filter(variant => variant && typeof variant === "object" && typeof (variant as { url?: unknown }).url === "string" && (variant as { url: string }).url.startsWith("/") && !(variant as { url: string }).url.startsWith("//"));
  }
  return normalized as T;
}

const canonicalBrandAssetUrls: Record<string, string> = {
};
function preserveCustomBrandAsset(asset: MediaAsset | undefined, fallback: MediaAsset) {
  if (!asset) return structuredClone(fallback);
  const canonicalUrl = canonicalBrandAssetUrls[asset.url];
  if (canonicalUrl) return { ...structuredClone(fallback), url: canonicalUrl, alt: asset.alt || fallback.alt };
  return asset;
}
function normalizeBrand(stored?: Partial<SiteData["brand"]>): SiteData["brand"] {
  const brand = { ...structuredClone(defaultData.brand), ...(stored || {}) };
  return {
    ...brand,
    mark: preserveCustomBrandAsset(brand.mark, defaultData.brand.mark),
    markLight: preserveCustomBrandAsset(brand.markLight, defaultData.brand.markLight || defaultData.brand.mark),
    markDark: preserveCustomBrandAsset(brand.markDark, defaultData.brand.markDark || defaultData.brand.mark),
    wordmark: preserveCustomBrandAsset(brand.wordmark, defaultData.brand.wordmark),
    wordmarkLight: preserveCustomBrandAsset(brand.wordmarkLight, defaultData.brand.wordmarkLight || defaultData.brand.wordmark),
    wordmarkDark: preserveCustomBrandAsset(brand.wordmarkDark, defaultData.brand.wordmarkDark || defaultData.brand.wordmark),
  };
}

export async function readSite(): Promise<SiteData> {
  const document = await prisma.contentDocument.findUnique({ where: { kind: "site" } });
  if (!document) return normalizeBrandText(normalizeLocalMediaAssets(normalizePublicAssetUrls(structuredClone(defaultData))));
  const stored = JSON.parse(document.payload) as Partial<SiteData>;
  const isDeleted = (type: ContentItem["type"], id: string) => (stored.deletedContentIds?.[type] || []).includes(id) || (stored.trash || []).some(entry => entry.type === type && entry.item.id === id);
  const merge = (type: ContentItem["type"], current: ContentItem[] | undefined, defaults: ContentItem[], retired = new Set<string>()) => [...(current || []).filter(item => !retired.has(item.id) && !isDeleted(type, item.id)).map(item => ({ ...(defaults.find(candidate => candidate.id === item.id) || {}), ...item })), ...defaults.filter(candidate => !retired.has(candidate.id) && !isDeleted(type, candidate.id) && !(current || []).some(item => item.id === candidate.id))];
  const footer = { ...structuredClone(defaultData.footer), ...(stored.footer || {}), socialLinks: { ...structuredClone(defaultData.footer.socialLinks), ...(stored.footer?.socialLinks || {}) } };
  const legacySocialRoots = new Set(["/contact", "https://www.facebook.com/", "https://www.instagram.com/", "https://www.youtube.com/"]);
  (Object.keys(footer.socialLinks) as Array<keyof typeof footer.socialLinks>).forEach(key => { if (legacySocialRoots.has(footer.socialLinks[key])) footer.socialLinks[key] = defaultData.footer.socialLinks[key]; });
  return normalizeBrandText(normalizeLocalMediaAssets(normalizePublicAssetUrls({
    ...structuredClone(defaultData),
    ...stored,
    homepage: { ...structuredClone(defaultData.homepage), ...(stored.homepage || {}) },
    news: merge("news", stored.news, defaultData.news), blogs: merge("blogs", stored.blogs, defaultData.blogs), projects: merge("projects", stored.projects, defaultData.projects), services: merge("services", stored.services, defaultData.services, retiredContentIds), products: merge("products", stored.products, defaultData.products), pages: merge("pages", stored.pages, defaultData.pages), jobs: merge("jobs", stored.jobs, defaultData.jobs), innovation: merge("innovation", stored.innovation, defaultData.innovation), regions: (stored.regions || defaultData.regions).map(region => ({ ...(defaultData.regions.find(candidate => candidate.code === region.code) || {}), ...region })), footer, assistant: stored.assistant || structuredClone(defaultData.assistant), brand: normalizeBrand(stored.brand), appearance: { ...structuredClone(defaultData.appearance), ...(stored.appearance || {}) },
    deletedContentIds: stored.deletedContentIds || {},
    trash: stored.trash || [],
  })));
}

/** Public renderers must never receive editor-only draft or archived records. */
export async function readPublicSite(): Promise<SiteData> {
  const cached = await getCachedPublicSite();
  if (cached && (cached as Partial<SiteData>).appearance) {
    const normalizedCached = normalizeBrandText(
      normalizeLocalMediaAssets(normalizePublicAssetUrls(cached))
    );
    await setCachedPublicSite(normalizedCached);
    return normalizedCached;
  }
  const site = await readSite();
  const { deletedContentIds: _deletedContentIds, trash: _trash, ...publicSite } = site;
  const collections = publicCollections.reduce((result, type) => {
    result[type] = site[type].filter(item => item.status !== "draft" && item.status !== "archived");
    return result;
  }, {} as Pick<SiteData, ContentItem["type"]>);
  const result = {
    ...publicSite,
    ...collections,
    ceoMessage: site.ceoMessage && site.ceoMessage.status !== "draft" && site.ceoMessage.status !== "archived" ? site.ceoMessage : undefined,
  };
  await setCachedPublicSite(result);
  return result;
}

export async function writeSite(site: SiteData) {
  const normalizedSite = normalizeBrandText(normalizePublicAssetUrls(site));
  const payload = JSON.stringify(normalizedSite);
  const now = new Date().toISOString();
  await prisma.contentDocument.upsert({ where: { kind: "site" }, update: { payload, updatedAt: now }, create: { id: "site", kind: "site", payload, createdAt: now, updatedAt: now } });
  await invalidatePublicSiteCache();
  return normalizedSite;
}
export async function ensureCEOMessage() {
  const document = await prisma.contentDocument.findUnique({ where: { kind: "site" } });
  if (!document) { await writeSite(defaultData); return; }
  const stored = JSON.parse(document.payload) as Partial<SiteData>;
  const needsCEO = !stored.ceoMessage || stored.ceoMessage.status === "archived";
  const needsAssistant = !stored.assistant;
  const needsBrand = !stored.brand || !stored.brand.wordmarkText;
  if (!needsCEO && !needsAssistant && !needsBrand) return;
  const now = new Date().toISOString();
  await prisma.contentDocument.update({ where: { kind: "site" }, data: { payload: JSON.stringify(normalizeBrandText(normalizePublicAssetUrls({ ...stored, ceoMessage: needsCEO ? structuredClone(defaultData.ceoMessage) : stored.ceoMessage, assistant: stored.assistant || structuredClone(defaultData.assistant), brand: normalizeBrand(stored.brand) }))), updatedAt: now } });
  await invalidatePublicSiteCache();
}
export async function upsertItem(type: ContentItem["type"], payload: Partial<ContentItem>) { const site = await readSite(); const list = site[type]; const item = { ...payload, id: payload.id || randomUUID(), type, slug: payload.slug || { en: "new-item", ar: "عنصر-جديد", fr: "nouvel-element", nl: "nieuw-item" }, title: payload.title || { en: "New item", ar: "عنصر جديد", fr: "Nouvel élément", nl: "Nieuw item" }, summary: payload.summary || { en: "", ar: "", fr: "", nl: "" }, body: payload.body || { en: "", ar: "", fr: "", nl: "" } } as ContentItem; const index = list.findIndex(row => row.id === item.id); if (index >= 0) list[index] = item; else list.unshift(item); if (site.deletedContentIds?.[type]) site.deletedContentIds[type] = site.deletedContentIds[type]!.filter(deletedId => deletedId !== item.id); site.trash = (site.trash || []).filter(entry => !(entry.type === type && entry.item.id === item.id)); await writeSite(site); return item; }
export async function reorderItem(type: ContentItem["type"], id: string, direction: "up" | "down") {
  const site = await readSite();
  const list = site[type];
  const index = list.findIndex(item => item.id === id);
  if (index < 0) return undefined;
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= list.length) return { item: list[index], items: list };
  [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
  list.forEach((item, position) => { item.displayOrder = position; });
  await writeSite(site);
  return { item: list[nextIndex], items: list };
}
function setCollectionOrder(items: ContentItem[]) {
  items.forEach((item, index) => { item.displayOrder = index; });
}

/** Move a top-level content item into the recoverable CMS Trash. */
export async function trashItem(type: ContentItem["type"], id: string, deletedBy?: string): Promise<TrashItem | undefined> {
  const site = await readSite();
  const index = site[type].findIndex(item => item.id === id);
  if (index < 0) return undefined;
  const item = structuredClone(site[type][index]);
  site[type] = site[type].filter(entry => entry.id !== id);
  setCollectionOrder(site[type]);
  site.deletedContentIds = { ...(site.deletedContentIds || {}), [type]: [...new Set([...(site.deletedContentIds?.[type] || []), id])] };
  const entry: TrashItem = { trashId: `${type}:${id}`, type, item, originalIndex: index, deletedAt: new Date().toISOString(), deletedBy };
  site.trash = [entry, ...(site.trash || []).filter(existing => existing.trashId !== entry.trashId)];
  await writeSite(site);
  return entry;
}

/** Restore an item to its previous collection position and status. */
export async function restoreTrashItem(type: ContentItem["type"], id: string): Promise<ContentItem | undefined> {
  const site = await readSite();
  const entry = (site.trash || []).find(candidate => candidate.type === type && candidate.item.id === id);
  if (!entry) return undefined;
  const list = site[type].filter(item => item.id !== id);
  const index = Math.max(0, Math.min(entry.originalIndex, list.length));
  list.splice(index, 0, structuredClone(entry.item));
  setCollectionOrder(list);
  site[type] = list;
  if (site.deletedContentIds?.[type]) site.deletedContentIds[type] = site.deletedContentIds[type]!.filter(deletedId => deletedId !== id);
  site.trash = (site.trash || []).filter(candidate => candidate.trashId !== entry.trashId);
  await writeSite(site);
  return entry.item;
}

/** Permanently delete selected Trash entries, or all entries when ids is omitted. */
export async function permanentlyDeleteTrashItems(ids?: string[]): Promise<TrashItem[]> {
  const site = await readSite();
  const selected = ids && ids.length ? new Set(ids) : undefined;
  const removed = (site.trash || []).filter(entry => !selected || selected.has(entry.trashId));
  site.trash = (site.trash || []).filter(entry => selected ? !selected.has(entry.trashId) : false);
  await writeSite(site);
  return removed;
}

/** Compatibility alias for callers that still use the old store name. */
export async function removeItem(type: ContentItem["type"], id: string, deletedBy?: string) { return trashItem(type, id, deletedBy); }

export const publicCollections: ContentItem["type"][] = ["news", "blogs", "projects", "services", "products", "pages", "jobs", "innovation"];

export function findBySlug(site: SiteData, type: ContentItem["type"], slug: string, locale: keyof ContentItem["slug"]) {
  return site[type].find(item => item.slug[locale] === slug || item.id === slug);
}

export function searchSite(site: SiteData, query: string, locale: keyof ContentItem["title"]) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  return publicCollections.flatMap(type => site[type].filter(item => item.status !== "archived" && item.status !== "draft").filter(item => [item.title[locale], item.summary[locale], item.body[locale], item.category || "", item.sector || ""].join(" ").toLocaleLowerCase().includes(needle)).map(item => ({ ...item, type })));
}

export async function createContactSubmission(payload: { name: string; email: string; phone?: string; company?: string; subject: string; message: string; locale: string }) {
  const now = new Date().toISOString();
  return prisma.contactSubmission.create({ data: { id: randomUUID(), ...payload, privacyAt: now, createdAt: now } });
}

export async function createNewsletterSubmission(payload: { name: string; email: string; locale: string; source: string }) {
  const now = new Date().toISOString();
  return prisma.newsletterSubmission.create({ data: { id: randomUUID(), ...payload, consentAt: now, createdAt: now } });
}

export async function createCareerApplication(payload: { jobId: string; name: string; email: string; phone?: string; coverNote: string; cvPath: string; cvName: string; locale: string }) {
  return prisma.careerApplication.create({ data: { id: randomUUID(), ...payload, createdAt: new Date().toISOString() } });
}
