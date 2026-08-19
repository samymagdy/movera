# MOVERA on Ubuntu with Docker

This guide installs Docker on an Ubuntu VM and runs the MOVERA public website, admin application, API, PostgreSQL, and Redis with Docker Compose.

## 1. Connect to the Ubuntu VM

```bash
ssh <ubuntu-user>@<VM_IP>
```

Update the system and install basic tools:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg git openssl
```

## 2. Install Docker Engine and Compose

```bash
sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Allow the current user to run Docker without `sudo`:

```bash
sudo usermod -aG docker "$USER"
newgrp docker
```

Verify the installation:

```bash
docker --version
docker compose version
docker run hello-world
```

## 3. Recommended image deployment

For the current Ubuntu deployment, pull prebuilt images from the private Docker Hub repository instead of cloning and building the project on the VM:

```bash
docker login
export IMAGE_REPOSITORY=ghcr.io/samymagdy/movera
export IMAGE_TAG=<commit-tag>

docker pull "$IMAGE_REPOSITORY:api-$IMAGE_TAG"
docker pull "$IMAGE_REPOSITORY:web-$IMAGE_TAG"
docker pull "$IMAGE_REPOSITORY:admin-$IMAGE_TAG"
```

Use the same immutable tag for all three services. Images contain application code only. PostgreSQL, Redis, uploaded media, secrets, and admin settings remain external and must be restored/configured separately.

## 4. Download the MOVERA source

This source-build path is for development or when Docker Hub images are not being used.

Replace the repository URL with the project repository:

```bash
git clone <YOUR_REPOSITORY_URL> tat
cd tat
```

The repository must contain:

- `Dockerfile.api`
- `Dockerfile.web`
- `Dockerfile.admin`
- `docker-compose.dev.yml`
- `package-lock.json`

## 5. Configure local secrets

Create the environment file:

```bash
cp .env.example .env
nano .env
```

Set these values:

```env
ADMIN_BOOTSTRAP_EMAIL=admin@movera.local
ADMIN_BOOTSTRAP_NAME=admin
ADMIN_BOOTSTRAP_PASSWORD=<strong-unique-admin-password>
INTEGRATION_SECRET_KEY=<generated-secret>
```

Generate the integration secret with:

```bash
openssl rand -hex 32
```

Paste the generated value into `INTEGRATION_SECRET_KEY`. This key must remain unchanged because it encrypts stored SMTP, Redis, newsletter, and reCAPTCHA secrets.

Do not commit `.env` or share it in source control.

For a browser-accessible server deployment, also set the public origins and
Next.js public URLs to the server address. These values are used by the API
for origin checks and by the web/admin builds for browser requests:

```env
WEB_ORIGIN=http://<VM_IP>:3000
ADMIN_ORIGIN=http://<VM_IP>:3001
NEXT_PUBLIC_API_BASE_URL=http://<VM_IP>:4000
NEXT_PUBLIC_ADMIN_API_BASE_URL=http://<VM_IP>:4000
NEXT_PUBLIC_SITE_URL=http://<VM_IP>:3000
NEXT_PUBLIC_PUBLIC_SITE_URL=http://<VM_IP>:3000
```

Do not leave these values as `localhost` when users will access the site from
another computer. `NEXT_PUBLIC_*` values are embedded into the Next.js
browser bundle during `docker compose build`; changing only the container
runtime environment does not update an already-built bundle.

## 6. Start PostgreSQL and Redis

```bash
docker compose -f docker-compose.dev.yml up -d postgres redis
```

Check their status:

```bash
docker compose -f docker-compose.dev.yml ps
```

## 7. Initialize PostgreSQL

Build the API image and apply the Prisma schema:

```bash
docker compose -f docker-compose.dev.yml build api

docker compose -f docker-compose.dev.yml run --rm api \
  npx prisma db push --schema apps/api/prisma/schema.prisma
```

The first API startup creates the configured Super Admin account if the database is empty.

## 8. Build and start all MOVERA services

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

When changing any `NEXT_PUBLIC_*` value, explicitly rebuild and recreate both
browser applications so the new URLs are compiled into their bundles:

```bash
docker compose -f docker-compose.dev.yml build web admin
docker compose -f docker-compose.dev.yml up -d --force-recreate web admin
```

Check all containers:

```bash
docker compose -f docker-compose.dev.yml ps
```

## 9. Verify the installation

API health check:

```bash
curl -fsS http://localhost:4000/health
```

Open these addresses from your browser:

```text
Public website: http://<VM_IP>:3000
Admin:          http://<VM_IP>:3001
API health:     http://<VM_IP>:4000/health
```

Initial admin login:

```text
Email:    admin@movera.local
Password: the value configured in ADMIN_BOOTSTRAP_PASSWORD
```

The bootstrap password is used only when the database has no admin account.
Changing `ADMIN_BOOTSTRAP_PASSWORD` later does not change an existing user's
password. Change an existing password from the admin user-management flow or
use the approved server recovery procedure. Keep the active password in a
password manager, not in this repository.

## 10. Verify browser assets and API data

Run the following checks from a client computer that can reach the VM:

```powershell
curl.exe -I http://<VM_IP>:3000/starter-media/movera-autonomy-hero.webp
curl.exe -I http://<VM_IP>:3000/branding/company-mark.svg
curl.exe -I http://<VM_IP>:3000/branding/company-wordmark.svg
```

Each image should return `200` with an `image/*` content type. If the admin
shows broken images after a rebuild, hard-refresh the browser (`Ctrl+F5`) and
confirm the admin bundle was rebuilt with the server URLs.

Verify the service health from the VM:

```bash
curl -fsS http://localhost:4000/health
docker compose -f docker-compose.dev.yml ps
```

Verify that the API can use Redis for the public-site cache:

```bash
curl -fsS http://localhost:4000/api/v1/site > /dev/null
docker compose -f docker-compose.dev.yml exec redis redis-cli EXISTS company:public-site:v1
docker compose -f docker-compose.dev.yml exec redis redis-cli TTL company:public-site:v1
```

The expected results are `1` for `EXISTS` and a positive TTL (60 seconds by
default). PostgreSQL remains the content source of truth. Successful content
writes invalidate this key, and the API falls back to PostgreSQL if Redis is
unavailable.

## 11. Install and access Portainer

For the Portainer installation, local Docker management is enabled through
the Docker socket. Follow [portainer.md](portainer.md) for the installation,
first-run initialization, login, and environment verification procedure.

## 12. Configure the Ubuntu firewall

For development or internal testing:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 4000/tcp
sudo ufw enable
sudo ufw status
```

For production, expose only the public web endpoint through a reverse proxy. Keep the API and admin application private or protected by an identity-aware proxy.

## 13. View logs

All services:

```bash
docker compose -f docker-compose.dev.yml logs -f
```

Individual services:

```bash
docker compose -f docker-compose.dev.yml logs -f api
docker compose -f docker-compose.dev.yml logs -f web
docker compose -f docker-compose.dev.yml logs -f admin
```

## 14. Stop and restart

Stop containers while preserving all data:

```bash
docker compose -f docker-compose.dev.yml stop
```

Start stopped containers:

```bash
docker compose -f docker-compose.dev.yml start
```

Remove containers but preserve database, Redis, and media volumes:

```bash
docker compose -f docker-compose.dev.yml down
```

Start again:

```bash
docker compose -f docker-compose.dev.yml up -d
```

## 15. Update the application

```bash
git pull
docker compose -f docker-compose.dev.yml build --pull

docker compose -f docker-compose.dev.yml run --rm api \
  npx prisma db push --schema apps/api/prisma/schema.prisma

docker compose -f docker-compose.dev.yml up -d
```

If the update changes browser-facing URLs or asset handling, rebuild and
recreate `web` and `admin` explicitly as shown in Section 8.

## 16. Backup PostgreSQL

```bash
docker compose -f docker-compose.dev.yml exec -T postgres \
  pg_dump -U company -d company_content > company-backup.sql
```

Restore a backup only after stopping the API and confirming the target database:

```bash
cat company-backup.sql | docker compose -f docker-compose.dev.yml exec -T postgres \
  psql -U company -d company_content
```

## 17. Destructive reset

The following removes PostgreSQL data, Redis data, uploaded media, and private files:

```bash
docker compose -f docker-compose.dev.yml down -v
```

Use this only when intentionally resetting the development environment.

## 18. Restore the current website backup

For the exact current content, admin data, settings, audit history, and uploaded media, follow [backup-restore.md](backup-restore.md). Restore the PostgreSQL dump and the storage archive before starting the API, then keep the same `INTEGRATION_SECRET_KEY` from the source environment.
