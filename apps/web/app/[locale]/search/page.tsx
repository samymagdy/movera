import { PublicSearchPage } from "../../../components/PublicContentPage";
import { locales, type Locale } from "@company/contracts";
export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) { const resolved = await params; return <PublicSearchPage initialLocale={(locales.includes(resolved.locale as Locale) ? resolved.locale : "en") as Locale} />; }
