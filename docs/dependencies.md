# Dependencies

| Package/tool | Purpose | License/source | Used in |
|---|---|---|---|
| Next.js + React | separate public and CMS frontends | MIT / npm | `apps/web`, `apps/admin` |
| Fastify | local API | MIT / npm | `apps/api` |
| Sharp | server-side image validation, resizing, and WebP variant generation | Apache-2.0 / npm | `apps/api`, media upload pipeline |
| Zod | request/content validation | MIT / npm | `apps/api`, shared contracts boundary |
| Prisma CLI/client | PostgreSQL schema, client generation, and reviewed production migrations | Apache-2.0 / npm | `apps/api/prisma` |
| concurrently | one-command local runner | MIT / npm | root scripts |
| Project media workflow | MOVERA hero and editorial visual direction | committed project asset | `apps/web/public/starter-media` |

## Security maintenance baseline

The committed `package-lock.json` is the source of truth for installed
versions. The current security baseline includes Next.js 16.2.11, PostCSS
8.5.22, Sharp 0.35.3, and patched fast-uri 3.1.4 and 4.1.1 resolutions.
PostCSS and Sharp are explicit root pins with a scoped Next.js override because
Next.js declares older nested ranges; this prevents `npm ci` from resolving
the vulnerable transitive versions again.

Before merging dependency changes, run:

```powershell
npm ci
npm audit
npm audit --omit=dev
npm test
npm run build
npm run test:e2e
```

Do not use `npm audit fix --force`; review the upstream advisory and apply a
supported patched release instead. See [`SECURITY.md`](../SECURITY.md) for
responsible disclosure and [`README.md`](../README.md) for the full operating
model.
