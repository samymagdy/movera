# MOVERA production deployment on Azure Container Apps

This guide deploys the three MOVERA application images to Azure Container Apps:

- `company-api`
- `company-web`
- `company-admin`

Production data services are separate managed resources:

- Azure Database for PostgreSQL Flexible Server.
- Azure Cache for Redis.
- Azure Blob Storage or the configured storage abstraction for uploads and private CV files.
- Azure Key Vault for secrets.

## 1. Production architecture

```text
Browser
  |
  +--> Public Container App :3000
  +--> Protected Admin Container App :3001

Public/Admin Container Apps
  |
  +--> API Container App :4000
          |
          +--> Azure PostgreSQL
          +--> Azure Redis
          +--> Azure Storage
          +--> Google reCAPTCHA, only when enabled
          +--> Configured newsletter provider, only when enabled
```

PostgreSQL is the source of truth. Redis is optional cache acceleration and must not be treated as the permanent content store.

## 2. Required Azure resources

Create these resources in the same Azure region:

1. Resource group.
2. Azure Container Registry.
3. Log Analytics workspace.
4. Container Apps environment.
5. Azure Database for PostgreSQL Flexible Server.
6. Azure Cache for Redis.
7. Azure Key Vault.
8. Storage account/container for uploaded media and private CV files.
9. Three Container Apps: API, public web, and admin.

Use managed identities and least-privilege roles wherever possible.

## 3. Install Azure CLI

On Ubuntu:

```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
az account show
```

Select the target subscription:

```bash
az account set --subscription <SUBSCRIPTION_ID>
```

Set shell variables for the remaining commands:

```bash
export RESOURCE_GROUP=company-prod-rg
export REGION=<azure-region>
export ACR_NAME=<globally-unique-acr-name>
export LOG_NAME=company-prod-logs
export CONTAINERAPPS_ENV=company-prod-env
export TAG=<git-commit-sha>
```

## 4. Create the resource group and registry

```bash
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$REGION"

az acr create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$ACR_NAME" \
  --sku Standard

az acr login --name "$ACR_NAME"
```

Use immutable image tags such as a Git commit SHA. Do not use `latest` for production releases.

## 5. Create monitoring and Container Apps environment

```bash
az monitor log-analytics workspace create \
  --resource-group "$RESOURCE_GROUP" \
  --workspace-name "$LOG_NAME" \
  --location "$REGION"

az containerapp env create \
  --name "$CONTAINERAPPS_ENV" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$REGION" \
  --logs-workspace-id "$(az monitor log-analytics workspace show \
    --resource-group "$RESOURCE_GROUP" \
    --workspace-name "$LOG_NAME" \
    --query customerId -o tsv)" \
  --logs-workspace-key "$(az monitor log-analytics workspace get-shared-keys \
    --resource-group "$RESOURCE_GROUP" \
    --workspace-name "$LOG_NAME" \
    --query primarySharedKey -o tsv)"
```

## 6. Create managed PostgreSQL, Redis, and storage

Create PostgreSQL Flexible Server, Azure Cache for Redis, and Azure Storage using the Azure portal or CLI. Record their private or public endpoints according to your network design. The current API uses the filesystem storage abstraction, so mount durable Azure Files storage at `/app/storage` for the API Container App (or implement and configure the Blob adapter before go-live). Container-local disk is not durable and must not be used for uploaded media or private CV files.

Required runtime values:

```text
DATABASE_URL
REDIS_URL
STORAGE_ROOT or the configured Azure storage connection settings
```

Enable TLS for PostgreSQL and Redis. Restrict firewall rules to the Container Apps environment or private network where possible.

## 7. Store secrets in Key Vault

Create a strong integration key:

```bash
openssl rand -hex 32
```

Store the following values in Key Vault:

```text
DATABASE_URL
INTEGRATION_SECRET_KEY
ADMIN_BOOTSTRAP_PASSWORD
SMTP password, if used
Newsletter API key, if used
Google reCAPTCHA secret key, if used
ENTRA_CLIENT_SECRET, if used
```

Never place these values in Dockerfiles, Git, image labels, public Next.js variables, or browser code. The `INTEGRATION_SECRET_KEY` must remain stable because it decrypts integration secrets saved by the admin system.

## 8. Build the three images

Run from the repository root:

```bash
docker build -f Dockerfile.api \
  -t "$ACR_NAME.azurecr.io/company-api:$TAG" .

docker build -f Dockerfile.web \
  -t "$ACR_NAME.azurecr.io/company-web:$TAG" .

docker build -f Dockerfile.admin \
  -t "$ACR_NAME.azurecr.io/company-admin:$TAG" .
```

The images use the repository lockfile, generate Prisma Client, compile the API, build both Next applications, and run as a non-root user.

## 9. Push images to Azure Container Registry

For the current Ubuntu image workflow, the equivalent private Docker Hub tags are:

```bash
export DOCKERHUB_REPOSITORY=samymagdy/movera
docker login
docker push "$DOCKERHUB_REPOSITORY:api-$TAG"
docker push "$DOCKERHUB_REPOSITORY:web-$TAG"
docker push "$DOCKERHUB_REPOSITORY:admin-$TAG"
```

Use the same immutable `<TAG>` for all three images. Docker Hub is an interim private distribution registry; Azure production should use ACR and managed identity pulls as described below.

```bash
docker push "$ACR_NAME.azurecr.io/company-api:$TAG"
docker push "$ACR_NAME.azurecr.io/company-web:$TAG"
docker push "$ACR_NAME.azurecr.io/company-admin:$TAG"
```

For private pulls, assign a managed identity to Container Apps and grant it the `AcrPull` role. Avoid permanent registry passwords.

## 10. Deploy the API Container App

Create the API first:

```bash
az containerapp create \
  --name company-api \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$CONTAINERAPPS_ENV" \
  --image "$ACR_NAME.azurecr.io/company-api:$TAG" \
  --target-port 4000 \
  --ingress external \
  --registry-server "$ACR_NAME.azurecr.io" \
  --min-replicas 1 \
  --max-replicas 3 \
  --env-vars NODE_ENV=production API_PORT=4000 NEXT_PUBLIC_SITE_URL=https://<PUBLIC_HOST> NEXT_PUBLIC_API_BASE_URL=https://<API_HOST>
```

Configure Key Vault secret references, database, Redis, storage, CORS origins, and the integration key on the API Container App. Do not start public traffic until the health endpoint works.

For an existing database created with `db push`, take a backup and baseline the initial migration once after schema comparison:

```bash
npx prisma migrate resolve --applied 00000000000000_initial_schema --schema apps/api/prisma/schema.prisma
```

For a new database, apply the reviewed migration from a controlled release job or one-off container:

```bash
NODE_ENV=production npm run db:migrate
```

Do not run `prisma db push` in production. The release script rejects that path by selecting `prisma migrate deploy` in production mode.

Verify:

```bash
curl -fsS https://<API_HOST>/health
```

## 11. Deploy the public web Container App

```bash
az containerapp create \
  --name company-web \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$CONTAINERAPPS_ENV" \
  --image "$ACR_NAME.azurecr.io/company-web:$TAG" \
  --target-port 3000 \
  --ingress external \
  --registry-server "$ACR_NAME.azurecr.io" \
  --min-replicas 1 \
  --max-replicas 3 \
  --env-vars NODE_ENV=production ADMIN_ORIGIN=https://<ADMIN_HOST> NEXT_PUBLIC_API_BASE_URL=https://<API_HOST> NEXT_PUBLIC_SITE_URL=https://<PUBLIC_HOST>
```

Use a custom domain and TLS certificate through Azure Container Apps or an Azure Front Door/Application Gateway layer.

## 12. Deploy the admin Container App

```bash
az containerapp create \
  --name company-admin \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$CONTAINERAPPS_ENV" \
  --image "$ACR_NAME.azurecr.io/company-admin:$TAG" \
  --target-port 3001 \
  --ingress external \
  --registry-server "$ACR_NAME.azurecr.io" \
  --min-replicas 1 \
  --max-replicas 2 \
  --env-vars NODE_ENV=production NEXT_PUBLIC_ADMIN_API_BASE_URL=https://<API_HOST> NEXT_PUBLIC_PUBLIC_SITE_URL=https://<PUBLIC_HOST>
```

The admin application must be protected with network restrictions, an identity-aware proxy, VPN, or equivalent access control before exposing it to the internet.

## 13. Configure production settings in Admin

After signing in to the protected admin application, configure and test:

1. SMTP delivery.
2. Newsletter connector.
3. Invisible Google reCAPTCHA and protected forms.
4. Redis connection.
5. Identity and login providers.

Secrets are write-only in the admin interface. They are never returned visually after saving.

Published news automatically feeds the public news bar. Archived or unpublished news is removed from it after the content cache is invalidated.

## 14. Production verification

```bash
curl -fsS https://<API_HOST>/health
curl -fsS https://<PUBLIC_HOST>/en
curl -fsS https://<PUBLIC_HOST>/ar
curl -fsS https://<PUBLIC_HOST>/fr
curl -fsS https://<PUBLIC_HOST>/nl
```

Also verify:

- Admin login and role restrictions.
- English, Arabic, French, and Dutch content.
- Arabic RTL layout.
- PostgreSQL backup and restore procedure in a staging database.
- API storage volume survives an API Container App restart and a new revision.
- Published media and private CV files remain readable after the restart.
- Admin content, settings, users, and audit counts are unchanged after the new revision.
- Publish, archive, and restore workflows.
- News-bar updates after publishing and archiving.
- SMTP, newsletter, Redis, and reCAPTCHA test buttons.
- Desktop, tablet, and mobile layouts.
- Uploads and private CV storage.
- Container logs and health probes.

## 15. Upgrade and rollback

Build and push a new immutable tag, then update each Container App:

```bash
az containerapp update --name company-api --resource-group "$RESOURCE_GROUP" \
  --image "$ACR_NAME.azurecr.io/company-api:<NEW_TAG>"

az containerapp update --name company-web --resource-group "$RESOURCE_GROUP" \
  --image "$ACR_NAME.azurecr.io/company-web:<NEW_TAG>"

az containerapp update --name company-admin --resource-group "$RESOURCE_GROUP" \
  --image "$ACR_NAME.azurecr.io/company-admin:<NEW_TAG>"
```

If verification fails, switch all three apps back to the previous image tag. Keep the API, web, and admin versions aligned.

## 16. External runtime services

The application serves repository assets and local/system fonts. The documented external runtime exceptions are:

- Azure services.
- Google reCAPTCHA when enabled.
- The newsletter provider configured by an administrator.

## 17. Restore the current website on first deployment

Follow [backup-restore.md](backup-restore.md) before opening public traffic. Restore the PostgreSQL dump into Azure Database for PostgreSQL, extract the media archive into the durable `/app/storage` Azure Files mount or configured Blob storage, and keep the same `INTEGRATION_SECRET_KEY`. Do not rely on Container App local disk or rebuild the site from seed data if the goal is to preserve the current website exactly.
