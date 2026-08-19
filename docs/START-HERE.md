# Start Here

## First Run

1. Copy `.env.example` to `.env`.
2. Set a unique `INTEGRATION_SECRET_KEY` and strong `ADMIN_BOOTSTRAP_PASSWORD`.
3. Start the source-based stack with
   `docker compose -p movera -f docker-compose.dev.yml -f docker-compose.movera.local.yml up -d --build`.
4. Push the Prisma schema with
   `docker compose -p movera -f docker-compose.dev.yml -f docker-compose.movera.local.yml exec api npx prisma db push --schema apps/api/prisma/schema.prisma`.
5. Open `/en` on port 3100 and the CMS on port 3101.

## Content Maintenance

- Maintain the four-language content baseline in `packages/contracts/src/starterSiteData.ts`.
- Maintain first-viewport locale files under `apps/web/content`.
- Store approved public assets under `apps/web/public` or `apps/admin/public`.
- Review navigation, legal copy, contact details, and social URLs before release.
- Never copy production databases, submissions, private files, credentials, or
  environment files into source control.

## Change Routing

Use `docs/change-map.md` before modifying a route, contract, component, API
payload, or CMS-editable field. Keep public presentation in `apps/web`, CMS
workflows in `apps/admin`, and data ownership in `apps/api`.

## Verification

Run `npm run media:check`, `npm test`, and `npm run build`. Run Playwright only
against the running MOVERA stack and record any remaining integration gaps.
