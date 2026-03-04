#!/bin/bash
docker stop inmobiliaria
docker rm inmobiliaria
docker run -d \
  --name inmobiliaria \
  --restart unless-stopped \
  --network n8n_default \
  -p 127.0.0.1:3020:3020 \
  -e NODE_ENV=production \
  -e PORT=3020 \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.inmobiliaria.rule=Host(\`controlmanager.cloud\`) && PathPrefix(\`/controlmanager/realstate\`)" \
  --label "traefik.http.routers.inmobiliaria.entrypoints=websecure" \
  --label "traefik.http.routers.inmobiliaria.tls.certresolver=mytlschallenge" \
  --label "traefik.http.services.inmobiliaria.loadbalancer.server.port=3020" \
  --label "traefik.http.routers.inmobiliaria.priority=1000" \
  ghcr.io/ibaitelexfree-creator/inmobiliaria-demo:latest
