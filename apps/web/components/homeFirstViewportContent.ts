import type { Locale } from "@company/contracts";
import ar from "../content/home-first-viewport/locales/ar.json";
import en from "../content/home-first-viewport/locales/en.json";
import fr from "../content/home-first-viewport/locales/fr.json";
import nl from "../content/home-first-viewport/locales/nl.json";
import microcharts from "../content/home-first-viewport/microchart-data.json";

export type SectorKey = "deliveryAdvisory" | "digitalProducts" | "operationalIntelligence";
export type CountryKey = "hub-a" | "hub-b" | "hub-c";
export type MetricKey = "projectsDelivered" | "customerPartners" | "productsPlatforms" | "officeLocations" | "integratedSectors";

type SectorCopy = {
  title: string;
  desktopTitleLines: string[];
  description: string;
};

type CountryCopy = {
  name: string;
  summary?: string;
  description?: string;
  offices: string[];
};

export type HomeFirstViewportCopy = {
  locale: Locale;
  direction: "ltr" | "rtl";
  hero: {
    eyebrow: string;
    title: string;
    desktopTitleLines: string[];
    body: string;
    cta: string;
    imageAlt: string;
    scrollLabel: string;
  };
  sectors: Record<SectorKey, SectorCopy>;
  presence: { countries: Record<CountryKey, CountryCopy> };
  impact: {
    eyebrow: string;
    title: string;
    metrics: Record<MetricKey, { value: string; label: string }>;
  };
};

export const homeFirstViewportCopy = { en, ar, fr, nl } as unknown as Record<Locale, HomeFirstViewportCopy>;

export const sectorOrder: SectorKey[] = ["deliveryAdvisory", "digitalProducts", "operationalIntelligence"];

export const sectorRoutes: Record<SectorKey, string> = {
  deliveryAdvisory: "/services/autonomy-systems",
  digitalProducts: "/services/fleet-intelligence",
  operationalIntelligence: "/services/mobility-operations",
};

export const countryOrder: CountryKey[] = ["hub-a", "hub-b", "hub-c"];

export const countryFlags: Record<CountryKey, string> = {
  "hub-a": "/starter-media/hub-a.svg",
  "hub-b": "/starter-media/hub-b.svg",
  "hub-c": "/starter-media/hub-c.svg",
};

export const countryDestinations: Record<CountryKey, string[]> = {
  "hub-a": ["Brussels, Belgium"],
  "hub-b": ["Flanders, Belgium"],
  "hub-c": ["Wallonia, Belgium"],
};

export const metricOrder: MetricKey[] = ["projectsDelivered", "customerPartners", "productsPlatforms", "officeLocations"];

export const metricIcons: Record<MetricKey, string> = {
  projectsDelivered: "/starter-media/metric.svg",
  customerPartners: "/starter-media/metric.svg",
  productsPlatforms: "/starter-media/metric.svg",
  officeLocations: "/starter-media/metric.svg",
  integratedSectors: "/starter-media/metric.svg",
};

export const microchartData = microcharts as Record<MetricKey, number[]>;

export function localPath(locale: Locale, path: string) {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export function locationUrl(destination: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}
