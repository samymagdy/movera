# First production cutover and safe releases

The first production deployment must use the current PostgreSQL database as the source of truth if the goal is to preserve the exact current content, admin account, settings, audit history, submissions, and media references. Building new Docker images does not copy the local database or uploaded files.

## Before the first deployment

1. Freeze admin editing temporarily and record the application commit being deployed.
2. Back up the current PostgreSQL database in custom format:

```bash
pg_dump --format=custom --file=company-content-$(date +%Y%m%d-%H%M%S).dump "$DATABASE_URL"
```

3. Back up uploaded media and private CV files. For the current filesystem layout:

```bash
tar -czf company-storage-$(date +%Y%m%d-%H%M%S).tar.gz storage/uploads storage/private
```

4. Verify both backup files can be read and copy them to protected backup storage. Do not commit them to Git.
5. Provision production PostgreSQL and restore the database backup into the intended empty database:

```bash
pg_restore --no-owner --no-privileges --dbname="$PRODUCTION_DATABASE_URL" company-content-<timestamp>.dump
```

6. Restore the media backup into the durable API storage mount at `/app/storage`, or migrate the files to the configured Azure storage adapter. Container-local disk is not a production storage location.
7. Keep the same `INTEGRATION_SECRET_KEY` used when the settings were saved. Without it, encrypted SMTP, newsletter, reCAPTCHA, and Redis secrets cannot be decrypted.
8. Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_BASE_URL` to the real public URLs. This also normalizes old localhost URLs in stored content when the API reads it.
9. Do not run `npm run db:seed` as a reset. It only inserts the CEO content when no site document exists, but the production cutover should restore the existing site document instead.

## Existing database created with `db push`

After restoring the current database, compare its schema with the reviewed initial migration. If it matches, mark the baseline migration as applied once:

```bash
npx prisma migrate resolve \
  --applied 00000000000000_initial_schema \
  --schema apps/api/prisma/schema.prisma
```

Do not use this command to bypass a schema mismatch. Stop and review the difference first.

## Every later code deployment

1. Back up PostgreSQL and durable media storage.
2. Build and tag the three images from the new commit.
3. Run `NODE_ENV=production npm run db:migrate` from a controlled release job. The script uses `prisma migrate deploy`; production must never use `prisma db push`.
4. Deploy the new API, web, and admin revisions using the same database, storage mount, and stable secret references.
5. Verify `/health`, admin login, content counts, settings status, a published image, and one localized route in each language.
6. Keep the previous image available for rollback. Roll back the application image only after checking migration compatibility; never delete the database volume.

## Operations that can destroy data

Never use these against production without an explicit, verified restore plan:

- `docker compose down -v`.
- Dropping or recreating the PostgreSQL database.
- `prisma db push --accept-data-loss`.
- Re-running a seed/reset that writes default content over the site document.
- Deploying the API without durable `/app/storage`.
- Changing `INTEGRATION_SECRET_KEY`.

Admin content changes are stored in PostgreSQL, not in the Docker image. Publishing, archiving, settings changes, users, roles, and audit events therefore survive an image rebuild when the same database and storage are retained. Deleted default content is recorded with persistent tombstones so it does not reappear merely because a later image contains the original default seed.
