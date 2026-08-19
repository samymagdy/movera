"use client";

import { useEffect, useMemo, useState } from "react";
import { IntelligenceNewsPauseControl } from "./intelligence-news-controls";

export type DisplayNewsItem = {
  expiresAt?: string;
  headline: string;
  href?: string;
  id: string;
  priority: number;
  startsAt?: string;
  summary?: string;
};

export function newsRotationIntervalMs(speedSeconds: number) {
  return Math.min(12_000, Math.max(4_000, (speedSeconds * 1_000) / 6));
}

export function IntelligenceNewsItems({
  items,
  locale,
  manualControls,
  reducedMotion,
  speedSeconds,
}: {
  items: DisplayNewsItem[];
  locale: "ar" | "en";
  manualControls: boolean;
  reducedMotion: "reduce" | "static";
  speedSeconds: number;
}) {
  const sortedItems = useMemo(
    () => [...items].sort((left, right) => right.priority - left.priority),
    [items],
  );
  const [visibleItems, setVisibleItems] = useState(sortedItems);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      setVisibleItems(
        sortedItems.filter((item) => {
          const starts = item.startsAt
            ? Date.parse(item.startsAt)
            : Number.NEGATIVE_INFINITY;
          const expires = item.expiresAt
            ? Date.parse(item.expiresAt)
            : Number.POSITIVE_INFINITY;
          return starts <= now && now < expires;
        }),
      );
    };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, [sortedItems]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const staticForReducedMotion = prefersReducedMotion && reducedMotion === "static";
  useEffect(() => {
    if (visibleItems.length < 2 || paused || staticForReducedMotion) {
      return;
    }
    // The persisted speed describes a full ticker pass. Convert it to a
    // readable story cadence while keeping the author-controlled timing.
    const interval = newsRotationIntervalMs(speedSeconds);
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % visibleItems.length);
    }, interval);
    return () => window.clearInterval(timer);
  }, [paused, speedSeconds, staticForReducedMotion, visibleItems.length]);

  const goToRelativeItem = (offset: number) => {
    if (visibleItems.length < 2) return;
    setActiveIndex(
      (index) => (index + offset + visibleItems.length) % visibleItems.length,
    );
  };
  const displayActiveIndex =
    visibleItems.length > 0 ? activeIndex % visibleItems.length : 0;
  return (
    <span
      className="tw-intelligence-news__items"
      data-active-index={displayActiveIndex}
    >
      <span className="tw-intelligence-news__viewport">
        <span
          aria-live="polite"
          className="tw-intelligence-news__marquee"
          data-paused={paused}
        >
          {[...visibleItems, ...visibleItems].map((item, index) => (
            <span
              className="tw-intelligence-news__marquee-item"
              key={`${item.id}-${index}`}
            >
              <a
                className="tw-intelligence-news__headline"
                href={item.href ?? "#"}
                id={index < visibleItems.length ? item.id : undefined}
              >
                {item.headline}
              </a>
              {item.summary ? (
                <span className="tw-intelligence-news__summary">{item.summary}</span>
              ) : null}
              <span aria-hidden="true" className="tw-intelligence-news__status" />
            </span>
          ))}
        </span>
      </span>
      {manualControls ? (
        <span className="tw-intelligence-news__controls">
          <button
            aria-label={locale === "ar" ? "العنصر السابق" : "Previous item"}
            className="tw-intelligence-news__step"
            onClick={() => goToRelativeItem(-1)}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label={locale === "ar" ? "العنصر التالي" : "Next item"}
            className="tw-intelligence-news__step"
            onClick={() => goToRelativeItem(1)}
            type="button"
          >
            ›
          </button>
          <IntelligenceNewsPauseControl
            onPausedChange={setPaused}
            pauseLabel={locale === "ar" ? "إيقاف الحركة" : "Pause feed"}
            paused={paused}
            resumeLabel={locale === "ar" ? "استئناف الحركة" : "Resume feed"}
          />
        </span>
      ) : null}
    </span>
  );
}
