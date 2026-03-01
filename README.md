# ⚓ Getxo Bela Eskola - Plataforma & Orquestador Swarm

Bienvenido al repositorio central de **Getxo Bela Eskola**, un ecosistema avanzado que combina una aplicación web para la gestión de la academia de navegación con un **Orquestador Multi-Agente (Swarm)** impulsado por RAG.

![Estado](https://img.shields.io/badge/Estado-Producci%C3%B3n-success.svg)
![Fase](https://img.shields.io/badge/Fase-12%20Completada-blue.svg)
![Lighthouse](https://img.shields.io/badge/Lighthouse-95%20%7C%20100%20%7C%20100-success.svg)

---

## 🏗️ Arquitectura del Ecosistema

El proyecto está dividido en dos grandes bloques funcionales que coexisten en el mismo repositorio pero tienen despliegues independientes:

### 1. 🌐 Aplicación Principal (Next.js + Supabase)
Aplicación para estudiantes y administradores que permite reserva de clases, seguimiento de bonos y control de la flota.
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI.
- **Backend/DB:** Supabase (PostgreSQL), Storage, Row Level Security (RLS).
- **Despliegue:** Vercel / Render.

### 2. 🧠 Orquestador Swarm & GlobalBrain (Node.js)
Un sistema backend autónomo (`/orchestration`) que coordina agentes de IA para ejecutar tareas complejas, revisar código y proporcionar contexto histórico.
- **Maestro:** Agente principal que desglosa tareas y las delega al enjambre.
- **GlobalBrain (RAG):** Motor vectorial basado en Qdrant (Dimension: 1024) con caché LRU. Inyecta contexto histórico de forma instantánea a los agentes (menos de 1ms de latencia).
- **Ejecutores:** `JulesExecutor` (Múltiples perfiles como UI, Data, Architect), `FlashExecutor` (Gemini Flash), y `ClawdeBotBridge` (Integración con modelos Claude).

---

## 🚀 Inicio Rápido (Local)

### Requisitos Previos
- Node.js 18+
- Docker (para correr Qdrant localmente si usas el Orquestador)
- Cuenta de Supabase

### Instalación de la Aplicación Web
1. Clonar el repositorio y entrar al directorio raíz.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno copiando `.env.example` a `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="tu_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="tu_service_role"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
4. Ejecutar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Iniciando el Orquestador (Opcional)
Para correr el Swarm localmente y usar características de RAG:
```bash
cd orchestration
npm install
# Levantar Qdrant local (si está configurado)
docker-compose up -d qdrant
# Iniciar el CLI / API del orquestador
npm start
```

---

## 🏆 Rendimiento & Vitals (Métricas Finales - Fase 11)

El portal ha sido rigurosamente auditado y optimizado con las siguientes puntuaciones (Core Web Vitals):
- ♿ **Accesibilidad:** 95 / 100
- ✨ **Buenas Prácticas:** 100 / 100
- 🔍 **SEO:** 100 / 100
- ⚡ **Performance:** 67 / 100 *(Optimizado con Lazy Loading en componentes interactivos pesados como 3D y Chatbots)*

El sistema RAG (`GlobalBrain`) opera con una latencia cacheada de **~0.08ms**, garantizando que el orquestador escale sin cuellos de botella en base de datos.

---

## 📚 Documentación Adicional

La documentación detallada está organizada en los siguientes documentos clave:
- [**ARCHITECTURE.md**](./ARCHITECTURE.md): Arquitectura detallada de alto nivel y del orquestador (MCP).
- [**AGENTS.md**](./AGENTS.md): Especificación de los perfiles y capacidades del Enjambre de Agentes.
- [**docs/PROGRESS.md**](./docs/PROGRESS.md): Historial de hitos y fases del proyecto.
- [**docs/GUIA_OPERATIVA_MULTI_AGENTE.md**](./docs/GUIA_OPERATIVA_MULTI_AGENTE.md): Manual operativo de cómo delegar tareas al Swarm.

---
*Desarrollado y mantenido autónomamente mediante Antigravity + Jules Integration.*
