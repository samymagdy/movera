import type { ContentItem, HomepageBand, Locale } from "@company/contracts";
import { Arrow } from "./icons";
import { MediaImage, mediaSource } from "./MediaImage";

type BandText = {
  eyebrow: string;
  title: string;
  body: string;
  viewLabel: string;
};

type HomepageContentBandsProps = {
  locale: Locale;
  bands?: HomepageBand[];
  news: ContentItem[];
  products: ContentItem[];
  projects: ContentItem[];
  jobs: ContentItem[];
};

const fallbackCopy: Record<Locale, {
  products: BandText;
  projects: BandText;
  careers: BandText;
  customers: BandText;
  featured: string;
}> = {
  en: {
    products: {
      eyebrow: "The MOVERA stack",
      title: "From perception to action.",
      body: "Product foundations for teams building intelligent vehicles and mobility networks.",
      viewLabel: "View products",
    },
    projects: {
      eyebrow: "Selected movement",
      title: "Make progress visible.",
      body: "Explore the systems and experiences MOVERA is shaping around real mobility decisions.",
      viewLabel: "View projects",
    },
    careers: {
      eyebrow: "Work with MOVERA",
      title: "Build the next move.",
      body: "Bring curiosity, craft, and responsibility to the future of movement.",
      viewLabel: "View roles",
    },
    customers: {
      eyebrow: "The ecosystem",
      title: "Built across the mobility ecosystem.",
      body: "MOVERA works with the teams making vehicles, infrastructure, and intelligence useful in the real world.",
      viewLabel: "",
    },
    featured: "Featured",
  },
  ar: {
    products: { eyebrow: "منظومة موفيرا", title: "من الإدراك إلى الفعل.", body: "أسس تقنية للفرق التي تبني المركبات الذكية وشبكات التنقل.", viewLabel: "عرض المنتجات" },
    projects: { eyebrow: "حركة مختارة", title: "اجعل التقدم مرئياً.", body: "استكشف الأنظمة والتجارب التي تطورها موفيرا حول قرارات التنقل الواقعية.", viewLabel: "عرض المشاريع" },
    careers: { eyebrow: "اعمل مع موفيرا", title: "ابنِ الحركة التالية.", body: "اجلب الفضول والحرفية والمسؤولية إلى مستقبل الحركة.", viewLabel: "عرض الوظائف" },
    customers: { eyebrow: "المنظومة", title: "نبني عبر منظومة التنقل.", body: "تعمل موفيرا مع الفرق التي تجعل المركبات والبنية التحتية والذكاء مفيدة في العالم الحقيقي.", viewLabel: "" },
    featured: "مميز",
  },
  fr: {
    products: { eyebrow: "La stack MOVERA", title: "De la perception à l'action.", body: "Des fondations produit pour les équipes qui bâtissent les véhicules intelligents et les réseaux de mobilité.", viewLabel: "Voir les produits" },
    projects: { eyebrow: "Mouvement sélectionné", title: "Rendre le progrès visible.", body: "Découvrez les systèmes et expériences que MOVERA façonne autour des décisions de mobilité réelles.", viewLabel: "Voir les projets" },
    careers: { eyebrow: "Travaillez avec MOVERA", title: "Construisez le prochain mouvement.", body: "Apportez curiosité, savoir-faire et responsabilité au futur du mouvement.", viewLabel: "Voir les postes" },
    customers: { eyebrow: "L'écosystème", title: "Conçu à travers l'écosystème mobilité.", body: "MOVERA travaille avec les équipes qui rendent les véhicules, l'infrastructure et l'intelligence utiles dans le monde réel.", viewLabel: "" },
    featured: "À la une",
  },
  nl: {
    products: { eyebrow: "De MOVERA-stack", title: "Van waarneming naar actie.", body: "Productfundamenten voor teams die intelligente voertuigen en mobiliteitsnetwerken bouwen.", viewLabel: "Bekijk producten" },
    projects: { eyebrow: "Geselecteerde beweging", title: "Maak vooruitgang zichtbaar.", body: "Ontdek de systemen en ervaringen die MOVERA rond echte mobiliteitsbeslissingen vormgeeft.", viewLabel: "Bekijk projecten" },
    careers: { eyebrow: "Werk met MOVERA", title: "Bouw de volgende beweging.", body: "Breng nieuwsgierigheid, vakmanschap en verantwoordelijkheid naar de toekomst van beweging.", viewLabel: "Bekijk vacatures" },
    customers: { eyebrow: "Het ecosysteem", title: "Gebouwd door het hele mobiliteitsecosysteem.", body: "MOVERA werkt met teams die voertuigen, infrastructuur en intelligentie bruikbaar maken in de echte wereld.", viewLabel: "" },
    featured: "Uitgelicht",
  },
};

const ecosystemNodes = [
  "Vehicle systems",
  "Mobility operators",
  "Fleet intelligence",
  "Cloud and edge",
  "Autonomy teams",
  "Urban networks",
  "Safety systems",
  "Research partners",
] as const;

const productReferenceOrder = ["perception-layer", "movera-command", "motion-os"];
const projectReferenceOrder = ["urban-perception-pilot", "predictive-fleet-network", "connected-cockpit"];
const omittedHomepageBands = new Set<HomepageBand["id"]>(["careers", "customers"]);

function pathFor(locale: Locale, path: string) {
  return `/${locale}${path}`;
}

function itemPath(locale: Locale, kind: "products" | "projects" | "jobs", slug: string) {
  const prefix = kind === "jobs" ? "/careers" : `/${kind}`;
  return pathFor(locale, `${prefix}/${slug}`);
}

function isPublished(item: ContentItem) {
  return item.status !== "archived" && item.status !== "draft";
}

function regionLabel(region: ContentItem["region"], locale: Locale) {
  const labels: Record<Locale, Record<NonNullable<ContentItem["region"]>, string>> = {
    en: { "hub-a": "Brussels & Capital Region", "hub-b": "Flanders Mobility Corridor", "hub-c": "Wallonia Mobility Corridor" },
    ar: { "hub-a": "بروكسل ومنطقة العاصمة", "hub-b": "ممر التنقل في فلاندرز", "hub-c": "ممر التنقل في والونيا" },
    fr: { "hub-a": "Bruxelles et Région-Capitale", "hub-b": "Corridor mobilité en Flandre", "hub-c": "Corridor mobilité en Wallonie" },
    nl: { "hub-a": "Brussel en het Hoofdstedelijk Gewest", "hub-b": "Vlaamse mobiliteitscorridor", "hub-c": "Waalse mobiliteitscorridor" },
  };
  return region ? labels[locale][region] : "";
}

function resolveBandText(band: HomepageBand | undefined, locale: Locale, fallback: BandText): BandText {
  if (!band) return fallback;
  return {
    eyebrow: band.eyebrow[locale] || fallback.eyebrow,
    title: band.title[locale] || fallback.title,
    body: band.body[locale] || fallback.body,
    viewLabel: band.viewLabel[locale] || fallback.viewLabel,
  };
}

function selectItems(items: ContentItem[], ids: string[] | undefined, fallbackToAll: boolean) {
  const published = items.filter(isPublished);
  if (!ids?.length) return fallbackToAll ? published : [];
  const byId = new Map(published.map(item => [item.id, item]));
  return ids.map(id => byId.get(id)).filter((item): item is ContentItem => Boolean(item));
}

function referenceOrder(items: ContentItem[], ids: string[]) {
  const rank = new Map(ids.map((id, index) => [id, index]));
  return [...items].sort((a, b) => (rank.get(a.id) ?? ids.length) - (rank.get(b.id) ?? ids.length));
}

function BandMedia({ item, className, locale }: { item: ContentItem; className: string; locale: Locale }) {
  if (!mediaSource(item.cover, "").src) return null;
  return <span className={className}>
    <MediaImage media={item.cover} alt={item.cover?.alt[locale] || item.title[locale]} loading="lazy" decoding="async" />
  </span>;
}

function RoundArrow() {
  return <span className="mref-round-arrow" aria-hidden="true"><Arrow /></span>;
}

function BandIntro({ headingId, eyebrow, title, body, href, hrefLabel }: BandText & { headingId: string; href: string; hrefLabel: string }) {
  return <header className="mref-intro">
    <p className="mref-kicker">{eyebrow}</p>
    <h2 id={headingId}>{title}</h2>
    <p className="mref-intro__body">{body}</p>
    <a className="mref-text-link" href={href}><span>{hrefLabel}</span><Arrow /></a>
  </header>;
}

function SignalField({ variant = "flow", className = "" }: { variant?: "flow" | "mesh" | "ecosystem"; className?: string }) {
  return <span className={`mref-signal mref-signal--${variant} ${className}`.trim()} aria-hidden="true">
    <svg viewBox="0 0 620 260" preserveAspectRatio="none" focusable="false">
      <g className="mref-signal__threads">
        <path d="M12 133C93 45 156 207 242 128S378 43 454 126s116 80 154-13" />
        <path d="M12 145c85-70 145 56 230-3s139-52 214 0 116 55 152-3" />
        <path d="M12 119c86-51 148 39 230-4s137-35 213 0 117 41 153 8" />
        <path d="M12 159c93-41 150 29 232 3s136-26 211-2 116 31 153 13" />
        <path d="M12 103c83-29 147 23 228-1s140-17 216 2 116 22 152 10" />
        <path d="M12 174c96-23 151 14 233 1s136-15 211-1 115 18 152 8" />
      </g>
      <g className="mref-signal__mesh">
        <path d="M58 130 112 77 175 134 233 92 309 132 374 72 437 126 508 86 590 115" />
        <path d="M58 130 118 183 175 134 240 192 309 132 378 192 437 126 516 178 590 115" />
      </g>
    </svg>
  </span>;
}

function ProductGlyph({ id, index }: { id: string; index: number }) {
  const variant = id === "perception-layer" ? "perception" : id === "movera-command" ? "command" : id === "motion-os" ? "motion" : index % 3 === 0 ? "perception" : index % 3 === 1 ? "command" : "motion";
  return <span className={`mref-product-glyph mref-product-glyph--${variant}`} aria-hidden="true">
    <svg viewBox="0 0 132 72" focusable="false">
      {variant === "perception" && <>
        <path className="glyph-soft" d="M4 50c20 0 25-21 45-21s26 12 42 12 21-18 37-18" />
        <path d="M4 50c20 0 25-21 45-21s26 12 42 12 21-18 37-18" />
        <circle cx="5" cy="50" r="2" /><circle cx="50" cy="29" r="2" /><circle cx="91" cy="41" r="2" /><circle cx="127" cy="23" r="2" />
      </>}
      {variant === "command" && <>
        <path className="glyph-soft" d="M66 4 99 23v37L66 78 33 60V23Z" />
        <path d="m66 12 23 13v26L66 64 43 51V25Z" />
        <path d="m66 23 13 7v15l-13 7-13-7V30Z" />
        <path d="m66 23v29m-13-22 13 8 13-8" />
      </>}
      {variant === "motion" && <>
        <ellipse cx="66" cy="36" rx="45" ry="21" />
        <ellipse cx="66" cy="36" rx="22" ry="32" />
        <path d="M7 52c27-8 39-30 61-23s27 24 57 4" />
        <circle cx="22" cy="48" r="2" /><circle cx="66" cy="29" r="3" /><circle cx="105" cy="42" r="2" />
      </>}
    </svg>
  </span>;
}

function ProjectVisual({ item, locale, variant }: { item: ContentItem; locale: Locale; variant: "featured" | "network" | "vehicle" }) {
  const configuredSource = mediaSource(item.cover, "").src;
  const usesStarterField = !configuredSource || configuredSource.endsWith("/starter-media/movera-hero-field.svg");
  const photoFallback = variant === "network" ? "/starter-media/movera-hero-field.svg" : "/starter-media/movera-autonomy-hero.webp";
  return <span className={`mref-project-visual mref-project-visual--${variant}`} aria-hidden="true">
    {usesStarterField
      ? <img src={photoFallback} alt="" loading="lazy" decoding="async" />
      : <BandMedia item={item} className="mref-project-visual__media" locale={locale} />}
    {variant === "featured" && <span className="mref-radar"><i /><i /><i /></span>}
    {variant !== "vehicle" && <SignalField variant={variant === "network" ? "mesh" : "flow"} />}
    {variant === "featured" && <span className="mref-route-line" />}
  </span>;
}

function RoleGlyph({ index }: { index: number }) {
  const waveform = index % 2 === 1;
  return <span className={`mref-role-glyph mref-role-glyph--${waveform ? "wave" : "vehicle"}`} aria-hidden="true">
    <svg viewBox="0 0 420 150" focusable="false">
      {waveform ? <>
        <g className="mref-role-glyph__mesh">
          <path d="M8 102 56 90l44 18 52-55 55 37 55-63 53 61 52-38 45 19" />
          <path d="M8 120 56 90 100 128 152 53 207 115 262 27 315 109 367 50 412 88" />
          <path d="M8 83 56 90 100 70 152 53 207 58 262 27 315 48 367 50 412 35" />
        </g>
      </> : <g className="mref-role-glyph__vehicle">
        <path d="M34 102h22l25-44c7-12 17-19 31-21l132-13c24-2 47 5 65 20l42 35 31 8c12 3 20 13 20 25v7H34Z" />
        <path d="m100 58 37-4 33-23m-8 20 81-8c17-2 33 2 47 12l27 21H87" />
        <circle cx="114" cy="116" r="24" /><circle cx="114" cy="116" r="9" />
        <circle cx="326" cy="116" r="24" /><circle cx="326" cy="116" r="9" />
      </g>}
    </svg>
  </span>;
}

function LocationPin() {
  return <svg className="mref-location-pin" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 14s4-3.7 4-7.5a4 4 0 1 0-8 0C4 10.3 8 14 8 14Z" /><circle cx="8" cy="6.5" r="1.35" /></svg>;
}

function EcosystemConstellation({ mirror = false }: { mirror?: boolean }) {
  return <span className={`mref-constellation${mirror ? " mref-constellation--mirror" : ""}`} aria-hidden="true">
    <svg viewBox="0 0 250 100" focusable="false">
      <g><path d="M14 61 61 28l54 16 44-26 72 22M14 61l53 25 48-42 47 39 69-43M61 28l6 58m48-42 47 39m-3-65 3 65" /></g>
    </svg>
  </span>;
}

export function HomepageContentBands({ locale, bands, products, projects, jobs }: HomepageContentBandsProps) {
  const copy = fallbackCopy[locale];
  const configured = new Map((bands || []).map(band => [band.id, band]));
  const hasConfiguredBands = Boolean(bands?.length);
  const isVisible = (id: HomepageBand["id"]) => !omittedHomepageBands.has(id) && configured.get(id)?.visible !== false;

  const productBand = configured.get("products");
  const projectBand = configured.get("projects");
  const careerBand = configured.get("careers");
  const customerBand = configured.get("customers");

  const productText = resolveBandText(productBand, locale, copy.products);
  const projectText = resolveBandText(projectBand, locale, copy.projects);
  const careerText = resolveBandText(careerBand, locale, copy.careers);
  const customerText = resolveBandText(customerBand, locale, copy.customers);
  const ecosystemTitle = customerText.title === "Movement is built together." ? copy.customers.title : customerText.title;

  const productItems = referenceOrder(selectItems(products, productBand?.itemIds, !hasConfiguredBands), productReferenceOrder).slice(0, 3);
  const projectItems = referenceOrder(selectItems(projects, projectBand?.itemIds, !hasConfiguredBands), projectReferenceOrder).slice(0, 3);
  const careerItems = selectItems(jobs, careerBand?.itemIds, !hasConfiguredBands).slice(0, 2);
  const featuredProject = projectItems[0];
  const secondaryProjects = projectItems.slice(1, 3);

  return <div className="homepage-intelligence-stream">
    {isVisible("products") && <section className="mref-band mref-stack-band" id="products" aria-labelledby="homepage-products-heading">
      <div className="mref-frame mref-stack-layout">
        <BandIntro headingId="homepage-products-heading" {...productText} href={pathFor(locale, "/products")} hrefLabel={productText.viewLabel} />
        <SignalField variant="flow" className="mref-stack-signal" />
        <div className="mref-product-list">
          {productItems.map((item, index) => <a className="mref-product-card" href={itemPath(locale, "products", item.slug[locale])} key={item.id}>
            <ProductGlyph id={item.id} index={index} />
            <span className="mref-card-copy"><strong>{item.title[locale]}</strong><small>{item.summary[locale]}</small></span>
            <RoundArrow />
            <i className="mref-product-port" aria-hidden="true" />
          </a>)}
        </div>
      </div>
    </section>}

    {isVisible("projects") && <section className="mref-band mref-projects-band" id="projects" aria-labelledby="homepage-projects-heading">
      <div className="mref-frame mref-projects-layout">
        <BandIntro headingId="homepage-projects-heading" {...projectText} href={pathFor(locale, "/projects")} hrefLabel={projectText.viewLabel} />
        <div className="mref-project-stage">
          {featuredProject && <a className="mref-project-card mref-project-card--featured" href={itemPath(locale, "projects", featuredProject.slug[locale])}>
            <ProjectVisual item={featuredProject} locale={locale} variant="featured" />
            <span className="mref-featured-tag">{copy.featured}</span>
            <span className="mref-project-copy"><strong>{featuredProject.title[locale]}</strong><small>{featuredProject.summary[locale]}</small>{featuredProject.client && <em>{featuredProject.client}</em>}</span>
            <RoundArrow />
          </a>}
          <div className="mref-project-secondary">
            {secondaryProjects.map((item, index) => <a className={`mref-project-card mref-project-card--secondary mref-project-card--${index === 0 ? "network" : "vehicle"}`} href={itemPath(locale, "projects", item.slug[locale])} key={item.id}>
              <ProjectVisual item={item} locale={locale} variant={index === 0 ? "network" : "vehicle"} />
              <span className="mref-project-copy"><strong>{item.title[locale]}</strong><small>{item.summary[locale]}</small>{item.client && <em>{item.client}</em>}</span>
              <RoundArrow />
            </a>)}
          </div>
        </div>
      </div>
    </section>}

    {isVisible("careers") && <section className="mref-band mref-careers-band" id="careers" aria-labelledby="homepage-careers-heading">
      <div className="mref-frame mref-careers-layout">
        <header className="mref-career-intro">
          <span className="mref-career-intro__number" aria-hidden="true">03</span>
          <div>
            <p className="mref-kicker">{careerText.eyebrow}</p>
            <h2 id="homepage-careers-heading">{careerText.title}</h2>
            <p>{careerText.body}</p>
            <a className="mref-text-link" href={pathFor(locale, "/careers")}><span>{careerText.viewLabel}</span><Arrow /></a>
          </div>
        </header>
        {careerItems.map((item, index) => <a className="mref-role-card" href={itemPath(locale, "jobs", item.slug[locale])} key={item.id}>
          <span className="mref-role-card__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <span className="mref-role-card__copy"><strong>{item.title[locale]}</strong><small>{item.summary[locale]}</small>{regionLabel(item.region, locale) && <em><LocationPin />{regionLabel(item.region, locale)}</em>}</span>
          <RoleGlyph index={index} />
          <RoundArrow />
        </a>)}
      </div>
    </section>}

    {isVisible("customers") && <section className="mref-band mref-ecosystem-band" aria-labelledby="homepage-ecosystem-heading">
      <div className="mref-frame mref-ecosystem-layout">
        <header className="mref-ecosystem-intro">
          <p className="mref-kicker">{customerText.eyebrow}</p>
          <h2 id="homepage-ecosystem-heading">{ecosystemTitle}</h2>
        </header>
        <div className="mref-ecosystem-stage">
          <p>{customerText.body}</p>
          <EcosystemConstellation />
          <div className="mref-ecosystem-nodes">
            {ecosystemNodes.map((name, index) => <span key={name} className={`mref-ecosystem-node mref-ecosystem-node--${index + 1}`}><strong>{name}</strong></span>)}
          </div>
          <EcosystemConstellation mirror />
        </div>
      </div>
    </section>}
  </div>;
}
