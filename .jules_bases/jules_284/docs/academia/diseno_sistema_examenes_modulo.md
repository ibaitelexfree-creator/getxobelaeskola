# 🧬 DISEÑO TÉCNICO: SISTEMA DE EXÁMENES DE MÓDULO

> **Documento de Diseño Técnico** para la implementación de la lógica de exámenes, basado en `contenido_academico/curso1_examenes_modulos.md` y la infraestructura existente.

---

# 1️⃣ MODELO DE DATOS

El sistema de evaluaciones ya tiene una base sólida en la migración `003_academia_fase3_evaluacion.sql`. No necesitamos crear tablas nuevas radicalmente distintas, pero sí definir cómo se usarán para los exámenes de módulo.

## Tablas Principales

### 1. `preguntas` (Ya existe)
Almacenará las 60 preguntas del archivo markdown.
- **`entidad_id`**: Apuntará al ID del **Módulo** correspondiente, no a la unidad.
- **`entidad_tipo`**: `'modulo'`
- **`tipo_pregunta`**: `'opcion_multiple'`
- **`opciones_json`**: `[{"id": "a", "texto": "..."}, {"id": "b", "texto": "..."}]`
- **`respuesta_correcta`**: `"c"` (o el ID de la opción correcta)
- **`explicacion_es`**: Texto explicativo para el feedback posterior.

### 2. `evaluaciones` (Ya existe)
Definirá el "examen" en sí mismo como entidad.
- **`id`**: UUID único del examen.
- **`tipo`**: `'examen_modulo'`
- **`entidad_id`**: UUID del módulo al que pertenece.
- **`num_preguntas`**: `15`
- **`nota_aprobado`**: `70.00`
- **`tiempo_limite_min`**: `20`
- **`intentos_maximos`**: `3` (por periodo de cochera, ver lógica de negocio).
- **`aleatorizar_preguntas`**: `TRUE`
- **`aleatorizar_opciones`**: `TRUE`

### 3. `intentos_evaluacion` (Ya existe)
Registra cada ejecución de un examen por un alumno.
- **`preguntas_json`**: Array de UUIDs de las 15 preguntas seleccionadas aleatoriamente para ESE intento.
- **`respuestas_json`**: Mapa `pregunta_id -> respuesta_alumno`.
- **`estado`**: `'en_progreso'` | `'completado'` | `'abandonado'`
- **`puntuacion`**: 0-100.
- **`aprobado`**: `TRUE` / `FALSE`.

---

# 2️⃣ REGLAS DEL SISTEMA DE EVALUACIÓN

## Reglas de Negocio (Hard Constraints)

1.  **Nota Mínima:** 70% (10.5 puntos sobre 15).
    - < 10.5 aciertos = SUSPENSO.
    - >= 10.5 aciertos = APROBADO.

2.  **Tiempo Límite:** 20 minutos.
    - El backend debe rechazar respuestas enviadas significativamente después del tiempo límite (+ margen de latencia).

3.  **Selección de Preguntas:**
    - El banco de preguntas del módulo tiene 15 preguntas fijas por ahora en el diseño (se pueden añadir más en el futuro).
    - El sistema seleccionará `num_preguntas` (15) aleatorias de las disponibles para el módulo.
    - **Orden aleatorio:** Las preguntas aparecen en orden distinto cada vez.
    - **Opciones aleatorias:** Las respuestas A, B, C, D se barajan en el frontend (o backend antes de enviar).

4.  **Reintentos y Cooldowns:**
    - Máximo 3 intentos cada 24 horas.
    - Si falla 3 veces → Bloqueo del examen durante 24 horas (`cooldown`).
    - **Lógica:** Se consulta `intentos_evaluacion` filtrando por las últimas 24h.

5.  **Impacto en el Progreso:**
    - **Aprobar:**
        - Marca el módulo como COMPLETADO (si todas las unidades están leídas/aprobadas).
        - Desbloquea el siguiente módulo (lógica secuencial).
        - Otorga habilidad si corresponde (ej. Módulo 1 -> "Marinero de Agua Dulce").
    - **Suspender:**
        - Mantiene el módulo en estado `en_progreso`.
        - No desbloquea el siguiente módulo.
        - Consume 1 intento.

---

# 3️⃣ FLUJO COMPLETO DEL EXAMEN (Backend Workflow)

## A. Iniciar Examen (`POST /api/academy/evaluation/start`)

1.  **Validación Previa:**
    - ¿El usuario está autenticado?
    - ¿El módulo está desbloqueado? (Verificar prerrequisitos).
    - ¿Todas las unidades están completadas? (Requisito para examen de módulo).
    - ¿Tiene intentos disponibles? (Revisar regla de 3 intentos/24h).

2.  **Generación del Intento:**
    - Seleccionar 15 preguntas aleatorias de la tabla `preguntas` donde `entidad_id = modulo_id`.
    - Crear registro en `intentos_evaluacion` con `estado = 'en_progreso'`, `fecha_inicio = NOW()`.
    - Guardar los IDs de las preguntas en `preguntas_json`.

3.  **Respuesta al Cliente:**
    - Retornar el objeto del examen con las preguntas (SIN el campo `respuesta_correcta` ni `explicacion`).
    - Retornar el `intento_id`.

## B. Enviar Respuestas (`POST /api/academy/evaluation/submit`)

1.  **Recepción:**
    - Recibe `intento_id` y objeto de respuestas `{ pregunta_id: opcion_id }`.

2.  **Validación de Integridad:**
    - Verificar que el intento existe, pertenece al usuario y está `'en_progreso'`.
    - Verificar tiempo: `NOW() - fecha_inicio <= tiempo_limite + margen`. Si excede, marcar como completado forzoso o rechazar.

3.  **Cálculo (Motor de Calificación):**
    - Recuperar las preguntas originales de la BD.
    - Comparar respuestas del usuario con `respuesta_correcta`.
    - Calcular puntuación (ej. 12/15 = 80%).
    - Determinar `aprobado` (>= 70%).

4.  **Persistencia:**
    - Actualizar `intentos_evaluacion`:
        - `respuestas_json` = input del usuario.
        - `puntuacion` = nota calculada.
        - `aprobado` = true/false.
        - `estado` = `'completado'`.
        - `fecha_completado` = NOW().

5.  **Side Effects (Triggers de Lógica):**
    - **Si APROBADO:**
        - Invocar `actualizar_progreso_modulo(alumno_id, modulo_id)`.
            - Verifica si cumple todo para cerrar módulo.
            - Marca módulo completado en `progreso_alumno`.
            - Dispara `verificar_desbloqueos(alumno_id)`.

6.  **Respuesta al Cliente:**
    - Retornar `nota`, `aprobado` y el objeto de corrección completo (ahora SÍ incluye `respuesta_correcta` y `explicacion` para revisión).

---

# 4️⃣ INTEGRACIÓN CON EL SISTEMA ACADÉMICO

## Tablas y Funciones Clave

-   **`progreso_alumno`**:
    -   Se añade columna (o se usa JSONB existente) para rastrear que el examen de módulo ha sido aprobado.
    -   La lógica de "Módulo Completado" ahora es: `(Unidades Completadas == Total Unidades) AND (Examen Módulo Aprobado == TRUE)`.

-   **`verificar_desbloqueos_dependencias()`**:
    -   Esta función PL/pgSQL (del motor de desbloqueo Fase 6) debe ser llamada tras un aprobado.
    -   Revisará si el siguiente módulo puede pasar a `disponible`.

-   **Endpoint `/api/academy/unlock-status`**:
    -   Debe reflejar el estado actualizado inmediatamente. El frontend revalidará SWR/React Query tras el submit.

---

# 5️⃣ SEGURIDAD E INTEGRIDAD

## Vectores de Ataque y Mitigación

1.  **Ver Respuestas en Frontend:**
    -   **Prevención:** El endpoint `/start` NUNCA envía el campo `respuesta_correcta` al cliente. Solo se envía tras el `/submit`.

2.  **Manipulación de Tiempo:**
    -   **Riesgo:** Cliente modifica el reloj local o intercepta la petición para ganar tiempo infinito.
    -   **Prevención:** El servidor confía solo en su `NOW()`. Al hacer submit, calcula `NOW() - fecha_inicio_db`. Si es > 20min (+1 min gracia), el examen se marca como no válido o se penaliza.

3.  **Fuerza Bruta (Reintentos Infinitos):**
    -   **Prevención:** Lógica de cooldown estricta en base de datos. Antes de crear un intento, contar intentos recientes.

4.  **Respuestas Fake:**
    -   **Prevención:** Validar que las IDs de preguntas en el submit coinciden con las guardadas en `preguntas_json` del intento generado.

5.  **Aprobar sin hacer el examen:**
    -   **Prevención:** El progreso académico solo se actualiza mediante la función segura que verifica la existencia de un registro `intentos_evaluacion` con `aprobado = true`. No hay endpoint directo `markModuleAsComplete`.

---
