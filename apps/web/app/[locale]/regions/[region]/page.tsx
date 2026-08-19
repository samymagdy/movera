import { PublicRegionPage } from "../../../../components/AboutEditorialPage";
import { locales, type Locale } from "@company/contracts";
const regions = ["hub-a", "hub-b", "hub-c"] as const;
export default async function RegionPage({ params }: { params: Promise<{ locale: string; region: string }> }) { const resolved = await params; const region = regions.includes(resolved.region as (typeof regions)[number]) ? resolved.region as (typeof regions)[number] : "hub-a"; return <PublicRegionPage initialLocale={(locales.includes(resolved.locale as Locale) ? resolved.locale : "en") as Locale} region={region} />; }
