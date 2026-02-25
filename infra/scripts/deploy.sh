#!/bin/bash
# ============================================================
# deploy.sh - Despliegue con un click
# Uso: ./scripts/deploy.sh [opción]
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$SCRIPT_DIR/.."

# Colores
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'

banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════╗"
    echo "║      🚀 SaaS Infrastructure Deploy         ║"
    echo "║         One-Click Deployment Kit           ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_deps() {
    local DEPS=("docker" "docker-compose")
    for dep in "${DEPS[@]}"; do
        if ! command -v "$dep" &>/dev/null; then
            echo -e "${RED}❌ $dep no está instalado${NC}"
            exit 1
        fi
    done
    echo -e "${GREEN}✅ Dependencias OK${NC}"
}

check_env() {
    if [ ! -f "$INFRA_DIR/.env" ]; then
        echo -e "${YELLOW}⚠️  No existe .env, creando desde .env.example...${NC}"
        cp "$INFRA_DIR/.env.example" "$INFRA_DIR/.env"
        echo -e "${RED}❗ EDITA .env antes de continuar${NC}"
        echo -e "   ${YELLOW}nano $INFRA_DIR/.env${NC}"
        exit 1
    fi
    source "$INFRA_DIR/.env"
    echo -e "${GREEN}✅ .env cargado${NC}"
}

# ============================================================
# OPCIONES DE DEPLOY
# ============================================================

deploy_full() {
    echo -e "${BOLD}🚀 Deploy completo...${NC}"
    cd "$INFRA_DIR"
    docker-compose pull
    docker-compose up -d --build
    echo -e "${GREEN}✅ Stack completo desplegado${NC}"
    show_status
}

deploy_n8n_only() {
    echo -e "${BOLD}🔄 Actualizando solo n8n...${NC}"
    cd "$INFRA_DIR"
    docker-compose pull n8n n8n-worker
    docker-compose up -d --no-deps n8n n8n-worker
    echo -e "${GREEN}✅ n8n actualizado${NC}"
}

deploy_db_only() {
    echo -e "${BOLD}🗄️  Iniciando solo base de datos...${NC}"
    cd "$INFRA_DIR"
    docker-compose up -d postgres redis
    echo -e "${GREEN}✅ Bases de datos iniciadas${NC}"
}

scale_workers() {
    echo -e -n "${YELLOW}¿Cuántos workers? (actual: $(docker-compose ps --quiet n8n-worker | wc -l)): ${NC}"
    read -r N_WORKERS
    cd "$INFRA_DIR"
    docker-compose up -d --scale n8n-worker="$N_WORKERS" n8n-worker
    echo -e "${GREEN}✅ Workers escalados a $N_WORKERS${NC}"
}

stop_all() {
    echo -e "${BOLD}🛑 Parando todo...${NC}"
    cd "$INFRA_DIR"
    docker-compose down
    echo -e "${GREEN}✅ Todo parado${NC}"
}

run_backup() {
    echo -e "${BOLD}💾 Ejecutando backup...${NC}"
    bash "$SCRIPT_DIR/backup.sh"
}

restore_backup() {
    echo -e "${BOLD}♻️  Restaurar backup de PostgreSQL${NC}"
    ls -la "$INFRA_DIR/backups/postgres/" 2>/dev/null || { echo "No hay backups locales"; return; }
    echo -e -n "${YELLOW}Introduce el nombre del archivo de backup: ${NC}"
    read -r BACKUP_FILE
    
    if [ ! -f "$INFRA_DIR/backups/postgres/$BACKUP_FILE" ]; then
        echo -e "${RED}❌ Archivo no encontrado${NC}"
        return 1
    fi
    
    echo -e "${RED}⚠️  ESTO SOBREESCRIBIRÁ LA DB ACTUAL. ¿Continuar? (yes/no): ${NC}"
    read -r CONFIRM
    [ "$CONFIRM" != "yes" ] && { echo "Cancelado"; return; }
    
    source "$INFRA_DIR/.env"
    gunzip -c "$INFRA_DIR/backups/postgres/$BACKUP_FILE" \
        | docker exec -i ${PROJECT_NAME:-saas}_postgres \
          psql -U "$DB_USER" "$DB_NAME"
    
    echo -e "${GREEN}✅ Restauración completada${NC}"
}

show_status() {
    echo -e "\n${BOLD}📊 Estado del stack:${NC}"
    cd "$INFRA_DIR"
    docker-compose ps
    echo ""
    echo -e "${BOLD}🌐 URLs:${NC}"
    source "$INFRA_DIR/.env" 2>/dev/null || true
    echo -e "  n8n: ${CYAN}https://${N8N_HOST:-localhost:5678}${NC}"
}

deploy_fly() {
    echo -e "${BOLD}✈️  Desplegando en Fly.io...${NC}"
    bash "$SCRIPT_DIR/fly-deploy.sh"
}

# ============================================================
# MENÚ INTERACTIVO
# ============================================================
show_menu() {
    echo -e "\n${BOLD}¿Qué quieres hacer?${NC}\n"
    echo -e "  ${GREEN}1)${NC} 🚀 Deploy completo (primera vez)"
    echo -e "  ${GREEN}2)${NC} 🔄 Actualizar solo n8n"
    echo -e "  ${GREEN}3)${NC} 🗄️  Iniciar solo base de datos"
    echo -e "  ${GREEN}4)${NC} ⚖️  Escalar workers"
    echo -e "  ${GREEN}5)${NC} 💾 Hacer backup ahora"
    echo -e "  ${GREEN}6)${NC} ♻️  Restaurar backup"
    echo -e "  ${GREEN}7)${NC} 📊 Ver estado"
    echo -e "  ${GREEN}8)${NC} ✈️  Deploy en Fly.io"
    echo -e "  ${RED}9)${NC} 🛑 Parar todo"
    echo -e "  ${YELLOW}0)${NC} Salir\n"
    echo -e -n "${BOLD}Opción: ${NC}"
}

main() {
    banner
    check_deps
    check_env

    # Si se pasa argumento directo, ejecutar sin menú
    case "${1:-}" in
        full)       deploy_full ;;
        n8n)        deploy_n8n_only ;;
        db)         deploy_db_only ;;
        backup)     run_backup ;;
        restore)    restore_backup ;;
        status)     show_status ;;
        fly)        deploy_fly ;;
        stop)       stop_all ;;
        *)
            while true; do
                show_menu
                read -r OPTION
                case $OPTION in
                    1) deploy_full ;;
                    2) deploy_n8n_only ;;
                    3) deploy_db_only ;;
                    4) scale_workers ;;
                    5) run_backup ;;
                    6) restore_backup ;;
                    7) show_status ;;
                    8) deploy_fly ;;
                    9) stop_all ;;
                    0) echo "Hasta luego!"; exit 0 ;;
                    *) echo -e "${RED}Opción inválida${NC}" ;;
                esac
            done
        ;;
    esac
}

main "$@"
