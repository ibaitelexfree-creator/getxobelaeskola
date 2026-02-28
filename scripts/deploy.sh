#!/bin/bash
set -e

VPS_USER="root"
VPS_IP="76.13.52.6"
REMOTE_PATH="/opt/getxo-sailing"
SSH_KEY="$HOME/.ssh/hostinger_getxo"

echo "Iniciando despliegue..."

ssh -i "$SSH_KEY" "$VPS_USER@$VPS_IP" "mkdir -p $REMOTE_PATH"

rsync -az --delete \
-e "ssh -i $SSH_KEY" \
--exclude node_modules \
--exclude .next \
--exclude .git \
--exclude .env.local \
--exclude .env \
--exclude public/uploads \
./ \
"$VPS_USER@$VPS_IP:$REMOTE_PATH/"

if [ -f ".env.local" ]; then
  echo "Subiendo variables de entorno (.env.local -> .env)..."
  scp -i "$SSH_KEY" .env.local "$VPS_USER@$VPS_IP:$REMOTE_PATH/.env"
else
  echo "⚠️ ADVERTENCIA: No se encontró .env.local localmente."
fi

ssh -i "$SSH_KEY" "$VPS_USER@$VPS_IP" << EOF
cd $REMOTE_PATH
# Asegurar permisos correctos
if [ -f .env ]; then
  chmod 600 .env
fi

echo "Iniciando Docker Compose..."
docker compose up -d --build --remove-orphans
docker image prune -f
docker ps
EOF

echo "Deploy completado"
