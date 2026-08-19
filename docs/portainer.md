# Portainer access and Docker management

This project can be managed through Portainer CE on a Docker host. Keep the
host URL and administrator account outside the repository.

## Access details

For a deployment, set the Portainer URL for the target host:

```text
URL:      https://<docker-host>:9443
Username: the Portainer administrator account
Password: the Portainer administrator password provisioned during setup
```

The HTTPS certificate is self-signed by default, so the browser may show a
certificate warning on the first visit. Store the password in a password
manager and rotate it after the first successful login. Do not commit the
password to `.env`, Markdown documentation, or source control.

## Install Portainer on Ubuntu

Install Portainer with persistent data and access to the local Docker socket:

```bash
sudo docker volume create portainer_data

sudo docker run -d \
  --name portainer \
  --restart=always \
  -p 9443:9443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:lts
```

The Docker socket mount allows Portainer to manage the Docker Engine on the
same host. The persistent `portainer_data` volume preserves the Portainer
database and configuration across container restarts.

## First-run initialization

The first-run setup token is printed in the Portainer container logs. Restart
Portainer before initialization if its setup window has expired:

```bash
sudo docker restart portainer
sudo docker logs portainer 2>&1 | grep -i setup_token
```

Open the URL in a browser and create the administrator account. Do not copy the
setup token or password into project documentation.

## Confirm Portainer is running

```bash
sudo docker ps --filter name=portainer
curl -k -I https://localhost:9443
```

Expected results are a running `portainer` container and an HTTP `200` response
from the HTTPS endpoint.

## Add the local Docker environment

After logging in, the local environment can be named `MOVERA-Docker` and
use:

```text
unix:///var/run/docker.sock
```

Confirm that the environment lists the MOVERA services, including:

- `movera-api-1`
- `movera-web-1`
- `movera-admin-1`
- `movera-postgres-1`
- `movera-redis-1`

Portainer can then be used to inspect logs, container health, images, volumes,
and restart state. Keep application deployments reproducible through the
Compose files; use Portainer for operational inspection and controlled
container actions.

## Portainer maintenance

View logs:

```bash
sudo docker logs -f portainer
```

Restart without deleting configuration:

```bash
sudo docker restart portainer
```

Back up Portainer configuration before upgrades or host migration:

```bash
sudo docker run --rm \
  -v portainer_data:/data \
  -v "$PWD":/backup \
  alpine tar czf /backup/portainer-data-backup.tgz -C /data .
```

Do not remove `portainer_data` unless intentionally resetting Portainer. That
volume contains its users, environments, and configuration.
