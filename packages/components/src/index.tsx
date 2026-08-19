import { localized, localizePath, type Locale } from "@company/localization";
import type { PageNode } from "@company/schemas";
import { sanitizeMediaUrl, sanitizeUrl } from "@company/utilities";
import type { CSSProperties, ReactNode } from "react";
import { AnimatedMetricValue } from "./animated-metric-value";
import { IntelligenceNewsItems } from "./intelligence-news-items";
import { IntelligenceParticles } from "./intelligence-particles";

const LEGACY_BUNDLED_HERO_URL = "/starter-media/movera-hero-field.svg";
const BUNDLED_HERO_URL = "/starter-media/movera-hero-field.svg";

function renderedMediaUrl(url: string): string | null {
  const sanitized = sanitizeMediaUrl(url);
  return sanitized === LEGACY_BUNDLED_HERO_URL ? BUNDLED_HERO_URL : sanitized;
}

export const approvedComponentTypes = [
  "intelligenceNewsBar",
  "cinematicHero",
  "visualLayer",
  "floatingInsightCard",
  "inlineMetrics",
  "productSuiteRail",
  "commandCenterShowcase",
  "dashboardPreview",
  "hero",
  "textBlock",
  "cardGrid",
  "stats",
  "newsTicker",
  "callToAction",
  "contentCollection",
  "editorialSplit",
  "featureExplorer",
  "timeline",
  "decorativeOverlay",
  "spacer",
  "divider",
  "section",
  "container",
  "grid",
  "columns",
  "column",
] as const satisfies readonly PageNode["type"][];

export type ApprovedComponentType = (typeof approvedComponentTypes)[number];
export type ApprovedNodeOf<Type extends ApprovedComponentType> = Extract<
  PageNode,
  { type: Type }
>;

export type ApprovedComponentProps<Type extends ApprovedComponentType> = {
  locale: Locale;
  node: ApprovedNodeOf<Type>;
};

export type ContentCollectionItem = {
  featured: boolean;
  id: string;
  publishedAt: string;
  slug: string;
  summary?: string;
  title: string;
  type: Extract<PageNode, { type: "contentCollection" }>["props"]["contentType"];
};

export type ContentCollectionMap = Readonly<
  Record<string, readonly ContentCollectionItem[]>
>;

export function isApprovedComponentType(value: string): value is ApprovedComponentType {
  return (approvedComponentTypes as readonly string[]).includes(value);
}

type StyleLayer = {
  alignItems?: string;
  animation?: string;
  aspectRatio?: string;
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  fontSize?: number;
  fontWeight?: string;
  gap?: number;
  height?: number;
  insetBlockStart?: number;
  insetInlineStart?: number;
  justifyContent?: string;
  letterSpacing?: number;
  lineHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  marginBlock?: number;
  marginInline?: number;
  minHeight?: number;
  minWidth?: number;
  opacity?: number;
  overflow?: string;
  paddingBlock?: number;
  paddingInline?: number;
  radius?: number;
  position?: string;
  rotation?: number;
  scale?: number;
  surfaceOpacity?: number;
  textAlign?: "start" | "center" | "end";
  textColor?: string;
  transformOrigin?: string;
  width?: number;
  zIndex?: number;
};

type ResponsiveStyleBag = StyleLayer & {
  base?: StyleLayer;
  desktop?: StyleLayer;
  largeDesktop?: StyleLayer;
  mobileLandscape?: StyleLayer;
  mobilePortrait?: StyleLayer;
  tablet?: StyleLayer;
};

const STYLE_PROPERTIES = [
  "alignItems",
  "aspectRatio",
  "background",
  "textColor",
  "borderColor",
  "borderWidth",
  "fontSize",
  "fontWeight",
  "gap",
  "height",
  "insetBlockStart",
  "insetInlineStart",
  "justifyContent",
  "letterSpacing",
  "lineHeight",
  "maxWidth",
  "maxHeight",
  "marginBlock",
  "marginInline",
  "minHeight",
  "minWidth",
  "opacity",
  "overflow",
  "paddingBlock",
  "paddingInline",
  "radius",
  "position",
  "rotation",
  "scale",
  "surfaceOpacity",
  "textAlign",
  "transformOrigin",
  "width",
  "zIndex",
] as const satisfies readonly (keyof StyleLayer)[];

const STYLE_LAYERS = [
  "base",
  "mobilePortrait",
  "mobileLandscape",
  "tablet",
  "desktop",
  "largeDesktop",
] as const;

function styleValue(property: (typeof STYLE_PROPERTIES)[number], value: unknown) {
  if (value === undefined) {
    return undefined;
  }
  if (property === "surfaceOpacity") {
    return String(value);
  }
  if (property === "justifyContent") {
    return String(value)
      .replace(/([a-z])([A-Z])/gu, "$1-$2")
      .toLowerCase();
  }
  if (property === "transformOrigin") {
    return String(value)
      .replace(/([a-z])([A-Z])/gu, "$1 $2")
      .toLowerCase();
  }
  if (
    property === "borderWidth" ||
    property === "fontSize" ||
    property === "gap" ||
    property === "height" ||
    property === "insetBlockStart" ||
    property === "insetInlineStart" ||
    property === "letterSpacing" ||
    property === "lineHeight" ||
    property === "maxWidth" ||
    property === "maxHeight" ||
    property === "marginBlock" ||
    property === "marginInline" ||
    property === "minHeight" ||
    property === "minWidth" ||
    property === "paddingBlock" ||
    property === "paddingInline" ||
    property === "radius" ||
    property === "rotation" ||
    property === "scale" ||
    property === "width" ||
    property === "zIndex"
  ) {
    if (property === "letterSpacing") {
      return `${String(value)}em`;
    }
    return property === "lineHeight" ||
      property === "rotation" ||
      property === "scale" ||
      property === "zIndex"
      ? String(value)
      : `${String(value)}px`;
  }
  return String(value);
}

function responsiveNodeStyle(node: PageNode): CSSProperties {
  const styles = node.styles as ResponsiveStyleBag;
  const variables: Record<string, string | undefined> = {};

  for (const layerName of STYLE_LAYERS) {
    const layer = styles[layerName];
    if (!layer) continue;
    for (const property of STYLE_PROPERTIES) {
      variables[`--tw-node-${property}-${layerName}`] = styleValue(
        property,
        layer[property],
      );
    }
  }

  return variables as CSSProperties;
}

type VisualGeometry = Extract<PageNode, { type: "visualLayer" }>["props"]["geometry"];

function responsiveGeometryStyle(geometry: VisualGeometry): CSSProperties {
  const variables: Record<string, string> = {};
  const layers = [
    "base",
    "mobilePortrait",
    "mobileLandscape",
    "tablet",
    "desktop",
    "largeDesktop",
  ] as const;
  for (const layerName of layers) {
    const layer = geometry[layerName];
    if (!layer) continue;
    for (const [property, value] of Object.entries(layer)) {
      if (value === undefined || property === "anchor") continue;
      variables[`--tw-geo-${property}-${layerName}`] =
        property === "x" ||
        property === "y" ||
        property === "width" ||
        property === "height"
          ? `${String(value)}%`
          : String(value);
    }
  }
  return variables as CSSProperties;
}

function visibilityAttributes(node: PageNode) {
  return {
    "data-visible-desktop": node.visibility.desktop !== false,
    "data-visible-large-desktop": node.visibility.largeDesktop !== false,
    "data-visible-mobile-landscape": node.visibility.mobileLandscape !== false,
    "data-visible-mobile-portrait": node.visibility.mobilePortrait !== false,
    "data-visible-tablet": node.visibility.tablet !== false,
  };
}

function Section({
  children,
  node,
  variant,
}: {
  children: ReactNode;
  node: PageNode;
  variant?: string;
}) {
  return (
    <section
      {...visibilityAttributes(node)}
      className="tw-section"
      data-animation={(node.styles as ResponsiveStyleBag).base?.animation}
      data-node={node.type}
      data-variant={variant}
      id={node.id}
      style={responsiveNodeStyle(node)}
    >
      <div className="tw-section__inner">{children}</div>
    </section>
  );
}

type ActionValue = {
  href: string;
  label: {
    ar?: string;
    en?: string;
    fallbackLocale?: Locale;
    mode?: "fallback" | "manual";
  };
  target?: "_blank" | "_self";
};

export function SafeAction({
  action,
  className,
  locale,
}: {
  action?: ActionValue;
  className: string;
  locale: Locale;
}) {
  if (!action) return null;
  const href = sanitizeUrl(action.href, null, { allowExternal: true });
  if (!href) return null;

  const opensNewContext = action.target === "_blank";
  const external = /^https?:\/\//iu.test(href);
  return (
    <a
      className={className}
      href={href}
      rel={external || opensNewContext ? "noopener noreferrer" : undefined}
      target={action.target}
    >
      {localized(action.label, locale)}
    </a>
  );
}

export function HeroComponent({ locale, node }: ApprovedComponentProps<"hero">) {
  const mediaUrl = node.props.backgroundMedia
    ? renderedMediaUrl(node.props.backgroundMedia.url)
    : null;
  const motion = node.props.visualMotion;

  return (
    <Section node={node} variant={node.props.alignment}>
      {mediaUrl && node.props.backgroundMedia ? (
        <img
          alt={localized(node.props.backgroundMedia.alt, locale)}
          className="tw-hero__media"
          decoding="async"
          fetchPriority="high"
          src={mediaUrl}
          style={{
            objectPosition: `${(node.props.backgroundMedia.focalX ?? 0.5) * 100}% ${(node.props.backgroundMedia.focalY ?? 0.5) * 100}%`,
          }}
        />
      ) : null}
      <div
        aria-hidden="true"
        className="tw-hero__overlay"
        style={
          {
            "--tw-hero-min-height": `${node.props.minHeight ?? 640}px`,
            "--tw-hero-overlay": node.props.overlayOpacity ?? 0.55,
            "--tw-motion-accent": motion?.accentColor ?? "#42d9ff",
            "--tw-motion-background-opacity": motion?.backgroundOpacity ?? 0.78,
            "--tw-motion-density": motion?.density ?? 0.45,
            "--tw-motion-intensity": motion?.intensity ?? 0.42,
            "--tw-motion-overlay-strength": motion?.overlayStrength ?? 0.52,
            "--tw-motion-speed": motion?.speed ?? 1,
          } as CSSProperties
        }
        data-motion-direction={motion?.direction ?? "inward"}
        data-motion-enabled={motion?.enabled !== false}
        data-motion-mobile={motion?.mobileVisible !== false}
        data-motion-reduced={motion?.reducedMotion ?? "reduce"}
      >
        <span className="tw-hero__pulse tw-hero__pulse--one" />
        <span className="tw-hero__pulse tw-hero__pulse--two" />
        <span className="tw-hero__pulse tw-hero__pulse--three" />
        <span className="tw-hero__data-lines" />
      </div>
      <div className="tw-hero">
        {node.props.eyebrow ? (
          <p className="tw-eyebrow">{localized(node.props.eyebrow, locale)}</p>
        ) : null}
        <h1>
          {localized(node.props.title, locale)}
          {node.props.highlight ? (
            <span>{localized(node.props.highlight, locale)}</span>
          ) : null}
        </h1>
        {node.props.description ? (
          <p className="tw-lede">{localized(node.props.description, locale)}</p>
        ) : null}
        <div className="tw-actions">
          <SafeAction
            action={node.props.primaryAction}
            className="tw-button tw-button--primary"
            locale={locale}
          />
          <SafeAction
            action={node.props.secondaryAction}
            className="tw-button tw-button--ghost"
            locale={locale}
          />
        </div>
      </div>
    </Section>
  );
}

export function TextBlockComponent({
  locale,
  node,
}: ApprovedComponentProps<"textBlock">) {
  return (
    <Section node={node} variant={node.props.width}>
      <div className="tw-text-block">
        {node.props.eyebrow ? (
          <p className="tw-eyebrow">{localized(node.props.eyebrow, locale)}</p>
        ) : null}
        {node.props.title ? <h2>{localized(node.props.title, locale)}</h2> : null}
        <p>{localized(node.props.body, locale)}</p>
      </div>
    </Section>
  );
}

export function CardGridComponent({
  locale,
  node,
}: ApprovedComponentProps<"cardGrid">) {
  return (
    <Section node={node} variant={node.props.cardStyle}>
      <header className="tw-section-heading">
        {node.props.eyebrow ? (
          <p className="tw-eyebrow">{localized(node.props.eyebrow, locale)}</p>
        ) : null}
        <h2>{localized(node.props.title, locale)}</h2>
        {node.props.description ? (
          <p>{localized(node.props.description, locale)}</p>
        ) : null}
      </header>
      <div
        className="tw-card-grid"
        style={{ "--tw-card-columns": node.props.columns } as CSSProperties}
      >
        {node.props.cards.map((card) => (
          <article className="tw-card" key={card.id}>
            {card.icon ? <span className="tw-card__icon">{card.icon}</span> : null}
            <h3>{localized(card.title, locale)}</h3>
            {card.description ? <p>{localized(card.description, locale)}</p> : null}
            <SafeAction
              action={card.action}
              className="tw-inline-link"
              locale={locale}
            />
          </article>
        ))}
      </div>
    </Section>
  );
}

export function StatsComponent({ locale, node }: ApprovedComponentProps<"stats">) {
  return (
    <Section node={node} variant={node.props.variant}>
      <dl
        className="tw-stats"
        data-animate={node.props.animate}
        data-variant={node.props.variant}
      >
        {node.props.stats.map((stat) => (
          <div data-stat-id={stat.id} key={stat.id}>
            <dt>{stat.value}</dt>
            <dd>{localized(stat.label, locale)}</dd>
            {stat.trend ? <small>{localized(stat.trend, locale)}</small> : null}
            {stat.status ? <em>{localized(stat.status, locale)}</em> : null}
          </div>
        ))}
      </dl>
    </Section>
  );
}

export function NewsTickerComponent({
  locale,
  node,
}: ApprovedComponentProps<"newsTicker">) {
  const repeatedItems = node.props.items.flatMap((item) => [item, item]);
  const title = localized(node.props.title, locale);
  const priorityIndex = node.props.items.findIndex(
    (item) => item.id === node.props.priorityItemId,
  );
  const previousIndex =
    priorityIndex > 0 ? priorityIndex - 1 : node.props.items.length - 1;
  const nextIndex =
    priorityIndex >= 0 && priorityIndex < node.props.items.length - 1
      ? priorityIndex + 1
      : 0;

  return (
    <Section node={node}>
      <aside
        aria-label={title}
        className="tw-news-ticker"
        data-fixed={node.props.fixed}
        data-pause-on-hover={node.props.pauseOnHover}
        data-reduced-motion={node.props.reducedMotion}
        style={
          { "--tw-ticker-speed": `${node.props.speedSeconds ?? 36}s` } as CSSProperties
        }
      >
        <div className="tw-news-ticker__label">
          <strong>{title}</strong>
          {node.props.showControls ? (
            <span className="tw-news-ticker__controls">
              <a
                aria-label={locale === "ar" ? "الخبر السابق" : "Previous item"}
                href={`#${node.props.items[previousIndex]?.id}`}
              >
                ‹
              </a>
              <a
                aria-label={locale === "ar" ? "الخبر التالي" : "Next item"}
                href={`#${node.props.items[nextIndex]?.id}`}
              >
                ›
              </a>
            </span>
          ) : null}
        </div>
        <div className="tw-news-ticker__viewport">
          <div className="tw-news-ticker__track">
            {repeatedItems.map((item, index) => {
              const href = item.href
                ? sanitizeUrl(item.href, null, { allowExternal: true })
                : null;
              const label = localized(item.label, locale);
              return href ? (
                <a
                  className={
                    item.id === node.props.priorityItemId ? "is-priority" : undefined
                  }
                  href={href}
                  id={`${item.id}-${index}`}
                  key={`${item.id}-${index}`}
                >
                  {label}
                </a>
              ) : (
                <span
                  className={
                    item.id === node.props.priorityItemId ? "is-priority" : undefined
                  }
                  id={`${item.id}-${index}`}
                  key={`${item.id}-${index}`}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </aside>
    </Section>
  );
}

export function EditorialSplitComponent({
  locale,
  node,
}: ApprovedComponentProps<"editorialSplit">) {
  const media = node.props.media ? renderedMediaUrl(node.props.media.url) : null;
  return (
    <Section node={node} variant={node.props.mediaSide}>
      <div
        className="tw-editorial-split"
        data-side={node.props.mediaSide}
        data-variant={node.props.variant}
      >
        <div className="tw-editorial-split__copy">
          {node.props.eyebrow ? (
            <p className="tw-eyebrow">{localized(node.props.eyebrow, locale)}</p>
          ) : null}
          <h2>{localized(node.props.title, locale)}</h2>
          <p className="tw-editorial-split__body">
            {localized(node.props.body, locale)}
          </p>
          {node.props.points.length > 0 ? (
            <ul>
              {node.props.points.map((point, index) => (
                <li key={`${node.id}-point-${index}`}>{localized(point, locale)}</li>
              ))}
            </ul>
          ) : null}
          <SafeAction
            action={node.props.action}
            className="tw-inline-link"
            locale={locale}
          />
        </div>
        {media && node.props.media ? (
          <figure className="tw-editorial-split__media">
            <img
              alt={localized(node.props.media.alt, locale)}
              loading="lazy"
              src={media}
              style={{
                objectPosition: `${(node.props.media.focalX ?? 0.5) * 100}% ${(node.props.media.focalY ?? 0.5) * 100}%`,
              }}
            />
            <span aria-hidden="true" />
          </figure>
        ) : null}
      </div>
    </Section>
  );
}

export function FeatureExplorerComponent({
  locale,
  node,
}: ApprovedComponentProps<"featureExplorer">) {
  return (
    <Section node={node} variant={node.props.variant}>
      <header className="tw-section-heading">
        <h2>{localized(node.props.heading, locale)}</h2>
        {node.props.description ? (
          <p>{localized(node.props.description, locale)}</p>
        ) : null}
      </header>
      <div className="tw-feature-explorer" data-variant={node.props.variant}>
        {node.props.items.map((item, index) => (
          <details
            className="tw-feature-explorer__item"
            key={item.id}
            open={index === 0}
          >
            <summary>
              <span className="tw-feature-explorer__index">0{index + 1}</span>
              <span>{localized(item.label, locale)}</span>
              <span aria-hidden="true">+</span>
            </summary>
            <div className="tw-feature-explorer__detail">
              <div>
                {item.icon ? (
                  <span className="tw-feature-explorer__icon">{item.icon}</span>
                ) : null}
                <h3>{localized(item.title, locale)}</h3>
                <p>{localized(item.description, locale)}</p>
                <SafeAction
                  action={item.action}
                  className="tw-inline-link"
                  locale={locale}
                />
              </div>
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function TimelineComponent({
  locale,
  node,
}: ApprovedComponentProps<"timeline">) {
  return (
    <Section node={node}>
      <header className="tw-section-heading">
        <h2>{localized(node.props.heading, locale)}</h2>
        {node.props.description ? (
          <p>{localized(node.props.description, locale)}</p>
        ) : null}
      </header>
      <ol className="tw-timeline">
        {node.props.items.map((item, index) => (
          <li key={item.id}>
            <span className="tw-timeline__marker">0{index + 1}</span>
            <div>
              <p className="tw-timeline__label">{localized(item.label, locale)}</p>
              <h3>{localized(item.title, locale)}</h3>
              <p>{localized(item.description, locale)}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function DecorativeOverlayComponent({
  node,
}: ApprovedComponentProps<"decorativeOverlay">) {
  const motion = node.props.motion;
  return (
    <div
      {...visibilityAttributes(node)}
      aria-hidden="true"
      className={`tw-decorative-overlay tw-decorative-overlay--${node.props.kind} tw-responsive-node`}
      data-motion-enabled={motion?.enabled !== false}
      data-node={node.type}
      style={
        {
          ...responsiveNodeStyle(node),
          "--tw-overlay-accent": node.props.accentColor,
          "--tw-overlay-density": node.props.density,
          "--tw-overlay-intensity": node.props.intensity,
          "--tw-overlay-speed": `${motion?.speed ?? 1}s`,
        } as CSSProperties
      }
    />
  );
}

export function CallToActionComponent({
  locale,
  node,
}: ApprovedComponentProps<"callToAction">) {
  return (
    <Section node={node}>
      <div className="tw-cta">
        <h2>{localized(node.props.title, locale)}</h2>
        {node.props.description ? (
          <p>{localized(node.props.description, locale)}</p>
        ) : null}
        <SafeAction
          action={node.props.action}
          className="tw-button tw-button--primary"
          locale={locale}
        />
      </div>
    </Section>
  );
}

const contentTypeLabels = {
  event: { ar: "فعالية", en: "Event" },
  news: { ar: "خبر", en: "News" },
  project: { ar: "مشروع", en: "Project" },
  service: { ar: "خدمة", en: "Service" },
} as const;

function InlineArrow() {
  return (
    <svg aria-hidden="true" fill="none" height="15" viewBox="0 0 20 20" width="15">
      <path
        d="M3 10h14m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function ContentCollectionComponent({
  items,
  locale,
  node,
}: ApprovedComponentProps<"contentCollection"> & {
  items?: readonly ContentCollectionItem[];
}) {
  if (items?.length === 0) return null;

  return (
    <Section node={node} variant={node.props.layout}>
      <header className="tw-section-heading tw-collection-heading">
        <h2>{localized(node.props.heading, locale)}</h2>
        {node.props.description ? (
          <p>{localized(node.props.description, locale)}</p>
        ) : null}
      </header>
      {items ? (
        <div className="tw-content-collection" data-layout={node.props.layout}>
          {items.map((item) => (
            <article className="tw-content-card" key={item.id}>
              <div className="tw-content-card__meta">
                <span>{contentTypeLabels[item.type][locale]}</span>
                {item.publishedAt ? (
                  <time dateTime={item.publishedAt}>
                    {new Intl.DateTimeFormat(locale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(item.publishedAt))}
                  </time>
                ) : null}
              </div>
              <h3>
                <a
                  href={localizePath(
                    `/content/${item.type}/${encodeURIComponent(item.slug)}`,
                    locale,
                  )}
                >
                  {item.title}
                </a>
              </h3>
              {node.props.showSummary && item.summary ? <p>{item.summary}</p> : null}
              <a
                aria-label={`${locale === "ar" ? "اقرأ" : "Read"} ${item.title}`}
                className="tw-inline-link"
                href={localizePath(
                  `/content/${item.type}/${encodeURIComponent(item.slug)}`,
                  locale,
                )}
              >
                {locale === "ar" ? "اقرأ المزيد" : "Read more"} <InlineArrow />
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="tw-content-collection-placeholder">
          <strong>{contentTypeLabels[node.props.contentType][locale]}</strong>
          <span>
            {locale === "ar"
              ? "سيظهر المحتوى المنشور هنا تلقائياً."
              : "Published content will populate this collection automatically."}
          </span>
        </div>
      )}
    </Section>
  );
}

export function SpacerComponent({ node }: ApprovedComponentProps<"spacer">) {
  return (
    <div
      {...visibilityAttributes(node)}
      aria-hidden="true"
      className="tw-spacer tw-responsive-node"
      id={node.id}
      style={{ ...responsiveNodeStyle(node), height: node.props.height }}
    />
  );
}

export function DividerComponent({ locale, node }: ApprovedComponentProps<"divider">) {
  return (
    <Section node={node}>
      <div className="tw-divider">
        {node.props.label ? localized(node.props.label, locale) : null}
      </div>
    </Section>
  );
}

function LayoutContent({
  contentCollections,
  locale,
  node,
}: {
  contentCollections?: ContentCollectionMap;
  locale: Locale;
  node: Extract<
    PageNode,
    { type: "section" | "container" | "grid" | "columns" | "column" }
  >;
}) {
  return (
    <>
      {node.children.map((child) => (
        <ApprovedPageNode
          contentCollections={contentCollections}
          key={child.id}
          locale={locale}
          node={child}
        />
      ))}
    </>
  );
}

function layoutAttributes(node: PageNode, className: string) {
  return {
    ...visibilityAttributes(node),
    className: `tw-section tw-layout ${className}`,
    "data-animation": (node.styles as ResponsiveStyleBag).base?.animation,
    "data-node": node.type,
    id: node.id,
    style: responsiveNodeStyle(node),
  };
}

export function SectionComponent({
  contentCollections,
  locale,
  node,
}: ApprovedComponentProps<"section"> & {
  contentCollections?: ContentCollectionMap;
}) {
  const content = (
    <div className="tw-section__inner tw-layout__inner">
      <LayoutContent
        contentCollections={contentCollections}
        locale={locale}
        node={node}
      />
    </div>
  );
  const attributes = layoutAttributes(node, "tw-layout--section");
  return node.props.semantic === "aside" ? (
    <aside {...attributes}>{content}</aside>
  ) : (
    <section {...attributes}>{content}</section>
  );
}

export function ContainerComponent({
  contentCollections,
  locale,
  node,
}: ApprovedComponentProps<"container"> & {
  contentCollections?: ContentCollectionMap;
}) {
  return (
    <div
      {...layoutAttributes(node, "tw-layout--container")}
      data-width={node.props.width}
    >
      <div className="tw-section__inner tw-layout__inner">
        <LayoutContent
          contentCollections={contentCollections}
          locale={locale}
          node={node}
        />
      </div>
    </div>
  );
}

export function GridComponent({
  contentCollections,
  locale,
  node,
}: ApprovedComponentProps<"grid"> & {
  contentCollections?: ContentCollectionMap;
}) {
  return (
    <div
      {...layoutAttributes(node, "tw-layout--grid")}
      style={
        {
          ...responsiveNodeStyle(node),
          "--tw-layout-columns": node.props.columns,
        } as CSSProperties
      }
    >
      <div className="tw-section__inner tw-layout__inner">
        <LayoutContent
          contentCollections={contentCollections}
          locale={locale}
          node={node}
        />
      </div>
    </div>
  );
}

export function ColumnsComponent({
  contentCollections,
  locale,
  node,
}: ApprovedComponentProps<"columns"> & {
  contentCollections?: ContentCollectionMap;
}) {
  return (
    <div
      {...layoutAttributes(node, "tw-layout--columns")}
      style={
        {
          ...responsiveNodeStyle(node),
          "--tw-layout-columns": node.props.columns,
        } as CSSProperties
      }
    >
      <div className="tw-section__inner tw-layout__inner">
        <LayoutContent
          contentCollections={contentCollections}
          locale={locale}
          node={node}
        />
      </div>
    </div>
  );
}

export function ColumnComponent({
  contentCollections,
  locale,
  node,
}: ApprovedComponentProps<"column"> & {
  contentCollections?: ContentCollectionMap;
}) {
  return (
    <div
      {...layoutAttributes(node, "tw-layout--column")}
      style={
        {
          ...responsiveNodeStyle(node),
          "--tw-column-span": node.props.span,
        } as CSSProperties
      }
    >
      <div className="tw-section__inner tw-layout__inner">
        <LayoutContent
          contentCollections={contentCollections}
          locale={locale}
          node={node}
        />
      </div>
    </div>
  );
}

function ArrowGlyph() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path
        d="M5 12h14m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function IntelligenceIcon({ value }: { value: string }) {
  const stroke = "currentColor";
  const common = {
    "aria-hidden": true,
    fill: "none",
    height: 32,
    viewBox: "0 0 24 24",
    width: 32,
  } as const;
  if (value === "◉") {
    return (
      <svg {...common}>
        <path d="M4 9.5 12 5l8 4.5v5L12 19l-8-4.5Z" stroke={stroke} />
        <circle cx="12" cy="12" r="2.6" stroke={stroke} />
        <path d="M12 5v4.4M8 18.2v-3.8M16 18.2v-3.8" stroke={stroke} />
      </svg>
    );
  }
  if (value === "▰") {
    return (
      <svg {...common}>
        <path d="m4 14 2-4h10l4 4v4H4Z" stroke={stroke} />
        <path d="m7 10 1.5-3h7l2 3M7 18v2M17 18v2" stroke={stroke} />
        <circle cx="8" cy="16" r="1" stroke={stroke} />
        <circle cx="17" cy="16" r="1" stroke={stroke} />
      </svg>
    );
  }
  if (value === "▥") {
    return (
      <svg {...common}>
        <path d="M5 20V7l7-3 7 3v13" stroke={stroke} />
        <path d="M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2" stroke={stroke} />
      </svg>
    );
  }
  if (value === "▦") {
    return (
      <svg {...common}>
        <path d="M4 20V11l4-2v11M10 20V6l4-2v16M16 20v-7l4-2v11" stroke={stroke} />
        <path d="M6 14h1M12 10h1M18 16h1" stroke={stroke} />
      </svg>
    );
  }
  if (value === "♙") {
    return (
      <svg {...common}>
        <circle cx="12" cy="7" r="2.5" stroke={stroke} />
        <path d="M7 20c.3-4.2 2.1-6.3 5-6.3s4.7 2.1 5 6.3M9 17h6" stroke={stroke} />
      </svg>
    );
  }
  if (value === "▤") {
    return (
      <svg {...common}>
        <ellipse cx="12" cy="6" rx="6" ry="2.5" stroke={stroke} />
        <path
          d="M6 6v6c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6M6 12v6c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-6"
          stroke={stroke}
        />
      </svg>
    );
  }
  if (value === "↗") {
    return (
      <svg {...common}>
        <path d="M4 18 9 13l3 3 7-9" stroke={stroke} />
        <path d="M14 7h5v5" stroke={stroke} />
      </svg>
    );
  }
  if (value === "⌘") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="2.5" stroke={stroke} />
        <circle cx="16" cy="8" r="2.5" stroke={stroke} />
        <circle cx="8" cy="16" r="2.5" stroke={stroke} />
        <circle cx="16" cy="16" r="2.5" stroke={stroke} />
        <path d="M10 8h4M10 16h4M8 10v4M16 10v4" stroke={stroke} />
      </svg>
    );
  }
  if (value === "⬡") {
    return (
      <svg {...common}>
        <path d="m12 3 7 4v10l-7 4-7-4V7Z" stroke={stroke} />
        <path d="m12 7 3 2v4l-3 2-3-2V9Z" stroke={stroke} />
      </svg>
    );
  }
  return <span>{value}</span>;
}

function metricIconKind(id: string, fallback?: string) {
  const normalized = id.toLowerCase();
  if (normalized.includes("model")) return "models";
  if (normalized.includes("asset")) return "assets";
  if (normalized.includes("project")) return "projects";
  if (normalized.includes("uptime") || normalized.includes("availability")) {
    return "uptime";
  }
  if (fallback === "⬡") return "models";
  if (fallback === "◫") return "assets";
  if (fallback === "△") return "projects";
  if (fallback === "◉") return "uptime";
  return "general";
}

function MetricIcon({ id, value }: { id: string; value?: string }) {
  const kind = metricIconKind(id, value);
  const common = {
    "aria-hidden": true,
    fill: "none",
    viewBox: "0 0 24 24",
  } as const;

  if (kind === "models") {
    return (
      <svg {...common} data-icon="models">
        <circle cx="12" cy="12" r="3.2" />
        <circle cx="5" cy="6" r="1.8" />
        <circle cx="19" cy="6" r="1.8" />
        <circle cx="5" cy="18" r="1.8" />
        <circle cx="19" cy="18" r="1.8" />
        <path d="m7 7.5 2.7 2.3m4.6 0L17 7.5M7 16.5l2.7-2.3m4.6 0 2.7 2.3" />
      </svg>
    );
  }
  if (kind === "assets") {
    return (
      <svg {...common} data-icon="assets">
        <rect height="16" rx="2.2" width="16" x="4" y="4" />
        <path d="M4 9h16M4 15h16" />
        <path d="M7.5 6.5h.01M7.5 12h.01M7.5 17.5h.01" strokeWidth="2.2" />
        <path d="M11 6.5h6M11 12h6M11 17.5h6" />
      </svg>
    );
  }
  if (kind === "projects") {
    return (
      <svg {...common} data-icon="projects">
        <path d="M3.5 7.5h6l2-2h9v13h-17Z" />
        <path d="m8 13 2.4 2.3 5.6-5.6" />
      </svg>
    );
  }
  if (kind === "uptime") {
    return (
      <svg {...common} data-icon="uptime">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M7 12h2.6l1.5-3.4 2.2 6.8 1.4-3.4H17" />
      </svg>
    );
  }
  return (
    <svg {...common} data-icon="general">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}

function VisualPresetArtwork({ node }: { node: ApprovedNodeOf<"visualLayer"> }) {
  const motion = node.props.motion;
  if (node.props.kind === "particles") {
    return (
      <IntelligenceParticles
        color={motion?.accentColor ?? "#249df2"}
        density={motion?.density ?? 0.45}
        direction={motion?.direction ?? "inward"}
        intensity={motion?.intensity ?? 0.42}
        reducedMotion={
          motion?.enabled === false ? "static" : (motion?.reducedMotion ?? "reduce")
        }
        speed={motion?.speed ?? 1}
      />
    );
  }
  if (node.props.preset === "cube") {
    return (
      <svg
        aria-hidden="true"
        className="tw-visual-svg tw-visual-svg--cube"
        viewBox="0 0 240 280"
      >
        <defs>
          <linearGradient id={`${node.id}-cube-front`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#0b8cff" stopOpacity=".42" />
            <stop offset="1" stopColor="#0054e8" stopOpacity=".16" />
          </linearGradient>
          <filter
            id={`${node.id}-cube-glow`}
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter={`url(#${node.id}-cube-glow)`}>
          <path
            d="M120 26 210 75 120 125 30 75Z"
            fill="#129eff"
            fillOpacity=".2"
            stroke="#50c5ff"
            strokeWidth="2"
          />
          <path
            d="M30 75 120 125v112L30 186Z"
            fill={`url(#${node.id}-cube-front)`}
            stroke="#1b9eff"
            strokeWidth="2"
          />
          <path
            d="m210 75-90 50v112l90-51Z"
            fill="#0053e8"
            fillOpacity=".2"
            stroke="#54c9ff"
            strokeWidth="2"
          />
          <path
            d="M120 125v112M30 75l90 50 90-50"
            fill="none"
            stroke="#8be0ff"
            strokeOpacity=".72"
          />
          <text
            x="118"
            y="188"
            fill="#f7fcff"
            fontSize="58"
            fontWeight="700"
            textAnchor="middle"
          >
            AI
          </text>
        </g>
      </svg>
    );
  }
  if (node.props.preset === "neuralNetwork") {
    return (
      <svg
        aria-hidden="true"
        className="tw-visual-svg tw-visual-svg--neural"
        viewBox="0 0 520 300"
      >
        <g fill="none" stroke="#39b4ff" strokeOpacity=".58" strokeWidth="1">
          <path d="M80 154C55 75 138 25 230 48c44-45 142-10 144 45 68 9 94 89 43 129-42 34-104 20-151 38-51 19-91-5-111-35-52 15-98-18-75-71Z" />
          <path d="M110 142 164 88l62 46 53-72 74 62 52-24M102 177l74-24 52 62 58-73 79 61M164 88l12 65 50-19 60 8 67-18M228 215l58-73 79 61" />
        </g>
        {[
          [110, 142],
          [164, 88],
          [176, 153],
          [226, 134],
          [228, 215],
          [279, 62],
          [286, 142],
          [353, 124],
          [365, 203],
          [405, 100],
          [102, 177],
        ].map(([cx, cy], index) => (
          <circle
            className="tw-neural-node"
            cx={cx}
            cy={cy}
            fill="#6ad2ff"
            key={index}
            r={index % 3 === 0 ? 4 : 2.5}
          />
        ))}
      </svg>
    );
  }
  if (node.props.preset === "dataPaths") {
    return (
      <svg
        aria-hidden="true"
        className="tw-visual-svg tw-visual-svg--paths"
        preserveAspectRatio="none"
        viewBox="0 0 1200 520"
      >
        <g fill="none" stroke="#168dff" strokeOpacity=".5" strokeWidth="1">
          <path
            className="tw-data-path"
            d="M0 410C210 300 298 470 500 314S838 200 1200 88"
          />
          <path
            className="tw-data-path tw-data-path--delay"
            d="M90 0c170 184 253 148 380 270s350 25 730 218"
          />
          <path
            className="tw-data-path tw-data-path--slow"
            d="M0 206c260 18 320-95 540 38s400 114 660 42"
          />
        </g>
      </svg>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`tw-visual-preset tw-visual-preset--${node.props.preset}`}
    />
  );
}

export function VisualLayerComponent({
  locale,
  node,
}: ApprovedComponentProps<"visualLayer">) {
  const authoredMediaUrl = node.props.media
    ? sanitizeMediaUrl(node.props.media.url)
    : null;
  const usesLegacyBundledHero = authoredMediaUrl === LEGACY_BUNDLED_HERO_URL;
  const mediaUrl = usesLegacyBundledHero ? BUNDLED_HERO_URL : authoredMediaUrl;
  const isBundledCity =
    node.props.preset === "city" &&
    (mediaUrl === BUNDLED_HERO_URL || mediaUrl === LEGACY_BUNDLED_HERO_URL);
  const motion = node.props.motion;
  return (
    <div
      {...visibilityAttributes(node)}
      aria-hidden={node.props.decorative || undefined}
      className="tw-visual-layer tw-responsive-node"
      data-blend={node.props.blendMode}
      data-kind={node.props.kind}
      data-locked={node.props.locked}
      data-motion-direction={motion?.direction ?? "inward"}
      data-motion-enabled={motion?.enabled !== false}
      data-motion-mobile={motion?.mobileVisible !== false}
      data-motion-reduced={motion?.reducedMotion ?? "reduce"}
      data-preset={node.props.preset}
      id={node.id}
      style={
        {
          ...responsiveNodeStyle(node),
          ...responsiveGeometryStyle(node.props.geometry),
          "--tw-layer-accent": motion?.accentColor ?? "#42d9ff",
          "--tw-layer-background-opacity": motion?.backgroundOpacity ?? 0.78,
          "--tw-layer-delay": `${motion?.delay ?? 0}s`,
          "--tw-layer-density": motion?.density ?? 0.45,
          "--tw-layer-fit": node.props.fit,
          "--tw-layer-focal-x": `${node.props.focalX * 100}%`,
          "--tw-layer-focal-y": `${node.props.focalY * 100}%`,
          "--tw-layer-intensity": motion?.intensity ?? 0.42,
          "--tw-layer-overlay-strength": motion?.overlayStrength ?? 0.52,
          "--tw-layer-speed": motion?.speed ?? 1,
        } as CSSProperties
      }
    >
      {mediaUrl && node.props.media && node.props.kind === "video" ? (
        <video
          aria-label={
            node.props.decorative ? undefined : localized(node.props.media.alt, locale)
          }
          autoPlay={motion?.enabled !== false}
          className="tw-visual-layer__media"
          loop
          muted
          playsInline
          src={mediaUrl}
        />
      ) : mediaUrl && node.props.media ? (
        isBundledCity ? (
          <>
            <div aria-hidden="true" className="tw-visual-layer__city-base">
              <img
                alt=""
                className="tw-visual-layer__media"
                decoding="async"
                src={mediaUrl}
              />
            </div>
            <div aria-hidden="true" className="tw-visual-layer__city-focus">
              <img
                alt=""
                className="tw-visual-layer__media"
                decoding="async"
                src={mediaUrl}
              />
            </div>
          </>
        ) : (
          <img
            alt={node.props.decorative ? "" : localized(node.props.media.alt, locale)}
            className="tw-visual-layer__media"
            decoding="async"
            src={mediaUrl}
          />
        )
      ) : (
        <VisualPresetArtwork node={node} />
      )}
    </div>
  );
}

export function FloatingInsightCardComponent({
  locale,
  node,
}: ApprovedComponentProps<"floatingInsightCard">) {
  const mediaUrl = node.props.media ? renderedMediaUrl(node.props.media.url) : null;
  return (
    <article
      {...visibilityAttributes(node)}
      className="tw-floating-card tw-responsive-node"
      data-entry={node.props.entryAnimation}
      data-hover={node.props.hover}
      data-mobile-mode={node.props.mobileMode}
      id={node.id}
      style={
        {
          ...responsiveNodeStyle(node),
          ...responsiveGeometryStyle(node.props.geometry),
          "--tw-card-border-opacity": node.props.borderOpacity,
          "--tw-card-glass": node.props.glassIntensity,
          "--tw-card-glow": node.props.glowIntensity,
        } as CSSProperties
      }
    >
      {mediaUrl && node.props.media ? (
        <img alt={localized(node.props.media.alt, locale)} src={mediaUrl} />
      ) : (
        <span aria-hidden="true" className="tw-floating-card__icon">
          <IntelligenceIcon value={node.props.icon ?? "◉"} />
        </span>
      )}
      <div>
        <h3>{localized(node.props.title, locale)}</h3>
        <p>{localized(node.props.description, locale)}</p>
        {node.props.value ? <strong>{node.props.value}</strong> : null}
        {node.props.status ? (
          <small>{localized(node.props.status, locale)}</small>
        ) : null}
        <SafeAction
          action={node.props.action}
          className="tw-floating-card__link"
          locale={locale}
        />
      </div>
    </article>
  );
}

export function InlineMetricsComponent({
  locale,
  node,
}: ApprovedComponentProps<"inlineMetrics">) {
  const hasGeometry = Boolean(node.props.geometry);
  const content = (
    <dl
      className={`tw-inline-metrics${hasGeometry ? "" : " tw-responsive-node"}`}
      data-animate={node.props.animate}
      data-variant={node.props.variant}
      style={hasGeometry ? undefined : responsiveNodeStyle(node)}
    >
      {node.props.metrics.map((metric) => (
        <div key={metric.id}>
          <span aria-hidden="true" className="tw-inline-metrics__icon">
            <MetricIcon id={metric.id} value={metric.icon} />
          </span>
          <dt>
            <AnimatedMetricValue enabled={node.props.animate} value={metric.value} />
          </dt>
          <dd>{localized(metric.label, locale)}</dd>
          {metric.trend ? <small>{localized(metric.trend, locale)}</small> : null}
          {metric.status ? <em>{localized(metric.status, locale)}</em> : null}
        </div>
      ))}
    </dl>
  );
  if (!node.props.geometry) return content;
  return (
    <div
      {...visibilityAttributes(node)}
      className="tw-inline-metrics-layer tw-responsive-node"
      id={node.id}
      style={{
        ...responsiveNodeStyle(node),
        ...responsiveGeometryStyle(node.props.geometry),
      }}
    >
      {content}
    </div>
  );
}

export function CinematicHeroComponent({
  locale,
  node,
}: ApprovedComponentProps<"cinematicHero">) {
  const visualLayers = node.children.filter((child) => child.type === "visualLayer");
  const metrics = node.children.filter((child) => child.type === "inlineMetrics");
  const backgroundUrl = node.props.backgroundMedia
    ? renderedMediaUrl(node.props.backgroundMedia.url)
    : null;
  const motion = node.props.visualMotion;
  return (
    <section
      {...visibilityAttributes(node)}
      className="tw-section tw-cinematic-hero"
      data-alignment={node.props.alignment}
      data-motion-direction={motion.direction}
      data-motion-enabled={motion.enabled}
      data-motion-mobile={motion.mobileVisible}
      data-motion-reduced={motion.reducedMotion}
      data-node={node.type}
      id={node.id}
      style={
        {
          ...responsiveNodeStyle(node),
          "--tw-cinematic-gradient": node.props.gradientMask,
          "--tw-cinematic-min-height": `${node.props.minHeight}px`,
          "--tw-cinematic-motion-accent": motion.accentColor,
          "--tw-cinematic-motion-background": motion.backgroundOpacity,
          "--tw-cinematic-motion-delay": `${motion.delay}s`,
          "--tw-cinematic-motion-density": motion.density,
          "--tw-cinematic-motion-intensity": motion.intensity,
          "--tw-cinematic-motion-overlay": motion.overlayStrength,
          "--tw-cinematic-motion-speed": motion.speed,
          "--tw-cinematic-radial": node.props.radialGlow,
          "--tw-cinematic-text-width": `${node.props.textWidth}px`,
          "--tw-cinematic-vignette": node.props.vignette,
        } as CSSProperties
      }
    >
      <div aria-hidden="true" className="tw-cinematic-hero__environment" />
      {backgroundUrl && node.props.backgroundMedia ? (
        <img
          alt=""
          aria-hidden="true"
          className="tw-cinematic-hero__background"
          decoding="async"
          src={backgroundUrl}
        />
      ) : null}
      {visualLayers.map((child) => (
        <VisualLayerComponent key={child.id} locale={locale} node={child} />
      ))}
      <div aria-hidden="true" className="tw-cinematic-hero__mask" />
      <div className="tw-cinematic-hero__copy">
        <h1>{localized(node.props.title, locale)}</h1>
        <strong>{localized(node.props.highlight, locale)}</strong>
        <p>{localized(node.props.description, locale)}</p>
        <div className="tw-cinematic-hero__actions">
          <SafeAction
            action={node.props.primaryAction}
            className="tw-cinematic-button tw-cinematic-button--primary"
            locale={locale}
          />
          <SafeAction
            action={node.props.secondaryAction}
            className="tw-cinematic-button tw-cinematic-button--ghost"
            locale={locale}
          />
        </div>
      </div>
      {metrics.map((child) => (
        <InlineMetricsComponent key={child.id} locale={locale} node={child} />
      ))}
    </section>
  );
}

export function IntelligenceNewsBarComponent({
  locale,
  node,
}: ApprovedComponentProps<"intelligenceNewsBar">) {
  const items = node.props.items.map((item) => ({
    expiresAt: item.expiresAt,
    headline: localized(item.headline, locale),
    href: item.href,
    id: item.id,
    priority: item.priority,
    startsAt: item.startsAt,
    summary: item.summary ? localized(item.summary, locale) : undefined,
  }));
  return (
    <section
      {...visibilityAttributes(node)}
      aria-label={localized(node.props.title, locale)}
      className="tw-section tw-intelligence-news"
      data-direction={node.props.direction}
      data-pause-on-hover={node.props.pauseOnHover}
      data-placement={node.props.placement}
      data-reduced-motion={node.props.reducedMotion}
      data-tone={node.props.tone}
      dir={node.props.direction === "auto" ? undefined : node.props.direction}
      id={node.id}
      style={
        {
          ...responsiveNodeStyle(node),
          "--tw-news-speed": `${node.props.speedSeconds}s`,
        } as CSSProperties
      }
    >
      <div className="tw-intelligence-news__inner">
        <strong className="tw-intelligence-news__badge">
          <span aria-hidden="true">▣</span> {localized(node.props.title, locale)}
        </strong>
        <IntelligenceNewsItems
          items={items}
          locale={locale}
          manualControls={node.props.manualControls}
          reducedMotion={node.props.reducedMotion}
          speedSeconds={node.props.speedSeconds}
        />
      </div>
    </section>
  );
}

export function ProductSuiteRailComponent({
  locale,
  node,
}: ApprovedComponentProps<"productSuiteRail">) {
  const previous = node.props.products.at(-1);
  const next = node.props.products[1] ?? node.props.products[0];
  return (
    <section
      {...visibilityAttributes(node)}
      className="tw-section tw-product-suite"
      data-node={node.type}
      id={node.id}
      style={responsiveNodeStyle(node)}
    >
      <div className="tw-product-suite__inner">
        <header className="tw-product-suite__intro">
          <h2>{localized(node.props.heading, locale)}</h2>
          <p>{localized(node.props.description, locale)}</p>
          <SafeAction
            action={node.props.action}
            className="tw-product-suite__all"
            locale={locale}
          />
        </header>
        <div className="tw-product-suite__viewport">
          <div
            aria-label={localized(node.props.heading, locale)}
            className="tw-product-suite__track"
            data-snap={node.props.snap}
            role="list"
            tabIndex={0}
          >
            {node.props.products.map((product) => (
              <article
                className="tw-product-suite__item"
                data-active={product.id === node.props.activeItemId}
                id={product.id}
                key={product.id}
                role="listitem"
              >
                <span aria-hidden="true" className="tw-product-suite__icon">
                  <IntelligenceIcon value={product.icon ?? "◉"} />
                </span>
                <div>
                  <h3>{localized(product.title, locale)}</h3>
                  <p>{localized(product.summary, locale)}</p>
                  <SafeAction
                    action={product.action}
                    className="tw-product-suite__link"
                    locale={locale}
                  />
                </div>
              </article>
            ))}
          </div>
          {node.props.showArrows ? (
            <nav
              aria-label={
                locale === "ar" ? "التنقل بين المنتجات" : "Product rail controls"
              }
              className="tw-product-suite__controls"
            >
              <a
                aria-label={locale === "ar" ? "المنتج السابق" : "Previous product"}
                href={previous ? `#${previous.id}` : "#"}
              >
                ‹
              </a>
              <a
                aria-label={locale === "ar" ? "المنتج التالي" : "Next product"}
                href={next ? `#${next.id}` : "#"}
              >
                ›
              </a>
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function DashboardLineChart() {
  return (
    <svg
      aria-hidden="true"
      className="tw-dashboard-chart"
      preserveAspectRatio="none"
      viewBox="0 0 360 112"
    >
      <path d="M0 88h360M0 56h360M0 24h360" stroke="#17466f" strokeOpacity=".35" />
      <path
        d="M0 76c24-28 42 10 68-17s48 19 79-10 43 13 74-18 40 23 69-7 42 9 70-19"
        fill="none"
        stroke="#219cff"
        strokeWidth="2"
      />
      <path
        d="M0 76c24-28 42 10 68-17s48 19 79-10 43 13 74-18 40 23 69-7 42 9 70-19v107H0Z"
        fill="url(#tw-chart-fill)"
        opacity=".32"
      />
      <defs>
        <linearGradient id="tw-chart-fill" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#168cff" />
          <stop offset="1" stopColor="#168cff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function DashboardMap() {
  return (
    <svg
      aria-hidden="true"
      className="tw-dashboard-map"
      preserveAspectRatio="none"
      viewBox="0 0 360 112"
    >
      <g fill="none" stroke="#155382" strokeOpacity=".55">
        <path d="M-20 88 92-12M34 126 178-12M142 126 286-12M260 126 382 4M0 32l360 58M0 76l270 38M98 0l262 52" />
        <path d="M24 0v112M110 0v112M212 0v112M318 0v112" strokeOpacity=".25" />
      </g>
      {[
        [92, 72],
        [178, 32],
        [268, 58],
      ].map(([cx, cy], index) => (
        <g key={index}>
          <circle cx={cx} cy={cy} fill="#008cff" opacity=".24" r="16" />
          <circle cx={cx} cy={cy} fill="#70d7ff" r="4" />
        </g>
      ))}
    </svg>
  );
}

export function DashboardPreviewComponent({
  locale,
  node,
}: ApprovedComponentProps<"dashboardPreview">) {
  const requestedActiveNavigationId = node.props.activeNavigationId;
  const activeNavigationId = node.props.navigation.some(
    (item) => item.id === requestedActiveNavigationId,
  )
    ? requestedActiveNavigationId
    : node.props.navigation[0]?.id;

  return (
    <div
      {...visibilityAttributes(node)}
      aria-label={localized(node.props.title, locale)}
      className="tw-dashboard-preview tw-responsive-node"
      data-mode={node.props.responsiveMode}
      data-theme={node.props.theme}
      id={node.id}
      role="region"
      style={responsiveNodeStyle(node)}
    >
      <aside className="tw-dashboard-preview__sidebar">
        <strong>{localized(node.props.title, locale)}</strong>
        <nav aria-label={locale === "ar" ? "أقسام المعاينة" : "Preview sections"}>
          {node.props.navigation.map((item) => (
            <span
              aria-current={item.id === activeNavigationId ? "page" : undefined}
              data-active={item.id === activeNavigationId}
              key={item.id}
            >
              <i aria-hidden="true">◎</i>
              {localized(item.label, locale)}
            </span>
          ))}
        </nav>
      </aside>
      <div className="tw-dashboard-preview__main">
        <div className="tw-dashboard-preview__metrics">
          {node.props.metrics.map((metric) => (
            <article key={metric.id}>
              <small>{localized(metric.label, locale)}</small>
              <strong>{metric.value}</strong>
              {metric.trend ? (
                <em data-tone={metric.trendTone}>{metric.trend}</em>
              ) : null}
            </article>
          ))}
        </div>
        <div className="tw-dashboard-preview__panels">
          <article className="tw-dashboard-panel tw-dashboard-panel--chart">
            <h4>{localized(node.props.chartLabel, locale)}</h4>
            <DashboardLineChart />
          </article>
          <article className="tw-dashboard-panel tw-dashboard-panel--map">
            <h4>{localized(node.props.mapLabel, locale)}</h4>
            <DashboardMap />
          </article>
          <aside className="tw-dashboard-panel tw-dashboard-panel--insights">
            <h4>{localized(node.props.insightsLabel, locale)}</h4>
            {node.props.insights.map((insight) => (
              <article key={insight.id}>
                <span aria-hidden="true">◎</span>
                <strong>{localized(insight.label, locale)}</strong>
                {insight.time ? <time>{insight.time}</time> : null}
                {insight.meta ? <small>{localized(insight.meta, locale)}</small> : null}
                <em data-status={insight.status}>{insight.status}</em>
              </article>
            ))}
            <a href="#alerts">
              {locale === "ar" ? "عرض جميع التنبيهات" : "View all alerts"}{" "}
              <ArrowGlyph />
            </a>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function CommandCenterShowcaseComponent({
  locale,
  node,
}: ApprovedComponentProps<"commandCenterShowcase">) {
  const dashboard = node.children.find((child) => child.type === "dashboardPreview");
  return (
    <section
      {...visibilityAttributes(node)}
      className="tw-section tw-command-center"
      data-node={node.type}
      id={node.id}
      style={responsiveNodeStyle(node)}
    >
      <div className="tw-command-center__inner">
        <div className="tw-command-center__copy">
          <h2>{localized(node.props.title, locale)}</h2>
          <strong>{localized(node.props.subtitle, locale)}</strong>
          <p>{localized(node.props.description, locale)}</p>
          <div className="tw-command-center__actions">
            <SafeAction
              action={node.props.primaryAction}
              className="tw-cinematic-button tw-cinematic-button--primary"
              locale={locale}
            />
            <SafeAction
              action={node.props.secondaryAction}
              className="tw-command-center__secondary"
              locale={locale}
            />
          </div>
        </div>
        {dashboard ? (
          <DashboardPreviewComponent locale={locale} node={dashboard} />
        ) : null}
      </div>
    </section>
  );
}

export const approvedComponentRegistry = Object.freeze({
  cinematicHero: CinematicHeroComponent,
  callToAction: CallToActionComponent,
  cardGrid: CardGridComponent,
  commandCenterShowcase: CommandCenterShowcaseComponent,
  contentCollection: ContentCollectionComponent,
  dashboardPreview: DashboardPreviewComponent,
  decorativeOverlay: DecorativeOverlayComponent,
  divider: DividerComponent,
  editorialSplit: EditorialSplitComponent,
  featureExplorer: FeatureExplorerComponent,
  floatingInsightCard: FloatingInsightCardComponent,
  hero: HeroComponent,
  inlineMetrics: InlineMetricsComponent,
  intelligenceNewsBar: IntelligenceNewsBarComponent,
  newsTicker: NewsTickerComponent,
  productSuiteRail: ProductSuiteRailComponent,
  spacer: SpacerComponent,
  stats: StatsComponent,
  textBlock: TextBlockComponent,
  timeline: TimelineComponent,
  visualLayer: VisualLayerComponent,
  section: SectionComponent,
  container: ContainerComponent,
  grid: GridComponent,
  columns: ColumnsComponent,
  column: ColumnComponent,
});

export function ApprovedPageNode({
  contentCollections,
  locale,
  node,
}: {
  contentCollections?: ContentCollectionMap;
  locale: Locale;
  node: PageNode;
}) {
  switch (node.type) {
    case "intelligenceNewsBar":
      return <IntelligenceNewsBarComponent locale={locale} node={node} />;
    case "cinematicHero":
      return <CinematicHeroComponent locale={locale} node={node} />;
    case "visualLayer":
      return <VisualLayerComponent locale={locale} node={node} />;
    case "floatingInsightCard":
      return <FloatingInsightCardComponent locale={locale} node={node} />;
    case "inlineMetrics":
      return <InlineMetricsComponent locale={locale} node={node} />;
    case "productSuiteRail":
      return <ProductSuiteRailComponent locale={locale} node={node} />;
    case "commandCenterShowcase":
      return <CommandCenterShowcaseComponent locale={locale} node={node} />;
    case "dashboardPreview":
      return <DashboardPreviewComponent locale={locale} node={node} />;
    case "hero":
      return <HeroComponent locale={locale} node={node} />;
    case "textBlock":
      return <TextBlockComponent locale={locale} node={node} />;
    case "cardGrid":
      return <CardGridComponent locale={locale} node={node} />;
    case "stats":
      return <StatsComponent locale={locale} node={node} />;
    case "newsTicker":
      return <NewsTickerComponent locale={locale} node={node} />;
    case "callToAction":
      return <CallToActionComponent locale={locale} node={node} />;
    case "contentCollection":
      return (
        <ContentCollectionComponent
          items={contentCollections?.[node.id]}
          locale={locale}
          node={node}
        />
      );
    case "editorialSplit":
      return <EditorialSplitComponent locale={locale} node={node} />;
    case "featureExplorer":
      return <FeatureExplorerComponent locale={locale} node={node} />;
    case "timeline":
      return <TimelineComponent locale={locale} node={node} />;
    case "decorativeOverlay":
      return <DecorativeOverlayComponent locale={locale} node={node} />;
    case "spacer":
      return <SpacerComponent locale={locale} node={node} />;
    case "divider":
      return <DividerComponent locale={locale} node={node} />;
    case "section":
      return (
        <SectionComponent
          contentCollections={contentCollections}
          locale={locale}
          node={node}
        />
      );
    case "container":
      return (
        <ContainerComponent
          contentCollections={contentCollections}
          locale={locale}
          node={node}
        />
      );
    case "grid":
      return (
        <GridComponent
          contentCollections={contentCollections}
          locale={locale}
          node={node}
        />
      );
    case "columns":
      return (
        <ColumnsComponent
          contentCollections={contentCollections}
          locale={locale}
          node={node}
        />
      );
    case "column":
      return (
        <ColumnComponent
          contentCollections={contentCollections}
          locale={locale}
          node={node}
        />
      );
  }
}
