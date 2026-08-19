#!/usr/bin/env bash
set -euo pipefail

REPOSITORY="${IMAGE_REPOSITORY:-ghcr.io/samymagdy/movera}"
TAG="${IMAGE_TAG:-$(git rev-parse --short=8 HEAD)}"

docker build -f Dockerfile.api -t "$REPOSITORY:api-$TAG" .
docker build -f Dockerfile.web -t "$REPOSITORY:web-$TAG" .
docker build -f Dockerfile.admin -t "$REPOSITORY:admin-$TAG" .

docker login
docker push "$REPOSITORY:api-$TAG"
docker push "$REPOSITORY:web-$TAG"
docker push "$REPOSITORY:admin-$TAG"

echo "Published $REPOSITORY with release tag $TAG"
