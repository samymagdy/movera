import { defineConfig, devices } from "@playwright/test";
import { execFileSync } from "node:child_process";

function frontendUrl() {
  const override = process.env.PLAYWRIGHT_BASE_URL;
  if (override) return override.replace(/\/$/, "");
  try {
    const published = execFileSync("docker", ["compose", "-f", "docker-compose.dev.yml", "port", "web", "3000"], { encoding: "utf8" }).trim();
    const match = published.match(/(?:127\.0\.0\.1|localhost|0\.0\.0\.0):(?<port>\d+)/);
    if (match?.groups?.port) return `http://localhost:${match.groups.port}`;
  } catch {
    // Fall back to the documented web port when Docker is unavailable.
  }
  return "http://localhost:3000";
}

const baseURL = frontendUrl();
const webServer = process.env.PLAYWRIGHT_BASE_URL ? undefined : {
  command: "docker compose -f docker-compose.dev.yml up -d",
  url: `${baseURL}/en`,
  reuseExistingServer: true,
  timeout: 120_000,
};

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: `${process.env.TEMP || "test-results"}/company-playwright-report`, open: "never" }]],
  outputDir: `${process.env.TEMP || "test-results"}/company-playwright-results`,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer,
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
