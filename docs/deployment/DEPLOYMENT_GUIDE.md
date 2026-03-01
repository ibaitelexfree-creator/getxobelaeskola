# 🚀 Deployment Guide - Ecosistema Getxo Bela Eskola

Esta guía consolida el despliegue del ecosistema completo: la **Aplicación Principal (Next.js)** y el **Orquestador Swarm (Node.js)** junto con su motor RAG.

---

## 🏗️ 1. Despliegue de la Aplicación Next.js (Frontend & Supabase)

La aplicación principal está diseñada para ser desplegada en **Vercel** o plataformas compatibles con Edge/Serverless.

### Requisitos Vercel & Supabase
1. **Crear Proyecto Supabase**: Configurar la base de datos de producción y aplicar las migraciones (`supabase/migrations`).
2. **Variables de Entorno Vercel**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Requerida para webhooks y scripts admin)
   - `NEXT_PUBLIC_APP_URL` (URL de producción, p.ej. https://getxobelaeskola.cloud)
3. **Poblar la Base de Datos (Seeding)**: Ejecutar en orden los seeds:
   - `FINAL_SEED_CURSO1.sql`
   - `004_skills_catalog.sql`
   - `005_logros_catalog_v2.sql`
4. **Almacenamiento (Storage)**: Asegurar que los buckets `avatars`, `course-images` y `certificates` están en público.

---

## 🧠 2. Despliegue del Orquestador Swarm (Backend Node.js & Qdrant)

El orquestador de agentes de IA y su GlobalBrain residen en la carpeta `/orchestration`. Su entorno natural de producción es **Render.com**, **Railway**, o un VPS con **Docker**.

### Configuración del VPS/Docker (Recomendado)
El stack requiere Node.js y un contenedor Qdrant para la Base Vectorial (RAG).

1. **Clonar e Iniciar**:
   ```bash
   cd orchestration
   docker-compose up -d qdrant  # Inicia Qdrant Vector DB
   npm install --production
   ```

2. **Variables de Entorno (.env en /orchestration)**:
   - Claves de LLMs: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`
   - Configuración MCP: `QDRANT_URL=http://localhost:6333`
   - Claves de Integración: Supabase, Stripe, etc. que requieran los agentes.

3. **Autostart (PM2 / Systemd)**:
   ```bash
   npm install -g pm2
   pm2 start index.js --name "gbe-swarm"
   pm2 save
   ```

4. **Reglas de Red**: Asegurarse de abrir los puertos para Mission Control (API por defecto 3000 o 3323) si va a ser consultado externamente, aplicando validación de tokens o IP whitelisting.

---

## ⚡ 3. Documentación de APIs Core (Mission Control)

El sistema expone endpoints clave tanto en Next.js como en el Orquestador para comunicación inter-servicios y monitoreo.

### API de Next.js (Supabase Sync & Pagos)
Las APIs Serverless manejan lógica transaccional:
- `POST /api/webhooks/stripe`: Gestión asíncrona de pagos de bonos y subscripciones.
- `GET /api/dashboard/stats`: Consumo SSR del dashboard del estudiante.

### API del Orquestador (Swarm Control)
Si se habilita el puerto HTTP en `index.js`, el orquestador expone:
- `GET /status`: Healthcheck de los agentes (Jules, Flash, ClawdeBot) y conexión Qdrant.
- `POST /evaluate`: Endpoint MCP para inyectar tareas priorizadas al Swarm externamente.

---

## 🚨 4. Troubleshooting & Mantenimiento

- **Latencia Elevada en el Orquestador**: Verificar que `GlobalBrain` no esté agotando la memoria caché LRU (por defecto 500 ítems).
- **Fallos en Qdrant**: Los ejecutores RAG tienen callbacks de gracia (`fallback: direct prompt`) si Qdrant cae, el sistema seguirá operando pero perdiendo contexto histórico. Revisar `docker logs <qdrant_container>`.
- **Desincronización Vercel/Node**: Asegurar siempre que `NEXT_PUBLIC_APP_URL` esté correctamente enlazado para los correos y webhooks.
