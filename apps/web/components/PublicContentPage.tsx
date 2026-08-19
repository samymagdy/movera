"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssistantSettings, ContentItem, ContentKind, Locale, SiteData } from "@company/contracts";
import { directionFor } from "@company/contracts";
import { Arrow, CloseIcon, SearchIcon, SocialIcon } from "./icons";
import { BrandLockup } from "./BrandLockup";
import { sampleData } from "./sampleData";
import { footerCopy, SiteHeader } from "./SiteHeader";
import { recaptchaToken } from "./Recaptcha";
import { useInitialSiteData } from "./SiteDataContext";
import { MediaImage } from "./MediaImage";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const uiCopy = {
  en: { search: "Search", loading: "Loading content…", empty: "No published content is available.", error: "This content is temporarily unavailable.", view: "View details", back: "Back", latest: "Latest", read: "Read more", newsletter: "Stay close to the signal", newsletterBody: "Receive useful updates from MOVERA. No noise.", name: "Name", email: "Email", phone: "Phone", subscribe: "Subscribe", consent: "I agree to receive MOVERA updates.", success: "Thank you — your subscription is confirmed.", apply: "Apply now", cv: "CV / résumé", chooseFile: "Choose file", noFile: "No file chosen", cover: "Cover note", send: "Send application", submitted: "Thank you — your application has been received.", filter: "Filter by service or product", sectorFilter: "Filter by sector", all: "All", clear: "Clear filters", privacy: "Privacy Policy", terms: "Terms of Use", cookies: "Cookie Policy", chat: "Ask MOVERA", chatIntro: "I can help you find answers across MOVERA’s services, projects, and perspectives.", chatServicesPrompt: "What does MOVERA do?", chatProjectsPrompt: "Show me the programmes", sendChat: "Send", chatPlaceholder: "Ask about MOVERA..." },
  ar: { search: "بحث", loading: "جارٍ تحميل المحتوى…", empty: "لا يوجد محتوى منشور حالياً.", error: "هذا المحتوى غير متاح مؤقتاً.", view: "عرض التفاصيل", back: "رجوع", latest: "الأحدث", read: "اقرأ المزيد", newsletter: "ابق قريباً من الإشارة", newsletterBody: "استقبل تحديثات موفيرا المفيدة من دون ضوضاء.", name: "الاسم", email: "البريد الإلكتروني", phone: "رقم الهاتف", subscribe: "اشترك", consent: "أوافق على استلام تحديثات موفيرا.", success: "شكراً — تم تأكيد اشتراكك.", apply: "تقدم الآن", cv: "السيرة الذاتية", chooseFile: "اختر ملفاً", noFile: "لم يتم اختيار ملف", cover: "رسالة التقديم", send: "إرسال الطلب", submitted: "شكراً — تم استلام طلبك.", filter: "تصفية حسب الخدمة أو المنتج", sectorFilter: "تصفية حسب المجال", all: "الكل", clear: "مسح التصفية", privacy: "سياسة الخصوصية", terms: "شروط الاستخدام", cookies: "سياسة ملفات الارتباط", chat: "اسأل موفيرا", chatIntro: "يمكنني مساعدتك في العثور على إجابات حول خدمات موفيرا وبرامجها ورؤاها.", chatServicesPrompt: "ماذا تقدم موفيرا؟", chatProjectsPrompt: "اعرض البرامج", sendChat: "إرسال", chatPlaceholder: "اسأل عن موفيرا..." },
  fr: { search: "Rechercher", loading: "Chargement…", empty: "Aucun contenu publié n’est disponible.", error: "Ce contenu est momentanément indisponible.", view: "Voir le détail", back: "Retour", latest: "Récent", read: "Lire la suite", newsletter: "Restez au plus près du signal", newsletterBody: "Recevez les nouvelles utiles de MOVERA, sans bruit.", name: "Nom", email: "E-mail", phone: "Téléphone", subscribe: "S’inscrire", consent: "J’accepte de recevoir les nouvelles de MOVERA.", success: "Merci — votre inscription est confirmée.", apply: "Postuler", cv: "CV", chooseFile: "Choisir un fichier", noFile: "Aucun fichier choisi", cover: "Message de motivation", send: "Envoyer la candidature", submitted: "Merci — votre candidature a bien été reçue.", filter: "Filtrer par service ou produit", sectorFilter: "Filtrer par domaine", all: "Tout", clear: "Effacer les filtres", privacy: "Politique de confidentialité", terms: "Conditions d’utilisation", cookies: "Politique relative aux cookies", chat: "Demander à MOVERA", chatIntro: "Je peux vous aider à trouver des réponses sur les services, programmes et perspectives de MOVERA.", chatServicesPrompt: "Que fait MOVERA ?", chatProjectsPrompt: "Voir les programmes", sendChat: "Envoyer", chatPlaceholder: "Demandez à MOVERA..." },
  nl: { search: "Zoeken", loading: "Inhoud laden…", empty: "Er is geen gepubliceerde inhoud beschikbaar.", error: "Deze inhoud is tijdelijk niet beschikbaar.", view: "Details bekijken", back: "Terug", latest: "Nieuwste", read: "Lees meer", newsletter: "Blijf dicht bij het signaal", newsletterBody: "Ontvang nuttige MOVERA-updates. Zonder ruis.", name: "Naam", email: "E-mail", phone: "Telefoon", subscribe: "Inschrijven", consent: "Ik ontvang graag updates van MOVERA.", success: "Bedankt — uw inschrijving is bevestigd.", apply: "Solliciteer", cv: "CV", chooseFile: "Bestand kiezen", noFile: "Geen bestand gekozen", cover: "Motivatie", send: "Sollicitatie versturen", submitted: "Bedankt — uw sollicitatie is ontvangen.", filter: "Filter op dienst of product", sectorFilter: "Filter op domein", all: "Alles", clear: "Filters wissen", privacy: "Privacybeleid", terms: "Gebruiksvoorwaarden", cookies: "Cookiebeleid", chat: "Vraag MOVERA", chatIntro: "Ik help u antwoorden vinden over de diensten, programma’s en perspectieven van MOVERA.", chatServicesPrompt: "Wat doet MOVERA?", chatProjectsPrompt: "Toon de programma’s", sendChat: "Versturen", chatPlaceholder: "Vraag iets over MOVERA..." },
} as const;

const pathFor = (locale: Locale, path = "") => `/${locale}${path}`;
const kindLabel = (kind: ContentKind, locale: Locale) => ({ news: { en: "Latest News", ar: "أحدث الأخبار", fr: "Dernières actualités", nl: "Laatste nieuws" }, blogs: { en: "Blogs", ar: "المدونات", fr: "Blogs", nl: "Blogs" }, projects: { en: "Projects", ar: "المشاريع", fr: "Projets", nl: "Projecten" }, services: { en: "Core Services", ar: "الخدمات الأساسية", fr: "Services principaux", nl: "Kerndiensten" }, products: { en: "Products & Solutions", ar: "المنتجات والحلول", fr: "Produits et solutions", nl: "Producten en oplossingen" }, pages: { en: "About MOVERA", ar: "عن موفيرا", fr: "À propos de MOVERA", nl: "Over MOVERA" }, jobs: { en: "Careers", ar: "الوظائف", fr: "Carrières", nl: "Vacatures" }, innovation: { en: "Innovation Hub", ar: "مركز الابتكار", fr: "Hub d’innovation", nl: "Innovatiehub" } }[kind][locale]);
const itemPath = (locale: Locale, kind: ContentKind, slug: string) => kind === "pages" ? pathFor(locale, `/about/${slug}`) : kind === "jobs" ? pathFor(locale, `/careers/${slug}`) : kind === "innovation" ? pathFor(locale, `/innovation-hub/${slug}`) : pathFor(locale, `/${kind}/${slug}`);
const getItems = (data: SiteData, kind: ContentKind) => data[kind];
const projectSectors = [
  { value: "Autonomous Vehicles", labels: { en: "Autonomous vehicles", ar: "المركبات ذاتية القيادة", fr: "Véhicules autonomes", nl: "Autonome voertuigen" } },
  { value: "Fleet Operations", labels: { en: "Fleet operations", ar: "عمليات الأساطيل", fr: "Opérations de flotte", nl: "Vlootoperaties" } },
  { value: "Vehicle Experience", labels: { en: "Vehicle experience", ar: "تجربة المركبة", fr: "Expérience à bord", nl: "Voertuigervaring" } },
  { value: "Connected Infrastructure", labels: { en: "Connected infrastructure", ar: "البنية التحتية المتصلة", fr: "Infrastructure connectée", nl: "Verbonden infrastructuur" } },
] as const;
const projectSectorValues = new Set<string>(projectSectors.map(item => item.value));
const projectSectorLabel = (value: string, locale: Locale) => projectSectors.find(item => item.value === value)?.labels[locale] || value;
const taxonomyLabels: Record<string, Record<Locale, string>> = {
  Autonomy: { en: "Autonomy", ar: "القيادة الذاتية", fr: "Autonomie", nl: "Autonomie" },
  Operations: { en: "Operations", ar: "العمليات", fr: "Opérations", nl: "Operaties" },
  Experience: { en: "Experience", ar: "التجربة", fr: "Expérience", nl: "Ervaring" },
  "Operations platform": { en: "Operations platform", ar: "منصة العمليات", fr: "Plateforme d’opérations", nl: "Operationeel platform" },
  "Vehicle intelligence": { en: "Vehicle intelligence", ar: "ذكاء المركبة", fr: "Intelligence véhicule", nl: "Voertuigintelligentie" },
  "Orchestration layer": { en: "Orchestration layer", ar: "طبقة التنسيق", fr: "Couche d’orchestration", nl: "Orkestratielaag" },
  Simulation: { en: "Simulation", ar: "المحاكاة", fr: "Simulation", nl: "Simulatie" },
  "Reference programme": { en: "Reference programme", ar: "برنامج مرجعي", fr: "Programme de référence", nl: "Referentieprogramma" },
  "Design study": { en: "Design study", ar: "دراسة تصميم", fr: "Étude de conception", nl: "Ontwerpstudie" },
  "Corridor blueprint": { en: "Corridor blueprint", ar: "تصور ممر", fr: "Schéma de corridor", nl: "Corridorconcept" },
  Company: { en: "Company", ar: "الشركة", fr: "Entreprise", nl: "Bedrijf" },
  Technology: { en: "Technology", ar: "التقنية", fr: "Technologie", nl: "Technologie" },
  Belgium: { en: "Belgium", ar: "بلجيكا", fr: "Belgique", nl: "België" },
  "Operations design": { en: "Operations design", ar: "تصميم العمليات", fr: "Design des opérations", nl: "Operationeel ontwerp" },
  "Passenger experience": { en: "Passenger experience", ar: "تجربة الراكب", fr: "Expérience passager", nl: "Passagierservaring" },
  "Mobility intelligence": { en: "Mobility intelligence", ar: "ذكاء التنقل", fr: "Intelligence mobilité", nl: "Mobiliteitsintelligentie" },
  "Applied research": { en: "Applied research", ar: "بحث تطبيقي", fr: "Recherche appliquée", nl: "Toegepast onderzoek" },
  "Street research": { en: "Street research", ar: "بحث ميداني", fr: "Recherche urbaine", nl: "Straatonderzoek" },
  Engineering: { en: "Engineering", ar: "الهندسة", fr: "Ingénierie", nl: "Engineering" },
  Data: { en: "Data", ar: "البيانات", fr: "Données", nl: "Data" },
  Delivery: { en: "Integration", ar: "التكامل", fr: "Intégration", nl: "Integratie" },
};
const regionLabel = (value: string, locale: Locale) => ({
  "hub-a": { en: "Brussels & Capital Region", ar: "بروكسل ومنطقة العاصمة", fr: "Bruxelles et Région-Capitale", nl: "Brussel en het Hoofdstedelijk Gewest" },
  "hub-b": { en: "Flanders Mobility Corridor", ar: "ممر التنقل في فلاندرز", fr: "Corridor mobilité en Flandre", nl: "Vlaamse mobiliteitscorridor" },
  "hub-c": { en: "Wallonia Mobility Corridor", ar: "ممر التنقل في والونيا", fr: "Corridor mobilité en Wallonie", nl: "Waalse mobiliteitscorridor" },
}[value as "hub-a" | "hub-b" | "hub-c"]?.[locale] || value);
const itemCategoryLabel = (entry: ContentItem, kind: ContentKind, locale: Locale, fallback: string) => {
  if (kind === "projects" && entry.sector) return projectSectorLabel(entry.sector, locale);
  if (kind === "jobs" && entry.region) return regionLabel(entry.region, locale);
  return entry.category ? taxonomyLabels[entry.category]?.[locale] || entry.category : fallback;
};
const coverUrlFor = (entry: ContentItem) => entry.cover?.url;
type ChatMessage = { role: "assistant" | "user"; text: string };

export function ChatWidget({ locale }: { locale: Locale }) {
  const t = uiCopy[locale];
  const initialSiteData = useInitialSiteData();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [assistant, setAssistant] = useState<AssistantSettings | null>(initialSiteData?.assistant || null);

  useEffect(() => {
    if (chatOpen && messages.length === 0) setMessages([{ role: "assistant", text: t.chatIntro }]);
  }, [chatOpen, messages.length, t.chatIntro]);
  useEffect(() => { fetch(`${API}/api/v1/site`).then(response => response.ok ? response.json() : Promise.reject()).then(payload => setAssistant(payload.data?.assistant || null)).catch(() => undefined); }, []);

  const submitChat = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessages(previous => [...previous, { role: "user", text: trimmed }]);
    setMessage("");
    try {
      const response = await fetch(`${API}/api/v1/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ locale, message: trimmed, recaptchaToken: await recaptchaToken("chat", locale) }) });
      const payload = await response.json();
      setMessages(previous => [...previous, { role: "assistant", text: payload.data?.answer || t.chatIntro }]);
    } catch {
      setMessages(previous => [...previous, { role: "assistant", text: t.chatIntro }]);
    }
  };

  const label = assistant?.label?.[locale] || t.chat;
  const icon = assistant?.icon?.url || "/starter-media/movera-chatbot.webp";
  const assistantVisual = <MediaImage media={assistant?.icon} url={icon} alt="" aria-hidden="true" />;
  return <>
    <button type="button" className={`chat-trigger public-content-chat ${chatOpen ? "is-open" : ""}`} onClick={() => setChatOpen(value => !value)} aria-label={label} aria-expanded={chatOpen}><span className="chat-assistant-visual">{assistantVisual}</span></button>
    {chatOpen && <section className="chat-panel" aria-label={locale === "ar" ? "محادثة موفيرا" : locale === "fr" ? "Conversation MOVERA" : locale === "nl" ? "MOVERA-gesprek" : "MOVERA chat"}><div className="chat-header"><span><i className="chat-assistant-visual">{assistantVisual}</i>{label}</span><button type="button" className="icon-button" onClick={() => setChatOpen(false)} aria-label={locale === "ar" ? "إغلاق المحادثة" : locale === "fr" ? "Fermer la conversation" : locale === "nl" ? "Gesprek sluiten" : "Close chat"}><CloseIcon /></button></div><div className="chat-messages" aria-live="polite">{messages.map((item, index) => <div key={`${item.role}-${index}`} className={`chat-message ${item.role}`}>{item.text}</div>)}{messages.length < 2 && <div className="suggestions"><button type="button" onClick={() => setMessage(t.chatServicesPrompt)}>{t.chatServicesPrompt}</button><button type="button" onClick={() => setMessage(t.chatProjectsPrompt)}>{t.chatProjectsPrompt}</button></div>}</div><form className="chat-form" onSubmit={event => { event.preventDefault(); void submitChat(); }}><input value={message} onChange={event => setMessage(event.target.value)} placeholder={t.chatPlaceholder} aria-label={t.chatPlaceholder} /><button type="submit" className="button button-primary compact" aria-label={t.sendChat}><Arrow /></button></form></section>}
  </>;
}

function Header({ locale, setLocale }: { locale: Locale; setLocale: (locale: Locale) => void }) {
  return <SiteHeader locale={locale} setLocale={setLocale} />;
}

const contentFooterCopy: typeof footerCopy = {
  en: { ...footerCopy.en, global: "MOVERA", ai: "Autonomy Systems", advisory: "Fleet Intelligence", implementation: "Mobility Operations", suite: "All products", platforms: "MOVERA Command", integrations: "Perception Layer", industries: "Programmes", mobility: "Autonomous vehicles", infrastructure: "Fleet operations", energy: "Connected infrastructure", built: "Mobility intelligence for clearer decisions." },
  ar: { ...footerCopy.ar, global: "موفيرا", ai: "أنظمة القيادة الذاتية", advisory: "ذكاء الأساطيل", implementation: "عمليات التنقل", suite: "كل المنتجات", platforms: "MOVERA Command", integrations: "Perception Layer", industries: "البرامج", mobility: "المركبات ذاتية القيادة", infrastructure: "عمليات الأساطيل", energy: "البنية التحتية المتصلة", built: "ذكاء تنقل لقرارات أوضح." },
  fr: { ...footerCopy.fr, global: "MOVERA", ai: "Systèmes autonomes", advisory: "Intelligence de flotte", implementation: "Opérations de mobilité", suite: "Tous les produits", platforms: "MOVERA Command", integrations: "Perception Layer", industries: "Programmes", mobility: "Véhicules autonomes", infrastructure: "Opérations de flotte", energy: "Infrastructure connectée", built: "Une intelligence mobilité pour des décisions plus claires." },
  nl: { ...footerCopy.nl, global: "MOVERA", ai: "Autonomiesystemen", advisory: "Vlootintelligentie", implementation: "Mobiliteitsoperaties", suite: "Alle producten", platforms: "MOVERA Command", integrations: "Perception Layer", industries: "Programma’s", mobility: "Autonome voertuigen", infrastructure: "Vlootoperaties", energy: "Verbonden infrastructuur", built: "Mobiliteitsintelligentie voor duidelijkere beslissingen." },
};

const footerSocialPlatforms = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
] as const;

export function Footer({ locale }: { locale: Locale }) {
  const initialSiteData = useInitialSiteData();
  const [footer, setFooter] = useState(initialSiteData?.footer || sampleData.footer);
  const t = uiCopy[locale];
  const f = contentFooterCopy[locale];
  const description = { en: "Autonomous vehicles, fleet operations and human decisions for a Belgium in motion.", ar: "مركبات ذاتية وعمليات أساطيل وقرارات بشرية لبلجيكا دائمة الحركة.", fr: "Véhicules autonomes, opérations de flotte et décisions humaines pour une Belgique en mouvement.", nl: "Autonome voertuigen, vlootoperaties en menselijke beslissingen voor een België in beweging." }[locale];
  useEffect(() => {
    if (initialSiteData?.footer) {
      setFooter(initialSiteData.footer);
      return;
    }
    fetch(`${API}/api/v1/site`).then(response => response.ok ? response.json() : Promise.reject()).then(payload => { if (payload.data?.footer) setFooter(payload.data.footer); }).catch(() => undefined);
  }, [initialSiteData]);
  return <footer className="site-footer public-content-footer"><div className="footer-rail"><div className="footer-brand"><a className="brand" href={pathFor(locale)}><BrandLockup variant="footer" locale={locale} /></a><p>{description}</p><div className="footer-social"><div className="social-links">{footerSocialPlatforms.filter(platform => footer.socialLinks[platform.key].trim()).map(platform => <a key={platform.key} className={`social-link social-link--${platform.key}`} href={footer.socialLinks[platform.key]} aria-label={platform.label} target="_blank" rel="noreferrer noopener"><SocialIcon name={platform.key} /></a>)}</div></div></div><nav className="footer-links" aria-label={locale === "ar" ? "روابط أسفل الموقع" : locale === "fr" ? "Navigation du pied de page" : locale === "nl" ? "Voettekstnavigatie" : "Footer navigation"}><div className="footer-column"><span className="footer-column-title">{f.about}</span><a href={pathFor(locale, "/about/who-we-are")}>{f.who}</a><a href={pathFor(locale, "/about/leadership")}>{f.leadership}</a><a href={pathFor(locale, "/about/clients-certificates")}>{f.partners}</a></div><div className="footer-column"><span className="footer-column-title">{f.services}</span><a href={pathFor(locale, "/services/autonomy-systems")}>{f.ai}</a><a href={pathFor(locale, "/services/fleet-intelligence")}>{f.advisory}</a><a href={pathFor(locale, "/services/mobility-operations")}>{f.implementation}</a></div><div className="footer-column"><span className="footer-column-title">{f.products}</span><a href={pathFor(locale, "/products")}>{f.suite}</a><a href={pathFor(locale, "/products/movera-command")}>{f.platforms}</a><a href={pathFor(locale, "/products/perception-layer")}>{f.integrations}</a></div><div className="footer-column"><span className="footer-column-title">{f.industries}</span><a href={pathFor(locale, "/projects?sector=Autonomous%20Vehicles")}>{f.mobility}</a><a href={pathFor(locale, "/projects?sector=Fleet%20Operations")}>{f.infrastructure}</a><a href={pathFor(locale, "/projects?sector=Connected%20Infrastructure")}>{f.energy}</a></div><div className="footer-column"><span className="footer-column-title">{f.resources}</span><a href={pathFor(locale, "/blogs")}>{f.insights}</a><a href={pathFor(locale, "/projects")}>{f.cases}</a><a href={pathFor(locale, "/news")}>{f.newsroom}</a></div><div className="footer-column"><span className="footer-column-title">{f.company}</span><a href={pathFor(locale, "/careers")}>{f.careers}</a><a href={pathFor(locale, "/contact")}>{f.contact}</a><a href="#top">{f.back}</a></div></nav></div><div className="footer-bottom"><span className="footer-copyright">© {new Date().getFullYear()} {locale === "ar" ? "موفيرا" : "MOVERA"}</span><div className="footer-legal-links"><a href={pathFor(locale, "/privacy-policy")}>{t.privacy}</a><a href={pathFor(locale, "/terms-and-conditions")}>{t.terms}</a><a href={pathFor(locale, "/cookie-policy")}>{t.cookies}</a></div><span className="footer-built">{f.built}</span></div></footer>;
}

function NewsletterForm({ locale }: { locale: Locale }) {
  const t = uiCopy[locale];
  const [status, setStatus] = useState("");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); setStatus("loading"); try { const response = await fetch(`${API}/api/v1/newsletter`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), locale, consent: form.get("consent") === "on", source: "content-page", recaptchaToken: await recaptchaToken("newsletter", locale) }) }); setStatus(response.ok ? "success" : "error"); if (response.ok) event.currentTarget.reset(); } catch { setStatus("error"); } };
  return <section className="content-newsletter"><div><p className="eyebrow">{t.newsletter}</p><p>{t.newsletterBody}</p></div><form onSubmit={submit}><div className="content-form-row"><input name="name" required placeholder={t.name} aria-label={t.name} autoComplete="name" /><input name="email" type="email" required placeholder={t.email} aria-label={t.email} autoComplete="email" /><button className="button button-primary compact">{t.subscribe} <Arrow /></button></div><label className="content-consent"><input name="consent" type="checkbox" required />{t.consent}</label><span className="form-status" aria-live="polite">{status === "loading" ? t.loading : status === "success" ? t.success : status === "error" ? t.error : ""}</span></form></section>;
}

function ApplicationForm({ locale, job }: { locale: Locale; job: ContentItem }) {
  const t = uiCopy[locale];
  const [status, setStatus] = useState("");
  const [fileName, setFileName] = useState("");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setStatus("loading"); try { const form = new FormData(event.currentTarget); const token = await recaptchaToken("careers", locale); if (token) form.append("recaptchaToken", token); const response = await fetch(`${API}/api/v1/careers/${job.id}/apply`, { method: "POST", body: form }); setStatus(response.ok ? "success" : "error"); if (response.ok) event.currentTarget.reset(); } catch { setStatus("error"); } };
  return <form className="content-application" onSubmit={submit}><div className="field-grid"><label className="field"><span>{t.name}</span><input name="name" required autoComplete="name" /></label><label className="field"><span>{t.email}</span><input name="email" type="email" required autoComplete="email" /></label><label className="field"><span>{t.phone}</span><input name="phone" type="tel" autoComplete="tel" /></label><label className="field"><span>{t.cv}</span><span className="file-picker"><span className="file-picker-name">{fileName || t.noFile}</span><b>{t.chooseFile}</b><input name="cv" type="file" accept=".pdf,.doc,.docx" required onChange={event => setFileName(event.target.files?.[0]?.name || "")} /></span></label></div><label className="field"><span>{t.cover}</span><textarea name="coverNote" rows={5} required /></label><input type="hidden" name="locale" value={locale} /><button className="button button-primary" disabled={status === "loading"}>{t.send} <Arrow /></button><span className="form-status" aria-live="polite">{status === "loading" ? t.loading : status === "success" ? t.submitted : status === "error" ? t.error : ""}</span></form>;
}

const legalPageIds = new Set(["privacy-policy", "terms-and-conditions", "cookie-policy"]);

const overviewIntro: Record<ContentKind, Record<Locale, string>> = {
  pages: { en: "The company, principles and responsibilities behind MOVERA.", ar: "الشركة والمبادئ والمسؤوليات التي تقف خلف موفيرا.", fr: "L’entreprise, les principes et les responsabilités derrière MOVERA.", nl: "Het bedrijf, de principes en de verantwoordelijkheden achter MOVERA." },
  jobs: { en: "Build real mobility systems with engineering craft and service responsibility.", ar: "ابنِ أنظمة تنقل واقعية بخبرة هندسية ومسؤولية تجاه الخدمة.", fr: "Construisez des systèmes de mobilité réels avec rigueur et sens du service.", nl: "Bouw echte mobiliteitssystemen met technisch vakmanschap en serviceverantwoordelijkheid." },
  news: { en: "Company news and practical mobility thinking from Belgium.", ar: "أخبار الشركة وأفكار عملية حول التنقل من بلجيكا.", fr: "Actualités et réflexions pratiques sur la mobilité depuis la Belgique.", nl: "Bedrijfsnieuws en praktische mobiliteitsinzichten uit België." },
  blogs: { en: "Perspectives on operators, passengers and accountable mobility decisions.", ar: "رؤى حول المشغّلين والركاب وقرارات التنقل المسؤولة.", fr: "Perspectives sur les opérateurs, les passagers et les décisions responsables.", nl: "Perspectieven over operatoren, passagiers en verantwoorde mobiliteitsbeslissingen." },
  projects: { en: "Belgian reference programmes for autonomous and connected mobility.", ar: "برامج مرجعية بلجيكية للتنقل الذاتي والمتصل.", fr: "Programmes de référence belges pour la mobilité autonome et connectée.", nl: "Belgische referentieprogramma’s voor autonome en verbonden mobiliteit." },
  services: { en: "Services that connect vehicle intelligence to dependable operations.", ar: "خدمات تربط ذكاء المركبة بعمليات يمكن الاعتماد عليها.", fr: "Des services qui relient intelligence véhicule et opérations fiables.", nl: "Diensten die voertuigintelligentie verbinden met betrouwbare operaties." },
  products: { en: "Product foundations from perception to coordinated action.", ar: "أسس منتجات تمتد من الإدراك إلى الإجراء المنسق.", fr: "Des fondations produit de la perception à l’action coordonnée.", nl: "Productfundamenten van perceptie tot gecoördineerde actie." },
  innovation: { en: "Applied research designed to become useful operational practice.", ar: "بحوث تطبيقية مصممة لتصبح ممارسة تشغيلية مفيدة.", fr: "Une recherche appliquée conçue pour devenir une pratique opérationnelle utile.", nl: "Toegepast onderzoek dat bruikbare operationele praktijk moet worden." },
};

function OverviewGrid({ locale, kind, items, title, view }: { locale: Locale; kind: ContentKind; items: ContentItem[]; title: string; view: string }) {
  return <div className={`public-overview-grid public-overview-grid--${kind}`}>{items.map((entry, index) => <a className="public-overview-card" key={entry.id} href={itemPath(locale, kind, entry.slug[locale])}><span className="public-overview-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div className="public-overview-media"><MediaImage media={entry.cover} url={coverUrlFor(entry) || "/starter-media/movera-hero-field.svg"} alt={entry.cover?.alt[locale] || entry.cover?.alt.en || entry.title[locale]} loading={index < 3 ? "eager" : "lazy"} /></div><div className="public-overview-copy"><p className="content-row-type">{itemCategoryLabel(entry, kind, locale, kind === "jobs" ? (locale === "ar" ? "فرصة وظيفية" : locale === "fr" ? "Poste ouvert" : locale === "nl" ? "Open functie" : "Open role") : title)}</p><h2>{entry.title[locale]}</h2><p>{entry.summary[locale]}</p><span className="public-overview-link">{view} <Arrow /></span></div></a>)}</div>;
}

function StructuredSections({ item, locale }: { item: ContentItem; locale: Locale }) {
  if (!item.sections?.length) return null;
  return <div className="public-structured-sections">{item.sections.map((entry, index) => <section key={entry.id} className="public-structured-section"><span className="public-section-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h2>{entry.title[locale]}</h2><p>{entry.body[locale]}</p>{entry.bullets?.length ? <ul>{entry.bullets.map((bullet, bulletIndex) => <li key={`${entry.id}-${bulletIndex}`}>{bullet[locale]}</li>)}</ul> : null}</div></section>)}</div>;
}

export function CookieNotice({ locale }: { locale: Locale }) {
  const [consent, setConsent] = useState<string | null>(null);
  const [customize, setCustomize] = useState(false);
  const copy = {
    en: { title: "Your privacy, your choice.", body: "We use necessary storage to keep MOVERA secure and working.", accept: "Accept all", reject: "Reject optional", customize: "Customize", heading: "Cookie preferences", close: "Close preferences", essential: "Necessary", always: "Always on", preferences: "Preferences", analytics: "Analytics", allow: "Allow" },
    ar: { title: "خصوصيتك، باختيارك.", body: "نستخدم التخزين الضروري للحفاظ على أمن موفيرا وعملها.", accept: "قبول الكل", reject: "رفض الاختياري", customize: "تخصيص", heading: "تفضيلات ملفات الارتباط", close: "إغلاق التفضيلات", essential: "ضروري", always: "مفعّل دائماً", preferences: "التفضيلات", analytics: "التحليلات", allow: "سماح" },
    fr: { title: "Votre confidentialité, votre choix.", body: "Nous utilisons le stockage nécessaire pour sécuriser et faire fonctionner MOVERA.", accept: "Tout accepter", reject: "Refuser l’optionnel", customize: "Personnaliser", heading: "Préférences relatives aux cookies", close: "Fermer les préférences", essential: "Nécessaire", always: "Toujours actif", preferences: "Préférences", analytics: "Analyse", allow: "Autoriser" },
    nl: { title: "Uw privacy, uw keuze.", body: "We gebruiken noodzakelijke opslag om MOVERA veilig en werkend te houden.", accept: "Alles accepteren", reject: "Optioneel weigeren", customize: "Aanpassen", heading: "Cookievoorkeuren", close: "Voorkeuren sluiten", essential: "Noodzakelijk", always: "Altijd actief", preferences: "Voorkeuren", analytics: "Analyse", allow: "Toestaan" },
  }[locale];
  useEffect(() => { try { setConsent(localStorage.getItem("company-consent-v1")); } catch { /* essential-only fallback */ } }, []);
  if (consent) return null;
  const save = (value: string) => { const record = JSON.stringify({ version: "v1", preferences: { essential: true, preferences: value !== "optional-rejected", analytics: value === "analytics" || value === "all" }, timestamp: new Date().toISOString(), locale }); setConsent(record); setCustomize(false); try { localStorage.setItem("company-consent-v1", record); } catch { /* essential-only fallback */ } };
  return <>{!customize && <div className="cookie-banner"><div><strong>{copy.title}</strong><p>{copy.body}</p></div><div className="cookie-actions"><button className="quiet-button" onClick={() => save("optional-rejected")}>{copy.reject}</button><button className="quiet-button" onClick={() => setCustomize(true)}>{copy.customize}</button><button className="button button-primary compact" onClick={() => save("all")}>{copy.accept}</button></div></div>}{customize && <div className="cookie-modal" role="dialog" aria-modal="true" aria-label={copy.heading}><div className="cookie-panel"><button className="icon-button panel-close" onClick={() => setCustomize(false)} aria-label={copy.close}><CloseIcon /></button><p className="eyebrow">{copy.heading}</p><h2>{copy.title}</h2><div className="cookie-category"><span>{copy.essential}</span><em>{copy.always}</em></div><div className="cookie-category"><span>{copy.preferences}</span><button onClick={() => save("preferences")}>{copy.allow}</button></div><div className="cookie-category"><span>{copy.analytics}</span><button onClick={() => save("analytics")}>{copy.allow}</button></div><button className="button button-primary" onClick={() => save("all")}>{copy.accept}</button></div></div>}</>;
}

export function PublicContentPage({ initialLocale, kind, slug }: { initialLocale: Locale; kind: ContentKind; slug?: string }) {
  const [locale, setLocale] = useState(initialLocale);
  const initialSiteData = useInitialSiteData();
  const [data, setData] = useState<SiteData>(initialSiteData || sampleData);
  const [loading, setLoading] = useState(!initialSiteData);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  useEffect(() => { if (initialSiteData) return; fetch(`${API}/api/v1/site`).then(response => response.ok ? response.json() : Promise.reject()).then(payload => payload.data && setData(payload.data)).catch(() => setError(true)).finally(() => setLoading(false)); }, [initialSiteData]);
  useEffect(() => {
    if (kind !== "projects" || typeof window === "undefined") return;
    const requested = new URLSearchParams(window.location.search).get("sector");
    setFilter(requested && projectSectorValues.has(requested) ? requested : "all");
  }, [kind]);
  useEffect(() => {
    if (kind !== "projects" || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (filter === "all") url.searchParams.delete("sector");
    else url.searchParams.set("sector", filter);
    window.history.replaceState({}, "", url);
  }, [filter, kind]);
  const t = uiCopy[locale];
  const items = useMemo(() => getItems(data, kind).filter(item => {
    const matchesFilter = kind === "projects" ? filter === "all" || item.sector === filter : filter === "all" || item.sector === filter || item.category === filter || item.region === filter;
    return matchesFilter && (!query.trim() || `${item.title[locale]} ${item.summary[locale]}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  }), [data, filter, kind, locale, query]);
  const item = slug ? getItems(data, kind).find(entry => entry.slug[locale] === slug || entry.id === slug) : undefined;
  const filters = kind === "projects" ? projectSectors.map(sector => sector.value) : kind === "jobs" ? ["hub-a", "hub-b", "hub-c"] : [];
  const title = kindLabel(kind, locale);
  const displayTitle = kind === "projects" && filter !== "all" ? projectSectorLabel(filter, locale) : title;
  const goBack = () => {
    const fallback = kind === "pages" ? "/about" : kind === "jobs" ? "/careers" : kind === "innovation" ? "/innovation-hub" : `/${kind}`;
    window.location.href = pathFor(locale, fallback);
  };
  const overviewItems = kind === "pages" ? items.filter(entry => !legalPageIds.has(entry.id)) : items;
  const itemCoverUrl = item ? coverUrlFor(item) : undefined;
  const itemCoverAlt = item ? item.cover?.alt[locale] || item.cover?.alt.en || item.title[locale] : "";
  return <main className={`site-shell locale-${locale}`} dir={directionFor(locale)}>
    <Header locale={locale} setLocale={setLocale} />
    <div className="content-page-shell section-pad">
      <div className="content-page-head">
        <p className="eyebrow">{locale === "ar" ? "موفيرا" : "MOVERA"} / {title}</p>
        <h1>{item?.title[locale] || displayTitle}</h1>
        <p>{item?.summary[locale] || overviewIntro[kind][locale]}</p>
      </div>
      {loading && <div className="content-state">{t.loading}</div>}
      {error && <div className="content-state error">{t.error}</div>}
      {!loading && !error && slug && !item && <div className="content-state error">{t.empty}</div>}
      {!loading && !error && !slug && <>
        {kind === "jobs" && <div className="career-tools"><input value={query} onChange={event => setQuery(event.target.value)} placeholder={locale === "ar" ? "ابحث عن وظيفة" : locale === "fr" ? "Rechercher un poste" : locale === "nl" ? "Zoek een functie" : "Search job titles"} aria-label={locale === "ar" ? "ابحث عن وظيفة" : locale === "fr" ? "Rechercher un poste" : locale === "nl" ? "Zoek een functie" : "Search job titles"} /></div>}
        {filters.length > 0 && <div className="content-filters" aria-label={kind === "projects" ? t.sectorFilter : t.filter}><span>{kind === "projects" ? t.sectorFilter : t.filter}</span><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>{t.all}</button>{filters.map(value => <button className={filter === value ? "active" : ""} onClick={() => setFilter(value)} key={value}>{kind === "projects" ? projectSectorLabel(value, locale) : regionLabel(value, locale)}</button>)}{filter !== "all" && <button onClick={() => setFilter("all")}>{t.clear}</button>}</div>}
        {(kind === "pages" || kind === "jobs") ? <OverviewGrid locale={locale} kind={kind} items={overviewItems} title={title} view={t.view} /> : <div className="content-list">{items.map((entry, index) => <a className="content-row" key={entry.id} href={itemPath(locale, kind, entry.slug[locale])}><span className="content-row-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span className="content-row-type">{itemCategoryLabel(entry, kind, locale, title)}</span><div><h2>{entry.title[locale]}</h2><p>{entry.summary[locale]}</p></div><Arrow /></a>)}{items.length === 0 && <div className="content-state">{t.empty}</div>}</div>}
        {(kind === "news" || kind === "blogs") && <NewsletterForm locale={locale} />}
      </>}
      {!loading && item && <article className="content-article">
        {itemCoverUrl && <div className="content-cover"><MediaImage media={item.cover} url={itemCoverUrl} alt={itemCoverAlt} caption={item.cover?.caption?.[locale]} lightbox /></div>}
        {item.body[locale].split("\n").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <StructuredSections item={item} locale={locale} />
        {kind === "jobs" && <ApplicationForm locale={locale} job={item} />}
        {(kind === "news" || kind === "blogs") && <NewsletterForm locale={locale} />}
        <button type="button" className="text-link content-back-link" onClick={goBack}><Arrow direction="left" /> {t.back}</button>
      </article>}
    </div>
    <Footer locale={locale} />
    <CookieNotice locale={locale} />
    <ChatWidget locale={locale} />
  </main>;
}

export function PublicSearchPage({ initialLocale }: { initialLocale: Locale }) {
  const [locale, setLocale] = useState(initialLocale);
  const [query, setQuery] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("q") || "");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [status, setStatus] = useState("");
  const t = uiCopy[locale];
  const runSearch = async (term: string) => { if (!term.trim()) { setResults([]); setStatus(""); return; } setStatus("loading"); try { const response = await fetch(`${API}/api/v1/search?q=${encodeURIComponent(term)}&locale=${locale}`); const payload = await response.json(); setResults(payload.data || []); setStatus("done"); } catch { setStatus("error"); } };
  useEffect(() => { const initialQuery = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("q") || ""; if (initialQuery.trim()) void runSearch(initialQuery); }, []);
  const submit = async (event?: React.FormEvent) => { event?.preventDefault(); await runSearch(query); };
  return <main className={`site-shell locale-${locale}`} dir={directionFor(locale)}><Header locale={locale} setLocale={setLocale} /><div className="content-page-shell section-pad search-page"><div className="content-page-head"><p className="eyebrow">{locale === "ar" ? "موفيرا" : "MOVERA"} / {t.search}</p><h1>{t.search}</h1><p>{locale === "ar" ? "ابحث في خدمات موفيرا ومنتجاتها وبرامجها وأخبارها ورؤاها." : locale === "fr" ? "Recherchez dans les services, produits, programmes, actualités et perspectives MOVERA." : locale === "nl" ? "Zoek in MOVERA-diensten, producten, programma’s, nieuws en perspectieven." : "Search MOVERA services, products, programmes, news, and perspectives."}</p></div><form className="search-form" onSubmit={submit}><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} /><button className="button button-primary">{t.search} <SearchIcon /></button></form>{status === "loading" && <div className="content-state">{t.loading}</div>}{status === "error" && <div className="content-state error">{t.error}</div>}{status === "done" && <div className="search-results">{Array.from(new Set(results.map(item => item.type))).map(type => <section key={type}><h2>{kindLabel(type, locale)}</h2>{results.filter(item => item.type === type).map((item, index) => <a className="content-row" key={item.id} href={itemPath(locale, item.type, item.slug[locale])}><span className="content-row-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span className="content-row-type">{itemCategoryLabel(item, item.type, locale, kindLabel(item.type, locale))}</span><div><h3>{item.title[locale]}</h3><p>{item.summary[locale]}</p></div><Arrow /></a>)}</section>)}{results.length === 0 && <div className="content-state">{t.empty}</div>}</div>}</div><Footer locale={locale} /><CookieNotice locale={locale} /><ChatWidget locale={locale} /></main>;
}

export function PublicRegionPage({ initialLocale, region }: { initialLocale: Locale; region: "hub-a" | "hub-b" | "hub-c" }) {
  const [locale, setLocale] = useState(initialLocale);
  const [data, setData] = useState<SiteData>(sampleData);
  const current = data.regions.find(item => item.code === region);
  useEffect(() => { fetch(`${API}/api/v1/site`).then(response => response.json()).then(payload => setData(payload.data)).catch(() => undefined); }, []);
  const copy = {
    en: { eyebrow: "MOVERA / Belgium", capabilities: "Regional focus", location: "Location", hours: "Working hours", email: "Email", contact: "Contact MOVERA" },
    ar: { eyebrow: "موفيرا / بلجيكا", capabilities: "محاور المنطقة", location: "الموقع", hours: "ساعات العمل", email: "البريد الإلكتروني", contact: "تواصل مع موفيرا" },
    fr: { eyebrow: "MOVERA / Belgique", capabilities: "Axes régionaux", location: "Lieu", hours: "Heures de contact", email: "E-mail", contact: "Contacter MOVERA" },
    nl: { eyebrow: "MOVERA / België", capabilities: "Regionale focus", location: "Locatie", hours: "Contacturen", email: "E-mail", contact: "Contacteer MOVERA" },
  }[locale];
  return <main className={`site-shell locale-${locale}`} dir={directionFor(locale)}><Header locale={locale} setLocale={setLocale} /><div className="content-page-shell section-pad"><div className="content-page-head"><p className="eyebrow">{copy.eyebrow}</p><h1>{current?.title[locale] || region}</h1><p>{current?.summary[locale]}</p></div><article className="content-article region-article">{current?.cover && <div className="content-cover"><MediaImage media={current.cover} alt={current.cover.alt[locale]} lightbox /></div>}<p>{current?.body[locale]}</p>{current?.capabilities?.length ? <section className="region-capabilities"><h2>{copy.capabilities}</h2><ol>{current.capabilities.map((capability, index) => <li key={index}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{capability[locale]}</li>)}</ol></section> : null}<div className="region-details"><div><span>{copy.location}</span><strong>{current?.address[locale]}</strong></div><div><span>{copy.hours}</span><strong>{current?.hours[locale]}</strong></div><div><span>{copy.email}</span><strong>{current?.email}</strong></div></div><a className="button button-primary" href={pathFor(locale, "/contact")}>{copy.contact} <Arrow /></a></article></div><Footer locale={locale} /><CookieNotice locale={locale} /><ChatWidget locale={locale} /></main>;
}
