import { ContactPage as ContactPageView } from "../../../components/ContactPage";

export default async function ContactRoute({ params }: { params: Promise<{ locale: string }> }) {
  const resolved = await params;
  return <ContactPageView initialLocale={(resolved.locale || "en") as "en" | "ar" | "fr" | "nl"} />;
}
