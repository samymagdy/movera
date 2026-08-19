# MOVERA deployment index

Use the focused runbooks below:

- [Ubuntu and Docker Compose](deployment-ubuntu-docker.md)
- [Azure Container Apps](deployment-azure-container-apps.md)

The remainder of this file is retained as a short architecture reference.

This repository keeps the public web app, admin app, and API as separate images. PostgreSQL is the permanent source of truth. Redis is an optional cache and integration service. Secrets are supplied at runtime and are never baked into an image.

## 1. Build the images first

From the repository root:

```bash
docker build -f Dockerfile.api -t company-api:local .
docker build -f Dockerfile.web -t company-web:local .
docker build -f Dockerfile.admin -t company-admin:local .
```

These Dockerfiles use Node 22, install the pinned lockfile, generate Prisma Client, compile the API, and build both Next applications. The runtime images run as the non-root `node` user.

## 2. Development with Docker Compose

1. Copy `.env.example` to `.env` and create a local integration key, for example:

   ```bash
   openssl rand -hex 32
   ```

   Put the value in `INTEGRATION_SECRET_KEY`. Do not commit `.env`.

2. Start PostgreSQL, Redis, API, web, and admin:

   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

3. In another terminal, apply the current Prisma schema once:

   ```bash
   docker compose -f docker-compose.dev.yml exec api npx prisma db push --schema apps/api/prisma/schema.prisma
   ```

4. Open:

   - Public website: `http://localhost:3000`
   - Admin: `http://localhost:3001`
   - API health: `http://localhost:4000/health`

5. Stop services without deleting local data:

   ```bash
   docker compose -f docker-compose.dev.yml down
   ```

To remove local PostgreSQL/Redis/media volumes, use `down -v` only when intentionally resetting development data.

## 3. Azure resources for production

Create these resources in one Azure region:

1. Azure Container Registry (ACR) for the three application images.
2. Azure Database for PostgreSQL Flexible Server.
3. Azure Cache for Redis.
4. Azure Key Vault for `DATABASE_URL`, `INTEGRATION_SECRET_KEY`, SMTP/API secrets, Entra credentials, and reCAPTCHA secret.
5. Azure Container Apps Environment and three Container Apps: `company-api`, `company-web`, and `company-admin`.
6. Azure Storage or the existing storage abstraction for uploads and private CV files.

Use managed identities and Key Vault references where available. Do not put passwords, tokens, or production connection strings in Dockerfiles, source control, image labels, or browser environment variables.

## 4. Build and push to ACR

```bash
az login
az account set --subscription <SUBSCRIPTION_ID>
az group create --name <RESOURCE_GROUP> --location <REGION>
az acr create --resource-group <RESOURCE_GROUP> --name <ACR_NAME> --sku Standard
az acr login --name <ACR_NAME>

docker build -f Dockerfile.api -t <ACR_NAME>.azurecr.io/company-api:<TAG> .
docker build -f Dockerfile.web -t <ACR_NAME>.azurecr.io/company-web:<TAG> .
docker build -f Dockerfile.admin -t <ACR_NAME>.azurecr.io/company-admin:<TAG> .
docker push <ACR_NAME>.azurecr.io/company-api:<TAG>
docker push <ACR_NAME>.azurecr.io/company-web:<TAG>
docker push <ACR_NAME>.azurecr.io/company-admin:<TAG>
```

Use an immutable tag such as a Git commit SHA, not `latest`, for production releases.

## 5. Create and configure Container Apps

Create the environment and log analytics workspace using the Azure portal or CLI. Then create the API first, followed by the public and admin apps:

```bash
az containerapp env create \
  --name <CONTAINERAPPS_ENV> \
  --resource-group <RESOURCE_GROUP> \
  --location <REGION>

az containerapp create \
  --name company-api \
  --resource-group <RESOURCE_GROUP> \
  --environment <CONTAINERAPPS_ENV> \
  --image <ACR_NAME>.azurecr.io/company-api:<TAG> \
  --target-port 4000 --ingress external \
  --registry-server <ACR_NAME>.azurecr.io \
  --env-vars NODE_ENV=production API_PORT=4000 NEXT_PUBLIC_SITE_URL=https://<PUBLIC_HOST>
```

Configure the API hostname and secret references in Container Apps settings. Then create web and admin with their runtime API base URLs:

```bash
az containerapp create --name company-web --resource-group <RESOURCE_GROUP> --environment <CONTAINERAPPS_ENV> \
  --image <ACR_NAME>.azurecr.io/company-web:<TAG> --target-port 3000 --ingress external \
  --registry-server <ACR_NAME>.azurecr.io \
  --env-vars NODE_ENV=production ADMIN_ORIGIN=https://<ADMIN_HOST> NEXT_PUBLIC_API_BASE_URL=https://<API_HOST> NEXT_PUBLIC_SITE_URL=https://<PUBLIC_HOST>

az containerapp create --name company-admin --resource-group <RESOURCE_GROUP> --environment <CONTAINERAPPS_ENV> \
  --image <ACR_NAME>.azurecr.io/company-admin:<TAG> --target-port 3001 --ingress external \
  --registry-server <ACR_NAME>.azurecr.io \
  --env-vars NODE_ENV=production NEXT_PUBLIC_ADMIN_API_BASE_URL=https://<API_HOST> NEXT_PUBLIC_PUBLIC_SITE_URL=https://<PUBLIC_HOST>
```

For ACR private pulls, use a managed identity with `AcrPull` rather than long-lived registry passwords. Restrict the admin hostname with network access policy or an identity-aware proxy before exposing it beyond the operations team.

## 6. Database and cache initialization

Run the schema command from a controlled release job or a one-off container, never on every request:

```bash
npx prisma db push --schema apps/api/prisma/schema.prisma
```

Production uses the reviewed Prisma migration at `apps/api/prisma/migrations/00000000000000_initial_schema`; do not use `prisma db push` for production. Existing databases must be backed up and baselined once with `prisma migrate resolve` after schema comparison. Set `DATABASE_URL` to Azure PostgreSQL, `REDIS_URL` to Azure Cache for Redis, `NEXT_PUBLIC_SITE_URL` to the public web URL, and `NEXT_PUBLIC_API_BASE_URL` to the public API URL so newly uploaded and preserved media resolve correctly. Mount durable Azure Files storage at `/app/storage` for the API, because Container App local disk is ephemeral. In Admin → Settings, save and test SMTP, newsletter, reCAPTCHA, and Redis connections. The secret encryption key must remain stable for the lifetime of stored integrations.

## 7. Release verification

For each image tag, verify:

```bash
curl -fsS https://<API_HOST>/health
curl -fsS https://<PUBLIC_HOST>/en
curl -fsS https://<PUBLIC_HOST>/ar
```

Then run the four-locale route matrix, admin role checks, publish/archive news-bar checks, SMTP/newsletter/Redis tests, and desktop/mobile/Arabic RTL browser QA. Roll back by switching all three apps to the previous immutable image tag.

The application serves repository assets and system/local fonts. Google reCAPTCHA, Azure services, and the configured newsletter provider are the documented external runtime exceptions.
