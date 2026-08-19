import type { MetadataRoute } from "next";
import { locales } from "@company/contracts";

const routes = ["", "/about", "/services", "/products", "/projects", "/innovation-hub", "/news", "/blogs", "/careers", "/search", "/contact", "/privacy-policy", "/terms-and-conditions", "/cookie-policy", "/regions/hub-a", "/regions/hub-b", "/regions/hub-c"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return locales.flatMap(locale => routes.map(route => ({ url: `${base}/${locale}${route}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: route === "" ? 1 : .7 })));
}
