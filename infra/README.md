# 🚀 SaaS Infrastructure Kit
### Reutilizable para cualquier proyecto · One-Click Deploy

> Base de infraestructura profesional con n8n, PostgreSQL, Redis, backups automáticos y redundancia en Fly.io

---

## 📁 Estructura

```
infra/
├── docker-compose.yml      # Stack completo
├── Caddyfile               # SSL automático
├── .env.example            # Variables (copia a .env)
├── fly/
│   └── fly.toml            # Config Fly.io (auto-generado)
├── scripts/
│   ├── deploy.sh           # 🚀 Deploy menú interactivo
│   ├── backup.sh           # 💾 Backup completo
│   └── fly-deploy.sh       # ✈️ Deploy en Fly.io
├── backups/                # Backups locales (git-ignored)
└── .github/workflows/
    ├── deploy.yml          # CI/CD automático
    └── backup.yml          # Backup diario automático
```

---

## ⚡ Quick Start

### 1. Configurar variables
```bash
cp .env.example .env
nano .env  # Rellena todos los valores
```

### 2. Generar claves seguras
```bash
# Genera N8N_ENCRYPTION_KEY y N8N_JWT_SECRET
openssl rand -hex 32
openssl rand -hex 32
```

### 3. Deploy con un click
```bash
chmod +x scripts/*.sh
./scripts/deploy.sh
# → Elige opción 1 (Deploy completo)
```

### O directo sin menú:
```bash
./scripts/deploy.sh full      # Deploy completo
./scripts/deploy.sh n8n       # Solo actualizar n8n
./scripts/deploy.sh backup    # Hacer backup ahora
./scripts/deploy.sh status    # Ver estado
./scripts/deploy.sh fly       # Deploy en Fly.io
./scripts/deploy.sh stop      # Parar todo
```

---

## 💾 Plan de Backups

| Qué | Cuándo | Dónde | Retención |
|-----|--------|-------|-----------|
| PostgreSQL (n8n DB) | Diario 2AM | S3/R2 + Local | 30 días |
| n8n data (workflows) | Diario 2AM | S3/R2 + Local | 30 días |
| Variables de entorno | Diario 2AM | S3/R2 (encriptado) | 90 días |
| Supabase | Automático | Supabase (plan pro) | 7 días |

### Configurar backup automático (cron):
```bash
# Añadir al crontab del servidor
crontab -e

# Backup diario a las 2AM
0 2 * * * /opt/infra/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### Restaurar backup:
```bash
./scripts/deploy.sh restore
# O directo:
./scripts/deploy.sh
# → Elige opción 6 (Restaurar backup)
```

---

## ✈️ Redundancia con Fly.io

### Arquitectura:
```
Internet
    │
    ▼
Cloudflare (DNS + SSL)
    │
    ├──→ Hostinger (Madrid) ← PRIMARY
    │         n8n + Worker + DB
    │
    └──→ Fly.io MAD + CDG   ← FAILOVER
              n8n + Worker
              (comparte DB con Hostinger vía connection string)
```

### Deploy en Fly.io:
```bash
# Primera vez
./scripts/deploy.sh fly
# → Opción 1 (crear app)

# Actualizaciones
./scripts/deploy.sh fly  
# → Opción 2 (actualizar)
```

---

## 🔧 GitHub Secrets necesarios

Configura estos secrets en tu repo → Settings → Secrets:

| Secret | Descripción |
|--------|-------------|
| `SERVER_HOST` | IP de Hostinger |
| `SERVER_USER` | Usuario SSH |
| `SERVER_SSH_KEY` | Clave SSH privada |
| `N8N_HOST` | Dominio de n8n |
| `BACKUP_S3_BUCKET` | Nombre del bucket |
| `BACKUP_S3_ACCESS_KEY` | Access key S3 |
| `BACKUP_S3_SECRET_KEY` | Secret key S3 |
| `BACKUP_S3_ENDPOINT` | Endpoint S3/R2/B2 |
| `FLY_API_TOKEN` | Token de Fly.io |
| `FLY_APP_NAME` | Nombre app en Fly.io |
| `SLACK_WEBHOOK` | Webhook notificaciones (opcional) |

---

## 🔄 Reutilizar para otro proyecto

1. Copia esta carpeta `infra/` a tu nuevo proyecto
2. Cambia `PROJECT_NAME` en `.env`
3. Actualiza el dominio en `Caddyfile`
4. Ejecuta `./scripts/deploy.sh full`

¡Listo! Nueva instancia en ~5 minutos.

---

## 📊 Stack incluido

- **n8n** - Orquestador (editor + workers en Queue Mode)
- **PostgreSQL 15** - Base de datos de n8n
- **Redis 7** - Cola de trabajos (Queue Mode)
- **Caddy** - Reverse proxy con SSL automático
- **Backups** - Automáticos a S3/R2/B2
- **Fly.io** - Redundancia en 2 regiones (opcional)
- **GitHub Actions** - CI/CD + backups automáticos
