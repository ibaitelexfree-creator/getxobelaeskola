# 🚀 Instrucciones para aplicar la Fase 3 - Sistema de Evaluación

## Paso 1: Ejecutar la migración en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **New query**
4. Abre el archivo `supabase/migrations/003_academia_fase3_evaluacion.sql`
5. Copia **todo** el contenido del archivo
6. Pégalo en el SQL Editor de Supabase
7. Haz clic en **Run** (o presiona `Ctrl+Enter`)

## Paso 2: Verificar que funcionó

Ejecuta estas queries para verificar que las tablas se crearon:

```sql
-- Ver estructura de tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('preguntas', 'evaluaciones', 'intentos_evaluacion', 'actividades', 'intentos_actividad')
ORDER BY table_name;

-- Verificar funciones creadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('seleccionar_preguntas_evaluacion', 'calcular_puntuacion_intento');
```

Deberías ver:
- **5 tablas**: `actividades`, `evaluaciones`, `intentos_actividad`, `intentos_evaluacion`, `preguntas`
- **2 funciones**: `calcular_puntuacion_intento`, `seleccionar_preguntas_evaluacion`

## Paso 3: Probar las APIs

### Iniciar una evaluación
```
POST http://localhost:3000/api/academy/evaluation/start
Content-Type: application/json

{
  "evaluacion_id": "uuid-de-la-evaluacion"
}
```

Devuelve:
- Intento creado con ID
- Preguntas seleccionadas aleatoriamente (sin respuestas correctas)
- Configuración de la evaluación

### Enviar respuestas
```
POST http://localhost:3000/api/academy/evaluation/submit
Content-Type: application/json

{
  "intento_id": "uuid-del-intento",
  "respuestas": {
    "pregunta-uuid-1": "respuesta-1",
    "pregunta-uuid-2": "respuesta-2"
  },
  "tiempo_empleado_seg": 180
}
```

Devuelve:
- Puntuación obtenida (0-100)
- Puntos obtenidos / puntos totales
- Aprobado (true/false)
- Respuestas correctas (si está configurado)

### Ver historial de intentos
```
GET http://localhost:3000/api/academy/evaluation/history?evaluacion_id=uuid
```

## ¿Qué se ha creado?

✅ Tabla `preguntas` — Banco de preguntas con 5 tipos diferentes  
✅ Tabla `evaluaciones` — Configuración de quizzes y exámenes  
✅ Tabla `intentos_evaluacion` — Registro de cada intento del alumno  
✅ Tabla `actividades` — Actividades interactivas (juegos educativos)  
✅ Tabla `intentos_actividad` — Registro de juegos completados  
✅ Función `seleccionar_preguntas_evaluacion()` — Selección aleatoria de preguntas  
✅ Función `calcular_puntuacion_intento()` — Corrección automática  
✅ Políticas RLS para privacidad  
✅ API `/api/academy/evaluation/start` — Iniciar evaluación  
✅ API `/api/academy/evaluation/submit` — Enviar respuestas  
✅ API `/api/academy/evaluation/history` — Historial de intentos  

## Tipos de preguntas soportados

| Tipo | Descripción | Ejemplo |
|---|---|---|
| `opcion_multiple` | 4 opciones, 1 correcta | ¿Qué es ceñida? A) ... B) ... |
| `verdadero_falso` | Verdadero o Falso | El viento aparente es siempre mayor que el real |
| `completar` | Completar frase | La maniobra para cambiar de bordo por proa se llama _____ |
| `ordenar` | Ordenar pasos | Ordena los pasos de una virada |
| `asociar` | Emparejar conceptos | Asocia cada nudo con su uso |

## Tipos de actividades interactivas

| Tipo | Descripción |
|---|---|
| `decision_tactica` | Escenario con opciones bajo presión de tiempo |
| `simulacion_maniobra` | Arrastrar/controlar elementos para completar maniobra |
| `identificacion_visual` | Señalar/etiquetar partes del barco, señales, nubes |
| `escenario_emergencia` | Historia interactiva con decisiones en cadena |
| `meteorologia` | Interpretar datos y predecir condiciones |
| `nudos` | Seguir instrucciones paso a paso |
| `regata` | Tomar decisiones de ruta y táctica |

## Características del sistema

### Selección aleatoria
- Las preguntas se seleccionan aleatoriamente del banco
- Se pueden aleatorizar el orden de preguntas y opciones
- Cada intento es único

### Corrección automática
- La función `calcular_puntuacion_intento()` corrige automáticamente
- Calcula puntos obtenidos / totales
- Determina si aprobó según el umbral configurado

### Límite de intentos
- Se puede configurar un número máximo de intentos
- El sistema valida antes de permitir un nuevo intento

### Progreso automático
- Si aprueba un quiz de unidad, la unidad se marca como completada
- Esto dispara el recálculo en cascada del progreso del módulo

### Tiempo límite
- Se puede configurar un tiempo límite por evaluación
- El frontend debe implementar el timer

## Próximos pasos

1. **Crear preguntas** para los módulos del Curso 1 (Iniciación)
2. **Crear evaluaciones** (quizzes de unidad, exámenes de módulo)
3. **Implementar el componente de quiz** en el frontend
4. **Crear actividades interactivas** con sus configuraciones
5. **Implementar los componentes de actividades** en el frontend

---

**Nota**: Las preguntas y evaluaciones se crearán mediante un panel de administración o scripts de seed específicos por curso.
