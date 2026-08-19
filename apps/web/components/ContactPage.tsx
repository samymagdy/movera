"use client";

import { useState } from "react";
import type { Locale } from "@company/contracts";
import { directionFor } from "@company/contracts";
import { Arrow } from "./icons";
import { CookieNotice, Footer } from "./PublicContentPage";
import { SiteHeader } from "./SiteHeader";
import { recaptchaToken } from "./Recaptcha";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const copy = {
  en: { eyebrow: "MOVERA / Contact", title: "Put the next mobility decision in motion.", intro: "Tell us where vehicles, operations, or passenger experience need greater clarity. We will connect your enquiry with the right MOVERA discipline.", aside: "Working with MOVERA", details: "Start with the operating question. We will shape the next conversation around it.", name: "Name", email: "Email", subject: "Subject", message: "Message", consent: "I agree that my details may be used to answer this enquiry.", send: "Send enquiry", sending: "Sending your enquiry…", success: "Thank you — your enquiry is with the MOVERA team.", error: "Please check the required fields and try again.", emailLabel: "Email", locationLabel: "Location", hoursLabel: "Working hours", location: "Belgium · meetings by appointment", hours: "Monday–Friday · 09:00–17:00 CET" },
  ar: { eyebrow: "موفيرا / تواصل معنا", title: "لنضع قرار التنقل التالي قيد الحركة.", intro: "أخبرنا أين تحتاج المركبات أو العمليات أو تجربة الركاب إلى وضوح أكبر، وسنصل استفسارك بالتخصص المناسب في موفيرا.", aside: "العمل مع موفيرا", details: "ابدأ بالسؤال التشغيلي، وسنبني حوله المحادثة التالية.", name: "الاسم", email: "البريد الإلكتروني", subject: "الموضوع", message: "الرسالة", consent: "أوافق على استخدام بياناتي للرد على هذا الاستفسار.", send: "إرسال الاستفسار", sending: "جارٍ إرسال الاستفسار…", success: "شكراً — وصل استفسارك إلى فريق موفيرا.", error: "يرجى مراجعة الحقول المطلوبة والمحاولة مرة أخرى.", emailLabel: "البريد الإلكتروني", locationLabel: "الموقع", hoursLabel: "ساعات العمل", location: "بلجيكا · الاجتماعات بموعد مسبق", hours: "الاثنين–الجمعة · 09:00–17:00 بتوقيت وسط أوروبا" },
  fr: { eyebrow: "MOVERA / Contact", title: "Mettons en mouvement la prochaine décision.", intro: "Dites-nous où véhicules, opérations ou expérience passager ont besoin de plus de clarté. Nous confierons votre demande à la bonne discipline MOVERA.", aside: "Travailler avec MOVERA", details: "Partons de la question opérationnelle. La suite de l’échange prendra forme autour d’elle.", name: "Nom", email: "E-mail", subject: "Objet", message: "Message", consent: "J’accepte que mes données soient utilisées pour répondre à cette demande.", send: "Envoyer la demande", sending: "Envoi de votre demande…", success: "Merci — votre demande est entre les mains de l’équipe MOVERA.", error: "Vérifiez les champs obligatoires et réessayez.", emailLabel: "E-mail", locationLabel: "Localisation", hoursLabel: "Horaires", location: "Belgique · rencontres sur rendez-vous", hours: "Lundi–vendredi · 09:00–17:00 CET" },
  nl: { eyebrow: "MOVERA / Contact", title: "Breng de volgende mobiliteitsbeslissing in beweging.", intro: "Vertel ons waar voertuigen, operaties of passagierservaring meer duidelijkheid vragen. Wij brengen uw vraag bij de juiste MOVERA-discipline.", aside: "Werken met MOVERA", details: "Begin bij de operationele vraag. Daar bouwen we het volgende gesprek rond.", name: "Naam", email: "E-mail", subject: "Onderwerp", message: "Bericht", consent: "Ik ga ermee akkoord dat mijn gegevens worden gebruikt om deze vraag te beantwoorden.", send: "Vraag versturen", sending: "Uw vraag wordt verstuurd…", success: "Bedankt — uw vraag is bij het MOVERA-team aangekomen.", error: "Controleer de verplichte velden en probeer het opnieuw.", emailLabel: "E-mail", locationLabel: "Locatie", hoursLabel: "Werkuren", location: "België · afspraken op aanvraag", hours: "Maandag–vrijdag · 09:00–17:00 CET" },
} as const;

export function ContactPage({ initialLocale }: { initialLocale: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [status, setStatus] = useState("");
  const t = copy[locale];

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("loading");
    try {
      const response = await fetch(`${API}/api/v1/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), subject: form.get("subject"), message: form.get("message"), locale, privacy: form.get("privacy") === "on", honeypot: form.get("company") || "", recaptchaToken: await recaptchaToken("contact", locale) }) });
      setStatus(response.ok ? "success" : "error");
      if (response.ok) event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  };

  return <main className={`site-shell locale-${locale}`} dir={directionFor(locale)}>
    <SiteHeader locale={locale} setLocale={setLocale} />
    <div className="content-page-shell section-pad contact-page-shell">
      <div className="content-page-head contact-page-head"><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.intro}</p></div>
      <div className="contact-layout">
        <aside className="contact-info-panel"><p className="eyebrow">{t.aside}</p><h2>{t.details}</h2><div className="contact-info-cards"><div className="contact-info-card"><span>{t.emailLabel}</span><a href="mailto:hello@movera.ai">hello@movera.ai</a></div><div className="contact-info-card"><span>{t.locationLabel}</span><strong>{t.location}</strong></div><div className="contact-info-card"><span>{t.hoursLabel}</span><strong>{t.hours}</strong></div></div></aside>
        <form className="dedicated-contact-form" onSubmit={submit}>
          <div className="contact-field-grid"><label><span>{t.name}</span><input name="name" required autoComplete="name" /></label><label><span>{t.email}</span><input name="email" type="email" required autoComplete="email" /></label></div>
          <label><span>{t.subject}</span><input name="subject" required /></label>
          <label><span>{t.message}</span><textarea name="message" rows={7} required /></label>
          <input className="contact-honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label className="contact-consent"><input name="privacy" type="checkbox" required /><span>{t.consent}</span></label>
          <div className="contact-form-actions"><button className="button button-primary" type="submit" disabled={status === "loading"}>{status === "loading" ? t.sending : t.send} <Arrow /></button>{status === "success" && <span className="form-status success" role="status">{t.success}</span>}{status === "error" && <span className="form-status error" role="status">{t.error}</span>}</div>
        </form>
      </div>
    </div>
    <Footer locale={locale} />
    <CookieNotice locale={locale} />
  </main>;
}
