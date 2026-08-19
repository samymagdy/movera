import { PublicHome } from "../../components/PublicHome";

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const resolved = await params;
  const locale = ["en", "ar", "fr", "nl"].includes(resolved.locale) ? resolved.locale : "en";
  return <PublicHome initialLocale={locale as "en" | "ar" | "fr" | "nl"} />;
}
