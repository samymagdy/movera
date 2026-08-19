"use client";

import { useId, useState, type FormEvent } from "react";
import type { Locale } from "@company/contracts";
import { Arrow } from "./icons";
import { recaptchaToken } from "./Recaptcha";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const copy: Record<Locale, { channel: string; title: string; body: string; name: string; email: string; subscribe: string; consent: string; loading: string; success: string; error: string }> = {
  en: { channel: "MOVERA / Open channel", title: "Stay close to the signal", body: "Receive useful updates from MOVERA. No noise.", name: "Name", email: "Email", subscribe: "Subscribe", consent: "I agree to receive MOVERA updates.", loading: "Subscribing…", success: "Thank you — your subscription is confirmed.", error: "We could not complete the subscription." },
  ar: { channel: "موفيرا / قناة مفتوحة", title: "ابق قريباً من الإشارة", body: "استقبل تحديثات مفيدة من موفيرا من دون ضوضاء.", name: "الاسم", email: "البريد الإلكتروني", subscribe: "اشترك", consent: "أوافق على استلام تحديثات موفيرا.", loading: "جارٍ الاشتراك…", success: "شكراً — تم تأكيد اشتراكك.", error: "تعذر إتمام الاشتراك." },
  fr: { channel: "MOVERA / Canal ouvert", title: "Restez au plus près du signal", body: "Recevez les nouvelles utiles de MOVERA, sans bruit.", name: "Nom", email: "E-mail", subscribe: "S’inscrire", consent: "J’accepte de recevoir les nouvelles de MOVERA.", loading: "Inscription…", success: "Merci — votre inscription est confirmée.", error: "Impossible de terminer l’inscription." },
  nl: { channel: "MOVERA / Open kanaal", title: "Blijf dicht bij het signaal", body: "Ontvang nuttige MOVERA-updates. Zonder ruis.", name: "Naam", email: "E-mail", subscribe: "Inschrijven", consent: "Ik ontvang graag updates van MOVERA.", loading: "Inschrijven…", success: "Bedankt — uw inschrijving is bevestigd.", error: "De inschrijving kon niet worden voltooid." },
};

export function NewsletterForm({ locale, source = "website" }: { locale: Locale; source?: string }) {
  const t = copy[locale];
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const nameId = useId();
  const emailId = useId();
  const consentId = useId();
  const statusId = useId();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("loading");
    try {
      const response = await fetch(`${API}/api/v1/newsletter`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: formData.get("name"), email: formData.get("email"), locale, consent: formData.get("consent") === "on", source, recaptchaToken: await recaptchaToken("newsletter", locale) }) });
      if (!response.ok) throw new Error("Newsletter subscription failed");
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return <section className="content-newsletter home-newsletter movera-open-channel" aria-labelledby="newsletter-title">
    <div className="movera-open-channel__copy">
      <p className="eyebrow">{t.channel}</p>
      <h2 id="newsletter-title">{t.title}</h2>
      <p>{t.body}</p>
    </div>
    <form onSubmit={submit} aria-describedby={status === "idle" ? undefined : statusId}>
      <div className="content-form-row">
        <label className="visually-hidden" htmlFor={nameId}>{t.name}</label>
        <input id={nameId} name="name" required aria-required="true" placeholder={t.name} autoComplete="name" />
        <label className="visually-hidden" htmlFor={emailId}>{t.email}</label>
        <input id={emailId} name="email" type="email" required aria-required="true" placeholder={t.email} autoComplete="email" />
        <button className="button button-primary compact" type="submit" disabled={status === "loading"}>{t.subscribe} <Arrow /></button>
      </div>
      <label className="content-consent" htmlFor={consentId}><input id={consentId} name="consent" type="checkbox" required aria-required="true" /><span>{t.consent}</span></label>
      {status === "loading" && <span className="form-status" id={statusId} role="status">{t.loading}</span>}
      {status === "success" && <span className="form-status success" id={statusId} role="status">{t.success}</span>}
      {status === "error" && <span className="form-status error" id={statusId} role="alert">{t.error}</span>}
    </form>
  </section>;
}
