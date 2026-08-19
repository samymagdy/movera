"use client";

import { useState } from "react";
import type { Locale } from "@company/contracts";
import {
  homeFirstViewportCopy,
  localPath,
  sectorOrder,
  sectorRoutes,
  type SectorKey,
} from "./homeFirstViewportContent";

const sectorClass: Record<SectorKey, string> = {
  deliveryAdvisory: "engineering",
  digitalProducts: "ai-digital",
  operationalIntelligence: "smart-city",
};

function DirectionalArrow() {
  return <svg className="company-directional-arrow" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h13M13 7l5 5-5 5" />
  </svg>;
}

export function InteractiveSectorTriangle({ locale }: { locale: Locale }) {
  const copy = homeFirstViewportCopy[locale];
  const [selected, setSelected] = useState<SectorKey>("deliveryAdvisory");
  const [hovered, setHovered] = useState<SectorKey | null>(null);

  return <div
    className="company-sector-stage"
    data-hovered={hovered || undefined}
    data-selected={selected}
    aria-label={copy.hero.eyebrow}
  >
    {sectorOrder.map(key => {
      const sector = copy.sectors[key];
      const cssKey = sectorClass[key];
      return <a
        className={`company-sector-card company-sector-card--${cssKey}`}
        data-sector={key}
        href={localPath(locale, sectorRoutes[key])}
        key={key}
        onMouseEnter={() => setHovered(key)}
        onMouseLeave={() => setHovered(null)}
        onFocus={() => setHovered(key)}
        onBlur={() => setHovered(null)}
        aria-label={sector.title}
      >
        <span className="company-sector-card-copy">
          <h2>{sector.desktopTitleLines.map((line, index) => <span key={line}>{line}{index < sector.desktopTitleLines.length - 1 ? " " : ""}</span>)}</h2>
          <p>{sector.description}</p>
          <span className="company-sector-arrow" aria-hidden="true"><DirectionalArrow /></span>
        </span>
      </a>;
    })}

    <div className="company-sector-triangle" aria-hidden="true">
      <span className="company-sector-triangle-frame" />
    </div>

    <div className="company-sector-tabs" role="tablist" aria-label={copy.hero.eyebrow}>
      {sectorOrder.map(key => <button
        type="button"
        role="tab"
        aria-selected={selected === key}
        className={selected === key ? "is-selected" : ""}
        key={key}
        onClick={() => setSelected(key)}
      >{copy.sectors[key].title}</button>)}
    </div>
  </div>;
}
