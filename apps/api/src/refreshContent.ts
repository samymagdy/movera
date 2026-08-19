import { starterSiteData, type HomepageBand } from "@company/contracts";
import { closePublicSiteCache } from "./cache";
import { readSite, writeSite } from "./store";

async function refreshContent() {
  const current = await readSite();
  const next = structuredClone(starterSiteData);

  // Preserve the approved visual identity and the current homepage hero image.
  next.brand = {
    ...next.brand,
    logo: current.brand.logo || next.brand.logo,
    logoLight: current.brand.logoLight || next.brand.logoLight,
    logoDark: current.brand.logoDark || next.brand.logoDark,
    mark: current.brand.mark || next.brand.mark,
    markLight: current.brand.markLight || next.brand.markLight,
    markDark: current.brand.markDark || next.brand.markDark,
    wordmark: current.brand.wordmark || next.brand.wordmark,
    wordmarkLight: current.brand.wordmarkLight || next.brand.wordmarkLight,
    wordmarkDark: current.brand.wordmarkDark || next.brand.wordmarkDark,
    wordmarkText: current.brand.wordmarkText || next.brand.wordmarkText,
    aiEnabled: current.brand.aiEnabled,
  };
  next.appearance = { ...current.appearance, defaultTheme: "light" };
  next.assistant = { ...next.assistant, icon: current.assistant?.icon || next.assistant.icon };
  next.homepage.hero.background = current.homepage?.hero?.background || next.homepage.hero.background;

  // Keep the approved homepage band order and visibility while replacing their
  // copy and item references with the new four-locale content set.
  const defaultBands = new Map(next.homepage.bands.map(band => [band.id, band]));
  const orderedBands: HomepageBand[] = [];
  for (const currentBand of current.homepage?.bands || []) {
    const replacement = defaultBands.get(currentBand.id);
    if (!replacement) continue;
    orderedBands.push({ ...replacement, visible: currentBand.visible });
    defaultBands.delete(currentBand.id);
  }
  next.homepage.bands = [...orderedBands, ...defaultBands.values()];

  // Keep real contact channels, without carrying old regional wording into the
  // Belgium-focused content model.
  next.footer.phone = current.footer?.phone || next.footer.phone;
  next.footer.email = current.footer?.email || next.footer.email;
  next.footer.socialLinks = { ...next.footer.socialLinks, ...(current.footer?.socialLinks || {}) };
  next.deletedContentIds = {};
  next.trash = [];

  await writeSite(next);
  console.log(JSON.stringify({
    refreshed: true,
    collections: {
      services: next.services.length,
      products: next.products.length,
      projects: next.projects.length,
      news: next.news.length,
      blogs: next.blogs.length,
      innovation: next.innovation.length,
      jobs: next.jobs.length,
      pages: next.pages.length,
      regions: next.regions.length,
    },
  }));
}

refreshContent()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePublicSiteCache();
  });
