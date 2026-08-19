"use client";

import { useEffect, useMemo, useState } from "react";
import type { ContentItem, Locale, RegionContent, SiteData } from "@company/contracts";
import { directionFor } from "@company/contracts";
import { Arrow, SparkIcon } from "./icons";
import { BackLinkContent } from "./BackLink";
import { ChatWidget, CookieNotice, Footer } from "./PublicContentPage";
import { sampleData } from "./sampleData";
import { useInitialSiteData } from "./SiteDataContext";
import { SiteHeader } from "./SiteHeader";
import { MediaImage } from "./MediaImage";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const pathFor = (locale: Locale, path = "") => `/${locale}${path}`;
const copy = {
  en: { about: "MOVERA / About", global: "MOVERA / Belgium", explore: "Brussels, Flanders and Wallonia each reveal a different mobility challenge and a shared need for clear operational decisions.", contact: "Contact MOVERA", back: "Back to About MOVERA", location: "Location", hours: "Working hours", email: "Email", capabilities: "Regional focus", connected: "Three regions. One mobility context.", view: "Explore region", open: "Open page" },
  ar: { about: "موفيرا / عن موفيرا", global: "موفيرا / بلجيكا", explore: "تكشف بروكسل وفلاندرز ووالونيا عن تحديات مختلفة للتنقل وحاجة مشتركة إلى قرارات تشغيلية واضحة.", contact: "تواصل مع موفيرا", back: "العودة إلى صفحة موفيرا", location: "الموقع", hours: "ساعات العمل", email: "البريد الإلكتروني", capabilities: "التركيز الإقليمي", connected: "ثلاث مناطق. سياق تنقل واحد.", view: "استكشف المنطقة", open: "فتح الصفحة" },
  fr: { about: "MOVERA / À propos", global: "MOVERA / Belgique", explore: "Bruxelles, la Flandre et la Wallonie posent chacune un défi de mobilité différent, avec un même besoin de décisions opérationnelles claires.", contact: "Contacter MOVERA", back: "Retour à MOVERA", location: "Lieu", hours: "Horaires", email: "E-mail", capabilities: "Priorités régionales", connected: "Trois régions. Un même contexte de mobilité.", view: "Explorer la région", open: "Ouvrir la page" },
  nl: { about: "MOVERA / Over MOVERA", global: "MOVERA / België", explore: "Brussel, Vlaanderen en Wallonië tonen elk een andere mobiliteitsuitdaging en dezelfde behoefte aan heldere operationele beslissingen.", contact: "Neem contact op", back: "Terug naar MOVERA", location: "Locatie", hours: "Contacturen", email: "E-mail", capabilities: "Regionale focus", connected: "Drie regio’s. Eén mobiliteitscontext.", view: "Ontdek de regio", open: "Pagina openen" },
} as const;

function PageFrame({ locale, setLocale, children, label }: { locale: Locale; setLocale: (locale: Locale) => void; children: React.ReactNode; label?: string }) {
  const t = copy[locale];
  return <main className={`site-shell locale-${locale} about-editorial-shell`} dir={directionFor(locale)}><SiteHeader locale={locale} setLocale={setLocale} /><div className="about-editorial-content"><div className="about-editorial-topline"><span>{label || t.about}</span></div>{children}</div><Footer locale={locale} /><CookieNotice locale={locale} /><ChatWidget locale={locale} /></main>;
}

function MediaFrame({ media, url, alt, caption, className = "" }: { media?: import("@company/contracts").MediaAsset; url?: string; alt: string; caption?: string; className?: string }) {
  return <div className={`about-media-frame ${className}`}>{media || url ? <MediaImage media={media} url={url} alt={alt} caption={caption} lightbox loading="lazy" /> : <div className="about-media-placeholder" aria-hidden="true"><SparkIcon /></div>}</div>;
}

function AboutIntro({ page, locale }: { page: ContentItem; locale: Locale }) {
  const t = copy[locale];
  return <div className="about-editorial-intro"><p className="eyebrow">{t.about}</p><h1>{page.title[locale]}</h1><p>{page.summary[locale]}</p></div>;
}

function AboutBack({ locale }: { locale: Locale }) {
  return <div className="about-page-back"><a className="about-back-link back-action" href={pathFor(locale, "/about")}><BackLinkContent locale={locale} label={copy[locale].back} /></a></div>;
}

function StoryPage({ page, locale, setLocale }: { page: ContentItem; locale: Locale; setLocale: (locale: Locale) => void }) {
  const sections = page.sections || [];
  return <PageFrame locale={locale} setLocale={setLocale}><AboutIntro page={page} locale={locale} /><div className="about-story-lead"><div className="about-story-copy"><span className="about-section-index" aria-hidden="true">01</span><p className="eyebrow">{sections[0]?.eyebrow?.[locale]}</p><h2>{sections[0]?.title[locale]}</h2><p>{sections[0]?.body[locale] || page.body[locale]}</p><ul>{sections[0]?.bullets?.map(bullet => <li key={bullet[locale]}>{bullet[locale]}</li>)}</ul></div><MediaFrame media={sections[0]?.media || page.cover} alt={sections[0]?.media?.alt[locale] || page.cover?.alt[locale] || page.title[locale]} caption={sections[0]?.media?.caption?.[locale] || page.cover?.caption?.[locale]} /></div><section className="about-principles"><div><span className="about-section-index" aria-hidden="true">02</span><p className="eyebrow">{sections[1]?.title[locale]}</p><p>{sections[1]?.body[locale]}</p></div><div className="about-value-rail">{(sections[1]?.bullets || []).map(value => <div key={value[locale]}><strong>{value[locale]}</strong></div>)}</div></section><AboutBack locale={locale} /></PageFrame>;
}

function HistoryPage({ page, locale, setLocale }: { page: ContentItem; locale: Locale; setLocale: (locale: Locale) => void }) {
  return <PageFrame locale={locale} setLocale={setLocale}><AboutIntro page={page} locale={locale} /><section className="about-timeline">{(page.timeline || []).map((entry, index) => <article className="about-timeline-entry" key={entry.id}><div className="about-timeline-marker"><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span></div><div className="about-timeline-copy"><p className="eyebrow">{entry.label[locale]}</p><h2>{entry.title[locale]}</h2><p>{entry.body[locale]}</p></div>{entry.media && <MediaFrame media={entry.media} alt={entry.media.alt[locale]} caption={entry.media.caption?.[locale]} className="about-timeline-media" />}</article>)}</section><AboutBack locale={locale} /></PageFrame>;
}

function VisionPage({ page, locale, setLocale }: { page: ContentItem; locale: Locale; setLocale: (locale: Locale) => void }) {
  const sections = page.sections || [];
  return <PageFrame locale={locale} setLocale={setLocale}><AboutIntro page={page} locale={locale} /><section className="about-vision-split">{sections.map((entry, index) => <article className={`about-vision-panel about-vision-panel--${index === 0 ? "vision" : "mission"}`} key={entry.id}><span className="about-section-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h2>{entry.title[locale]}</h2><p>{entry.body[locale]}</p><ul>{entry.bullets?.map(bullet => <li key={bullet[locale]}>{bullet[locale]}</li>)}</ul></article>)}</section><section className="about-vision-note"><p>{page.body[locale]}</p></section><AboutBack locale={locale} /></PageFrame>;
}

function LeadershipPage({ page, locale, setLocale }: { page: ContentItem; locale: Locale; setLocale: (locale: Locale) => void }) {
  const profiles = page.profiles || [];
  return <PageFrame locale={locale} setLocale={setLocale}><AboutIntro page={page} locale={locale} /><section className="about-leadership-list">{profiles.map((profile, index) => <article className={`about-profile about-profile--${index === 0 ? "feature" : "standard"}`} key={profile.id}><span className="about-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><MediaFrame media={profile.portrait} alt={profile.portrait?.alt[locale] || profile.name[locale]} caption={profile.portrait?.caption?.[locale]} className="about-profile-media" /><div className="about-profile-copy"><p className="eyebrow">{profile.role[locale]}</p><h2>{profile.name[locale]}</h2><p>{profile.summary[locale]}</p></div></article>)}</section><AboutBack locale={locale} /></PageFrame>;
}

function CertificatesPage({ page, locale, setLocale }: { page: ContentItem; locale: Locale; setLocale: (locale: Locale) => void }) {
  return <PageFrame locale={locale} setLocale={setLocale}><AboutIntro page={page} locale={locale} /><div className="about-certificates-head"><p>{page.body[locale]}</p></div><section className="about-credentials">{(page.credentials || []).map((credential, index) => <article className="about-credential" key={credential.id}><span className="about-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{credential.media ? <MediaFrame media={credential.media} alt={credential.media.alt[locale]} caption={credential.media.caption?.[locale]} className="about-credential-media" /> : <div className="about-credential-mark" aria-hidden="true"><SparkIcon /></div>}<div><p className="eyebrow">{credential.issuer[locale]}</p><h2>{credential.title[locale]}</h2><p>{credential.description[locale]}</p></div><Arrow /></article>)}</section><AboutBack locale={locale} /></PageFrame>;
}

export function AboutEditorialPage({ initialLocale, slug }: { initialLocale: Locale; slug: string }) {
  const [locale, setLocale] = useState(initialLocale);
  const initialSiteData = useInitialSiteData();
  const [data, setData] = useState<SiteData>(initialSiteData || sampleData);
  useEffect(() => { if (initialSiteData) return; fetch(`${API}/api/v1/site`).then(response => response.ok ? response.json() : Promise.reject()).then(payload => payload.data && setData(payload.data)).catch(() => undefined); }, [initialSiteData]);
  const page = useMemo(() => data.pages.find(entry => entry.id === slug), [data.pages, slug]);
  if (!page || slug === "ceo-message") return <PageFrame locale={locale} setLocale={setLocale}><div className="content-state">{locale === "ar" ? "جارٍ تحميل المحتوى…" : locale === "fr" ? "Chargement du contenu…" : locale === "nl" ? "Inhoud laden…" : "Loading content…"}</div></PageFrame>;
  const props = { page, locale, setLocale };
  if (page.aboutLayout === "timeline") return <HistoryPage {...props} />;
  if (page.aboutLayout === "vision") return <VisionPage {...props} />;
  if (page.aboutLayout === "leadership") return <LeadershipPage {...props} />;
  if (page.aboutLayout === "certificates") return <CertificatesPage {...props} />;
  return <StoryPage {...props} />;
}

function RegionPageBody({ current, locale }: { current: RegionContent; locale: Locale }) {
  const t = copy[locale];
  return <><div className="regional-hero"><div className="regional-hero-copy"><p className="eyebrow">{t.global}</p><h1>{current.title[locale]}</h1><p>{current.summary[locale]}</p><a className="button button-primary" href={pathFor(locale, "/contact")}>{t.contact} <Arrow /></a></div><MediaFrame media={current.cover} alt={current.cover?.alt[locale] || current.title[locale]} caption={current.cover?.caption?.[locale]} /></div><section className="regional-detail"><div><p className="eyebrow">{t.capabilities}</p><h2>{current.body[locale]}</h2></div><div className="regional-capabilities">{(current.capabilities || []).map((capability, index) => <div key={capability[locale]}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><strong>{capability[locale]}</strong><Arrow /></div>)}</div></section><section className="regional-contact-strip"><div><span>{t.location}</span><strong>{current.address[locale]}</strong></div><div><span>{t.hours}</span><strong>{current.hours[locale]}</strong></div><div><span>{t.email}</span><strong>{current.email}</strong></div></section></>;
}

export function PublicRegionPage({ initialLocale, region }: { initialLocale: Locale; region: "hub-a" | "hub-b" | "hub-c" }) {
  const [locale, setLocale] = useState(initialLocale);
  const initialSiteData = useInitialSiteData();
  const [data, setData] = useState<SiteData>(initialSiteData || sampleData);
  const current = data.regions.find(item => item.code === region);
  useEffect(() => { if (initialSiteData) return; fetch(`${API}/api/v1/site`).then(response => response.ok ? response.json() : Promise.reject()).then(payload => payload.data && setData(payload.data)).catch(() => undefined); }, [initialSiteData]);
  if (!current) return null;
  return <PageFrame locale={locale} setLocale={setLocale} label={copy[locale].global}><RegionPageBody current={current} locale={locale} /></PageFrame>;
}

export function GlobalOperationsPage({ initialLocale }: { initialLocale: Locale }) {
  const [locale, setLocale] = useState(initialLocale);
  const initialSiteData = useInitialSiteData();
  const [data, setData] = useState<SiteData>(initialSiteData || sampleData);
  const t = copy[locale];
  useEffect(() => { if (initialSiteData) return; fetch(`${API}/api/v1/site`).then(response => response.ok ? response.json() : Promise.reject()).then(payload => payload.data && setData(payload.data)).catch(() => undefined); }, [initialSiteData]);
  return <PageFrame locale={locale} setLocale={setLocale} label={t.global}><div className="global-hero"><p className="eyebrow">{t.global}</p><h1>{t.connected}</h1><p>{t.explore}</p><MediaFrame media={data.regions[0]?.cover} url={data.regions[0]?.cover ? undefined : "/starter-media/movera-hero-field.svg"} alt={data.regions[0]?.cover?.alt[locale] || t.global} caption={data.regions[0]?.cover?.caption?.[locale]} /></div><section className="global-region-list">{data.regions.map((region, index) => <a href={pathFor(locale, `/regions/${region.code}`)} key={region.code}><span className="eyebrow">{String(index + 1).padStart(2, "0")}</span><h2>{region.title[locale]}</h2><p>{region.summary[locale]}</p><span>{t.view} <Arrow /></span></a>)}</section></PageFrame>;
}
