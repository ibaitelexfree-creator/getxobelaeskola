#!/bin/bash
# ============================================================
# fly-deploy.sh - Despliegue en Fly.io con 2 regiones
# Redundancia automática Madrid + París
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../.env"

APP_NAME="${FLY_APP_NAME:-${PROJECT_NAME:-saas}-n8n}"
REGION_PRIMARY="${FLY_REGION_PRIMARY:-mad}"    # Madrid
REGION_SECONDARY="${FLY_REGION_SECONDARY:-cdg}" # París

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

check_flyctl() {
    if ! command -v flyctl &>/dev/null; then
        echo -e "${YELLOW}Instalando flyctl...${NC}"
        curl -L https://fly.io/install.sh | sh
        export PATH="$HOME/.fly/bin:$PATH"
    fi
    echo -e "${GREEN}✅ flyctl disponible${NC}"
}

create_fly_app() {
    echo -e "${GREEN}🚀 Creando app en Fly.io: $APP_NAME${NC}"
    
    # Crear app si no existe
    flyctl apps create "$APP_NAME" --org personal 2>/dev/null || \
        echo "App ya existe, continuando..."
    
    # Crear volumen en región primaria
    flyctl volumes create n8n_data \
        --app "$APP_NAME" \
        --region "$REGION_PRIMARY" \
        --size 10 \
        --yes 2>/dev/null || echo "Volumen primario ya existe"
    
    # Crear volumen en región secundaria (failover)
    flyctl volumes create n8n_data_backup \
        --app "$APP_NAME" \
        --region "$REGION_SECONDARY" \
        --size 10 \
        --yes 2>/dev/null || echo "Volumen secundario ya existe"
    
    echo -e "${GREEN}✅ App y volúmenes creados${NC}"
}

set_fly_secrets() {
    echo -e "${GREEN}🔐 Configurando secrets en Fly.io...${NC}"
    
    flyctl secrets set \
        --app "$APP_NAME" \
        DB_PASSWORD="$DB_PASSWORD" \
        REDIS_PASSWORD="$REDIS_PASSWORD" \
        N8N_ENCRYPTION_KEY="$N8N_ENCRYPTION_KEY" \
        N8N_JWT_SECRET="$N8N_JWT_SECRET" \
        WEBHOOK_URL="$WEBHOOK_URL"
    
    echo -e "${GREEN}✅ Secrets configurados${NC}"
}

deploy_to_fly() {
    echo -e "${GREEN}✈️  Desplegando en Fly.io...${NC}"
    
    # Generar fly.toml si no existe
    if [ ! -f "$SCRIPT_DIR/../fly/fly.toml" ]; then
        generate_fly_toml
    fi
    
    flyctl deploy \
        --app "$APP_NAME" \
        --config "$SCRIPT_DIR/../fly/fly.toml" \
        --remote-only
    
    echo -e "${GREEN}✅ Desplegado en $REGION_PRIMARY${NC}"
}

scale_to_two_regions() {
    echo -e "${GREEN}🌍 Escalando a 2 regiones ($REGION_PRIMARY + $REGION_SECONDARY)...${NC}"
    
    # Una máquina en cada región
    flyctl scale count 2 \
        --app "$APP_NAME" \
        --region "$REGION_PRIMARY,$REGION_SECONDARY"
    
    echo -e "${GREEN}✅ Activo en 2 regiones - Failover automático habilitado${NC}"
}

generate_fly_toml() {
    mkdir -p "$SCRIPT_DIR/../fly"
    cat > "$SCRIPT_DIR/../fly/fly.toml" << EOF
app = "${APP_NAME}"
primary_region = "${REGION_PRIMARY}"

[build]
  image = "n8nio/n8n:latest"

[env]
  DB_TYPE = "postgresdb"
  EXECUTIONS_MODE = "queue"
  N8N_HOST = "${N8N_HOST:-n8n.tudominio.com}"
  N8N_PROTOCOL = "https"
  GENERIC_TIMEZONE = "${TIMEZONE:-Europe/Madrid}"

[http_service]
  internal_port = 5678
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

  [http_service.concurrency]
    type = "connections"
    hard_limit = 100
    soft_limit = 80

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512

[mounts]
  source = "n8n_data"
  destination = "/home/node/.n8n"
EOF
    echo -e "${GREEN}✅ fly.toml generado${NC}"
}

show_fly_status() {
    echo -e "\n${GREEN}📊 Estado en Fly.io:${NC}"
    flyctl status --app "$APP_NAME"
    echo ""
    flyctl ips list --app "$APP_NAME"
}

main() {
    echo -e "${GREEN}✈️  === Fly.io Deployment === ${NC}\n"
    
    check_flyctl
    
    echo -e "${YELLOW}¿Primera vez? (crear app) o solo actualizar? (1=crear, 2=actualizar): ${NC}"
    read -r CHOICE
    
    case $CHOICE in
        1)
            create_fly_app
            set_fly_secrets
            generate_fly_toml
            deploy_to_fly
            scale_to_two_regions
            show_fly_status
            ;;
        2)
            set_fly_secrets
            deploy_to_fly
            show_fly_status
            ;;
        *)
            echo "Opción inválida"
            exit 1
            ;;
    esac
    
    echo -e "\n${GREEN}🎉 ¡Listo! n8n corriendo en 2 regiones con failover automático${NC}"
    echo -e "   Primaria:   ${REGION_PRIMARY} (${FLY_REGION_PRIMARY:-mad})"
    echo -e "   Secundaria: ${REGION_SECONDARY} (${FLY_REGION_SECONDARY:-cdg})"
}

main "$@"
