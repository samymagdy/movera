import "../globals.css";
import "../home-newsletter.css";
import "../ceo-message.css";
import "../about-editorial.css";
import "../theme.css";
import "../triangle-hero.css";
import "../home-first.css";
import "../homepage-bands.css";
import "../image-lightbox.css";
import "../homepage-scroll-background.css";
import "../movera-light.css";
import "../homepage-intelligence.css";
import "../homepage-platform.css";
import "../chatbot.css";
import type { Metadata } from "next";
import { directionFor, locales, type Locale, type SiteData } from "@company/contracts";
import { ThemeProvider } from "../../components/ThemeProvider";
import { SiteDataProvider } from "../../components/SiteDataContext";
import { ImageLightboxProvider } from "../../components/ImageLightbox";

const localeMetadata: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "MOVERA — Mobility intelligence",
    description: "MOVERA connects autonomous systems, intelligent vehicles, and the people who keep mobility moving.",
  },
  ar: {
    title: "موفيرا — ذكاء التنقل",
    description: "تربط موفيرا أنظمة القيادة الذاتية والمركبات الذكية بالأشخاص الذين يحافظون على انسيابية الحركة.",
  },
  fr: {
    title: "MOVERA — Intelligence mobilité",
    description: "MOVERA relie systèmes autonomes, véhicules intelligents et équipes qui font avancer la mobilité.",
  },
  nl: {
    title: "MOVERA — Mobiliteitsintelligentie",
    description: "MOVERA verbindt autonome systemen, intelligente voertuigen en de mensen die mobiliteit in beweging houden.",
  },
};

const resolveLocale = (value: string): Locale => locales.includes(value as Locale) ? value as Locale : "en";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  return {
    ...localeMetadata[resolvedLocale],
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    icons: { icon: "/branding/movera-mark.svg", shortcut: "/branding/movera-mark.svg", apple: "/branding/movera-mark.svg" },
  };
}

async function getInitialSiteData(): Promise<SiteData | null> {
  const apiBase = process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  try {
    const response = await fetch(`${apiBase}/api/v1/site`, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json() as { data?: SiteData };
    return payload.data || null;
  } catch {
    return null;
  }
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const [{ locale }, initialSiteData] = await Promise.all([params, getInitialSiteData()]);
  const resolvedLocale = resolveLocale(locale);
  const themeBootstrap = `document.documentElement.dataset.theme = "light"`;
  return <html lang={resolvedLocale} dir={directionFor(resolvedLocale)} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head><body><SiteDataProvider initialData={initialSiteData}><ThemeProvider><ImageLightboxProvider>{children}</ImageLightboxProvider></ThemeProvider></SiteDataProvider></body></html>;
}
