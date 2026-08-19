"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import type { ContentItem, Locale } from "@company/contracts";
import { Arrow } from "./icons";

type PlatformStoryProps = {
  locale: Locale;
  products: ContentItem[];
};

type StoryPhase = {
  label: string;
  title: string;
  body: string;
};

type StoryDomain = {
  id: "vehicles" | "fleets" | "infrastructure";
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  details: string[];
};

type StoryCopy = {
  liveKicker: string;
  liveTitle: string;
  liveBody: string;
  explore: string;
  operatingModel: string;
  platformFlow: string;
  pause: string;
  play: string;
  reduced: string;
  imageAlt: string;
  capabilityLabel: string;
  phases: StoryPhase[];
  decisionKicker: string;
  decisionTitle: string;
  decisionBody: string;
  scenario: string;
  scenarioName: string;
  decisionLabel: string;
  domainsKicker: string;
  domainsTitle: string;
  domainsBody: string;
  domainsLabel: string;
  domains: StoryDomain[];
  trustKicker: string;
  trustTitle: string;
  trustItems: { title: string; body: string }[];
};

const copy: Record<Locale, StoryCopy> = {
  en: {
    liveKicker: "MOVERA FOR BELGIUM",
    liveTitle: "Every signal becomes a better decision.",
    liveBody: "MOVERA connects perception, operational intelligence, and coordinated action across vehicles and mobility networks.",
    explore: "Explore the platform",
    operatingModel: "Belgian mobility context",
    platformFlow: "Platform flow",
    pause: "Pause motion",
    play: "Play motion",
    reduced: "Motion reduced",
    imageAlt: "An autonomous electric shuttle moving through a connected city corridor.",
    capabilityLabel: "Platform capabilities",
    phases: [
      { label: "Perceive", title: "The road becomes legible.", body: "Vehicle and infrastructure signals reveal what is changing around every moving system." },
      { label: "Understand", title: "Context becomes intelligence.", body: "MOVERA interprets confidence, intent, risk, and network conditions as one operational picture." },
      { label: "Coordinate", title: "The next move becomes clear.", body: "A safe, explainable response is prepared across the vehicle, operator, and mobility network." },
      { label: "Learn", title: "Every outcome improves the system.", body: "Decisions, interventions, and results remain connected so the next response starts better informed." },
    ],
    decisionKicker: "ONE DECISION IN MOTION",
    decisionTitle: "See how MOVERA thinks.",
    decisionBody: "A changing road condition moves through one accountable chain—from perception to action and learning.",
    scenario: "Operating scenario",
    scenarioName: "Urban corridor · changing lane condition",
    decisionLabel: "Decision sequence",
    domainsKicker: "ACROSS BELGIAN MOBILITY",
    domainsTitle: "One intelligence layer. Every moving system.",
    domainsBody: "The same decision architecture adapts to the machine, the operation, and the world around them.",
    domainsLabel: "Operating domains",
    domains: [
      { id: "vehicles", label: "Vehicles", eyebrow: "INTELLIGENCE ON THE MOVE", title: "A vehicle that understands more than the road.", body: "MOVERA brings perception, intent, and explainability into one continuously updated driving context.", details: ["Multi-sensor context", "Explainable response", "Human-ready handoff"] },
      { id: "fleets", label: "Fleets", eyebrow: "ONE OPERATIONAL PICTURE", title: "Every vehicle moves with the network in mind.", body: "Fleet teams can coordinate routes, priorities, and interventions without losing the context behind each decision.", details: ["Network-wide context", "Coordinated action", "Visible exceptions"] },
      { id: "infrastructure", label: "Infrastructure", eyebrow: "THE ROAD AS A SYSTEM", title: "Infrastructure becomes part of the decision loop.", body: "Roadside and city signals help vehicles and operators anticipate conditions before they become disruption.", details: ["Connected corridors", "Shared road context", "Proactive operations"] },
    ],
    trustKicker: "ACCOUNTABLE AUTONOMY",
    trustTitle: "Intelligence people can stand behind.",
    trustItems: [
      { title: "Explainable by design", body: "Signals, recommendations, and decision context stay visible." },
      { title: "Human in command", body: "People remain responsible for consequential action." },
      { title: "Every decision traceable", body: "Intent, intervention, and outcome share one record." },
    ],
  },
  ar: {
    liveKicker: "موفيرا لبلجيكا",
    liveTitle: "كل إشارة تقود إلى قرار أفضل.",
    liveBody: "تربط موفيرا الإدراك والذكاء التشغيلي والعمل المنسق عبر المركبات وشبكات التنقل.",
    explore: "استكشف المنصة",
    operatingModel: "سياق التنقل البلجيكي",
    platformFlow: "مسار المنصة",
    pause: "إيقاف الحركة",
    play: "تشغيل الحركة",
    reduced: "تم تقليل الحركة",
    imageAlt: "حافلة كهربائية ذاتية القيادة تتحرك عبر ممر حضري متصل.",
    capabilityLabel: "قدرات المنصة",
    phases: [
      { label: "الإدراك", title: "يصبح الطريق واضحاً.", body: "تكشف إشارات المركبة والبنية التحتية ما يتغير حول كل نظام متحرك." },
      { label: "الفهم", title: "يتحول السياق إلى فهم تشغيلي.", body: "تفسر موفيرا مستوى الثقة والهدف والمخاطر وظروف الشبكة ضمن صورة تشغيلية واحدة." },
      { label: "التنسيق", title: "تصبح الخطوة التالية واضحة.", body: "يتم إعداد استجابة آمنة وقابلة للتفسير للمركبة والمشغّل وشبكة التنقل." },
      { label: "التعلّم", title: "كل نتيجة تحسّن النظام.", body: "تبقى القرارات والتدخلات والنتائج مترابطة لتبدأ الاستجابة التالية بفهم أفضل." },
    ],
    decisionKicker: "قرار واحد في حركة",
    decisionTitle: "شاهد كيف تفكر موفيرا.",
    decisionBody: "تنتقل حالة طريق متغيرة عبر سلسلة واحدة خاضعة للمساءلة، من الإدراك إلى التنفيذ والتعلّم.",
    scenario: "سيناريو تشغيلي",
    scenarioName: "ممر حضري · تغير في حالة المسار",
    decisionLabel: "تسلسل القرار",
    domainsKicker: "عبر منظومة التنقل البلجيكية",
    domainsTitle: "طبقة ذكاء واحدة. لكل نظام متحرك.",
    domainsBody: "تتكيف بنية القرار نفسها مع الآلة والتشغيل والعالم المحيط بهما.",
    domainsLabel: "مجالات التشغيل",
    domains: [
      { id: "vehicles", label: "المركبات", eyebrow: "ذكاء يتحرك", title: "مركبة تفهم أكثر من الطريق.", body: "تجمع موفيرا الإدراك والهدف وقابلية التفسير في سياق قيادة واحد ومتجدد باستمرار.", details: ["سياق متعدد المستشعرات", "استجابة قابلة للتفسير", "تسليم واضح للإنسان"] },
      { id: "fleets", label: "الأساطيل", eyebrow: "صورة تشغيلية واحدة", title: "كل مركبة تتحرك وهي تدرك الشبكة.", body: "تنسق فرق الأساطيل المسارات والأولويات والتدخلات دون فقدان سياق كل قرار.", details: ["سياق على مستوى الشبكة", "عمل منسق", "استثناءات مرئية"] },
      { id: "infrastructure", label: "البنية التحتية", eyebrow: "الطريق كنظام", title: "تصبح البنية التحتية جزءاً من حلقة القرار.", body: "تساعد إشارات الطريق والمدينة المركبات والمشغلين على توقع الظروف قبل أن تتحول إلى تعطّل.", details: ["ممرات متصلة", "سياق طريق مشترك", "تشغيل استباقي"] },
    ],
    trustKicker: "تنقل ذاتي خاضع للمساءلة",
    trustTitle: "ذكاء يستطيع الناس الاعتماد عليه.",
    trustItems: [
      { title: "قابل للتفسير من الأساس", body: "تبقى الإشارات والتوصيات وسياق القرار ظاهرة." },
      { title: "الإنسان هو المسؤول", body: "يبقى البشر مسؤولين عن الإجراءات المؤثرة." },
      { title: "كل قرار قابل للتتبع", body: "يجتمع الهدف والتدخل والنتيجة في سجل واحد." },
    ],
  },
  fr: {
    liveKicker: "MOVERA POUR LA BELGIQUE",
    liveTitle: "Chaque signal mène à une meilleure décision.",
    liveBody: "MOVERA relie perception, intelligence opérationnelle et action coordonnée à travers les véhicules et les réseaux de mobilité.",
    explore: "Explorer la plateforme",
    operatingModel: "Contexte de mobilité belge",
    platformFlow: "Flux de la plateforme",
    pause: "Suspendre le mouvement",
    play: "Activer le mouvement",
    reduced: "Mouvement réduit",
    imageAlt: "Une navette électrique autonome circule dans un corridor urbain connecté.",
    capabilityLabel: "Capacités de la plateforme",
    phases: [
      { label: "Percevoir", title: "La route devient lisible.", body: "Les signaux des véhicules et des infrastructures révèlent ce qui change autour de chaque système mobile." },
      { label: "Comprendre", title: "Le contexte devient intelligence.", body: "MOVERA interprète confiance, intention, risque et conditions du réseau dans une seule vue opérationnelle." },
      { label: "Coordonner", title: "Le prochain mouvement devient clair.", body: "Une réponse sûre et explicable est préparée pour le véhicule, l’opérateur et le réseau de mobilité." },
      { label: "Apprendre", title: "Chaque résultat améliore le système.", body: "Décisions, interventions et résultats restent liés afin de mieux informer la réponse suivante." },
    ],
    decisionKicker: "UNE DÉCISION EN MOUVEMENT",
    decisionTitle: "Voyez comment MOVERA raisonne.",
    decisionBody: "Une évolution de la route traverse une chaîne responsable, de la perception à l’action et à l’apprentissage.",
    scenario: "Scénario opérationnel",
    scenarioName: "Corridor urbain · changement de voie",
    decisionLabel: "Séquence de décision",
    domainsKicker: "À TRAVERS LA MOBILITÉ BELGE",
    domainsTitle: "Une couche d’intelligence. Tous les systèmes en mouvement.",
    domainsBody: "La même architecture de décision s’adapte à la machine, à l’opération et au monde qui les entoure.",
    domainsLabel: "Domaines opérationnels",
    domains: [
      { id: "vehicles", label: "Véhicules", eyebrow: "L’INTELLIGENCE EN MOUVEMENT", title: "Un véhicule qui comprend plus que la route.", body: "MOVERA réunit perception, intention et explicabilité dans un contexte de conduite continuellement actualisé.", details: ["Contexte multicapteur", "Réponse explicable", "Relais humain clair"] },
      { id: "fleets", label: "Flottes", eyebrow: "UNE VUE OPÉRATIONNELLE", title: "Chaque véhicule se déplace avec le réseau en tête.", body: "Les équipes coordonnent itinéraires, priorités et interventions sans perdre le contexte de chaque décision.", details: ["Contexte du réseau", "Action coordonnée", "Exceptions visibles"] },
      { id: "infrastructure", label: "Infrastructure", eyebrow: "LA ROUTE COMME SYSTÈME", title: "L’infrastructure rejoint la boucle de décision.", body: "Les signaux routiers et urbains aident véhicules et opérateurs à anticiper les conditions avant la perturbation.", details: ["Corridors connectés", "Contexte routier partagé", "Opérations proactives"] },
    ],
    trustKicker: "AUTONOMIE RESPONSABLE",
    trustTitle: "Une intelligence que chacun peut assumer.",
    trustItems: [
      { title: "Explicable par conception", body: "Signaux, recommandations et contexte de décision restent visibles." },
      { title: "L’humain aux commandes", body: "Les personnes restent responsables des actions importantes." },
      { title: "Chaque décision traçable", body: "Intention, intervention et résultat partagent un même registre." },
    ],
  },
  nl: {
    liveKicker: "MOVERA VOOR BELGIË",
    liveTitle: "Elk signaal wordt een betere beslissing.",
    liveBody: "MOVERA verbindt waarneming, operationele intelligentie en gecoördineerde actie voor voertuigen en mobiliteitsnetwerken.",
    explore: "Ontdek het platform",
    operatingModel: "Belgische mobiliteitscontext",
    platformFlow: "Platformstroom",
    pause: "Beweging pauzeren",
    play: "Beweging afspelen",
    reduced: "Beweging verminderd",
    imageAlt: "Een autonome elektrische shuttle rijdt door een verbonden stedelijke corridor.",
    capabilityLabel: "Platformmogelijkheden",
    phases: [
      { label: "Waarnemen", title: "De weg wordt leesbaar.", body: "Signalen van voertuig en infrastructuur tonen wat rond elk bewegend systeem verandert." },
      { label: "Begrijpen", title: "Context wordt intelligentie.", body: "MOVERA interpreteert zekerheid, intentie, risico en netwerkomstandigheden als één operationeel beeld." },
      { label: "Coördineren", title: "De volgende beweging wordt helder.", body: "Een veilige, uitlegbare reactie wordt voorbereid voor voertuig, operator en mobiliteitsnetwerk." },
      { label: "Leren", title: "Elke uitkomst verbetert het systeem.", body: "Besluiten, interventies en resultaten blijven verbonden zodat de volgende reactie beter begint." },
    ],
    decisionKicker: "ÉÉN BESLISSING IN BEWEGING",
    decisionTitle: "Zie hoe MOVERA denkt.",
    decisionBody: "Een veranderende wegsituatie doorloopt één controleerbare keten, van waarneming tot actie en leren.",
    scenario: "Operationeel scenario",
    scenarioName: "Stedelijke corridor · veranderende rijstrook",
    decisionLabel: "Beslisvolgorde",
    domainsKicker: "DOOR DE BELGISCHE MOBILITEIT",
    domainsTitle: "Eén intelligentielaag. Elk bewegend systeem.",
    domainsBody: "Dezelfde beslisarchitectuur past zich aan de machine, de operatie en hun omgeving aan.",
    domainsLabel: "Operationele domeinen",
    domains: [
      { id: "vehicles", label: "Voertuigen", eyebrow: "INTELLIGENTIE IN BEWEGING", title: "Een voertuig dat meer begrijpt dan de weg.", body: "MOVERA brengt waarneming, intentie en uitlegbaarheid samen in één voortdurend bijgewerkte rijcontext.", details: ["Multisensorcontext", "Uitlegbare reactie", "Heldere menselijke overdracht"] },
      { id: "fleets", label: "Vloten", eyebrow: "ÉÉN OPERATIONEEL BEELD", title: "Elk voertuig beweegt met het netwerk in gedachten.", body: "Vlootteams coördineren routes, prioriteiten en interventies zonder de context achter beslissingen te verliezen.", details: ["Netwerkbrede context", "Gecoördineerde actie", "Zichtbare uitzonderingen"] },
      { id: "infrastructure", label: "Infrastructuur", eyebrow: "DE WEG ALS SYSTEEM", title: "Infrastructuur wordt onderdeel van de beslislus.", body: "Weg- en stadssignalen helpen voertuigen en operators omstandigheden voorzien voordat ze verstoring worden.", details: ["Verbonden corridors", "Gedeelde wegcontext", "Proactieve operatie"] },
    ],
    trustKicker: "VERANTWOORDE AUTONOMIE",
    trustTitle: "Intelligentie waar mensen achter kunnen staan.",
    trustItems: [
      { title: "Uitlegbaar ontworpen", body: "Signalen, aanbevelingen en besliscontext blijven zichtbaar." },
      { title: "De mens houdt regie", body: "Mensen blijven verantwoordelijk voor ingrijpende acties." },
      { title: "Elke beslissing traceerbaar", body: "Intentie, interventie en uitkomst delen één dossier." },
    ],
  },
};

const preferredProductIds = ["perception-layer", "movera-command", "motion-os"];
const phaseImages = [
  "/starter-media/movera-belgium-perceive-v4.webp",
  "/starter-media/movera-belgium-understand-v4.webp",
  "/starter-media/movera-belgium-coordinate-v4.webp",
  "/starter-media/movera-belgium-learn-v4.webp",
];
const domainImages: Record<StoryDomain["id"], string> = {
  vehicles: "/starter-media/movera-belgium-vehicles-v4.webp",
  fleets: "/starter-media/movera-belgium-fleets-v4.webp",
  infrastructure: "/starter-media/movera-belgium-infrastructure-v4.webp",
};

function pathFor(locale: Locale, path: string) {
  return "/" + locale + path;
}

export function MoveraPlatformStory({ locale, products }: PlatformStoryProps) {
  const t = copy[locale];
  const [activePhase, setActivePhase] = useState(0);

  const selectPhaseFromKeyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % t.phases.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + t.phases.length) % t.phases.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = t.phases.length - 1;
    else return;
    event.preventDefault();
    setActivePhase(next);
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role='tab']");
    tabs?.[next]?.focus();
  };

  const selectedProducts = preferredProductIds
    .map(id => products.find(product => product.id === id))
    .filter((product): product is ContentItem => Boolean(product));

  return <div className="movera-platform-story">
    <section className="mps-live" aria-labelledby="mps-live-title">
      <div className="mps-live-stage" data-phase={activePhase}>
        <div
          className="mps-live-stage__viewport"
          id="mps-phase-panel"
          role="tabpanel"
          aria-labelledby={"mps-phase-tab-" + activePhase}
        >
          <Image
            key={phaseImages[activePhase]}
            className="mps-live-stage__image"
            src={phaseImages[activePhase]}
            alt=""
            fill
            sizes="100vw"
            priority={activePhase === 0}
          />
          <div className="mps-live-stage__wash" aria-hidden="true" />

          <div className="mps-live-stage__topline">
            <span><i aria-hidden="true" />{t.operatingModel}</span>
            <div className="mps-capabilities" aria-label={t.capabilityLabel}>
              {selectedProducts.map(product => <Link key={product.id} href={pathFor(locale, "/products/" + product.slug[locale])}>{product.title[locale]}</Link>)}
            </div>
          </div>

          <div className="mps-live-stage__readout" key={activePhase}>
            <p><span>{String(activePhase + 1).padStart(2, "0")}</span> {t.liveKicker}</p>
            <h2 id="mps-live-title">{t.phases[activePhase].title}</h2>
            <p>{t.phases[activePhase].body}</p>
            <Link className="mps-action-link" href={pathFor(locale, "/products")}>
              <span>{t.explore}</span><span className="mps-action-link__icon"><Arrow /></span>
            </Link>
          </div>
        </div>

        <div className="mps-phase-rail" role="tablist" aria-label={t.platformFlow}>
          {t.phases.map((phase, index) => <button
            id={"mps-phase-tab-" + index}
            type="button"
            role="tab"
            key={phase.label}
            className={index === activePhase ? "is-active" : ""}
            aria-selected={index === activePhase}
            aria-controls="mps-phase-panel"
            tabIndex={index === activePhase ? 0 : -1}
            onClick={() => setActivePhase(index)}
            onKeyDown={event => selectPhaseFromKeyboard(event, index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{phase.label}</strong>
          </button>)}
        </div>
      </div>
    </section>

    <section className="mps-domains" aria-label={t.domainsKicker}>
      <div className="mps-shell">
        <div className="mps-domain-sequence">
          {t.domains.map((domain, index) => <article
            className="mps-domain-chapter"
            data-domain={domain.id}
            data-layout={index % 2 === 0 ? "copy-first" : "visual-first"}
            key={domain.id}
          >
            <div className="mps-domain-chapter__copy">
              <p className="mps-domain-chapter__index">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{domain.label}</span>
              </p>
              <p className="mps-kicker">{domain.eyebrow}</p>
              <h2>{domain.title}</h2>
              <p>{domain.body}</p>
              <ul>{domain.details.map(detail => <li key={detail}>{detail}</li>)}</ul>
            </div>
            <figure className="mps-domain-chapter__visual">
              <Image
                className="mps-domain-chapter__image"
                src={domainImages[domain.id]}
                alt={domain.title}
                fill
                sizes="(max-width: 860px) 100vw, 58vw"
              />
            </figure>
          </article>)}
        </div>

        <div className="mps-trust">
          <div className="mps-trust__heading">
            <p className="mps-kicker">{t.trustKicker}</p>
            <h3>{t.trustTitle}</h3>
          </div>
          <ol>{t.trustItems.map((item, index) => <li key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </li>)}</ol>
        </div>
      </div>
    </section>
  </div>;
}
