    # Contexto Técnico - Getxo Bela Eskola

    ## Stack
    - **Frontend:** Next.js 15 + React 19 + Tailwind CSS
    - **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
    - **Pagos:** Stripe (Checkout Sessions)
    - **i18n:** next-intl (es, eu, en, fr)
    - **Deploy:** Vercel (web) + Capacitor (mobile)
    - **Orquestación:** MCP Bridge en puerto 3323

    ## Dominios de Agentes

    | Agente | Dominio Permitido | Rama Prefijo | Notas |
    |--------|-------------------|--------------|-------|
    | **Jules** | `/src/app/api`, `/src/lib`, `/supabase` | `feature/jules-*` | Backend, APIs, DB |
    | **ClawdBot** | `/src/components`, `/messages`, `/public` | `feature/clawd-*` | UI, traducciones |
    | **Antigravity** | Coordinación, PRs, docs, `/project_memory` | - | No genera código pesado |

    ## Estructura Crítica
    ```
    src/
    ├── app/
    │   ├── api/          ← Jules
    │   └── [locale]/     ← Compartido (cuidado)
    ├── components/       ← ClawdBot
    ├── lib/              ← Jules
    ├── hooks/            ← Compartido (coordinar)
    └── types/            ← Compartido (coordinar)
    ```

    ## Reglas de Conflicto
    1. **Nunca** tocar archivos fuera de tu dominio sin aprobación en `GLOBAL_STATE.md`
    2. **Siempre** crear rama con tu prefijo antes de editar
    3. **Actualizar** `GLOBAL_STATE.md` al iniciar y terminar tarea
    4. Si dos agentes necesitan el mismo archivo → notificar por Telegram y esperar
    5. **Archivos compartidos** (`hooks/`, `types/`) → pedir permiso primero

    ## Variables de Entorno Clave
    - `NEXT_PUBLIC_SUPABASE_URL` - URL de Supabase
    - `STRIPE_SECRET_KEY` - Clave de Stripe
    - `TELEGRAM_BOT_TOKEN` - Bot de notificaciones
    - `JULES_API_KEY` - Acceso a Jules API

    ## Convenciones
    - Componentes: PascalCase, archivos `.tsx`
    - APIs: kebab-case en rutas
    - Commits: `tipo(scope): descripción` (ej: `fix(api): corregir checkout`)
    - Tests: colocados junto al archivo (`Component.test.tsx`)
