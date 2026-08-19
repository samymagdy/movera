import { ApprovedPageNode, type ContentCollectionMap } from "@company/components";
import {
  directionForLocale,
  localizePath,
  resolveLocalized,
} from "@company/localization";
import {
  validatePageTree,
  type Locale,
  type LocalizedText,
  type MediaReference,
  type PageTree,
  type SiteTheme,
} from "@company/schemas";
import type { CSSProperties, ReactNode } from "react";
import { SiteHeaderSearch } from "./site-header-search";

export type PageRendererProps = {
  contentCollections?: ContentCollectionMap;
  locale: Locale;
  tree: PageTree;
};

/**
 * Renders only schema-approved React components. GrapesJS HTML, CSS, and
 * component scripts are deliberately not accepted by this production path.
 */
export function PageRenderer({ contentCollections, locale, tree }: PageRendererProps) {
  const safeTree = validatePageTree(tree);

  return (
    <main
      className="company-page"
      data-page-id={safeTree.pageId}
      data-schema-version={safeTree.schemaVersion}
      dir={directionForLocale(locale)}
      lang={locale}
    >
      {safeTree.nodes.map((node) => (
        <ApprovedPageNode
          contentCollections={contentCollections}
          key={node.id}
          locale={locale}
          node={node}
        />
      ))}
    </main>
  );
}

export type SiteNavigationItem = {
  children?: SiteNavigationItem[];
  href: string;
  id: string;
  icon?: string;
  label: LocalizedText;
  openInNewTab?: boolean;
};

export type SiteChrome = {
  brand: LocalizedText;
  enquiry: {
    href: string;
    label: LocalizedText;
  };
  footerLine: LocalizedText;
  header?: {
    background: string;
    borderOpacity: number;
    compactOnScroll: boolean;
    dropdownStyle: "compact" | "mega";
    height: number;
    hoverStyle?: "underline" | "glow" | "fill";
    logoSize: number;
    mobileMode: "drawer" | "overlay";
    navigationAnimation?: "none" | "fade" | "slide";
    navigationGap: number;
    showLanguage: boolean;
    showSearch: boolean;
    sticky: boolean;
    tone: "transparent" | "solid";
    transparentToSolid: boolean;
  };
  logo?: MediaReference;
  navigation: SiteNavigationItem[];
  theme?: SiteTheme;
};

export const defaultSiteChrome: SiteChrome = {
  brand: { ar: "موفيرا", en: "MOVERA" },
  enquiry: { href: "/contact", label: { ar: "استفسار", en: "Enquiry" } },
  footerLine: {
    ar: "ذكاء مؤسسي، مصمم للتشغيل.",
    en: "Enterprise intelligence, built to operate.",
  },
  header: {
    background: "#000717",
    borderOpacity: 0.24,
    compactOnScroll: true,
    dropdownStyle: "compact",
    height: 75,
    hoverStyle: "glow",
    logoSize: 48,
    mobileMode: "drawer",
    navigationAnimation: "fade",
    navigationGap: 34,
    showLanguage: true,
    showSearch: true,
    sticky: true,
    tone: "transparent",
    transparentToSolid: true,
  },
  navigation: [
    { href: "/about", id: "about", label: { ar: "عن موفيرا", en: "About" } },
    { href: "/services", id: "services", label: { ar: "الخدمات", en: "Services" } },
    { href: "/products", id: "products", label: { ar: "المنتجات", en: "Products" } },
    { href: "/projects", id: "projects", label: { ar: "المشاريع", en: "Projects" } },
    {
      href: "/innovation-hub",
      id: "innovation-hub",
      label: { ar: "مركز الابتكار", en: "Innovation Hub" },
    },
    { href: "/careers", id: "careers", label: { ar: "الوظائف", en: "Careers" } },
    { href: "/contact", id: "contact", label: { ar: "اتصل بنا", en: "Contact" } },
  ],
  theme: {
    accent: "#35a8ec",
    background: "#000717",
    backgroundElevated: "#03132a",
    glassIntensity: 0.72,
    glow: "#087cff",
    glowIntensity: 0.62,
    muted: "#b9c0d0",
    purpleAccent: "#7b61ff",
    radius: 12,
    shadow: "deep",
    spacingScale: 1,
    text: "#fcfcfc",
    typography: "editorial",
  },
};

function SiteLogo({ logoUrl }: { logoUrl?: string }) {
  return (
    <span className="brand-split-logo" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- canonical local logo mark asset. */}
      <img className="brand-split-logo__mark" alt="" src={logoUrl || "/branding/movera-mark.svg"} />
      {/* eslint-disable-next-line @next/next/no-img-element -- canonical local wordmark asset. */}
      <img className="brand-split-logo__wordmark" alt="" src="/branding/movera-wordmark.svg" />
    </span>
  );
}

function identityLabels(identityName: string, locale: Locale) {
  return locale === "ar"
    ? {
        copyright: `© ${new Date().getFullYear()} ${identityName}. جميع الحقوق محفوظة.`,
        home: `الصفحة الرئيسية لـ ${identityName}`,
      }
    : {
        copyright: `© ${new Date().getFullYear()} ${identityName}. All rights reserved.`,
        home: `${identityName} home`,
      };
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 12h17M12 3c2.2 2.4 3.4 5.4 3.4 9S14.2 18.6 12 21M12 3C9.8 5.4 8.6 8.4 8.6 12s1.2 6.6 3.4 9"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17">
      <path
        d="M5 12h14m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SiteNavigation({ chrome, locale }: { chrome: SiteChrome; locale: Locale }) {
  return (
    <nav aria-label="Primary navigation" className="site-nav">
      {chrome.navigation.map((item) => {
        const children = item.children ?? [];
        const itemLink = (
          <a
            href={localizePath(item.href, locale)}
            rel={item.openInNewTab ? "noopener noreferrer" : undefined}
            target={item.openInNewTab ? "_blank" : undefined}
          >
            {item.icon ? (
              <span aria-hidden="true" className="site-nav__icon">
                {item.icon}
              </span>
            ) : null}
            {resolveLocalized(item.label, locale)}
            {children.length > 0 || item.id === "services" ? (
              <svg
                aria-hidden="true"
                fill="none"
                height="11"
                viewBox="0 0 16 16"
                width="11"
              >
                <path
                  d="m4 6 4 4 4-4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            ) : null}
          </a>
        );
        return children.length > 0 ? (
          <div
            className="site-nav__group"
            data-dropdown={chrome.header?.dropdownStyle}
            key={item.id}
          >
            {itemLink}
            <div className="site-nav__dropdown">
              {children.map((child) => (
                <a
                  href={localizePath(child.href, locale)}
                  key={child.id}
                  rel={child.openInNewTab ? "noopener noreferrer" : undefined}
                  target={child.openInNewTab ? "_blank" : undefined}
                >
                  {child.icon ? (
                    <span aria-hidden="true" className="site-nav__icon">
                      {child.icon}
                    </span>
                  ) : null}
                  {resolveLocalized(child.label, locale)}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <span className="site-nav__group" key={item.id}>
            {itemLink}
          </span>
        );
      })}
    </nav>
  );
}

export type SiteRendererProps = PageRendererProps & {
  chrome?: SiteChrome;
  currentSlug?: string;
};

export type SiteShellProps = {
  children: ReactNode;
  chrome?: SiteChrome;
  currentSlug?: string;
  locale: Locale;
};

/** Shared public chrome for trusted pages and structured-content routes. */
export function SiteShell({
  children,
  chrome = defaultSiteChrome,
  currentSlug = "home",
  locale,
}: SiteShellProps) {
  const nextLocale = locale === "en" ? "ar" : "en";
  const currentPath = currentSlug === "home" ? "/" : `/${currentSlug}`;
  const header = chrome.header ?? {
    background: "#000717",
    borderOpacity: 0.24,
    compactOnScroll: true,
    dropdownStyle: "compact" as const,
    height: 75,
    hoverStyle: "glow" as const,
    logoSize: 48,
    mobileMode: "drawer" as const,
    navigationAnimation: "fade" as const,
    navigationGap: 34,
    showLanguage: true,
    showSearch: true,
    sticky: true,
    tone: "transparent" as const,
    transparentToSolid: true,
  };
  const logoUrl = "/branding/movera-mark.svg";
  const theme = chrome.theme ?? defaultSiteChrome.theme!;
  const identityName = locale === "ar" ? "موفيرا" : "MOVERA";
  const labels = identityLabels(identityName, locale);

  return (
    <div
      className="public-shell"
      data-shadow={theme.shadow}
      data-typography={theme.typography}
      dir={directionForLocale(locale)}
      lang={locale}
      style={
        {
          "--tw-color-accent": theme.accent,
          "--tw-color-background": theme.background,
          "--tw-color-background-elevated": theme.backgroundElevated,
          "--tw-color-glow": theme.glow,
          "--tw-color-purple": theme.purpleAccent,
          "--tw-color-text": theme.text,
          "--tw-color-text-muted": theme.muted,
          "--tw-theme-glass": theme.glassIntensity,
          "--tw-theme-glow-intensity": theme.glowIntensity,
          "--tw-theme-radius": `${theme.radius}px`,
          "--tw-theme-spacing": theme.spacingScale,
        } as CSSProperties
      }
    >
      <header
        className="site-header"
        data-compact-on-scroll={header.compactOnScroll}
        data-hover-style={header.hoverStyle ?? "glow"}
        data-mobile-mode={header.mobileMode}
        data-navigation-animation={header.navigationAnimation ?? "fade"}
        data-sticky={header.sticky}
        data-tone={header.tone}
        data-transparent-to-solid={header.transparentToSolid}
        style={
          {
            "--tw-header-background": header.background,
            "--tw-header-border-opacity": header.borderOpacity,
            "--tw-header-height": `${header.height}px`,
            "--tw-header-logo-size": `${header.logoSize}px`,
            "--tw-header-nav-gap": `${header.navigationGap}px`,
          } as CSSProperties
        }
      >
        <a aria-label={labels.home} className="site-brand" href={`/${locale}`}>
          <SiteLogo logoUrl={logoUrl} />
        </a>
        <SiteNavigation chrome={chrome} locale={locale} />
        <div className="site-actions">
          {header.showSearch ? <SiteHeaderSearch locale={locale} /> : null}
          {header.showLanguage ? (
            <>
              <span aria-hidden="true" className="header-rule" />
              <a className="locale-switch" href={localizePath(currentPath, nextLocale)}>
                <GlobeIcon />
                {locale === "ar" ? "العربية" : "English"}
              </a>
            </>
          ) : null}
          <a
            className="enquiry-button"
            href={localizePath(chrome.enquiry.href, locale)}
          >
            {resolveLocalized(chrome.enquiry.label, locale)} <ArrowIcon />
          </a>
          <details className="mobile-navigation">
            <summary aria-label="Open navigation menu">
              <MenuIcon />
            </summary>
            <SiteNavigation chrome={chrome} locale={locale} />
          </details>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="site-brand">
          <SiteLogo logoUrl={logoUrl} />
        </div>
        <p>{resolveLocalized(chrome.footerLine, locale)}</p>
        <small>{labels.copyright}</small>
      </footer>
    </div>
  );
}

/** Shared public chrome plus the exact trusted page renderer used by preview. */
export function SiteRenderer({
  chrome = defaultSiteChrome,
  contentCollections,
  currentSlug = "home",
  locale,
  tree,
}: SiteRendererProps) {
  return (
    <SiteShell chrome={chrome} currentSlug={currentSlug} locale={locale}>
      <PageRenderer
        contentCollections={contentCollections}
        locale={locale}
        tree={tree}
      />
    </SiteShell>
  );
}
