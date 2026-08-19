"use client";

import { useEffect, useState } from "react";
import type { BrandSettings, Locale } from "@company/contracts";
import { useInitialSiteData } from "./SiteDataContext";
import { useTheme } from "./ThemeProvider";
import { MediaImage } from "./MediaImage";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const BRAND_MARK_URL = "/branding/movera-mark.svg";
const BRAND_WORDMARK_URL = "/branding/movera-wordmark.svg";
const BRAND_SOURCE_URL = "/branding/movera-logo-transparent.png";
const fallbackBrand: BrandSettings = {
  logo: { id: "movera-logo", url: "/branding/movera-lockup.svg", alt: { en: "MOVERA logo", ar: "شعار موفيرا", fr: "Logo MOVERA", nl: "MOVERA-logo" } },
  logoLight: { id: "movera-logo-light", url: "/branding/movera-lockup.svg", alt: { en: "MOVERA logo", ar: "شعار موفيرا", fr: "Logo MOVERA", nl: "MOVERA-logo" } },
  logoDark: { id: "movera-logo-dark", url: "/branding/movera-lockup.svg", alt: { en: "MOVERA logo", ar: "شعار موفيرا", fr: "Logo MOVERA", nl: "MOVERA-logo" } },
  mark: { id: "movera-logo-mark", url: BRAND_MARK_URL, alt: { en: "MOVERA mark", ar: "رمز موفيرا", fr: "Symbole MOVERA", nl: "MOVERA-merk" } },
  markLight: { id: "movera-logo-mark-light", url: BRAND_MARK_URL, alt: { en: "MOVERA mark", ar: "رمز موفيرا", fr: "Symbole MOVERA", nl: "MOVERA-merk" } },
  markDark: { id: "movera-logo-mark-dark", url: BRAND_MARK_URL, alt: { en: "MOVERA mark", ar: "رمز موفيرا", fr: "Symbole MOVERA", nl: "MOVERA-merk" } },
  wordmark: { id: "movera-wordmark", url: BRAND_WORDMARK_URL, alt: { en: "MOVERA wordmark", ar: "اسم موفيرا", fr: "Nom MOVERA", nl: "MOVERA-woordmerk" } },
  wordmarkLight: { id: "movera-wordmark-light", url: BRAND_WORDMARK_URL, alt: { en: "MOVERA wordmark", ar: "اسم موفيرا", fr: "Nom MOVERA", nl: "MOVERA-woordmerk" } },
  wordmarkDark: { id: "movera-wordmark-dark", url: BRAND_WORDMARK_URL, alt: { en: "MOVERA wordmark", ar: "اسم موفيرا", fr: "Nom MOVERA", nl: "MOVERA-woordmerk" } },
  wordmarkText: { en: "MOVERA", ar: "موفيرا", fr: "MOVERA", nl: "MOVERA" },
  aiLabel: { en: "Mobility AI", ar: "ذكاء التنقل", fr: "IA mobilité", nl: "Mobiliteits-AI" },
  aiEnabled: true,
};

let brandRequest: Promise<BrandSettings | null> | null = null;
function loadBrand() {
  if (!brandRequest) {
    brandRequest = fetch(`${API}/api/v1/site`).then(response => response.ok ? response.json() : Promise.reject()).then(payload => payload.data?.brand || null).catch(() => null);
  }
  return brandRequest;
}

function BrandAsset({ kind, media, alt }: { kind: "mark" | "wordmark"; media: BrandSettings["mark"]; alt: string }) {
  const suppliedMOVERAAsset = media?.url?.includes("/branding/movera-mark.svg") || media?.url?.includes("/branding/movera-wordmark.svg");
  if (suppliedMOVERAAsset) {
    return <span className={`brand-asset-crop brand-asset-crop--${kind}`}><img className="brand-source-image" src={BRAND_SOURCE_URL} alt={alt} /></span>;
  }
  return <MediaImage className={kind === "mark" ? "brand-mark-image" : "brand-wordmark-image"} media={media} alt={alt} />;
}

type BrandLockupProps = { variant?: "header" | "footer" | "emblem"; locale?: Locale };

export function BrandLockup({ variant = "header", locale = "en" }: BrandLockupProps) {
  const initialBrand = useInitialSiteData()?.brand || null;
  const { theme } = useTheme();
  const [brand, setBrand] = useState<BrandSettings>(initialBrand || fallbackBrand);
  useEffect(() => {
    if (initialBrand) {
      setBrand(initialBrand);
      return;
    }
    void loadBrand().then(value => { if (value) setBrand(value); });
  }, [initialBrand]);
  const wordmarkText = brand.wordmarkText?.[locale]?.trim() || fallbackBrand.wordmarkText[locale];
  const useEditableWordmark = wordmarkText.toLocaleUpperCase() !== "MOVERA";
  const mark = theme === "light" ? brand.markLight || brand.mark : brand.markDark || brand.mark;
  const wordmark = theme === "light" ? brand.wordmarkLight || brand.wordmark : brand.wordmarkDark || brand.wordmark;
  const resolveBrandAsset = (url: string | undefined, fallback: string) => url || fallback;
  const selectedMark = { ...(mark || fallbackBrand.mark), url: resolveBrandAsset(mark?.url, BRAND_MARK_URL) };
  const selectedWordmark = { ...(wordmark || fallbackBrand.wordmark), url: resolveBrandAsset(wordmark?.url, BRAND_WORDMARK_URL) };
  if (variant === "emblem") {
    return <span data-brand-lockup className="brand-lockup brand-lockup--emblem" aria-hidden="true">
      <BrandAsset kind="mark" media={{ ...selectedMark, alt: { en: "", ar: "", fr: "", nl: "" } }} alt="" />
    </span>;
  }
  return <span data-brand-lockup className={`brand-lockup brand-lockup--${variant}`} aria-label="MOVERA">
    <BrandAsset kind="mark" media={selectedMark} alt={selectedMark.alt?.[locale] || selectedMark.alt?.en || "MOVERA mark"} />
    {useEditableWordmark ? <span className="brand-wordmark-text" aria-label={wordmarkText}>{wordmarkText}</span> : <BrandAsset kind="wordmark" media={selectedWordmark} alt={selectedWordmark.alt?.[locale] || selectedWordmark.alt?.en || "MOVERA wordmark"} />}
  </span>;
}
