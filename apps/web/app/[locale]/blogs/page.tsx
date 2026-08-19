import { EditorialContentPage } from "../../../components/EditorialContentPage";
import { locales, type Locale } from "@company/contracts";
export default async function BlogsPage({ params }: { params: Promise<{ locale: string }> }) { const resolved = await params; return <EditorialContentPage initialLocale={(locales.includes(resolved.locale as Locale) ? resolved.locale : "en") as Locale} kind="blogs" />; }
