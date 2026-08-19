"use client";

import { useEffect, useState } from "react";
import type { CEOMessageContent, Locale, SiteData } from "@company/contracts";
import { directionFor } from "@company/contracts";
import { BackLinkContent } from "./BackLink";
import { ChatWidget, CookieNotice, Footer } from "./PublicContentPage";
import { SiteHeader } from "./SiteHeader";
import { MediaImage } from "./MediaImage";
import { useInitialSiteData } from "./SiteDataContext";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const ui = {
  en: { loading: "Loading message…", error: "We could not load this message.", kicker: "MOVERA / About MOVERA", intro: "A message from MOVERA’s leadership.", portrait: "CEO portrait", back: "Back to About MOVERA", chat: "Ask MOVERA" },
  ar: { loading: "جارٍ تحميل الرسالة…", error: "تعذر تحميل هذه الرسالة.", kicker: "موفيرا / عن موفيرا", intro: "رسالة من قيادة موفيرا.", portrait: "صورة الرئيس التنفيذي", back: "العودة إلى عن موفيرا", chat: "اسأل موفيرا" },
  fr: { loading: "Chargement du message…", error: "Impossible de charger ce message.", kicker: "MOVERA / À propos de MOVERA", intro: "Un message de la direction de MOVERA.", portrait: "Portrait du directeur général", back: "Retour à À propos de MOVERA", chat: "Demander à MOVERA" },
  nl: { loading: "Bericht laden…", error: "Dit bericht kon niet worden geladen.", kicker: "MOVERA / Over MOVERA", intro: "Een bericht van de leiding van MOVERA.", portrait: "Portret van de algemeen directeur", back: "Terug naar Over MOVERA", chat: "Vraag MOVERA" },
} as const;

function isPublicCEO(content?: CEOMessageContent) {
  return Boolean(content && content.status !== "archived" && content.status !== "draft");
}

export function CEOMessagePage({ initialLocale }: { initialLocale: Locale }) {
  const [locale, setLocale] = useState(initialLocale);
  const initialSiteData = useInitialSiteData();
  const [content, setContent] = useState<CEOMessageContent | undefined>(initialSiteData?.ceoMessage);
  const [loading, setLoading] = useState(!initialSiteData);
  const [error, setError] = useState(false);
  const t = ui[locale];
  useEffect(() => {
    if (initialSiteData) return;
    fetch(`${API}/api/v1/site`).then(response => response.ok ? response.json() : Promise.reject()).then(payload => setContent(payload.data?.ceoMessage)).catch(() => setError(true)).finally(() => setLoading(false));
  }, [initialSiteData]);
  return <main className={`site-shell locale-${locale} ceo-page`} dir={directionFor(locale)}><SiteHeader locale={locale} setLocale={setLocale} /><div className="ceo-page-shell">{loading && <div className="ceo-state">{t.loading}</div>}{error && <div className="ceo-state ceo-state--error">{t.error}</div>}{!loading && !error && isPublicCEO(content) && content && <article className="ceo-composition"><header className="ceo-intro"><p className="eyebrow">{t.kicker}</p><h1>{content.title[locale]}</h1><p className="ceo-intro-line">{t.intro}</p></header><div className="ceo-grid"><figure className="ceo-portrait-figure"><div className="ceo-portrait-frame"><MediaImage media={content.portrait} alt={content.portrait.alt[locale] || content.portrait.alt.en} caption={content.portrait.caption?.[locale]} lightbox width="300" height="300" style={{ objectPosition: `${content.portrait.focalX ?? 50}% ${content.portrait.focalY ?? 50}%` }} /></div><figcaption><strong>{content.name[locale]}</strong><span>{content.position[locale]}</span></figcaption></figure><div className="ceo-message-column"><div className="ceo-message-meta"><span>01</span><span>{content.position[locale]}</span></div><div className="ceo-message-copy">{content.message.map((paragraph, index) => <p key={index}>{paragraph[locale]}</p>)}</div>{content.pullQuote && <blockquote><span>“</span><p>{content.pullQuote[locale]}</p></blockquote>}<a className="ceo-back-link back-action" href={`/${locale}/about`}><BackLinkContent locale={locale} label={t.back} /></a></div></div></article>}{!loading && !error && !isPublicCEO(content) && <div className="ceo-state">{t.error}</div>}</div><Footer locale={locale} /><CookieNotice locale={locale} /><ChatWidget locale={locale} /></main>;
}
