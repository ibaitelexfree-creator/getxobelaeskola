#!/bin/bash

# SWARM CI/CD 2.0 - Automated Backup Script
# Backs up Postgres database and Qdrant collections.

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/swarm_$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "🚀 Starting Swarm Backup: $TIMESTAMP"

# 1. Postgres Backup
echo "🐘 Backing up Postgres..."
if command -v pg_dump > /dev/null; then
    # Use DATABASE_URL from .env if possible, or default to swarm_db
    DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2)
    pg_dump "$DB_URL" > "$BACKUP_DIR/postgres_dump.sql"
    echo "✅ Postgres backup saved to $BACKUP_DIR/postgres_dump.sql"
else
    echo "⚠️ pg_dump not found. Skipping Postgres backup."
fi

# 2. Key Configuration Backup
echo "⚙️ Backing up environment and prompts..."
cp .env "$BACKUP_DIR/.env.bak"
cp -r src/prompts "$BACKUP_DIR/prompts" 2>/dev/null || cp -r ../prompts "$BACKUP_DIR/prompts"
echo "✅ Configuration backed up."

# 3. Qdrant Backup (Metadata only or snapshots if available)
echo "🔍 Backing up Qdrant metadata..."
# Note: Full Qdrant backup usually requires the Snapshots API.
# Here we just log the status for now.
curl -s http://localhost:6333/collections > "$BACKUP_DIR/qdrant_collections.json"
echo "✅ Qdrant collection list saved."

# 4. Compression
echo "📦 Compressing backup..."
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"

echo "🏁 Backup completed: $BACKUP_DIR.tar.gz"

# Optional: Prune old backups (> 7 days)
# find ./backups -name "swarm_*.tar.gz" -mtime +7 -delete
