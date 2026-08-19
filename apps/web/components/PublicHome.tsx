"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Locale, SiteData } from "@company/contracts";
import { directionFor } from "@company/contracts";
import { Arrow } from "./icons";
import { NewsletterForm } from "./NewsletterForm";
import { byIds, sampleData } from "./sampleData";
import { ChatWidget, CookieNotice, Footer } from "./PublicContentPage";
import { SiteHeader } from "./SiteHeader";
import { recaptchaToken } from "./Recaptcha";
import { useInitialSiteData } from "./SiteDataContext";
import { HomepageFirstSection } from "./HomepageFirstSection";
import { MoveraPlatformStory } from "./MoveraPlatformStory";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const copy = {
  en: { contact: "Start a conversation", title: "Start with the operating question.", name: "Name", email: "Email", subject: "Subject", message: "Message", consent: "I agree that my details may be used to answer this enquiry.", send: "Send enquiry", sending: "Sending your enquiry…", success: "Thank you — your enquiry is with the MOVERA team.", error: "We could not send your enquiry. Please try again." },
  ar: { contact: "ابدأ محادثة", title: "لنبدأ بالسؤال التشغيلي.", name: "الاسم", email: "البريد الإلكتروني", subject: "الموضوع", message: "الرسالة", consent: "أوافق على استخدام بياناتي للرد على هذا الاستفسار.", send: "إرسال الاستفسار", sending: "جارٍ إرسال الاستفسار…", success: "شكراً — وصل استفسارك إلى فريق موفيرا.", error: "تعذر إرسال الاستفسار. يرجى المحاولة مرة أخرى." },
  fr: { contact: "Entamer une conversation", title: "Partons de la question opérationnelle.", name: "Nom", email: "E-mail", subject: "Objet", message: "Message", consent: "J’accepte que mes données soient utilisées pour répondre à cette demande.", send: "Envoyer la demande", sending: "Envoi de votre demande…", success: "Merci — votre demande est entre les mains de l’équipe MOVERA.", error: "Votre demande n’a pas pu être envoyée. Veuillez réessayer." },
  nl: { contact: "Start een gesprek", title: "Begin bij de operationele vraag.", name: "Naam", email: "E-mail", subject: "Onderwerp", message: "Bericht", consent: "Ik ga ermee akkoord dat mijn gegevens worden gebruikt om deze vraag te beantwoorden.", send: "Vraag versturen", sending: "Uw vraag wordt verstuurd…", success: "Bedankt — uw vraag is bij het MOVERA-team aangekomen.", error: "Uw vraag kon niet worden verstuurd. Probeer het opnieuw." },
} as const;

function localePath(locale: Locale, path = "") { return `/${locale}${path}`; }

function containsAiMention(value: string | undefined) {
  return /\b(ai|ia)\b|الذكاء الاصطناعي/i.test(value || "");
}

function isAiNewsItem(item: SiteData["news"][number]) {
  return Object.values(item.title).some(containsAiMention) || Object.values(item.summary).some(containsAiMention);
}

export function PublicHome({ initialLocale, focusSection }: { initialLocale: Locale; focusSection?: string }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const initialSiteData = useInitialSiteData();
  const [data, setData] = useState<SiteData>(initialSiteData || sampleData);
  const [contactStatus, setContactStatus] = useState("");
  const t = copy[locale];
  const dir = directionFor(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [dir, locale]);

  useEffect(() => {
    if (initialSiteData) return;
    fetch(`${API}/api/v1/site`).then(res => res.ok ? res.json() : Promise.reject()).then(payload => payload.data && setData(payload.data)).catch(() => undefined);
  }, [initialSiteData]);

  useEffect(() => {
    if (focusSection) setTimeout(() => document.getElementById(focusSection === "contact" ? "contact-form" : focusSection)?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [focusSection]);

  const latestNews = useMemo(() => {
    const configuredIds = data.homepage.latestNews?.length
      ? data.homepage.latestNews
      : data.homepage.bands?.find(band => band.id === "news")?.itemIds || data.news.map(item => item.id);
    return byIds(data.news, configuredIds).filter(item => item.status !== "archived" && item.status !== "draft" && !isAiNewsItem(item));
  }, [data]);

  const hero = data.homepage.hero;

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setContactStatus(t.sending);
    try {
      const response = await fetch(`${API}/api/v1/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), subject: form.get("subject"), message: form.get("message"), locale, privacy: form.get("privacy") === "on", honeypot: form.get("company") || "", recaptchaToken: await recaptchaToken("homepage", locale) }) });
      setContactStatus(response.ok ? t.success : t.error);
      if (response.ok) event.currentTarget.reset();
    } catch {
      setContactStatus(t.error);
    }
  };

  return <main className={`site-shell homepage-shell locale-${locale}`} dir={dir}>
    <SiteHeader locale={locale} setLocale={setLocale} newsItems={latestNews.map(item => ({ href: `/news/${item.slug[locale]}`, title: item.title[locale] }))} />
    <HomepageFirstSection locale={locale} hero={hero} />
    <MoveraPlatformStory locale={locale} products={data.products} />
    <NewsletterForm locale={locale} source="homepage" />
    {focusSection === "contact" && <section className="contact-form-section section-pad" id="contact-form"><div className="contact-form-copy"><p className="eyebrow">{t.contact}</p><h2>{t.title}</h2><p>{hero.description[locale]}</p></div><form className="contact-form" onSubmit={submitContact}><label><span>{t.name}</span><input name="name" required autoComplete="name" /></label><label><span>{t.email}</span><input name="email" type="email" required autoComplete="email" /></label><label><span>{t.subject}</span><input name="subject" required /></label><label><span>{t.message}</span><textarea name="message" rows={5} required /></label><label className="contact-consent"><input name="privacy" type="checkbox" required /><span>{t.consent}</span></label><div className="contact-form-actions"><button className="button button-primary" type="submit">{t.send} <Arrow /></button>{contactStatus && <span className="contact-status" role="status" aria-live="polite">{contactStatus}</span>}</div></form></section>}
    <Footer locale={locale} />
    <CookieNotice locale={locale} />
    <ChatWidget locale={locale} />
  </main>;
}
