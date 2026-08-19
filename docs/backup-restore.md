# MOVERA backup and restore

PostgreSQL is the source of truth for published content, drafts, users, settings, submissions, and audit history. Uploaded media is stored separately under the API storage root. Back up both before the first deployment and before every production release.

## Current local backup

A verified backup of the current local environment was created on 2026-07-18:

```text
../company-backups/YYYYMMDD-HHMMSS/company-content.dump
../company-backups/YYYYMMDD-HHMMSS/company-storage.tar.gz
```

The PostgreSQL custom-format dump and storage archive were both read successfully after creation. The storage archive contains the current `storage/uploads` files. There are currently no `storage/private` files; create that directory on the target before restoring private uploads.

Do not commit backups to Git. Copy them to protected backup storage.

## Create a local backup

```bash
BACKUP_DIR="company-backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

pg_dump --format=custom \
  --file="$BACKUP_DIR/company-content.dump" \
  "$DATABASE_URL"

tar -czf "$BACKUP_DIR/company-storage.tar.gz" \
  storage/uploads storage/private 2>/dev/null || \
tar -czf "$BACKUP_DIR/company-storage.tar.gz" storage/uploads

pg_restore --list "$BACKUP_DIR/company-content.dump" >/dev/null
tar -tzf "$BACKUP_DIR/company-storage.tar.gz" >/dev/null
sha256sum "$BACKUP_DIR"/*
```

## Restore on Mac Docker Desktop

From the repository root, create `.env` from `.env.example` and set the local
secrets. Keep `.env` out of Git. Then start the data services first:

```bash
docker compose -f docker-compose.dev.yml up -d postgres redis
docker compose -f docker-compose.dev.yml run --rm api \
  npx prisma db push --schema apps/api/prisma/schema.prisma
```

Restore the verified backup without removing the named volumes:

```bash
BACKUP_DIR="$HOME/Downloads/company-backups/YYYYMMDD-HHMMSS"

docker compose -f docker-compose.dev.yml exec -T postgres \
  pg_restore --clean --if-exists --no-owner --no-privileges \
  -U company -d company_content < "$BACKUP_DIR/company-content.dump"

docker compose -f docker-compose.dev.yml run --rm \
  -v "$BACKUP_DIR/company-storage.tar.gz:/restore/company-storage.tar.gz:ro" \
  api sh -lc 'mkdir -p /app/storage && tar -xzf /restore/company-storage.tar.gz -C /app'

docker compose -f docker-compose.dev.yml run --rm api \
  sh -lc 'mkdir -p /app/storage/private/cv'
docker compose -f docker-compose.dev.yml up -d --build
curl -fsS http://localhost:4000/health
```

Do not run `down -v` during normal development; it deletes the restored
PostgreSQL, Redis, and media volumes.

## Publish updated Docker images after development

Use the commit SHA as an immutable release tag. Build and push all three
application images after a verified change:

```bash
REPOSITORY=ghcr.io/samymagdy/movera
TAG=$(git rev-parse --short=8 HEAD)

docker build -f Dockerfile.api -t "$REPOSITORY:api-$TAG" .
docker build -f Dockerfile.web -t "$REPOSITORY:web-$TAG" .
docker build -f Dockerfile.admin -t "$REPOSITORY:admin-$TAG" .

docker login
docker push "$REPOSITORY:api-$TAG"
docker push "$REPOSITORY:web-$TAG"
docker push "$REPOSITORY:admin-$TAG"
```

The image contains application code, not PostgreSQL data or uploaded files.
Keep using the backup/restore process above for database and storage. On the
next deployment, pull all three tags for the same commit before switching the
containers. Never reuse a mutable `latest` tag for production rollback.

## Automatic update sequence

After development changes are committed and verified, publish fresh images:

```bash
./scripts/release-images.sh
```

The script derives the tag from the current commit and pushes matching API,
web, and admin tags. It does not touch database or storage volumes.

Deploy that exact release locally or on Ubuntu:

```bash
export IMAGE_TAG=$(git rev-parse --short=8 HEAD)
./scripts/deploy-images.sh
```

The deployment script performs `pull` followed by `up -d --force-recreate`,
so containers cannot continue running the previous image. PostgreSQL, Redis,
uploads, and private media remain in their named volumes. Restore data only
when provisioning a new environment or intentionally recovering a backup.
The release compose file explicitly reuses the existing `company-*`
volumes so switching from source-built containers does not create a second
empty database or media store.

## Restore on Ubuntu with Docker

Pull the exact application release from the private Docker Hub repository before restoring data:

```bash
docker login
export IMAGE_REPOSITORY=ghcr.io/samymagdy/movera
export IMAGE_TAG=<commit-tag>
docker pull "$IMAGE_REPOSITORY:api-$IMAGE_TAG"
docker pull "$IMAGE_REPOSITORY:web-$IMAGE_TAG"
docker pull "$IMAGE_REPOSITORY:admin-$IMAGE_TAG"
```

Images do not contain PostgreSQL or uploaded media. Configure the services to use these image tags, then continue with the database and storage restore below.

1. Stop the API, web, and admin containers. Keep PostgreSQL running while restoring:

```bash
docker compose -f docker-compose.dev.yml stop api web admin
```

2. Copy the backup files to the Ubuntu VM and place them in a protected directory.

3. Restore the database. This replaces the target database contents, so verify the database name and take a safety backup first:

```bash
docker compose -f docker-compose.dev.yml exec -T postgres \
  pg_restore --clean --if-exists --no-owner --no-privileges \
  -U company -d company_content < company-content.dump
```

4. Restore media into the named Docker volume used by the API:

```bash
docker compose -f docker-compose.dev.yml run --rm \
  -v "$PWD/company-storage.tar.gz:/restore/company-storage.tar.gz:ro" \
  api sh -lc 'mkdir -p /app/storage && tar -xzf /restore/company-storage.tar.gz -C /app'
```

5. Recreate the private directory if the backup contained no private files:

```bash
docker compose -f docker-compose.dev.yml run --rm api \
  sh -lc 'mkdir -p /app/storage/private/cv'
```

6. Start the services and verify the health endpoint and public content:

```bash
docker compose -f docker-compose.dev.yml up -d
curl -fsS http://localhost:4000/health
curl -fsS http://localhost:3000/en
```

Use the same `INTEGRATION_SECRET_KEY` as the backup environment. Changing it makes encrypted SMTP, Redis, newsletter, and reCAPTCHA settings unreadable.

## Restore on Azure Container Apps

Azure Container Apps local disk is ephemeral. Restore PostgreSQL into Azure Database for PostgreSQL and restore media into the durable Azure Files mount at `/app/storage` (or the configured Blob adapter before go-live).

1. Take a safety backup of the production database before restoring.
2. Restore the custom-format dump into the intended empty or explicitly reset database:

```bash
pg_restore --clean --if-exists --no-owner --no-privileges \
  --dbname="$PRODUCTION_DATABASE_URL" company-content.dump
```

3. Extract media into the mounted durable storage path on the API release job or a one-off maintenance container:

```bash
mkdir -p /app/storage/private/cv
tar -xzf company-storage.tar.gz -C /app
```

4. Configure the API Container App with the same `DATABASE_URL`, `INTEGRATION_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE_URL`, Redis settings, and durable storage mount used by the current system.
5. Run production migrations only after schema comparison:

```bash
NODE_ENV=production npm run db:migrate
```

6. Restart the API revision, then verify:

```bash
curl -fsS https://<API_HOST>/health
curl -fsS https://<PUBLIC_HOST>/en
curl -fsS https://<PUBLIC_HOST>/ar
```

Confirm content counts, admin login, published media, all four locales, and the news bar before opening public traffic.

## Important safety rules

- Never run `docker compose down -v` before a verified backup.
- Never restore over production without confirming the target database and storage mount.
- Never use a new integration secret when restoring an environment with encrypted settings.
- Keep database backups and media backups outside the repository with restricted access.
