"use client";

import { useEffect } from "react";
import type { Locale } from "@company/contracts";

const supported: Locale[] = ["en", "ar", "fr", "nl"];

export function LocaleRedirect() {
  useEffect(() => {
    let locale: Locale = "en";
    try {
      const stored = window.localStorage.getItem("company-locale") as Locale | null;
      if (stored && supported.includes(stored)) locale = stored;
    } catch { /* essential-only fallback */ }
    window.location.replace(`/${locale}`);
  }, []);
  return <main className="site-shell content-state" aria-live="polite">Loading…</main>;
}
