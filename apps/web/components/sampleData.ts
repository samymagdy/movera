import { starterSiteData, type ContentItem, type SiteData } from "@company/contracts";

/** Browser fallback used when the API is temporarily unavailable. */
export const sampleData: SiteData = starterSiteData;

export function byIds(items: ContentItem[], ids: string[]) {
  return ids.map(id => items.find(item => item.id === id)).filter(Boolean) as ContentItem[];
}
