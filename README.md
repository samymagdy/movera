# MOVERA

MOVERA is a multilingual mobility-intelligence platform for autonomous vehicles,
fleet operations, connected infrastructure, and accountable human decision-making.
This repository contains the current public website, authenticated content
management system, API, shared content contracts, database schema, and Docker
runtime.

The public experience is authored independently in English, Arabic, French, and
Dutch. Arabic is rendered right-to-left at the document level. Website content
and media can be managed through the CMS without changing frontend source.

## Applications

```text
Browser
  |-- Public website :3100  ---> Fastify API :4100 ---> PostgreSQL
  |-- MOVERA CMS     :3101  ---> Fastify API :4100 ---> Redis cache
                                           \-------> managed media storage
```

| Workspace | Responsibility |
| --- | --- |
| `apps/web` | Next.js public website, localized routes, accessibility, forms, and media |
| `apps/admin` | Authenticated CMS for content, media, users, settings, audit history, and Trash |
| `apps/api` | Fastify API, Prisma persistence, authentication, authorization, validation, integrations, and uploads |
| `packages/contracts` | Shared TypeScript contracts and the current MOVERA content baseline |
| `tests/e2e` | Playwright localization, RTL, responsive, route, and accessibility coverage |

## Technology

- TypeScript, React 19, and Next.js 16
- Fastify 5 and Zod
- Prisma 6 with PostgreSQL 16
- Redis 7
- Playwright and axe-core
- Docker and Docker Compose

## Public information architecture

The website includes localized home, company, services, products, projects,
news, perspectives, innovation, careers, regional, contact, search, and legal
routes. Locale prefixes are:

- `/en` — English
- `/ar` — Arabic with RTL layout
- `/fr` — French
- `/nl` — Dutch

The current editable public content is committed in
[`packages/contracts/src/starterSiteData.ts`](packages/contracts/src/starterSiteData.ts).
Homepage viewport copy is maintained under
[`apps/web/content/home-first-viewport/locales`](apps/web/content/home-first-viewport/locales).
All public editorial and brand images used by the application are committed
under `apps/web/public` and `apps/admin/public`.

## Reproducible database state

The repository intentionally does not contain a raw live database. A raw dump
would include administrator password hashes, sessions, audit history, form
submissions, private CV paths, and encrypted integration settings.

A clean environment reproduces the public site through:

- the Prisma schema in `apps/api/prisma/schema.prisma`;
- committed migrations in `apps/api/prisma/migrations`;
- the full MOVERA content baseline in `packages/contracts`;
- public media in the application public directories; and
- `npm --workspace apps/api run refresh-content` for an existing clean database.

Runtime databases, `.env` files, private uploads, and user submissions are
excluded from version control by design.

## Local development with Docker

### Prerequisites

- Docker Desktop with Docker Compose v2
- Node.js 22 and npm when running checks outside Docker
- Git

### 1. Configure the environment

```powershell
Copy-Item .env.example .env
```

Set at least these values in `.env`:

```dotenv
INTEGRATION_SECRET_KEY=<32-byte-or-longer-random-secret>
ADMIN_BOOTSTRAP_PASSWORD=<strong-one-time-bootstrap-password>
ADMIN_BOOTSTRAP_EMAIL=admin@movera.local

WEB_ORIGIN=http://localhost:3100
ADMIN_ORIGIN=http://localhost:3101
NEXT_PUBLIC_SITE_URL=http://localhost:3100
NEXT_PUBLIC_API_BASE_URL=http://localhost:4100
NEXT_PUBLIC_ADMIN_API_BASE_URL=http://localhost:4100
NEXT_PUBLIC_PUBLIC_SITE_URL=http://localhost:3100
```

Generate an integration key in PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Never commit `.env` or copy credentials from another environment.

### 2. Build and start the isolated stack

```powershell
docker compose -p movera `
  -f docker-compose.dev.yml `
  -f docker-compose.movera.local.yml `
  up -d --build
```

If Docker is exposed through Ubuntu WSL2, run the same Compose command through
`wsl.exe -d Ubuntu -- docker compose ...` using `/mnt/c/...` paths.

### 3. Apply the database schema

```powershell
docker compose -p movera `
  -f docker-compose.dev.yml `
  -f docker-compose.movera.local.yml `
  exec api npx prisma db push --schema apps/api/prisma/schema.prisma
```

The API creates the first administrator only when no administrator exists.
Change the bootstrap password after first use and never use it as a permanent
production credential.

### 4. Open the applications

- Public website: <http://localhost:3100/en>
- CMS: <http://localhost:3101>
- API health: <http://localhost:4100/health>
- Public content payload: <http://localhost:4100/api/v1/site>

The local override publishes PostgreSQL on `55440` and Redis on `56379`. Those
ports are for local diagnostics and must not be exposed publicly.

## Run without Docker

```powershell
npm ci
npm run build:contracts
npm run db:generate
npm run dev
```

This mode still requires reachable PostgreSQL and Redis services plus a valid
`.env` configuration.

## Content refresh

The refresh command applies the committed four-language content baseline while
preserving configured branding, hero media, assistant icon, contact details,
social links, and homepage visibility settings:

```powershell
docker compose -p movera `
  -f docker-compose.dev.yml `
  -f docker-compose.movera.local.yml `
  exec api npm --workspace apps/api run refresh-content
```

Back up PostgreSQL before content refreshes in a shared or deployed environment.

## Verification

```powershell
npm ci
npm run media:check
npm test
npm run build
npm run test:e2e
```

The end-to-end suite checks localized routes, document language and direction,
responsive layouts, keyboard focus, image integrity, horizontal overflow,
duplicate IDs, console and request failures, and serious or critical axe-core
findings.

## Deployment

Production images are built independently for the public website, CMS, and API.
Browser-facing URLs are compile-time values for the Next.js applications, so
set the deployment host and ports explicitly when building images.

Relevant runbooks:

- [Ubuntu and Docker deployment](docs/deployment-ubuntu-docker.md)
- [Database backup and restore](docs/backup-restore.md)
- [Database migration](docs/database-migration.md)
- [Production data cutover](docs/production-data-cutover.md)
- [Browser verification](docs/browser-testing.md)

Do not expose PostgreSQL, Redis, the CMS, or development Compose defaults to the
public internet. Use TLS termination, restricted network access, explicit
origins, protected secrets, backups, and monitoring.

## Security

Do not open a public issue for a suspected vulnerability. Follow the private
reporting instructions in [SECURITY.md](SECURITY.md).

## Repository scope

This repository contains the complete reproducible MOVERA application and its
public content/media state. Environment secrets, administrator/session data,
submissions, private files, raw databases, test artifacts, local deployment
bundles, and developer visual checks are intentionally excluded.
