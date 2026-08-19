# Browser-based visual testing

The repository includes reusable Playwright smoke tests in
`tests/e2e/public-smoke.spec.ts` and `tests/e2e/admin-light-smoke.spec.ts`,
with project configuration in `playwright.config.ts`.

Start the normal Docker development environment:

```powershell
docker compose -f docker-compose.dev.yml up -d --build
```

Run browser validation:

```powershell
npm run test:e2e
```

The Playwright configuration discovers the mapped public `web` port from
Docker (`docker compose port web 3000`) and uses `PLAYWRIGHT_BASE_URL` when
provided. It runs desktop Chromium at 1440×900 and mobile Chromium at
390×844. Screenshots and HTML reports are written under the Windows temporary
directory, not into the repository.

The web container keeps `NEXT_PUBLIC_API_BASE_URL` for browser requests and
uses `INTERNAL_API_BASE_URL` for its server-side `/uploads/*` rewrite. Docker
development defaults the internal value to `http://api:4000`; do not point that
server-side value at `localhost` from inside the web container.

Codex is configured with a local Playwright MCP server in the user
configuration (`%USERPROFILE%\.codex\config.toml`). Chromium is installed with
`npx playwright install chromium`.

The smoke checks cover public routes, page identity/content, hydration and
runtime errors, console errors, failed network requests, broken images,
horizontal overflow, theme persistence, language persistence, mobile menu
navigation, contact form controls, and the admin light-mode login surface.
The admin login page intentionally probes the session endpoint and receives a
401 before authentication; that specific response is expected and is excluded
from the console-error assertion.

The visual QA also uses a 110% browser-zoom equivalent viewport (`1440 / 1.1`
by `900 / 1.1`) to catch desktop overflow and cramped controls. This validates
real browser zoom behavior without forcing a permanent `zoom: 1.1` on users at
other resolutions. Light mode is expected to use white surfaces and dark navy
text, icons, arrows, menus, and news controls; dark artwork remains intentionally
dark for contrast.
