import { locales, type Locale } from "@company/contracts";
import { GlobalOperationsPage } from "../../../components/AboutEditorialPage";

export default async function RegionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolved = await params;
  const locale = (locales.includes(resolved.locale as Locale) ? resolved.locale : "en") as Locale;
  return <GlobalOperationsPage initialLocale={locale} />;
}
