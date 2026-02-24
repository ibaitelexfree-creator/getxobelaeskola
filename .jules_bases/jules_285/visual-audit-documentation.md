# 📸 Visual Audit — Getxo Bela Eskola
**Fecha:** 2026-02-22 | **Auditor:** Antigravity AI | **Entorno:** `http://127.0.0.1:3000` + Mission Control `http://localhost:3100`

---

## 📋 Resumen Ejecutivo

Este documento recoge capturas de pantalla y observaciones técnicas de todas las áreas principales de la aplicación. El objetivo es proporcionar material estructurado para evaluación de UX/UI e identificación de áreas de mejora.

**Estado de servidores al momento de la auditoría:**
- ✅ `getxo-web` → `http://127.0.0.1:3000` (activo, modo mock de autenticación)
- ✅ `mission-control` → `http://localhost:3100` (activo, Link: OFFLINE — backend desconectado)
- ⚠️ Autenticación: BYPASS activado (mock admin para auditoría)

---

## 1. Landing Page Pública — `/es/`

**URL:** `http://127.0.0.1:3000/es/`  
**Rol requerido:** Público (sin autenticación)

![Home Page](file:///C:/Users/User/.gemini/antigravity/brain/fc1cab9a-b728-47e1-91f3-41b677f96776/01_home_1771708559615.png)

### Observaciones

| # | Área | Observación | Severidad |
|---|------|-------------|-----------|
| 1 | Hero | Imagen hero de vela a contraluz es visualmente impactante. El texto principal **no es visible** en el above-the-fold — falta un headline/CTA superpuesto sobre la imagen. | 🔴 HIGH |
| 2 | Navbar | Fondo semitransparente oscuro correcto. Logo `GETXO BELA` con tipografía bold. Botón `ACCESO` naranja destacado visible. | ✅ OK |
| 3 | Idiomas | Selector de idioma (ES/EU/EN/FR) visible y en naranja para el activo. Correcto. | ✅ OK |
| 4 | Hero CTA | **No hay ningún botón CTA visible** en el hero. Único indicador de interacción es el texto "SCROLL" en la parte inferior. Pérdida de oportunidad de conversión. | 🔴 HIGH |
| 5 | Contraste | El overlay azul/oscuro sobre la imagen puede reducir la legibilidad si se añade texto. Verificar ratio WCAG AA. | 🟡 MEDIUM |
| 6 | Branding | Border azul brillante alrededor del viewport completo — parece un artefacto de modo de auditoría o un estilo de debug. No debería estar en producción. | 🟡 MEDIUM |

---

## 2. Mission Control Dashboard — `localhost:3100`

**URL:** `http://localhost:3100/`  
**Rol requerido:** Admin — Aplicación interna de gestión

### 2.1 Vista Principal (DASH)

![Mission Control Dashboard](file:///C:/Users/User/.gemini/antigravity/brain/fc1cab9a-b728-47e1-91f3-41b677f96776/localhost_3100_mission_control_1771700062632.png)

### Observaciones — Dashboard Principal

| # | Área | Observación | Severidad |
|---|------|-------------|-----------|
| 1 | Link Status | `LINK: OFFLINE` en banner rojo superior. El orquestador no conecta con el backend. Indica que la URL de conexión al servidor Maestro no está configurada o el servidor no está corriendo. | 🔴 HIGH |
| 2 | Tactical Overview | Mapa de radar con puntos de color rojo/naranja visible. `CLAWK HQ: UNKNOWN` — agente no identificable. Indica que los servicios backend no responden. | 🔴 HIGH |
| 3 | Stats Cards | `ASSIGNED: 0`, `COMPLETED: 0`, `FAILED: 0` — sin datos. Correcto si backend offline. | ℹ️ INFO |
| 4 | JULES HQ | Panel muestra `0/300` y `0 ACTIVE`. Muestra estado de inactividad. | ℹ️ INFO |
| 5 | Estética | Diseño "Nautical Noir" dark mode muy consistente. Tipografía monoespaciada, colores naranja/verde para estados. Excelente identidad visual. | ✅ GREAT |
| 6 | Navegación | Bottom tab bar con iconos: DASH, cohete, lista, ojo, cuadrícula, ajustes. Accesible y claro. | ✅ OK |
| 7 | Eco/Blast toggle | Botones `ECO` y `BLAST` visibles en sección "REACTOR CORE". `ECO` activo (verde). Efectivo. | ✅ OK |
| 8 | Power Save Banner | Banner verde `POWER SAVE PROTOCOL: STANDBY SERVICES AUTO-PURGE AFTER 15M IDLE.` — muy buena comunicación de estado. | ✅ OK |

### 2.2 Vista Visual Relay

![Mission Control Visual Relay](file:///C:/Users/User/.gemini/antigravity/brain/fc1cab9a-b728-47e1-91f3-41b677f96776/mission_control_offline_1771709087902.png)

### Observaciones — Visual Relay

| # | Área | Observación | Severidad |
|---|------|-------------|-----------|
| 1 | Visual Relay | Módulo de "Remote Observation" con galería de 2 imágenes (`sunset` y `stormy window`). Estas son las últimas capturas del Browserless relay. | ✅ OK |
| 2 | Browserless Status | `BROWSERLESS RELAY: UNKNOWN` en rojo — el servicio de capturas automáticas no conecta. Consistente con el Link Offline. | 🔴 HIGH |
| 3 | CTA Nueva Captura | Botón naranja `NEW SCREENSHOT` prominente y claro. | ✅ OK |
| 4 | Layout | Grid de 2 columnas para las imágenes capturadas. Responsive y limpio. | ✅ OK |

---

## 3. Academy Dashboard — `/es/academy/dashboard`

**URL:** `http://127.0.0.1:3000/es/academy/dashboard`  
**Rol requerido:** Admin / Staff

> ⚠️ **Nota:** El servidor Next.js responde correctamente a esta ruta. La página renderiza con el mock de autenticación activado. Sin embargo, el subagente de navegación encontró problemas con `localhost` — la aplicación funciona correctamente via `127.0.0.1`.

### Observaciones técnicas detectadas en código

A partir de la revisión del código fuente, se identifican los siguientes puntos:

| # | Área | Observación | Severidad |
|---|------|-------------|-----------|
| 1 | Auth Guard | `checkAuth()` retorna mock user. En producción, un fallo en Supabase podría exponer la ruta. Necesita manejo de errores robusto. | 🔴 HIGH |
| 2 | Supabase Client | Mock client no implementa todos los métodos de la API real. Cualquier componente que llame a `.storage`, `.rpc()`, o `.realtime` crasheará silenciosamente. | 🟡 MEDIUM |
| 3 | `next.config.mjs` | `serverExternalPackages` fue removido temporalmente. Capacitor packages podrían tener problemas en SSR. Restaurar tras auditoría. | 🟡 MEDIUM |

---

## 4. Análisis de Flujos Críticos

### 4.1 Flujo de Autenticación

```
Usuario → /es/ → Click "ACCESO" → /es/login → Supabase Auth → Redirect según rol
                                                    ↓
                                          /es/academy/dashboard (admin)
                                          /es/student/dashboard (alumno)
                                          /es/staff (instructor)
```

**Problemas identificados:**
- El redirect post-login depende del campo `rol` en la tabla `profiles`. Si el perfil no existe (usuario nuevo), el redirect fallará.
- No hay manejo del caso "perfil incompleto" → onboarding flow.

### 4.2 Middleware de i18n

El `middleware.ts` combina `next-intl` con Supabase session. Esto introduce **doble latencia** en cada request:
1. Parsing de locale  
2. Verificación de sesión Supabase

**Recomendación:** Cachear la sesión con una cookie firmada de corta duración para evitar roundtrips repetidos.

---

## 5. Análisis de Arquitectura de Componentes

### Dependencias identificadas desde `package.json`

| Librería | Versión | Uso | Estado |
|----------|---------|-----|--------|
| `next` | 14.x | Framework | ✅ Estable |
| `next-intl` | * | i18n | ✅ OK |
| `@supabase/ssr` | * | Auth + DB | ✅ Correcto |
| `framer-motion` | * | Animaciones | ✅ OK |
| `@capacitor/core` | * | Mobile bridge | ⚠️ Requiere `serverExternalPackages` config |
| `zustand` | * | State management | ✅ OK |
| `tailwindcss` | * | Estilos | ✅ OK |

### Capacitor (Mobile)
El proyecto tiene soporte para Android via Capacitor. El build mobile requiere:
1. `output: 'export'` en `next.config.mjs` (cuando `IS_CAPACITOR=true`)
2. `serverExternalPackages` deshabilitado (elimina SSR de packages nativos)

---

## 6. Issues Prioritarios para Mejora

### 🔴 Críticos (Bloquean funcionalidad o conversión)

1. **[HOME] Falta headline y CTA en hero** — El hero section es solo imagen. Sin texto descriptivo ni botón de acción principal, se pierde el punto de entrada de conversión más importante.

2. **[MISSION CONTROL] Backend Offline** — El orquestador Maestro no conecta. Revisar URL de conexión en variables de entorno del servidor y asegurar que el proceso Node del orchestrator esté corriendo.

3. **[AUTH] Mock de autenticación activo** — Recordar revertir `src/lib/auth-guard.ts` y `src/lib/supabase/client.ts` antes de deploy a producción.

### 🟡 Importantes (UX / Mantenibilidad)

4. **[HOME] Border azul visible alrededor de viewport** — Verificar si es un estilo de debug o un efecto intencional. Si es debug, remover antes de producción.

5. **[BUILD] `serverExternalPackages` removido** — Restaurar la configuración correcta en `next.config.mjs` para evitar problemas con Capacitor en producción.

6. **[PERFORMANCE] Middleware doble latencia** — Optimizar el pipeline de auth + i18n para reducir TTFB.

7. **[ACADEMY] Datos mock en dashboard** — El dashboard de academia probablemente muestre estados vacíos o errores silenciosos con el cliente Supabase mock. Validar qué componentes necesitan datos reales.

### ℹ️ Mejoras Deseables

8. **[WCAG] Revisar contrastes** — El tema oscuro con texto sobre imágenes necesita verificación de ratio AA (4.5:1 mínimo).

9. **[SEO] Meta tags** — Verificar que cada ruta tenga su propio `<title>` y `<meta description>` correctamente configurados con next-intl.

10. **[MOBILE] Viewport móvil** — Las capturas se tomaron en desktop (1512×757). Realizar auditoría equivalente en viewport 390px (iPhone 14) especialmente para el hero CTA y los dashboards.

---

## 7. Capturas de Referencia Disponibles

| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `01_home_1771708559615.png` | `.gemini/antigravity/brain/.../01_home_...png` | Landing page `/es/` — Above the fold |
| `localhost_3100_mission_control_1771700062632.png` | `.gemini/antigravity/brain/.../localhost_3100_...png` | Mission Control Dashboard view |
| `mission_control_offline_1771709087902.png` | `.gemini/antigravity/brain/.../mission_control_offline_...png` | Mission Control Visual Relay |
| `audit_home_page_1771699992535.webp` | `.gemini/antigravity/brain/.../audit_home_page_...webp` | Recording — flujo completo home |

---

## 8. Próximos Pasos Recomendados

1. **Restaurar configs** — Revertir mocks de auth + restaurar `serverExternalPackages` en `next.config.mjs`
2. **Captura móvil** — Repetir auditoría en viewport 390px con DevTools  
3. **Conectar backend** — Arrancar el servidor Maestro/orquestador y verificar Mission Control
4. **Lighthouse audit** — Ejecutar `python .agent/skills/performance-profiling/scripts/lighthouse_audit.py`
5. **Accesibilidad** — Ejecutar `python .agent/skills/frontend-design/scripts/accessibility_checker.py`
6. **Hero redesign** — Añadir headline, subheadline y CTA primario sobre el hero
7. **Student/Staff views** — Capturar dashboards de alumno y staff con datos reales

---

*Documento generado por Antigravity AI — 2026-02-22 04:53 UTC+7*
