# 🚀 Instrucciones para aplicar la Fase 2 - Sistema de Progreso

## Paso 1: Ejecutar la migración en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **New query**
4. Abre el archivo `supabase/migrations/002_academia_fase2_progreso.sql`
5. Copia **todo** el contenido del archivo
6. Pégalo en el SQL Editor de Supabase
7. Haz clic en **Run** (o presiona `Ctrl+Enter`)

## Paso 2: Verificar que funcionó

Ejecuta esta query para verificar que las tablas se crearon:

```sql
-- Ver habilidades creadas
SELECT slug, nombre_es, icono, categoria 
FROM habilidades 
ORDER BY orden_visual;

-- Ver logros creados
SELECT slug, nombre_es, icono, categoria, rareza 
FROM logros 
ORDER BY puntos;
```

Deberías ver:
- **12 habilidades** desde "Marinero de Agua Dulce" hasta "Capitán"
- **8 logros** desde "Primer Día" hasta "100 Horas Navegadas"

## Paso 3: Probar las APIs

Una vez ejecutada la migración, puedes probar los endpoints (necesitas estar autenticado):

### Obtener progreso del alumno
```
GET http://localhost:3000/api/academy/progress
```

Devuelve:
- Progreso por entidad (niveles, cursos, módulos, unidades)
- Habilidades desbloqueadas
- Logros obtenidos
- Horas de navegación
- Estadísticas globales

### Actualizar progreso
```
POST http://localhost:3000/api/academy/progress/update
Content-Type: application/json

{
  "tipo_entidad": "unidad",
  "entidad_id": "uuid-de-la-unidad",
  "estado": "completado",
  "porcentaje": 100
}
```

## ¿Qué se ha creado?

✅ Tabla `progreso_alumno` — Trackeo de progreso por entidad  
✅ Tabla `habilidades` — Catálogo de habilidades (12 predefinidas)  
✅ Tabla `habilidades_alumno` — Habilidades desbloqueadas por alumno  
✅ Tabla `logros` — Catálogo de logros/medallas (8 predefinidos)  
✅ Tabla `logros_alumno` — Logros obtenidos por alumno  
✅ Tabla `horas_navegacion` — Registro de horas prácticas  
✅ Tabla `certificados` — Certificados emitidos  
✅ Políticas RLS para privacidad del alumno  
✅ Función `generar_numero_certificado()` para certificados únicos  
✅ API `/api/academy/progress` para consultar progreso  
✅ API `/api/academy/progress/update` para actualizar progreso  

## Características del sistema

### Progreso en cascada
Cuando un alumno completa una unidad:
1. Se marca la unidad como completada
2. Se recalcula automáticamente el porcentaje del módulo
3. Si todas las unidades están completadas, el módulo se marca como completado

### Habilidades
Se desbloquean automáticamente al completar ciertos módulos o niveles:
- **Marinero de Agua Dulce** → Al completar el primer módulo
- **Capitán** → Al completar todos los niveles

### Logros
Se otorgan automáticamente cuando se cumplen las condiciones:
- **Primer Día** → Completar 1 unidad
- **7 Días Seguidos** → Acceder 7 días consecutivos
- **100 Horas Navegadas** → Acumular 100h de navegación

### Certificados
Se generan automáticamente al completar un nivel con:
- Número único (formato: GBE-2026-XXXXXX)
- Nota final
- Distinción si nota ≥ 90%
- Hash de verificación

## Próximos pasos

1. **Crear el dashboard del alumno** para visualizar todo este progreso
2. **Implementar el motor de logros** que evalúa condiciones automáticamente
3. **Crear el sistema de evaluación** (quizzes y exámenes)
4. **Generar PDFs de certificados**

---

**Nota**: Si encuentras errores del tipo "already exists", es normal. La migración es idempotente.
