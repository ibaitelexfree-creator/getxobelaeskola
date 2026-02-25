#!/bin/bash
# ============================================================
# backup.sh - Backup completo automático
# Cron sugerido: 0 2 * * * /opt/infra/scripts/backup.sh
# ============================================================

set -euo pipefail

# Cargar variables de entorno
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../.env"

# Configuración
BACKUP_DIR="$SCRIPT_DIR/../backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="${PROJECT_NAME:-saas}_${TIMESTAMP}"
LOG_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.log"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARN: $1${NC}" | tee -a "$LOG_FILE"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"; }

mkdir -p "$BACKUP_DIR/postgres" "$BACKUP_DIR/n8n" "$BACKUP_DIR/env"

# ============================================================
# 1. BACKUP POSTGRESQL (DB de n8n)
# ============================================================
backup_postgres() {
    log "📦 Iniciando backup de PostgreSQL..."
    
    POSTGRES_BACKUP="$BACKUP_DIR/postgres/${BACKUP_NAME}_postgres.sql.gz"
    
    docker exec ${PROJECT_NAME:-saas}_postgres \
        pg_dump -U "$DB_USER" "$DB_NAME" \
        | gzip > "$POSTGRES_BACKUP"
    
    SIZE=$(du -sh "$POSTGRES_BACKUP" | cut -f1)
    log "✅ PostgreSQL backup completado: $SIZE → $POSTGRES_BACKUP"
    echo "$POSTGRES_BACKUP"
}

# ============================================================
# 2. BACKUP n8n DATA (workflows, credenciales cifradas)
# ============================================================
backup_n8n_data() {
    log "📦 Iniciando backup de datos n8n..."
    
    N8N_BACKUP="$BACKUP_DIR/n8n/${BACKUP_NAME}_n8n_data.tar.gz"
    
    # Backup del volumen Docker de n8n
    docker run --rm \
        -v ${PROJECT_NAME:-saas}_n8n_data:/data \
        -v "$BACKUP_DIR/n8n":/backup \
        alpine tar czf "/backup/$(basename $N8N_BACKUP)" -C /data .
    
    SIZE=$(du -sh "$N8N_BACKUP" | cut -f1)
    log "✅ n8n data backup completado: $SIZE → $N8N_BACKUP"
    echo "$N8N_BACKUP"
}

# ============================================================
# 3. BACKUP VARIABLES DE ENTORNO (encriptado)
# ============================================================
backup_env() {
    log "📦 Iniciando backup de variables de entorno..."
    
    ENV_BACKUP="$BACKUP_DIR/env/${BACKUP_NAME}_env.tar.gz.gpg"
    
    # Comprimir y encriptar con GPG (o con openssl si no hay GPG)
    if command -v gpg &> /dev/null; then
        tar czf - "$SCRIPT_DIR/../.env" \
            | gpg --symmetric --cipher-algo AES256 \
            --batch --passphrase "${N8N_ENCRYPTION_KEY}" \
            -o "$ENV_BACKUP"
    else
        tar czf - "$SCRIPT_DIR/../.env" \
            | openssl enc -aes-256-cbc -pbkdf2 \
            -k "${N8N_ENCRYPTION_KEY}" \
            -out "$ENV_BACKUP"
    fi
    
    log "✅ Variables de entorno backup completado (encriptado)"
    echo "$ENV_BACKUP"
}

# ============================================================
# 4. SUBIR A S3/R2/B2
# ============================================================
upload_to_s3() {
    local FILE=$1
    local FILENAME=$(basename "$FILE")
    
    log "☁️  Subiendo $FILENAME a S3..."
    
    if ! command -v aws &> /dev/null; then
        warn "AWS CLI no instalado, saltando subida a S3"
        return 0
    fi
    
    aws s3 cp "$FILE" \
        "s3://${BACKUP_S3_BUCKET}/backups/${FILENAME}" \
        --endpoint-url "${BACKUP_S3_ENDPOINT}" \
        --no-progress
    
    log "✅ Subido: s3://${BACKUP_S3_BUCKET}/backups/${FILENAME}"
}

# ============================================================
# 5. LIMPIAR BACKUPS LOCALES ANTIGUOS
# ============================================================
cleanup_old_backups() {
    log "🧹 Limpiando backups locales antiguos (>${BACKUP_RETENTION_DAYS:-30} días)..."
    
    find "$BACKUP_DIR" -type f -mtime "+${BACKUP_RETENTION_DAYS:-30}" -delete
    
    log "✅ Limpieza completada"
}

# ============================================================
# 6. NOTIFICACIÓN (Slack/Discord webhook opcional)
# ============================================================
notify() {
    local STATUS=$1
    local MESSAGE=$2
    
    if [ -z "${BACKUP_WEBHOOK_URL:-}" ]; then
        return 0
    fi
    
    local EMOJI="✅"
    [ "$STATUS" = "error" ] && EMOJI="❌"
    
    curl -s -X POST "${BACKUP_WEBHOOK_URL}" \
        -H 'Content-type: application/json' \
        --data "{\"text\":\"${EMOJI} Backup ${PROJECT_NAME:-saas}: ${MESSAGE}\"}" \
        || true
}

# ============================================================
# MAIN
# ============================================================
main() {
    log "🚀 Iniciando backup completo de ${PROJECT_NAME:-saas}..."
    log "Timestamp: $TIMESTAMP"
    
    FAILED=0
    
    # PostgreSQL
    PG_FILE=$(backup_postgres) || { error "Falló backup PostgreSQL"; FAILED=1; }
    
    # n8n data
    N8N_FILE=$(backup_n8n_data) || { error "Falló backup n8n"; FAILED=1; }
    
    # Variables de entorno
    ENV_FILE=$(backup_env) || { error "Falló backup de .env"; FAILED=1; }
    
    # Subir a S3 (si está configurado)
    if [ "${BACKUP_S3_BUCKET:-}" != "" ]; then
        upload_to_s3 "$PG_FILE" || warn "Falló subida PostgreSQL a S3"
        upload_to_s3 "$N8N_FILE" || warn "Falló subida n8n a S3"
        upload_to_s3 "$ENV_FILE" || warn "Falló subida .env a S3"
    fi
    
    # Limpiar antiguos
    cleanup_old_backups
    
    if [ $FAILED -eq 0 ]; then
        log "🎉 Backup completo exitoso!"
        notify "success" "Backup completo exitoso - $TIMESTAMP"
    else
        error "⚠️  Backup completado con errores"
        notify "error" "Backup con errores - revisar logs - $TIMESTAMP"
        exit 1
    fi
}

main "$@"
