"use client";

import { useEffect, useMemo, useState } from "react";
import type { ContentItem, ContentKind, Locale, MediaAsset, SiteData } from "@company/contracts";
import { directionFor } from "@company/contracts";
import { Arrow } from "./icons";
import { BackLinkContent } from "./BackLink";
import { ChatWidget, Footer, CookieNotice } from "./PublicContentPage";
import { SiteHeader } from "./SiteHeader";
import { MediaImage } from "./MediaImage";
import { sampleData } from "./sampleData";
import { useInitialSiteData } from "./SiteDataContext";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const fallbackMedia = "/starter-media/movera-hero-field.svg";

const copy = {
  en: {
    projects: { label: "Reference programmes", intro: "Belgian contexts where autonomous and connected mobility can be examined in the real world.", item: "Programme", view: "View programme", related: "Related programmes", back: "Back to programmes", capability: "Mobility domain" },
    services: { label: "Mobility services", intro: "Engineering services that connect vehicle intelligence to dependable operations.", item: "Service", view: "Explore service", related: "Related services", back: "Back to services", capability: "Discipline" },
    products: { label: "MOVERA products", intro: "Four product foundations that carry mobility from perception to coordinated action.", item: "Product", view: "View product", related: "Related products", back: "Back to products", capability: "Mobility domain" },
    news: { label: "Signal feed", intro: "Company news and practical mobility thinking from Belgium.", item: "News", view: "Read article", related: "More signals", back: "Back to news", capability: "Topic" },
    blogs: { label: "Perspectives", intro: "Thinking on operators, passengers and accountable mobility decisions.", item: "Perspective", view: "Read perspective", related: "More perspectives", back: "Back to perspectives", capability: "Topic" },
    innovation: { label: "Innovation Hub", intro: "Applied mobility research designed to become useful operating practice.", item: "Research track", view: "Explore research", related: "More from the hub", back: "Back to Innovation Hub", capability: "Research focus" },
  },
  ar: {
    projects: { label: "البرامج المرجعية", intro: "سياقات بلجيكية نختبر فيها التنقل الذاتي والمتصل ضمن العالم الحقيقي.", item: "برنامج", view: "عرض البرنامج", related: "برامج ذات صلة", back: "العودة إلى البرامج", capability: "مجال التنقل" },
    services: { label: "خدمات التنقل", intro: "خدمات هندسية تربط ذكاء المركبة بعمليات موثوقة.", item: "خدمة", view: "استكشف الخدمة", related: "خدمات ذات صلة", back: "العودة إلى الخدمات", capability: "التخصص" },
    products: { label: "منتجات موفيرا", intro: "أربعة أسس تنقل الحركة من الإدراك إلى الإجراء المنسق.", item: "منتج", view: "عرض المنتج", related: "منتجات ذات صلة", back: "العودة إلى المنتجات", capability: "مجال التنقل" },
    news: { label: "موجز الإشارات", intro: "أخبار موفيرا وأفكار عملية حول التنقل من بلجيكا.", item: "خبر", view: "اقرأ الخبر", related: "إشارات أخرى", back: "العودة إلى الأخبار", capability: "الموضوع" },
    blogs: { label: "رؤى موفيرا", intro: "أفكار حول المشغّلين والركاب وقرارات التنقل المسؤولة.", item: "رؤية", view: "اقرأ الرؤية", related: "المزيد من الرؤى", back: "العودة إلى الرؤى", capability: "الموضوع" },
    innovation: { label: "مركز الابتكار", intro: "بحوث تطبيقية في التنقل مصممة لتتحول إلى ممارسة تشغيلية مفيدة.", item: "مسار بحثي", view: "استكشف البحث", related: "المزيد من المركز", back: "العودة إلى مركز الابتكار", capability: "محور البحث" },
  },
  fr: {
    projects: { label: "Programmes de référence", intro: "Des contextes belges où la mobilité autonome et connectée se confronte au réel.", item: "Programme", view: "Voir le programme", related: "Programmes associés", back: "Retour aux programmes", capability: "Domaine mobilité" },
    services: { label: "Services mobilité", intro: "Des services d’ingénierie qui relient intelligence véhicule et opérations fiables.", item: "Service", view: "Explorer le service", related: "Services associés", back: "Retour aux services", capability: "Discipline" },
    products: { label: "Produits MOVERA", intro: "Quatre fondations pour passer de la perception à l’action coordonnée.", item: "Produit", view: "Voir le produit", related: "Produits associés", back: "Retour aux produits", capability: "Domaine mobilité" },
    news: { label: "Fil des signaux", intro: "Actualités MOVERA et réflexions pratiques sur la mobilité depuis la Belgique.", item: "Actualité", view: "Lire l’article", related: "Autres signaux", back: "Retour aux actualités", capability: "Sujet" },
    blogs: { label: "Perspectives", intro: "Des regards sur les opérateurs, les passagers et la responsabilité des décisions.", item: "Perspective", view: "Lire la perspective", related: "Plus de perspectives", back: "Retour aux perspectives", capability: "Sujet" },
    innovation: { label: "Hub d’innovation", intro: "Une recherche appliquée en mobilité pensée pour devenir une pratique utile.", item: "Axe de recherche", view: "Explorer la recherche", related: "Plus du hub", back: "Retour au hub", capability: "Axe de recherche" },
  },
  nl: {
    projects: { label: "Referentieprogramma’s", intro: "Belgische contexten waarin autonome en verbonden mobiliteit zich in de praktijk bewijst.", item: "Programma", view: "Bekijk programma", related: "Gerelateerde programma’s", back: "Terug naar programma’s", capability: "Mobiliteitsdomein" },
    services: { label: "Mobiliteitsdiensten", intro: "Engineeringdiensten die voertuigintelligentie verbinden met betrouwbare operaties.", item: "Dienst", view: "Ontdek de dienst", related: "Gerelateerde diensten", back: "Terug naar diensten", capability: "Discipline" },
    products: { label: "MOVERA-producten", intro: "Vier fundamenten die mobiliteit van waarneming naar gecoördineerde actie brengen.", item: "Product", view: "Bekijk product", related: "Gerelateerde producten", back: "Terug naar producten", capability: "Mobiliteitsdomein" },
    news: { label: "Signaalfeed", intro: "MOVERA-nieuws en praktische mobiliteitsinzichten uit België.", item: "Nieuws", view: "Lees het artikel", related: "Meer signalen", back: "Terug naar nieuws", capability: "Onderwerp" },
    blogs: { label: "Perspectieven", intro: "Inzichten over operatoren, passagiers en verantwoorde mobiliteitsbeslissingen.", item: "Perspectief", view: "Lees het perspectief", related: "Meer perspectieven", back: "Terug naar perspectieven", capability: "Onderwerp" },
    innovation: { label: "Innovatiehub", intro: "Toegepast mobiliteitsonderzoek dat bruikbare operationele praktijk moet worden.", item: "Onderzoekslijn", view: "Ontdek het onderzoek", related: "Meer uit de hub", back: "Terug naar de hub", capability: "Onderzoeksfocus" },
  },
} as const;

type EditorialKind = "projects" | "services" | "products" | "news" | "blogs" | "innovation";
type Copy = (typeof copy)[Locale][EditorialKind];

const projectSectors = [
  "Autonomous Vehicles",
  "Fleet Operations",
  "Vehicle Experience",
  "Connected Infrastructure",
] as const;

const projectSectorLabels: Record<(typeof projectSectors)[number], Record<Locale, string>> = {
  "Autonomous Vehicles": { en: "Autonomous vehicles", ar: "المركبات ذاتية القيادة", fr: "Véhicules autonomes", nl: "Autonome voertuigen" },
  "Fleet Operations": { en: "Fleet operations", ar: "عمليات الأساطيل", fr: "Opérations de flotte", nl: "Vlootoperaties" },
  "Vehicle Experience": { en: "Vehicle experience", ar: "تجربة المركبة", fr: "Expérience à bord", nl: "Voertuigervaring" },
  "Connected Infrastructure": { en: "Connected infrastructure", ar: "البنية التحتية المتصلة", fr: "Infrastructure connectée", nl: "Verbonden infrastructuur" },
};

const taxonomy: Record<string, Record<Locale, string>> = {
  "Mobility Planning": { en: "Mobility planning", ar: "تخطيط التنقل", fr: "Planification mobilité", nl: "Mobiliteitsplanning" },
  Autonomy: { en: "Autonomy", ar: "القيادة الذاتية", fr: "Autonomie", nl: "Autonomie" },
  Operations: { en: "Operations", ar: "العمليات", fr: "Opérations", nl: "Operaties" },
  Experience: { en: "Experience", ar: "التجربة", fr: "Expérience", nl: "Ervaring" },
  "Operations platform": { en: "Operations platform", ar: "منصة العمليات", fr: "Plateforme d’opérations", nl: "Operationeel platform" },
  "Vehicle intelligence": { en: "Vehicle intelligence", ar: "ذكاء المركبة", fr: "Intelligence véhicule", nl: "Voertuigintelligentie" },
  "Orchestration layer": { en: "Orchestration layer", ar: "طبقة التنسيق", fr: "Couche d’orchestration", nl: "Orkestratielaag" },
  Simulation: { en: "Simulation", ar: "المحاكاة", fr: "Simulation", nl: "Simulatie" },
  "Reference programme": { en: "Reference programme", ar: "برنامج مرجعي", fr: "Programme de référence", nl: "Referentieprogramma" },
  "Design study": { en: "Design study", ar: "دراسة تصميم", fr: "Étude de conception", nl: "Ontwerpstudie" },
  "Corridor blueprint": { en: "Corridor blueprint", ar: "تصور ممر", fr: "Schéma de corridor", nl: "Corridorconcept" },
  Company: { en: "Company", ar: "الشركة", fr: "Entreprise", nl: "Bedrijf" },
  Technology: { en: "Technology", ar: "التقنية", fr: "Technologie", nl: "Technologie" },
  Belgium: { en: "Belgium", ar: "بلجيكا", fr: "Belgique", nl: "België" },
  "Operations design": { en: "Operations design", ar: "تصميم العمليات", fr: "Design des opérations", nl: "Operationeel ontwerp" },
  "Passenger experience": { en: "Passenger experience", ar: "تجربة الراكب", fr: "Expérience passager", nl: "Passagierservaring" },
  "Mobility intelligence": { en: "Mobility intelligence", ar: "ذكاء التنقل", fr: "Intelligence mobilité", nl: "Mobiliteitsintelligentie" },
  "Applied research": { en: "Applied research", ar: "بحث تطبيقي", fr: "Recherche appliquée", nl: "Toegepast onderzoek" },
  "Street research": { en: "Street research", ar: "بحث ميداني", fr: "Recherche urbaine", nl: "Straatonderzoek" },
};

function taxonomyLabel(locale: Locale, value?: string) {
  if (!value) return "";
  return taxonomy[value]?.[locale] || projectSectorLabel(locale, value) || value;
}

function formatDate(locale: Locale, value: string) {
  const language = locale === "ar" ? "ar-BE" : locale === "fr" ? "fr-BE" : locale === "nl" ? "nl-BE" : "en-BE";
  return new Intl.DateTimeFormat(language, { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00Z`));
}

function projectSectorLabel(locale: Locale, value?: string) {
  return value && value in projectSectorLabels
    ? projectSectorLabels[value as (typeof projectSectors)[number]][locale]
    : value || "";
}

function itemPath(locale: Locale, kind: EditorialKind, slug: string) {
  const prefix = kind === "innovation" ? "innovation-hub" : kind;
  return `/${locale}/${prefix}/${slug}`;
}

function isVisible(item: ContentItem) {
  return item.status !== "archived" && item.status !== "draft";
}

function mediaFor(item: ContentItem): MediaAsset[] {
  const assets = [item.cover, ...(item.gallery || [])].filter(Boolean) as MediaAsset[];
  return assets.length ? assets : [{ id: `${item.id}-fallback`, url: fallbackMedia, alt: { en: "MOVERA mobility image", ar: "صورة تنقل من موفيرا", fr: "Image mobilité MOVERA", nl: "MOVERA-mobiliteitsbeeld" } }];
}

function MediaGallery({ item, locale, compact = false, lightbox = false }: { item: ContentItem; locale: Locale; compact?: boolean; lightbox?: boolean }) {
  const assets = mediaFor(item);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);
  useEffect(() => {
    if (assets.length < 2 || paused || reducedMotion) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % assets.length), 5200);
    return () => window.clearInterval(timer);
  }, [assets.length, paused, reducedMotion]);
  return <div className={`editorial-media ${compact ? "editorial-media--compact" : ""}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
    {assets.map((asset, assetIndex) => <MediaImage key={`${asset.id}-${assetIndex}`} media={asset} className={assetIndex === index ? "is-active" : ""} alt={asset.alt[locale] || asset.alt.en} caption={asset.caption?.[locale]} lightbox={lightbox} loading={assetIndex === 0 ? "eager" : "lazy"} style={{ objectPosition: `${asset.focalX ?? 50}% ${asset.focalY ?? 50}%` }} />)}
    {assets.length > 1 && <span className="editorial-media-count" aria-label={`${assets.length} images`}>{String(index + 1).padStart(2, "0")} / {String(assets.length).padStart(2, "0")}</span>}
  </div>;
}

function HeaderBlock({ locale, kind, item, copy: t, titleOverride }: { locale: Locale; kind: EditorialKind; item?: ContentItem; copy: Copy; titleOverride?: string }) {
  return <div className={`editorial-head editorial-head--${kind}`}><p className="eyebrow">{locale === "ar" ? "موفيرا" : "MOVERA"} / {t.label}</p><h1>{item?.title[locale] || titleOverride || t.label}</h1><p>{item?.summary[locale] || t.intro}</p></div>;
}

function ProjectList({ locale, items, t }: { locale: Locale; items: ContentItem[]; t: Copy }) {
  return <div className="editorial-feed editorial-feed--projects">{items.map((item, index) => <a className="editorial-project-row" key={item.id} href={itemPath(locale, "projects", item.slug[locale])}><span className="editorial-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><MediaGallery item={item} locale={locale} /><div className="editorial-row-copy"><p className="editorial-kicker">{taxonomyLabel(locale, item.sector || item.category) || t.item}</p><h2>{item.title[locale]}</h2><p className="editorial-summary">{item.summary[locale]}</p><span className="editorial-link">{t.view} <Arrow /></span></div></a>)}</div>;
}

function ServiceList({ locale, items, t }: { locale: Locale; items: ContentItem[]; t: Copy }) {
  return <div className="editorial-service-grid">{items.map((item, index) => <a className="editorial-service-card" key={item.id} href={itemPath(locale, "services", item.slug[locale])}><span className="editorial-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div className="editorial-card-media"><MediaGallery item={item} locale={locale} compact /></div><div className="editorial-service-copy"><p className="editorial-kicker">{taxonomyLabel(locale, item.sector) || t.item}</p><h2>{item.title[locale]}</h2><p className="editorial-summary">{item.summary[locale]}</p><span className="editorial-link">{t.view} <Arrow /></span></div></a>)}</div>;
}

function ProductList({ locale, items, t }: { locale: Locale; items: ContentItem[]; t: Copy }) {
  return <div className="editorial-product-grid">{items.map((item, index) => <a className="editorial-product-card" key={item.id} href={itemPath(locale, "products", item.slug[locale])}><span className="editorial-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div className="editorial-card-media"><MediaGallery item={item} locale={locale} compact /></div><div className="editorial-product-copy"><p className="editorial-kicker">{taxonomyLabel(locale, item.category) || t.item}</p><h2>{item.title[locale]}</h2><p className="editorial-summary">{item.summary[locale]}</p><span className="editorial-link">{t.view} <Arrow /></span></div></a>)}</div>;
}

function ArticleList({ locale, kind, items, t }: { locale: Locale; kind: "news" | "blogs"; items: ContentItem[]; t: Copy }) {
  return <div className="editorial-article-grid">{items.map((item, index) => <a className="editorial-article-card" key={item.id} href={itemPath(locale, kind, item.slug[locale])}><span className="editorial-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div className="editorial-card-media"><MediaGallery item={item} locale={locale} compact /></div><div className="editorial-article-copy"><div className="editorial-article-meta"><span>{taxonomyLabel(locale, item.category) || t.item}</span>{item.date && <time dateTime={item.date}>{formatDate(locale, item.date)}</time>}</div><h2>{item.title[locale]}</h2><p className="editorial-summary">{item.summary[locale]}</p><span className="editorial-link">{t.view} <Arrow /></span></div></a>)}</div>;
}

function InnovationList({ locale, items, t }: { locale: Locale; items: ContentItem[]; t: Copy }) {
  return <div className="editorial-innovation-grid">{items.map((item, index) => <a className="editorial-innovation-card" key={item.id} href={itemPath(locale, "innovation", item.slug[locale])}><span className="editorial-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div className="editorial-card-media"><MediaGallery item={item} locale={locale} compact /></div><div><p className="editorial-kicker">{taxonomyLabel(locale, item.category) || t.item}</p><h2>{item.title[locale]}</h2><p className="editorial-summary">{item.summary[locale]}</p><span className="editorial-link">{t.view} <Arrow /></span></div></a>)}</div>;
}

function Related({ locale, items, t, kind }: { locale: Locale; items: ContentItem[]; t: Copy; kind: EditorialKind }) {
  if (!items.length) return null;
  return <section className="editorial-related"><div className="editorial-section-heading"><p className="eyebrow">{t.related}</p><span /></div><div className="editorial-related-grid">{items.map(item => <a key={item.id} href={itemPath(locale, kind, item.slug[locale])}><MediaGallery item={item} locale={locale} compact /><h3>{item.title[locale]}</h3><span>{t.view} <Arrow /></span></a>)}</div></section>;
}

function Detail({ locale, kind, item, allItems, t }: { locale: Locale; kind: EditorialKind; item: ContentItem; allItems: ContentItem[]; t: Copy }) {
  const related = useMemo(() => {
    const preferred = (item.relatedIds || []).map(id => allItems.find(candidate => candidate.id === id)).filter(Boolean) as ContentItem[];
    return (preferred.length ? preferred : allItems.filter(candidate => candidate.id !== item.id && (candidate.category === item.category || candidate.sector === item.sector || !item.category && !item.sector))).slice(0, 3);
  }, [allItems, item]);
  return <article className={`editorial-detail editorial-detail--${kind}`}><div className="editorial-detail-hero"><div><p className="editorial-kicker">{taxonomyLabel(locale, item.category || item.sector) || t.capability}</p><h1>{item.title[locale]}</h1><p className="editorial-detail-summary">{item.summary[locale]}</p></div><MediaGallery item={item} locale={locale} lightbox /></div><div className="editorial-detail-body"><aside><span>{t.capability}</span><strong>{taxonomyLabel(locale, item.sector || item.category) || t.item}</strong></aside><div className="editorial-prose">{item.body[locale].split("\n").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}{item.sections?.map((entry, index) => <section className="editorial-prose-section" key={entry.id}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h2>{entry.title[locale]}</h2><p>{entry.body[locale]}</p></section>)}</div></div><Related locale={locale} items={related} t={t} kind={kind} /><button type="button" className="editorial-back back-action" onClick={() => { window.location.href = `/${locale}/${kind === "innovation" ? "innovation-hub" : kind}`; }}><BackLinkContent locale={locale} label={t.back} /></button></article>;
}

export function EditorialContentPage({ initialLocale, kind, slug }: { initialLocale: Locale; kind: EditorialKind; slug?: string }) {
  const [locale, setLocale] = useState(initialLocale);
  const initialSiteData = useInitialSiteData();
  const [data, setData] = useState<SiteData>(initialSiteData || sampleData);
  const [loading, setLoading] = useState(!initialSiteData);
  const [error, setError] = useState(false);
  const [projectSector, setProjectSector] = useState<(typeof projectSectors)[number] | "all">("all");
  useEffect(() => { if (initialSiteData) return; fetch(`${API}/api/v1/site`).then(response => response.ok ? response.json() : Promise.reject()).then(payload => payload.data && setData(payload.data)).catch(() => setError(true)).finally(() => setLoading(false)); }, [initialSiteData]);
  const t = copy[locale][kind];
  const items = useMemo(() => data[kind].filter(isVisible).sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)), [data, kind]);
  const filteredItems = useMemo(() => kind === "projects" && projectSector !== "all" ? items.filter(item => item.sector === projectSector) : items, [items, kind, projectSector]);
  const item = slug ? items.find(entry => entry.slug[locale] === slug || entry.id === slug) : undefined;
  useEffect(() => {
    if (kind !== "projects" || slug || typeof window === "undefined") return;
    const requested = new URLSearchParams(window.location.search).get("sector");
    setProjectSector(projectSectors.includes(requested as (typeof projectSectors)[number]) ? requested as (typeof projectSectors)[number] : "all");
  }, [kind, slug]);
  useEffect(() => {
    if (kind !== "projects" || slug || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (projectSector === "all") url.searchParams.delete("sector");
    else url.searchParams.set("sector", projectSector);
    window.history.replaceState({}, "", url);
  }, [kind, projectSector, slug]);
  // SiteHeader owns the locale prefix; keep ticker links locale-relative here.
  const tickerItems = data.news.filter(isVisible).slice(0, 3).map(entry => ({ href: `/news/${entry.slug[locale]}`, title: entry.title[locale] }));
  const projectTitle = projectSector === "all" ? undefined : projectSectorLabel(locale, projectSector);
  const filterCopy = locale === "ar" ? "تصفية حسب القطاع" : locale === "fr" ? "Filtrer par secteur" : locale === "nl" ? "Filter op sector" : "Filter by sector";
  const allCopy = locale === "ar" ? "الكل" : locale === "fr" ? "Tous" : locale === "nl" ? "Alles" : "All";
  const stateCopy = {
    en: { loading: "Loading content…", error: "This content is temporarily unavailable.", empty: "No published content is available." },
    ar: { loading: "جارٍ تحميل المحتوى…", error: "هذا المحتوى غير متاح مؤقتاً.", empty: "لا يوجد محتوى منشور حالياً." },
    fr: { loading: "Chargement du contenu…", error: "Ce contenu est momentanément indisponible.", empty: "Aucun contenu publié n’est disponible." },
    nl: { loading: "Inhoud laden…", error: "Deze inhoud is tijdelijk niet beschikbaar.", empty: "Er is geen gepubliceerde inhoud beschikbaar." },
  }[locale];
  return <main className={`site-shell locale-${locale} editorial-shell`} dir={directionFor(locale)}><SiteHeader locale={locale} setLocale={setLocale} newsItems={tickerItems} /><div className="content-page-shell editorial-page-shell">{loading && <div className="content-state">{stateCopy.loading}</div>}{error && <div className="content-state error">{stateCopy.error}</div>}{!loading && !error && <>{item ? <Detail locale={locale} kind={kind} item={item} allItems={items} t={t} /> : <><HeaderBlock locale={locale} kind={kind} titleOverride={projectTitle} copy={t} />{kind === "projects" && <div className="content-filters editorial-project-filters" aria-label={filterCopy}><span>{filterCopy}</span><button type="button" className={projectSector === "all" ? "active" : ""} onClick={() => setProjectSector("all")}>{allCopy}</button>{projectSectors.map(sector => <button type="button" key={sector} className={projectSector === sector ? "active" : ""} onClick={() => setProjectSector(sector)}>{projectSectorLabel(locale, sector)}</button>)}</div>}{kind === "projects" && <ProjectList locale={locale} items={filteredItems} t={t} />}{kind === "services" && <ServiceList locale={locale} items={items} t={t} />}{kind === "products" && <ProductList locale={locale} items={items} t={t} />}{(kind === "news" || kind === "blogs") && <ArticleList locale={locale} kind={kind} items={items} t={t} />}{kind === "innovation" && <InnovationList locale={locale} items={items} t={t} />}{!filteredItems.length && <div className="content-state">{stateCopy.empty}</div>}</>}</>}</div><Footer locale={locale} /><CookieNotice locale={locale} /><ChatWidget locale={locale} /></main>;
}
