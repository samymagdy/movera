import { PublicContentPage } from "../../../components/PublicContentPage";
import { locales, type Locale } from "@company/contracts";
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) { const resolved = await params; return <PublicContentPage initialLocale={(locales.includes(resolved.locale as Locale) ? resolved.locale : "en") as Locale} kind="pages" slug="privacy-policy" />; }
