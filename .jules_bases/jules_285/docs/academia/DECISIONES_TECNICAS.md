# 🧠 DECISIONES TÉCNICAS — Getxo Bela Eskola
## Registro de decisiones arquitectónicas importantes

---

## Formato de cada decisión

> **DT-XX:** Título de la decisión
> - **Fecha:** cuándo se tomó
> - **Contexto:** por qué surgió
> - **Decisión:** qué se decidió
> - **Alternativas descartadas:** qué se consideró y por qué no
> - **Consecuencias:** qué implica para el futuro

---

## DT-01: Supabase como BaaS único

- **Fecha:** 2026-02-09
- **Contexto:** Se necesitaba autenticación, base de datos y almacenamiento.
- **Decisión:** Usar Supabase para todo (Auth, PostgreSQL, Storage, RLS).
- **Alternativas descartadas:** Firebase (no SQL), Auth0 + Prisma (complejidad innecesaria).
- **Consecuencias:** Toda la lógica de permisos se gestiona con RLS en PostgreSQL. No hay ORM; se usan queries directas via el cliente de Supabase.

---

## DT-02: Progreso basado en desempeño, no en tiempo

- **Fecha:** 2026-02-11
- **Contexto:** Diseñar cómo avanza un alumno por el contenido.
- **Decisión:** El contenido se desbloquea SOLO por resultados reales (quiz aprobado + secciones leídas + tiempo mínimo). No se puede avanzar sin aprobar.
- **Alternativas descartadas:** Desbloqueo por tiempo ("espera 24h"), desbloqueo por pago, progreso libre sin restricciones.
- **Consecuencias:** Cada alumno avanza a su ritmo. El sistema necesita un motor de evaluación y desbloqueo robusto.

---

## DT-03: La mejor nota se guarda siempre

- **Fecha:** 2026-02-11
- **Contexto:** ¿Qué nota se guarda si un alumno repite un quiz?
- **Decisión:** Se guarda siempre la nota más alta. El progreso nunca baja.
- **Alternativas descartadas:** Guardar la última nota (penaliza reintentos), media de todas las notas (desincentiva practicar).
- **Consecuencias:** Los alumnos pueden practicar sin miedo a bajar su nota.

---

## DT-04: Niveles transversales (Seguridad y Meteorología)

- **Fecha:** 2026-02-11
- **Contexto:** Los niveles 6 y 7 no son secuenciales con los niveles 3-5.
- **Decisión:** Seguridad y Meteorología solo requieren completar el Nivel 2 (Perfeccionamiento). No requieren Vela Ligera ni Crucero.
- **Alternativas descartadas:** Hacerlos estrictamente secuenciales (obligaría a un navegante de crucero a competir en regatas).
- **Consecuencias:** Hay que implementar lógica de desbloqueo diferenciada para niveles transversales vs. secuenciales.

---

## DT-05: Contenido bilingüe obligatorio (ES + EU)

- **Fecha:** 2026-02-09
- **Contexto:** La escuela opera en País Vasco.
- **Decisión:** Toda columna de texto tiene pares `_es` y `_eu`. Sin excepciones.
- **Alternativas descartadas:** Solo español, i18n con JSON externo.
- **Consecuencias:** Cada seed, cada migración y cada API debe contemplar ambos idiomas.

---

## DT-06: 14 fases de implementación independientes

- **Fecha:** 2026-02-11
- **Contexto:** El sistema es demasiado grande para implementar de golpe.
- **Decisión:** Dividir en 14 fases con dependencias explícitas. Cada fase produce un entregable verificable.
- **Alternativas descartadas:** Implementar todo junto ("big bang"), dividir por capas (todo el backend → todo el frontend).
- **Consecuencias:** Se puede asignar cada fase a un agente distinto. Cada fase tiene criterios de verificación claros.

---

## DT-07: Desbloqueo Secuencial Global con Trigger

- **Fecha:** 2026-02-11
- **Contexto:** Se necesitaba una forma de desbloquear niveles interdependientes (Nivel 6 depende de Nivel 2) y asegurar que el progreso fluya correctamente sin intervención manual. La lógica "siguiente + 1" no servía para desbloqueos transversales.
- **Decisión:** Implementar un trigger `verificar_desbloqueos_dependencias` que se ejecuta cada vez que algo se completa. Este trigger revisa TODOS los niveles y cursos y desbloquea los que cumplen sus prerrequisitos.
- **Alternativas descartadas:** Verificar solo el "siguiente" (falla con dependencias no lineales), calcular en frontend (inseguro y propenso a errores), batch jobs nocturnos (lento para el alumno).
- **Consecuencias:** El desbloqueo es inmediato y robusto. Si se añaden nuevos prerrequisitos en la DB, el sistema los respeta automáticamente. Requiere que la función PL/PGSQL sea eficiente.

---

## Cómo añadir una nueva decisión

Copia la plantilla, numera como DT-XX, y documenta contexto, decisión, alternativas y consecuencias. Las decisiones son inmutables (no se borran) pero se pueden marcar como **REEMPLAZADA POR DT-XX** si cambia algo.
