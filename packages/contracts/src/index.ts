export const locales = ["en", "ar", "fr", "nl"] as const;
export type Locale = (typeof locales)[number];
export type Direction = "ltr" | "rtl";

export type LocalizedText = Record<Locale, string>;

export type ContentKind = "news" | "blogs" | "projects" | "services" | "products" | "pages" | "jobs" | "innovation";

export type SeoFields = {
  title: LocalizedText;
  description: LocalizedText;
  keywords: LocalizedText;
};

export type DocumentAsset = { id: string; name: string; url: string; mimeType?: string };

export type MediaVariant = {
  url: string;
  width: number;
  height: number;
  mimeType?: string;
  sizeBytes?: number;
};

export type MediaAsset = {
  id: string;
  url: string;
  alt: LocalizedText;
  caption?: LocalizedText;
  credit?: string;
  focalX?: number;
  focalY?: number;
  zoom?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  sizeBytes?: number;
  variants?: MediaVariant[];
};

export type AboutPageLayout = "story" | "timeline" | "vision" | "leadership" | "certificates";

export type AboutSection = {
  id: string;
  eyebrow?: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  bullets?: LocalizedText[];
  media?: MediaAsset;
};

export type AboutTimelineEntry = {
  id: string;
  label: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  media?: MediaAsset;
};

export type LeadershipProfile = {
  id: string;
  name: LocalizedText;
  role: LocalizedText;
  summary: LocalizedText;
  portrait?: MediaAsset;
};

export type VerifiedCredential = {
  id: string;
  title: LocalizedText;
  issuer: LocalizedText;
  description: LocalizedText;
  media?: MediaAsset;
};

export type ContentItem = {
  id: string;
  type: ContentKind;
  slug: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  body: LocalizedText;
  category?: string;
  date?: string;
  featured?: boolean;
  client?: string;
  sector?: string;
  icon?: string;
  cover?: MediaAsset;
  gallery?: MediaAsset[];
  videos?: string[];
  documents?: DocumentAsset[];
  relatedIds?: string[];
  status?: "draft" | "published" | "archived";
  displayOrder?: number;
  tags?: string[];
  region?: "hub-a" | "hub-b" | "hub-c";
  seo?: SeoFields;
  aboutLayout?: AboutPageLayout;
  sections?: AboutSection[];
  timeline?: AboutTimelineEntry[];
  profiles?: LeadershipProfile[];
  credentials?: VerifiedCredential[];
};

export type RegionContent = {
  code: "hub-a" | "hub-b" | "hub-c";
  title: LocalizedText;
  summary: LocalizedText;
  body: LocalizedText;
  address: LocalizedText;
  hours: LocalizedText;
  email: string;
  cover?: MediaAsset;
  capabilities?: LocalizedText[];
};

export type FooterContent = {
  contactLabel: LocalizedText;
  locationLabel: LocalizedText;
  workingHoursLabel: LocalizedText;
  phone: string;
  email: string;
  address: LocalizedText;
  hours: LocalizedText;
  socialLinks: { facebook: string; instagram: string; youtube: string; linkedin: string };
};

export type AssistantSettings = {
  label: LocalizedText;
  icon: MediaAsset;
};

export type BrandSettings = {
  /** Unified logo asset containing the MOVERA mark and wordmark. */
  logo?: MediaAsset;
  logoLight?: MediaAsset;
  logoDark?: MediaAsset;
  mark: MediaAsset;
  markLight?: MediaAsset;
  markDark?: MediaAsset;
  wordmark: MediaAsset;
  wordmarkLight?: MediaAsset;
  wordmarkDark?: MediaAsset;
  wordmarkText: LocalizedText;
  aiLabel: LocalizedText;
  aiEnabled: boolean;
};

export type ThemeMode = "dark" | "light";

export type AppearanceSettings = {
  defaultTheme: ThemeMode;
};

export type HomepageBandId = "locations" | "news" | "products" | "projects" | "careers" | "customers";

export type HomepageBand = {
  id: HomepageBandId;
  visible: boolean;
  itemIds: string[];
  eyebrow: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  viewLabel: LocalizedText;
};

export type HomepageContent = {
  hero: {
    eyebrow: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
    primaryLabel: LocalizedText;
    primaryHref: string;
    secondaryLabel: LocalizedText;
    secondaryHref: string;
    background: MediaAsset;
  };
  intro: { title: LocalizedText; body: LocalizedText };
  stats: { value: string; label: LocalizedText }[];
  featuredServices: string[];
  featuredProjects: string[];
  latestNews: string[];
  bands: HomepageBand[];
  cta: { title: LocalizedText; body: LocalizedText; label: LocalizedText; href: string };
};

export type CEOMessageContent = {
  slug: string;
  title: LocalizedText;
  name: LocalizedText;
  position: LocalizedText;
  message: LocalizedText[];
  pullQuote?: LocalizedText;
  portrait: MediaAsset;
  seo: SeoFields;
  status?: "draft" | "published" | "archived";
};

/** A recoverable snapshot of a collection item removed from the editor. */
export type TrashItem = {
  trashId: string;
  type: ContentKind;
  item: ContentItem;
  originalIndex: number;
  deletedAt: string;
  deletedBy?: string;
};

export type SiteData = {
  homepage: HomepageContent;
  ceoMessage?: CEOMessageContent;
  assistant: AssistantSettings;
  brand: BrandSettings;
  appearance: AppearanceSettings;
  news: ContentItem[];
  blogs: ContentItem[];
  projects: ContentItem[];
  services: ContentItem[];
  products: ContentItem[];
  pages: ContentItem[];
  jobs: ContentItem[];
  innovation: ContentItem[];
  regions: RegionContent[];
  footer: FooterContent;
  /** IDs intentionally removed by an administrator; prevents default content returning on deploy. */
  deletedContentIds?: Partial<Record<ContentKind, string[]>>;
  /** Recoverable top-level content removed from the editor. */
  trash?: TrashItem[];
};

export const directionFor = (locale: Locale): Direction => (locale === "ar" ? "rtl" : "ltr");

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  nl: "Nederlands",
};

/** Content is authored by the new company in each locale; no brand rewrite is applied. */
export function normalizeBrandText<T>(value: T): T {
  return value;
}

export { starterSiteData } from "./starterSiteData";
