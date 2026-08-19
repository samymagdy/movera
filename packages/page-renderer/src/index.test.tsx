import { pageTreeSchema, type PageTree } from "@company/schemas";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageRenderer, SiteRenderer, type SiteChrome } from "./index.js";

const bilingualHero = pageTreeSchema.parse({
  nodes: [
    {
      id: "home-hero",
      props: {
        alignment: "left",
        description: {
          ar: "ذكاء مؤسسي آمن",
          en: "Safe enterprise intelligence",
        },
        minHeight: 640,
        overlayOpacity: 0.55,
        title: { ar: "حلول الذكاء الاصطناعي", en: "AI Solutions" },
      },
      styles: {},
      type: "hero",
      version: 1,
      visibility: {},
    },
  ],
  pageId: "home",
  schemaVersion: 1,
});

const builderFirstTree = pageTreeSchema.parse({
  locale: "en",
  nodes: [
    {
      children: [],
      id: "home-intelligence-news",
      props: {
        items: [
          {
            headline: { en: "Inspection intelligence is now live" },
            href: "/news/inspection-intelligence",
            id: "inspection-news",
          },
        ],
        title: { en: "Intelligence News" },
      },
      styles: {},
      type: "intelligenceNewsBar",
      version: 1,
      visibility: {},
    },
    {
      children: [
        {
          children: [],
          id: "home-cinematic-city",
          props: {
            geometry: {
              base: { height: 100, width: 73, x: 27, y: 0, zIndex: 1 },
              mobileLandscape: { height: 72, width: 88, x: 12, y: 28 },
              mobilePortrait: { height: 61, width: 112, x: -6, y: 39 },
            },
            media: {
              alt: { en: "Connected AI city" },
              url: "/starter-media/hero.svg",
            },
            name: { en: "AI city" },
            motion: {
              accentColor: "#44ddff",
              backgroundOpacity: 0.63,
              delay: 0.4,
              density: 0.34,
              direction: "outward",
              enabled: false,
              intensity: 0.51,
              mobileVisible: false,
              overlayStrength: 0.48,
              reducedMotion: "static",
              speed: 1.2,
            },
            preset: "city",
          },
          styles: {
            base: { radius: 18 },
            mobileLandscape: { opacity: 0.66 },
          },
          type: "visualLayer",
          version: 1,
          visibility: {},
        },
        {
          children: [],
          id: "home-cinematic-inspection-card",
          props: {
            description: { en: "Real-time anomaly detection" },
            geometry: {
              base: { height: 27, width: 16, x: 39, y: 11, zIndex: 14 },
              mobilePortrait: { height: 18, width: 44, x: 4, y: 58 },
            },
            entryAnimation: "scaleIn",
            title: { en: "AI Inspection" },
          },
          styles: {},
          type: "floatingInsightCard",
          version: 1,
          visibility: {},
        },
        {
          children: [],
          id: "home-cinematic-metrics",
          props: {
            geometry: {
              base: { height: 14, width: 34, x: 4, y: 80, zIndex: 18 },
              mobilePortrait: { height: 20, width: 92, x: 4, y: 78 },
            },
            metrics: [
              { id: "ai-models", label: { en: "AI Models" }, value: "50+" },
              {
                id: "assets-monitored",
                label: { en: "Assets Monitored" },
                value: "1M+",
              },
            ],
            variant: "expanded",
          },
          styles: {},
          type: "inlineMetrics",
          version: 1,
          visibility: {},
        },
      ],
      id: "home-cinematic-hero",
      props: {
        description: { en: "AI products for mission-critical operations." },
        gradientMask: 0.31,
        highlight: { en: "Enterprise Intelligence" },
        primaryAction: { href: "/services", label: { en: "Explore AI" } },
        radialGlow: 0.27,
        title: { en: "AI Solutions" },
        visualMotion: {
          accentColor: "#33bbff",
          backgroundOpacity: 0.61,
          delay: 0.6,
          density: 0.39,
          direction: "clockwise",
          enabled: false,
          intensity: 0.47,
          mobileVisible: false,
          overlayStrength: 0.53,
          reducedMotion: "static",
          speed: 1.4,
        },
      },
      styles: {},
      type: "cinematicHero",
      version: 1,
      visibility: {},
    },
    {
      children: [],
      id: "home-product-suite",
      props: {
        description: { en: "Modular intelligence products." },
        heading: { en: "AI Product Suite" },
        products: [
          {
            id: "vision-ai",
            summary: { en: "Perception at scale" },
            title: { en: "Vision AI" },
          },
          {
            id: "agent-ai",
            summary: { en: "Autonomous operations" },
            title: { en: "Agent AI" },
          },
        ],
      },
      styles: {},
      type: "productSuiteRail",
      version: 1,
      visibility: {},
    },
    {
      children: [
        {
          children: [],
          id: "home-dashboard-preview",
          props: {
            activeNavigationId: "assets",
            chartLabel: { en: "Events Over Time" },
            insights: [
              {
                id: "road-anomaly",
                label: { en: "Road Anomaly Detected" },
              },
            ],
            insightsLabel: { en: "Top Insights" },
            mapLabel: { en: "Live Map" },
            metrics: [
              {
                id: "assets-online",
                label: { en: "Assets Online" },
                value: "12,847",
              },
              {
                id: "active-alerts",
                label: { en: "Active Alerts" },
                value: "36",
              },
            ],
            navigation: [
              { id: "overview", label: { en: "Overview" } },
              { id: "assets", label: { en: "Assets" } },
              { id: "alerts", label: { en: "Alerts" } },
            ],
            responsiveMode: "compact",
            theme: "electric",
            title: { en: "Operations Overview" },
          },
          styles: {},
          type: "dashboardPreview",
          version: 1,
          visibility: {},
        },
      ],
      id: "home-command-center",
      props: {
        description: { en: "Real-time visibility across operations." },
        primaryAction: {
          href: "/command-center",
          label: { en: "Explore Command Center" },
        },
        subtitle: { en: "Command Center" },
        title: { en: "Live Intelligence" },
      },
      styles: {},
      type: "commandCenterShowcase",
      version: 1,
      visibility: {},
    },
  ],
  pageId: "builder-first-home",
  schemaVersion: 2,
});

const publishedChrome: SiteChrome = {
  brand: { ar: "شركتك الرقمية", en: "Your Company Digital" },
  enquiry: {
    href: "/contact",
    label: { ar: "تواصل معنا", en: "Talk to us" },
  },
  footerLine: { ar: "نبني المستقبل", en: "Building the future" },
  logo: {
    alt: { ar: "شعار قديم", en: "Stale logo label" },
    url: "/media/company-digital.svg",
  },
  header: {
    background: "#00152d",
    borderOpacity: 0.32,
    compactOnScroll: true,
    dropdownStyle: "mega",
    height: 82,
    logoSize: 34,
    mobileMode: "overlay",
    navigationGap: 28,
    showLanguage: true,
    showSearch: true,
    sticky: true,
    tone: "transparent",
    transparentToSolid: true,
  },
  navigation: [
    {
      children: [
        {
          href: "/products/vision-ai",
          id: "vision-ai",
          label: { ar: "الرؤية الذكية", en: "Vision AI" },
          openInNewTab: true,
        },
      ],
      href: "/en/services/ai?view=all#details",
      id: "services-ai",
      label: { ar: "حلول الذكاء", en: "AI Solutions" },
    },
    {
      href: "https://example.test/news",
      id: "external-news",
      label: { ar: "أخبار خارجية", en: "External news" },
      openInNewTab: true,
    },
  ],
  theme: {
    accent: "#36b8ef",
    background: "#00101f",
    backgroundElevated: "#072541",
    glassIntensity: 0.4,
    glow: "#1177ff",
    glowIntensity: 0.3,
    muted: "#aabbcc",
    purpleAccent: "#8866ff",
    radius: 18,
    shadow: "soft",
    spacingScale: 1.25,
    text: "#fefefe",
    typography: "technical",
  },
};

describe("PageRenderer", () => {
  it("renders only the approved React tree", () => {
    const html = renderToStaticMarkup(
      <PageRenderer locale="en" tree={bilingualHero} />,
    );

    expect(html).toContain('data-node="hero"');
    expect(html).toContain("AI Solutions");
    expect(html).not.toContain("dangerouslySetInnerHTML");
  });

  it("sets native Arabic language and direction while resolving Arabic content", () => {
    const html = renderToStaticMarkup(
      <PageRenderer locale="ar" tree={bilingualHero} />,
    );

    expect(html).toContain('dir="rtl"');
    expect(html).toContain('lang="ar"');
    expect(html).toContain("حلول الذكاء الاصطناعي");
  });

  it("rejects an unapproved production node before rendering", () => {
    expect(() =>
      PageRenderer({
        locale: "en",
        tree: {
          ...bilingualHero,
          nodes: [
            {
              id: "unsafe-script",
              props: { source: "alert(1)" },
              styles: {},
              type: "script",
              version: 1,
              visibility: {},
            },
          ],
        } as unknown as typeof bilingualHero,
      }),
    ).toThrow();
  });

  it("upgrades a historical v1 publication at the trusted render boundary", () => {
    const legacyTree = {
      locale: "en",
      nodes: [
        {
          id: "legacy-hero",
          props: { title: { en: "Historical publication" } },
          styles: { paddingInline: 48, textColor: "#ffffff" },
          type: "hero",
          version: 1,
          visibility: {},
        },
      ],
      pageId: "legacy-page",
      schemaVersion: 1,
    };

    const html = renderToStaticMarkup(
      <PageRenderer locale="en" tree={legacyTree as unknown as PageTree} />,
    );
    expect(html).toContain('data-schema-version="2"');
    expect(html).toContain("Historical publication");
    expect(html).toContain("--tw-node-paddingInline-base:48px");
  });

  it("renders each nested approved node once", () => {
    const nestedTree = pageTreeSchema.parse({
      locale: "en",
      nodes: [
        {
          children: [
            {
              children: [],
              id: "nested-copy",
              props: { body: { en: "One nested node" } },
              styles: {},
              type: "textBlock",
              version: 1,
              visibility: {},
            },
          ],
          id: "nested-section",
          props: {},
          styles: {},
          type: "section",
          version: 1,
          visibility: {},
        },
      ],
      pageId: "nested-page",
      schemaVersion: 2,
    });
    const html = renderToStaticMarkup(<PageRenderer locale="en" tree={nestedTree} />);
    expect(html.match(/id="nested-copy"/gu)).toHaveLength(1);
    expect(html.match(/One nested node/gu)).toHaveLength(1);
  });

  it("renders the builder-first nested composition through the trusted registry", () => {
    const html = renderToStaticMarkup(
      <PageRenderer locale="en" tree={builderFirstTree} />,
    );

    expect(html).toContain("tw-intelligence-news");
    expect(html).toContain('data-node="cinematicHero"');
    expect(html).toContain('class="tw-visual-layer tw-responsive-node"');
    expect(html).toContain('data-preset="city"');
    expect(html).toContain('data-motion-enabled="false"');
    expect(html).toContain('data-motion-mobile="false"');
    expect(html).toContain('data-motion-direction="clockwise"');
    expect(html).toContain('src="/starter-media/hero.svg"');
    expect(html).toContain("--tw-layer-fit:contain");
    expect(html).not.toContain('class="tw-floating-card tw-responsive-node"');
    expect(html).toContain('class="tw-inline-metrics-layer tw-responsive-node"');
    expect(html).toContain('data-variant="expanded"');
    expect(html).toContain("--tw-cinematic-gradient:0.31");
    expect(html).toContain("--tw-cinematic-radial:0.27");
    expect(html).toContain("--tw-cinematic-motion-accent:#33bbff");
    expect(html).toContain("--tw-geo-width-base:73%");
    expect(html).toContain("--tw-geo-width-mobileLandscape:88%");
    expect(html).toContain("--tw-geo-width-mobilePortrait:112%");
    expect(html).toContain("--tw-node-radius-base:18px");
    expect(html).toContain("--tw-node-opacity-mobileLandscape:0.66");
    expect(html).toContain('data-node="productSuiteRail"');
    expect(html).toContain('data-node="commandCenterShowcase"');
    expect(html).toContain('class="tw-dashboard-preview tw-responsive-node"');
    expect(html).toContain('data-mode="compact"');
    expect(html).toContain('data-theme="electric"');
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Operations Overview"');
    expect(html.match(/data-active="true"/gu)).toHaveLength(1);
    expect(html).toContain('aria-current="page" data-active="true">');
    expect(html).toContain("Enterprise Intelligence");
    expect(html).toContain("12,847");
    expect(html).not.toContain("data-company-component");
  });
});

describe("SiteRenderer", () => {
  it("renders published English chrome and preserves a nested slug when switching locale", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer
        chrome={publishedChrome}
        currentSlug="services/ai"
        locale="en"
        tree={bilingualHero}
      />,
    );

    expect(html).toContain('class="public-shell"');
    expect(html).toContain('dir="ltr" lang="en"');
    expect(html).toContain("YOUR COMPANY");
    expect(html).toContain("Building the future");
    expect(html).toContain('aria-label="YOUR COMPANY home"');
    expect(html.match(/alt="YOUR COMPANY"/gu)).toBeNull();
    expect(html.match(/src="\/branding\/company-emblem\.webp"/gu)).toHaveLength(2);
    expect(html.match(/src="\/branding\/company-wordmark\.webp"/gu)).toHaveLength(2);
    expect(html).not.toContain("<strong>YOUR COMPANY</strong>");
    expect(html).toContain(
      `© ${new Date().getFullYear()} YOUR COMPANY. All rights reserved.`,
    );
    expect(html).not.toContain("Stale logo label");
    expect(html).toContain("AI Solutions");
    expect(html.match(/href="\/en\/services\/ai\?view=all#details"/gu)).toHaveLength(2);
    expect(html.match(/href="https:\/\/example\.test\/news"/gu)).toHaveLength(2);
    expect(html.match(/target="_blank"/gu)).toHaveLength(4);
    expect(html.match(/rel="noopener noreferrer"/gu)).toHaveLength(4);
    expect(html.match(/href="\/en\/products\/vision-ai"/gu)).toHaveLength(2);
    expect(html).toContain('data-dropdown="mega"');
    expect(html).toContain('data-transparent-to-solid="true"');
    expect(html).toContain("--tw-header-height:82px");
    expect(html).toContain("--tw-header-background:#00152d");
    expect(html).toContain("--tw-theme-glass:0.4");
    expect(html).toContain("--tw-theme-glow-intensity:0.3");
    expect(html).toContain("--tw-theme-radius:18px");
    expect(html).toContain("--tw-theme-spacing:1.25");
    expect(html).toContain('class="locale-switch" href="/ar/services/ai"');
    expect(html).toContain('class="enquiry-button" href="/en/contact"');
    expect(html).toContain('aria-label="Open search"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('action="/en/search"');
    expect(html).toContain('name="q"');
    expect(html).toContain('placeholder="Search YOUR COMPANY"');
  });

  it("re-localizes published navigation and the current nested route in Arabic", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer
        chrome={publishedChrome}
        currentSlug="services/ai"
        locale="ar"
        tree={bilingualHero}
      />,
    );

    expect(html).toContain('class="public-shell"');
    expect(html).toContain('dir="rtl" lang="ar"');
    expect(html).toContain("شركتك");
    expect(html).toContain("نبني المستقبل");
    expect(html).toContain('aria-label="الصفحة الرئيسية لـ شركتك"');
    expect(html.match(/alt="YOUR COMPANY"/gu)).toBeNull();
    expect(html.match(/src="\/branding\/company-emblem\.webp"/gu)).toHaveLength(2);
    expect(html.match(/src="\/branding\/company-wordmark\.webp"/gu)).toHaveLength(2);
    expect(html).not.toContain("<strong>YOUR COMPANY</strong>");
    expect(html).toContain(
      `© ${new Date().getFullYear()} شركتك. جميع الحقوق محفوظة.`,
    );
    expect(html).not.toContain("شعار قديم");
    expect(html).toContain("حلول الذكاء");
    expect(html.match(/href="\/ar\/services\/ai\?view=all#details"/gu)).toHaveLength(2);
    expect(html).toContain('class="locale-switch" href="/en/services/ai"');
    expect(html).toContain('class="enquiry-button" href="/ar/contact"');
    expect(html).toContain('aria-label="فتح البحث"');
    expect(html).toContain('action="/ar/search"');
    expect(html).toContain('placeholder="ابحث في شركتك"');
  });

  it("keeps the full public shell on the same approved-tree trust boundary", () => {
    const unsafeTree = {
      ...bilingualHero,
      nodes: [
        {
          id: "unsafe-script",
          props: { source: "alert(1)" },
          styles: {},
          type: "script",
          version: 1,
          visibility: {},
        },
      ],
    } as unknown as PageTree;

    expect(() =>
      renderToStaticMarkup(<SiteRenderer locale="en" tree={unsafeTree} />),
    ).toThrow();
  });
});
