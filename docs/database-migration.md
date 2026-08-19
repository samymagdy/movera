# Database migration path

The API uses PostgreSQL through the generated Prisma client. The backend remains the only persistence boundary, and the Prisma schema at `apps/api/prisma/schema.prisma` is the source of the database model for development and production.

For development, `docker-compose.dev.yml` provisions PostgreSQL and the documented setup uses `prisma db push`. Production never uses `db push`: `npm run db:migrate` selects `prisma migrate deploy` when `NODE_ENV=production` and fails if the migration history is not available.

The repository contains the initial schema migration at `apps/api/prisma/migrations/00000000000000_initial_schema`. For an existing database created previously with `db push`, take a verified backup, compare the live schema with the migration, and baseline it once with:

```bash
npx prisma migrate resolve --applied 00000000000000_initial_schema --schema apps/api/prisma/schema.prisma
```

Run that command only after confirming the database already contains the schema represented by the migration. For a new production database, run `NODE_ENV=production npm run db:migrate`; it creates the schema from the reviewed migration. Future schema changes must be generated as reviewed migration files and applied only through the release job.

Content, admin users, integration settings, submissions, and audit history live in PostgreSQL. A new application image does not replace them. Do not run `docker compose down -v`, drop the database, or run a seed/reset command against production. `npm run db:seed` only adds the CEO record when the site document is missing; it does not replace an existing site document.

Before every production release, back up PostgreSQL and the media/private-file storage, record the backup identifiers, apply migrations, deploy the image, and verify the content/settings counts and representative media URLs. Keep `INTEGRATION_SECRET_KEY` unchanged for the lifetime of the database; changing it makes encrypted SMTP, newsletter, reCAPTCHA, and Redis secrets unreadable.
