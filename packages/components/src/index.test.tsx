import { pageTreeSchema } from "@company/schemas";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ApprovedPageNode, SafeAction, approvedComponentRegistry } from "./index.js";
import { newsRotationIntervalMs } from "./intelligence-news-items.js";

describe("approved React components", () => {
  it("renders localized content as encoded text without executing markup", () => {
    const tree = pageTreeSchema.parse({
      nodes: [
        {
          id: "home-hero",
          props: {
            alignment: "left",
            minHeight: 640,
            overlayOpacity: 0.5,
            title: { ar: "<b>شركتك</b>", en: "<b>Your Company</b>" },
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

    const html = renderToStaticMarkup(
      <ApprovedPageNode locale="en" node={tree.nodes[0]!} />,
    );
    expect(html).toContain("&lt;b&gt;Your Company&lt;/b&gt;");
    expect(html).not.toContain("<b>");
  });

  it("drops unsafe action protocols defensively", () => {
    const html = renderToStaticMarkup(
      <SafeAction
        action={{ href: "javascript:alert(1)", label: { en: "Unsafe" } }}
        className="button"
        locale="en"
      />,
    );
    expect(html).toBe("");
  });

  it("clips the animated news track inside its dedicated viewport", () => {
    const tree = pageTreeSchema.parse({
      nodes: [
        {
          id: "ticker",
          props: {
            fixed: false,
            items: [{ id: "item", label: { en: "Published update" } }],
            speedSeconds: 30,
            title: { en: "News" },
          },
          styles: {},
          type: "newsTicker",
          version: 1,
          visibility: {},
        },
      ],
      pageId: "home",
      schemaVersion: 1,
    });

    const html = renderToStaticMarkup(
      <ApprovedPageNode locale="en" node={tree.nodes[0]!} />,
    );
    expect(html).toContain('class="tw-news-ticker__viewport"');
    expect(html).toContain('class="tw-news-ticker__track"');
  });

  it("keeps the intelligence news cadence readable across configured speeds", () => {
    expect(newsRotationIntervalMs(42)).toBe(7_000);
    expect(newsRotationIntervalMs(8)).toBe(4_000);
    expect(newsRotationIntervalMs(180)).toBe(12_000);
  });

  it("uses a full-width intelligence-news viewport and semantic metric icons", () => {
    const tree = pageTreeSchema.parse({
      locale: "en",
      nodes: [
        {
          children: [],
          id: "intelligence-news",
          props: {
            items: [
              {
                headline: { en: "Inspection intelligence is now live" },
                id: "inspection",
              },
            ],
            title: { en: "News" },
          },
          styles: {},
          type: "intelligenceNewsBar",
          version: 1,
          visibility: {},
        },
        {
          children: [],
          id: "hero-metrics",
          props: {
            metrics: [
              { icon: "⬡", id: "models", label: { en: "AI Models" }, value: "50+" },
              {
                icon: "◫",
                id: "assets",
                label: { en: "Assets Monitored" },
                value: "1M+",
              },
              {
                icon: "△",
                id: "projects",
                label: { en: "Active Projects" },
                value: "200+",
              },
              {
                icon: "◉",
                id: "uptime",
                label: { en: "System Uptime" },
                value: "99.8%",
              },
            ],
          },
          styles: {},
          type: "inlineMetrics",
          version: 1,
          visibility: {},
        },
      ],
      pageId: "home",
      schemaVersion: 2,
    });

    const html = tree.nodes
      .map((node) =>
        renderToStaticMarkup(<ApprovedPageNode locale="en" node={node} />),
      )
      .join("");
    expect(html).toContain('class="tw-intelligence-news__viewport"');
    expect(html.match(/tw-intelligence-news__marquee-item/gu)).toHaveLength(2);
    expect(html).toContain('data-icon="models"');
    expect(html).toContain('data-icon="assets"');
    expect(html).toContain('data-icon="projects"');
    expect(html).toContain('data-icon="uptime"');
  });

  it("registers every currently approved production component", () => {
    expect(Object.keys(approvedComponentRegistry).sort()).toEqual([
      "callToAction",
      "cardGrid",
      "cinematicHero",
      "column",
      "columns",
      "commandCenterShowcase",
      "container",
      "contentCollection",
      "dashboardPreview",
      "decorativeOverlay",
      "divider",
      "editorialSplit",
      "featureExplorer",
      "floatingInsightCard",
      "grid",
      "hero",
      "inlineMetrics",
      "intelligenceNewsBar",
      "newsTicker",
      "productSuiteRail",
      "section",
      "spacer",
      "stats",
      "textBlock",
      "timeline",
      "visualLayer",
    ]);
  });

  it("renders resolved published collection items with locale-safe routes", () => {
    const tree = pageTreeSchema.parse({
      locale: "ar",
      nodes: [
        {
          children: [],
          id: "latest-projects",
          props: {
            contentType: "project",
            featuredOnly: false,
            heading: { ar: "أحدث المشاريع", en: "Latest projects" },
            layout: "cards",
            limit: 3,
            showSummary: true,
          },
          styles: {},
          type: "contentCollection",
          version: 1,
          visibility: {},
        },
      ],
      pageId: "projects",
      schemaVersion: 2,
    });

    const html = renderToStaticMarkup(
      <ApprovedPageNode
        contentCollections={{
          "latest-projects": [
            {
              featured: true,
              id: "4f53f8e5-1844-44fb-8e84-efce68caf835",
              publishedAt: "2026-07-13T12:00:00.000Z",
              slug: "smart-mobility",
              summary: "منظومة تنقل متصلة.",
              title: "التنقل الذكي",
              type: "project",
            },
          ],
        }}
        locale="ar"
        node={tree.nodes[0]!}
      />,
    );

    expect(html).toContain("أحدث المشاريع");
    expect(html).toContain('href="/ar/content/project/smart-mobility"');
    expect(html).toContain("منظومة تنقل متصلة");
  });

  it("renders nested layout nodes recursively with trusted responsive variables", () => {
    const tree = pageTreeSchema.parse({
      locale: "en",
      nodes: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [],
                          id: "nested-text",
                          props: { body: { en: "Nested content" }, width: "narrow" },
                          styles: { base: { paddingBlock: 20 } },
                          type: "textBlock",
                          version: 1,
                          visibility: {},
                        },
                      ],
                      id: "column-left",
                      props: { span: 6 },
                      styles: { base: {} },
                      type: "column",
                      version: 1,
                      visibility: {},
                    },
                    {
                      children: [],
                      id: "column-right",
                      props: { span: 6 },
                      styles: { base: {} },
                      type: "column",
                      version: 1,
                      visibility: {},
                    },
                  ],
                  id: "columns-main",
                  props: { columns: 2 },
                  styles: { base: { gap: 24 }, tablet: { gap: 16 } },
                  type: "columns",
                  version: 1,
                  visibility: { mobilePortrait: false },
                },
              ],
              id: "container-main",
              props: { width: "wide" },
              styles: { base: { maxWidth: 1440 } },
              type: "container",
              version: 1,
              visibility: {},
            },
          ],
          id: "section-main",
          props: { semantic: "aside" },
          styles: { base: { paddingBlock: 64 } },
          type: "section",
          version: 1,
          visibility: {},
        },
      ],
      pageId: "layout-page",
      schemaVersion: 2,
    });

    const html = renderToStaticMarkup(
      <ApprovedPageNode locale="en" node={tree.nodes[0]!} />,
    );
    expect(html).toContain('class="tw-section tw-layout tw-layout--section"');
    expect(html).toContain('data-node="columns"');
    expect(html).toContain('data-visible-mobile-portrait="false"');
    expect(html).toContain("--tw-node-gap-base:24px");
    expect(html).toContain("--tw-node-gap-tablet:16px");
    expect(html).toContain("Nested content");
    expect(html.match(/id="nested-text"/gu)).toHaveLength(1);
  });

  it("renders an accessible dashboard region with exactly one active navigation item", () => {
    const tree = pageTreeSchema.parse({
      locale: "en",
      nodes: [
        {
          children: [
            {
              children: [],
              id: "operations-dashboard",
              props: {
                activeNavigationId: "missing-navigation-item",
                chartLabel: { en: "Events" },
                insights: [{ id: "alert", label: { en: "New alert" } }],
                insightsLabel: { en: "Insights" },
                mapLabel: { en: "Map" },
                metrics: [
                  { id: "assets", label: { en: "Assets" }, value: "24" },
                  { id: "alerts", label: { en: "Alerts" }, value: "3" },
                ],
                navigation: [
                  { id: "overview", label: { en: "Overview" } },
                  { id: "assets-nav", label: { en: "Assets" } },
                  { id: "alerts-nav", label: { en: "Alerts" } },
                ],
                responsiveMode: "summary",
                theme: "cyan",
                title: { en: "Operations dashboard" },
              },
              styles: {
                base: { radius: 20 },
                mobilePortrait: { opacity: 0.8 },
              },
              type: "dashboardPreview",
              version: 1,
              visibility: {},
            },
          ],
          id: "operations-command-center",
          props: {
            description: { en: "Live operations" },
            primaryAction: { href: "/operations", label: { en: "Explore" } },
            subtitle: { en: "Command Center" },
            title: { en: "Intelligence" },
          },
          styles: {},
          type: "commandCenterShowcase",
          version: 1,
          visibility: {},
        },
      ],
      pageId: "operations",
      schemaVersion: 2,
    });

    const html = renderToStaticMarkup(
      <ApprovedPageNode locale="en" node={tree.nodes[0]!} />,
    );
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Operations dashboard"');
    expect(html).toContain('data-mode="summary"');
    expect(html).toContain('data-theme="cyan"');
    expect(html.match(/data-active="true"/gu)).toHaveLength(1);
    expect(html).toContain('aria-current="page" data-active="true">');
    expect(html).toContain("--tw-node-radius-base:20px");
    expect(html).toContain("--tw-node-opacity-mobilePortrait:0.8");
  });
});
