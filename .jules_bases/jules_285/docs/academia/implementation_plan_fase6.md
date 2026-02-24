# 🗺️ PLAN DE IMPLEMENTACIÓN — Fase 6: Motor de Desbloqueo Secuencial

## Objetivo
Implementar el motor central que gestiona la disponibilidad y el desbloqueo secuencial (Unit N -> Unit N+1) y dependiente (Level A -> Level B) de todo el contenido académico, asegurando que los alumnos progresen según las reglas establecidas.

## 1. Cambios en Base de Datos (Migración 005)

### Funciónd `verificar_desbloqueos_globales(alumno_id)`
Esta función actuará como "Trigger Lógico" después de completar cualquier entidad mayor (Nivel, Curso).
- **Niveles:** Iterar sobre todos los niveles con `prerequisitos`. Si están cumplidos -> Insertar registro `en_progreso`/`no_iniciado` en `progreso_alumno`.
- **Cursos:** Idem para cursos con `prerequisitos_curso` o secuencia interna.
- **Regla del Primero:** Si un Nivel se desbloquea -> Desbloquear su primer Curso. Si un Curso se desbloquea -> Desbloquear su primer Módulo, etc.

### Función `obtener_estado_desbloqueo(alumno_id)`
Devolverá un JSON con el estado calculado de TODAS las entidades para el frontend, mapeando:
- `bloqueado`: Si no cumple requisitos.
- `disponible`: Cumple requisitos pero no iniciado.
- `en_progreso`: Iniciado pero no terminado.
- `completado`: Done.

## 2. API Backend

### `GET /api/academy/unlock-status`
Endpoint que llama a la función `obtener_estado_desbloqueo`.
Estructura de respuesta:
```json
{
  "niveles": { "uuid-nivel-1": "completado", "uuid-nivel-2": "disponible", ... },
  "cursos": { "uuid-curso-1": "completado", ... },
  "modulos": { ... },
  "unidades": { ... }
}
```

## 3. Seguridad y Validación

### Middleware de Validación
En los endpoints de escritura (`progress/update`, `progress/unit-read`, `evaluation/start`), verificado primero si la entidad está desbloqueada antes de permitir la acción.

## 4. Verificación
- Completar Unidad 1 -> Unidad 2 disponible.
- Completar Nivel 2 -> Nivel 6 (Seguridad) disponible.
- Intentar acceder a Unidad 3 sin hacer Unidad 2 -> Bloqueado.
