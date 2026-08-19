#!/usr/bin/env bash
set -euo pipefail

export IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-ghcr.io/samymagdy/movera}"
export IMAGE_TAG="${IMAGE_TAG:?Set IMAGE_TAG to the published commit tag}"

docker compose -f docker-compose.images.yml pull api web admin
docker compose -f docker-compose.images.yml up -d --force-recreate api web admin
docker compose -f docker-compose.images.yml ps

curl -fsS http://localhost:4000/health
curl -fsSI http://localhost:3000/en | head -n 1
curl -fsSI http://localhost:3001 | head -n 1
