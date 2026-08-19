# Change Map

| Change | Primary surface | Contract or runtime impact |
|---|---|---|
| Replace company content and seed data | `packages/contracts/src/starterSiteData.ts` | Fresh API seed and browser fallback |
| Replace first viewport copy | `apps/web/content/home-first-viewport/locales/*.json`, `apps/web/components/homeFirstViewportContent.ts` | Hero, sectors, hubs, metrics, and destinations |
| Change public route rendering | `apps/web/app/[locale]`, `apps/web/components`, `packages/contracts/src/index.ts` | Localized route and `SiteData` contract |
| Change CMS fields or editor behavior | `apps/admin/components/AdminApp.tsx`, `apps/api/src/index.ts` | Validation, permissions, persistence, and public payload |
| Change persisted content | `apps/api/src/store.ts`, `apps/api/prisma/schema.prisma` | PostgreSQL document, cache invalidation, and migrations |
| Replace local visual assets | `apps/web/public/branding`, `apps/web/public/starter-media` | Media policy and local-only asset checks |
| Change deployment/runtime | `docker-compose.dev.yml`, `docker-compose.images.yml`, `Dockerfile.*`, `.env.example` | Ports, service origins, secrets, and image builds |

Keep design tokens and layout geometry in code. They are implementation
boundaries, not CMS fields.
