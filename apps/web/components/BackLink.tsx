import type { Locale } from "@company/contracts";
import { directionFor } from "@company/contracts";
import { Arrow } from "./icons";

export function BackLinkContent({ locale, label }: { locale: Locale; label: string }) {
  const isRtl = directionFor(locale) === "rtl";
  return isRtl ? <><span className="back-link-label" dir="rtl">{label}</span><Arrow direction="right" /></> : <><Arrow direction="left" /><span className="back-link-label">{label}</span></>;
}
