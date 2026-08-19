import type { Locale, SiteData } from "@company/contracts";
import { homeFirstViewportCopy, localPath, metricOrder } from "./homeFirstViewportContent";

type HomepageHero = SiteData["homepage"]["hero"];

function DirectionalArrow() {
  return <svg className="movera-arrow" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>;
}

export function HomepageFirstSection({ locale, hero }: { locale: Locale; hero: HomepageHero }) {
  const copy = homeFirstViewportCopy[locale];
  const title = hero.title[locale] || copy.hero.title;
  const description = hero.description[locale] || copy.hero.body;
  const eyebrow = hero.eyebrow[locale] || copy.hero.eyebrow;

  return <section
    className="company-home-first-viewport movera-hero"
    data-testid="home-first-viewport"
    dir={copy.direction}
    aria-labelledby="movera-first-heading"
  >
    <div className="movera-hero-layout">
      <div className="movera-hero-copy">
        <p className="movera-hero-eyebrow"><span className="movera-eyebrow-dot" />{eyebrow}</p>
        <h1 id="movera-first-heading">{title}</h1>
        <p className="movera-hero-description">{description}</p>
        <div className="movera-hero-actions">
          <a className="movera-primary-action" href={localPath(locale, hero.primaryHref)}>{hero.primaryLabel[locale]} <DirectionalArrow /></a>
          <a className="movera-secondary-action" href={localPath(locale, hero.secondaryHref)}>{hero.secondaryLabel[locale]}</a>
        </div>
        <div className="movera-hero-proof" aria-label={copy.impact.title}>
          {metricOrder.map(metric => <span key={metric}><b>{copy.impact.metrics[metric].value}</b><small>{copy.impact.metrics[metric].label}</small></span>)}
        </div>
      </div>

      <figure className="movera-hero-photo" aria-label={copy.hero.imageAlt}>
        <img src="/starter-media/movera-autonomy-hero.webp" alt="" aria-hidden="true" />
        <span className="movera-photo-vignette" aria-hidden="true" />
      </figure>
    </div>
    <div className="movera-hero-footer">
      <span className="movera-scroll-mark"><i />{copy.hero.scrollLabel}</span>
      <span className="movera-hero-coordinate" dir="ltr">50°51′N / 4°21′E</span>
    </div>
  </section>;
}
