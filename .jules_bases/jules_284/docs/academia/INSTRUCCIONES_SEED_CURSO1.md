# 📚 Instrucciones para Poblar la Academia con Contenido Real

## ¿Qué contiene este seed?

Este script crea el **Curso 1: Iniciación a la Vela Ligera** completo con:

- ✅ **1 Curso** con toda su metadata
- ✅ **2 Módulos** temáticos
- ✅ **3 Unidades Didácticas** con contenido real y detallado
- ✅ **Contenido bilingüe** (Español y Euskera)
- ✅ **Teoría, práctica y errores comunes** para cada unidad

### Estructura del contenido:

```
Curso: Iniciación a la Vela Ligera (20h totales: 6h teoría + 14h práctica)
│
├── Módulo 1: Introducción y Seguridad (4h)
│   ├── Unidad 1.1: Seguridad en el Mar (45 min)
│   │   ├── Teoría: Equipo de seguridad, meteorología, emergencias
│   │   ├── Práctica: Colocación de chaleco, simulacros
│   │   └── Errores comunes: 4 errores típicos
│   │
│   └── Unidad 1.2: Partes del Barco (60 min)
│       ├── Teoría: Casco, aparejo, cabos, timón, orza
│       ├── Práctica: Reconocimiento, montaje de vela
│       └── Errores comunes: 4 errores típicos
│
└── Módulo 2: Teoría de la Navegación (5h)
    └── Unidad 2.1: Cómo Funciona la Vela (50 min)
        ├── Teoría: Aerodinámica, viento aparente, cazada
        ├── Práctica: Observación, ajuste de vela
        └── Errores comunes: 4 errores típicos
```

## Paso 1: Ejecutar el Seed en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **New query**
4. Abre el archivo `supabase/seeds/001_curso_iniciacion.sql`
5. Copia **todo** el contenido del archivo
6. Pégalo en el SQL Editor de Supabase
7. Haz clic en **Run** (o presiona `Ctrl+Enter`)

## Paso 2: Verificar que funcionó

Ejecuta estas queries para verificar:

```sql
-- Ver el curso creado
SELECT nombre_es, duracion_h, horas_teoricas, horas_practicas
FROM cursos
WHERE slug = 'iniciacion-vela-ligera';

-- Ver los módulos
SELECT m.orden, m.nombre_es, m.duracion_estimada_h
FROM modulos m
JOIN cursos c ON m.curso_id = c.id
WHERE c.slug = 'iniciacion-vela-ligera'
ORDER BY m.orden;

-- Ver las unidades didácticas
SELECT 
    m.orden as modulo,
    u.orden as unidad,
    u.nombre_es,
    u.duracion_estimada_min
FROM unidades_didacticas u
JOIN modulos m ON u.modulo_id = m.id
JOIN cursos c ON m.curso_id = c.id
WHERE c.slug = 'iniciacion-vela-ligera'
ORDER BY m.orden, u.orden;
```

Deberías ver:
- **1 curso**: "Iniciación a la Vela Ligera"
- **2 módulos**: "Introducción y Seguridad" y "Teoría de la Navegación"
- **3 unidades**: Seguridad, Partes del Barco, Cómo Funciona la Vela

## Paso 3: Probar en la Aplicación

1. Navega a: `http://localhost:3000/es/academy`
2. Haz clic en **Nivel 1: Iniciación a la Vela**
3. Deberías ver el curso "Iniciación a la Vela Ligera"
4. Haz clic en el curso para ver los 2 módulos
5. Haz clic en "Módulo 1: Introducción y Seguridad"
6. Deberías ver las 2 unidades del módulo
7. Haz clic en "Unidad 1.1: Seguridad en el Mar"
8. **¡Deberías ver el contenido completo con tabs de Teoría/Práctica/Errores!**

## Contenido Destacado

### Unidad 1.1: Seguridad en el Mar
- **Teoría completa** sobre equipo de seguridad (chaleco, calzado, protección solar)
- **Procedimientos de emergencia** (hombre al agua, vuelco)
- **Señales de comunicación**
- **Respeto al medio marino**
- **Práctica**: 3 ejercicios (colocación de chaleco, reconocimiento, simulacro)

### Unidad 1.2: Partes del Barco
- **Terminología náutica** completa (proa, popa, babor, estribor)
- **Aparejo**: mástil, botavara, velas
- **Cabos**: escotas, drizas
- **Reglas mnemotécnicas** para recordar
- **Práctica**: Tour del barco, juego de identificación, montaje de vela

### Unidad 2.1: Cómo Funciona la Vela
- **Aerodinámica de la vela** (empuje vs sustentación)
- **Viento real vs viento aparente** con ejemplos
- **Cazada óptima** de la vela
- **Práctica**: Observación del viento, ajuste de vela

## Características del Contenido

✅ **Contenido pedagógico real** (no lorem ipsum)  
✅ **Bilingüe** (español y euskera)  
✅ **Estructurado** (teoría + práctica + errores)  
✅ **Progresivo** (de lo simple a lo complejo)  
✅ **Práctico** (ejercicios específicos con tiempos)  
✅ **Profesional** (terminología náutica correcta)  

## Próximos Pasos Sugeridos

1. **Completar el Módulo 2** con las unidades restantes:
   - Unidad 2.2: Rumbos de Navegación
   - Unidad 2.3: Puntos de Navegación

2. **Añadir Módulos 3 y 4**:
   - Módulo 3: Maniobras Básicas
   - Módulo 4: Práctica en el Agua

3. **Crear evaluaciones** (quizzes) para cada módulo

4. **Añadir actividades interactivas** (simulaciones, juegos)

5. **Crear el Curso 2** del mismo nivel

## Notas Técnicas

- El script usa **transacciones** para garantizar consistencia
- Los IDs se generan automáticamente (UUID)
- El contenido usa **formato Markdown** en los campos de texto
- Los arrays se almacenan como **JSONB** para flexibilidad
- El script es **idempotente** (se puede ejecutar múltiples veces)

---

**¡Ahora tienes una academia digital funcional con contenido real y profesional!** 🎉
