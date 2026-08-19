import { expect, test } from "@playwright/test";

test("renders the MOVERA light mobility homepage", async ({ page }) => {
  await page.goto("/en", { waitUntil: "networkidle" });

  await expect(page.locator("h1").first()).toContainText("Move intelligence");
  await expect(page.locator('[data-brand-lockup] img[alt*="MOVERA"]').first()).toBeVisible();
  const hero = page.locator('img[src="/starter-media/movera-autonomy-hero.webp"]').first();
  await expect(hero).toBeVisible();
  await expect.poll(() => hero.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText("AI ROUTE · LIVE")).toHaveCount(0);
  await expect(page.locator(".chat-trigger")).toBeVisible();
  await expect(page.getByText("Perception to action")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Pause motion/i })).toHaveCount(0);
  await expect(page.locator("body")).toContainText("MOVERA");
});
