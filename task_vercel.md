# Tarea: Migración Frontend a Vercel + CI/CD Android ✅ (COMPLETO)
# Tarea: Fase 4 - Redundancia n8n en Fly.io ✈️ (EN CURSO)

## Sub-tareas
- [x] Configurar `/infra` para que el VPS solo maneje el Backend.
- [x] Crear nuevo workflow para el Orquestador en el VPS.
- [x] Adaptar procesos de despliegue.
- [ ] Implementar redundancia n8n en Fly.io.
    - [x] Generar `fly.toml` con configuración de regiones (Madrid + París).
    - [x] Crear script de despliegue para Windows (`fly-deploy.ps1`).
    - [ ] Ejecutar despliegue inicial y escalado.
- [ ] Configurar failover de DNS en Cloudflare (Fase 5).

## Notas
- El Frontend se desplegará automáticamente por Vercel al detectar pushes en `main`.
- El Orquestador y n8n seguirán en el VPS de Hostinger.
- Los Backups seguirán funcionando en el VPS hacia Cloudflare R2.
