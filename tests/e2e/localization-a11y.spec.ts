import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const localeExpectations = {
  en: { dir: "ltr", heading: "Move intelligence into motion." },
  ar: { dir: "rtl", heading: "نحوّل الذكاء إلى حركة." },
  fr: { dir: "ltr", heading: "Mettre l’intelligence en mouvement." },
  nl: { dir: "ltr", heading: "Breng intelligentie in beweging." },
} as const;

const representativePaths = [
  "",
  "/about",
  "/about/who-we-are",
  "/about/history",
  "/about/vision-mission",
  "/about/clients-certificates",
  "/about/ceo-message",
  "/about/leadership",
  "/services",
  "/services/autonomy-systems",
  "/products",
  "/products/movera-command",
  "/projects/brussels-perception-pilot",
  "/news/introducing-movera",
  "/blogs/designing-operator-confidence",
  "/innovation-hub/confidence-maps",
  "/careers/autonomy-systems-engineer",
  "/regions/hub-a",
  "/contact",
  "/privacy-policy",
  "/search?q=mobility",
] as const;

for (const [locale, expected] of Object.entries(localeExpectations)) {
  test(`${locale} renders native copy, direction and accessible route layouts`, async ({ page }) => {
    test.setTimeout(180_000);
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    const accessibilityFailures: string[] = [];
    page.on("console", message => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", request => {
      const failure = request.failure()?.errorText || "request failed";
      if (!failure.includes("ERR_ABORTED")) failedRequests.push(`${request.url()} · ${failure}`);
    });

    const pathsToCheck = process.env.PLAYWRIGHT_QA_PATH
      ? [process.env.PLAYWRIGHT_QA_PATH === "/" ? "" : process.env.PLAYWRIGHT_QA_PATH]
      : representativePaths;
    for (const path of pathsToCheck) {
      const response = await page.goto(`/${locale}${path}`, { waitUntil: "networkidle" });
      expect(response?.status(), `${locale}${path} should return 200`).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("html")).toHaveAttribute("dir", expected.dir);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("h1")).toHaveCount(1);

      const rendering = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        brokenImages: Array.from(document.images)
          .filter(image => image.complete && image.naturalWidth === 0)
          .map(image => image.currentSrc || image.src),
        duplicateIds: Array.from(document.querySelectorAll("[id]"))
          .map(element => element.id)
          .filter((id, index, ids) => ids.indexOf(id) !== index),
      }));
      expect(rendering.overflow, `${locale}${path} should not overflow horizontally`).toBeLessThanOrEqual(1);
      expect(rendering.brokenImages, `${locale}${path} should not contain broken images`).toEqual([]);
      expect(rendering.duplicateIds, `${locale}${path} should not contain duplicate IDs`).toEqual([]);

      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const serious = accessibility.violations.filter(violation =>
        violation.impact === "serious" || violation.impact === "critical"
      );
      for (const violation of serious) {
        const targets = violation.nodes.flatMap(node => node.target).join(", ");
        const details = violation.nodes.map(node => node.failureSummary).filter(Boolean).join(" | ");
        accessibilityFailures.push(`${locale}${path || "/"} · ${violation.id} · ${targets} · ${details}`);
      }
    }

    await page.goto(`/${locale}`, { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText(expected.heading);
    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press("Tab");
      const focus = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (!element || element === document.body) return { usable: false, label: "body" };
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          usable: style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0,
          label: element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 80) || element.tagName,
        };
      });
      expect(focus.usable, `Keyboard focus ${index + 1} should be visible and usable (${focus.label})`).toBe(true);
    }

    expect(accessibilityFailures, `${locale} should have no serious or critical axe violations`).toEqual([]);
    expect(failedRequests, `${locale} should not have failed network requests`).toEqual([]);
    expect(consoleErrors, `${locale} should not log browser console errors`).toEqual([]);
  });
}

test("captures desktop, tablet and RTL mobile visual checkpoints", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const checkpoints = testInfo.project.name === "mobile"
    ? [{ locale: "ar", width: 390, height: 844, path: "" }]
    : [
        { locale: "en", width: 1440, height: 900, path: "" },
        { locale: "fr", width: 768, height: 1024, path: "/products" },
      ];

  for (const checkpoint of checkpoints) {
    await page.setViewportSize({ width: checkpoint.width, height: checkpoint.height });
    await page.goto(`/${checkpoint.locale}${checkpoint.path}`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: testInfo.outputPath(`${checkpoint.locale}-${checkpoint.width}x${checkpoint.height}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
});
