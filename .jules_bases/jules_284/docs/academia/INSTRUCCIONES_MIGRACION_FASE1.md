# 🚀 Instrucciones para aplicar la Fase 1 - Academia Digital

## Paso 1: Acceder al SQL Editor de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **New query**

## Paso 2: Ejecutar la migración

1. Abre el archivo `supabase/migrations/001_academia_fase1_niveles.sql`
2. Copia **todo** el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (o presiona `Ctrl+Enter`)

## Paso 3: Verificar que funcionó

Ejecuta esta query para verificar que los 7 niveles se crearon correctamente:

```sql
SELECT orden, nombre_es, slug, icono 
FROM niveles_formacion 
ORDER BY orden;
```

Deberías ver:

| orden | nombre_es | slug | icono |
|---|---|---|---|
| 1 | Iniciación a la Vela | iniciacion | ⚓ |
| 2 | Perfeccionamiento | perfeccionamiento | ⛵ |
| 3 | Vela Ligera | vela-ligera | 🏁 |
| 4 | Crucero | crucero | 🗺️ |
| 5 | Maniobras Avanzadas | maniobras-avanzadas | 🌊 |
| 6 | Seguridad y Emergencias | seguridad-emergencias | 🆘 |
| 7 | Meteorología Náutica | meteorologia | 🌤️ |

## Paso 4: Probar la API

Una vez ejecutada la migración, puedes probar el endpoint:

```
GET http://localhost:3000/api/academy/levels
```

Debería devolver los 7 niveles en formato JSON.

## ¿Qué se ha creado?

✅ Tabla `niveles_formacion` con los 7 niveles académicos  
✅ Tabla `modulos` para organizar contenido por bloques  
✅ Tabla `unidades_didacticas` para el contenido granular  
✅ Campos nuevos en `cursos`: `nivel_formacion_id`, `horas_teoricas`, `horas_practicas`, `prerequisitos_curso`, `orden_en_nivel`  
✅ Políticas RLS para lectura pública  
✅ Triggers para `updated_at` automático  
✅ Índices para optimizar consultas  

## Próximos pasos

Después de verificar que todo funciona:

1. **Crear los cursos** y vincularlos a niveles (Fase 2)
2. **Crear módulos** para cada curso
3. **Crear unidades didácticas** para cada módulo
4. **Crear el sistema de evaluación** (quizzes y exámenes)
5. **Crear el sistema de progreso** del alumno

---

**Nota**: Si encuentras algún error del tipo "already exists", es normal. La migración está diseñada para ser idempotente (se puede ejecutar varias veces sin problemas).
