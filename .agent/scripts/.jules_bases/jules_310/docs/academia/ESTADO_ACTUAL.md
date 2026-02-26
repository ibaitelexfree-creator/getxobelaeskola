# 📊 ESTADO ACTUAL — Getxo Bela Eskola
## Última actualización: 2026-02-11

---

## Resumen rápido

| Componente | Estado | Detalle |
|-----------|--------|---------|
| Estructura BD (niveles, cursos, módulos, unidades) | ✅ Completo | 3 migraciones ejecutadas |
| Seed Curso 1 (12 unidades en BD) | ✅ Completo | Mediante `populate_academy.js` |
| Contenido 12 unidades (markdown) | ✅ Completo | `curso1_unidades_4_a_12.md` |
| 200 preguntas (markdown) | ✅ Completo | 4 archivos `parte1-4.md` |
| 10 casos prácticos (markdown) | ✅ Completo | `curso1_casos_practicos.md` |
| APIs básicas academia | ✅ Completo | progress, evaluation, course, module, unit |
| Páginas frontend academia | ✅ Completo | academy, course, module, unit, level |
| Seed 200 preguntas en BD | ✅ Completo | FASE 1 y 5 completadas |
| Seed evaluaciones (quizzes/exámenes) | ✅ Completo | FASE 2 y 5 completadas |
| Motor progreso: completado unidad | ✅ Completo | Propagación manual + RPC |
| Motor progreso: propagación cascada | ✅ Completo | Fallback TS + RPC recalcular_progreso |
| Cooldowns y reintentos | ✅ Completo | FASE 5: APIs con lógica de tiempo y ventana |
| Motor desbloqueo | ✅ Completo | Migración 005 + API unlock-status |
| Motor habilidades (lógica) | ✅ Completo | FASE 7: Migración 006 + API skills + Trigger + RPC |
| Motor logros (lógica) | ✅ Completo | FASE 8 (30 logros + rachas) |
| Motor certificados | ✅ Completo | FASE 9: Refactor Migración 016 + Lógica Capitán + Verificación Hash |
| Frontend con progreso | ✅ Completo | FASE 10 |
| Quiz con timer | ✅ Completo | FASE 11 (useEvaluation + UI) |
| Dashboard alumno | ✅ Premium | FASE 12 (Racha, Ranking, Bitácora) |
| Animaciones/notificaciones | ✅ Completo | FASE 13 (Toasts, Modales, Mensajes) + Integración con APIs |
| Certificados PDF | ✅ Completo | FASE 14 (PDF + QR + Verificación Pública) |
| Hardening y Auditoría | ✅ Completo | FASE 15: RLS restringido en preguntas, RPCs definitores, validación lecturas en /start y bypass en /update |

---

## Archivos clave del proyecto

### Base de datos
- `supabase/migrations/001_academia_fase1_niveles.sql` — 7 niveles, módulos, unidades
- `supabase/migrations/002_academia_fase2_progreso.sql` — Progreso, habilidades, logros, horas, certificados
- `supabase/migrations/003_academia_fase3_evaluacion.sql` — Preguntas, evaluaciones, intentos
- `scripts/populate_academy.js` — Script maestro para cargar preguntas y estructura.

### APIs (`src/app/api/academy/`)
- `progress/route.ts` — GET progreso completo del alumno
- `progress/update/route.ts` — POST actualizar progreso
- `evaluation/start/route.ts` — POST iniciar evaluación (con cooldowns)
- `evaluation/submit/route.ts` — POST enviar respuestas (con propagación)
- `course/[slug]/route.ts` — GET detalle de curso

---

## Próxima fase a implementar

**PROYECTO ACADÉMICO v2.0 — FINALIZADO**
 
 Todas las fases planificadas (1-15) han sido implementadas. 
 El sistema está listo para QA intensivo y despliegue.

Ver `PLAN_IMPLEMENTACION_FASES.md` para detalles.
Ver `TAREA_ACTUAL.md` para lo que se está haciendo en este momento.
