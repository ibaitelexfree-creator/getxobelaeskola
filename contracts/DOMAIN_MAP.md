# 🗺️ DOMAIN MAP — AI Software Factory

Este archivo define la propiedad de las carpetas y archivos para cada agente del Swarm. El CI/CD utilizará este mapa para validar PRs y el Orchestrator para despachar tareas.

---

## 🏛️ Jules 1: Lead Architect
**Email:** getxobelaeskola@gmail.com
**Folders:**
- `/contracts/` (Source of Truth)
- `/.jules/` (Configuración del Swarm)
- `/.github/workflows/` (CI/CD Pipelines)
- `/.agent/` (Instrucciones del Agente)
- `/docs/ARCHITECTURE.md`
- `package.json`, `tsconfig.json`, `next.config.mjs`

---

## 🗄️ Jules 2: Data Master
**Email:** ibaitnt@gmail.com
**Folders:**
- `/supabase/` (Migraciones, RLS, Seed)
- `/src/lib/supabase/` (Clientes y Helpers)
- `/src/app/api/` (Endpoints y Lógica de Negocio)
- `/src/types/db.ts` (Generado por Supabase)
- `/monitoring/` (Alertas de salud)

---

## 🎨 Jules 3: UI Engine
**Email:** ibaitelexfree@gmail.com
**Folders:**
- `/src/components/` (UI Library)
- `/src/app/` (Excepto `/api/`)
- `/public/` (Assets estáticos)
- `/src/styles/` (CSS/Tailwind)
- `/messages/` (i18n)

---

## 🛡️ Reglas de Validación
1. **Zero Overlap:** Un Jules no debe pushear cambios en carpetas de otro sin aprobación explícita.
2. **Contract First:** Jules 2 y 3 solo pueden implementar lo definido en `/contracts/`.
3. **Cross-Check:** Jules 1 (Lead Architect) tiene permisos de escritura en TODO el repo únicamente para **Auto-Fix** de CI.
