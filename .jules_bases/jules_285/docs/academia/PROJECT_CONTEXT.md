# 🧭 PROJECT_CONTEXT.md — Getxo Bela Eskola
## Contexto operativo del proyecto para todos los agentes de IA

---

# 1. DESCRIPCIÓN DEL PROYECTO

Getxo Bela Eskola es una **academia online de vela real**. No es una landing page ni un catálogo de cursos: es un sistema educativo completo donde los alumnos avanzan como en una escuela náutica profesional.

Los alumnos progresan a través de **niveles formativos** (Iniciación, Perfeccionamiento, Vela Ligera, Crucero, Maniobras Avanzadas, Seguridad y Emergencias, Meteorología). Cada nivel contiene cursos, y cada curso se estructura así:

```
Curso
 └── Módulos (3-4 por curso)
       └── Unidades Didácticas (2-4 por módulo)
             ├── Lección teórica
             ├── Práctica en el agua
             ├── Errores comunes
             ├── Recursos descargables
             ├── Juego interactivo (opcional)
             └── Quiz evaluable (5 preguntas, umbral 60%)
```

Cada módulo tiene un **examen de módulo** (15 preguntas, umbral 70%, 20 min).
Cada curso termina con un **examen final obligatorio** (30 preguntas + 2 casos prácticos, umbral 75%, 45 min).

El sistema controla el progreso del alumno en tiempo real: **el contenido se desbloquea por desempeño**, no por tiempo ni por pago. Un alumno que no aprueba no avanza.

---

# 2. STACK TECNOLÓGICO

| Capa | Tecnología | Notas |
|------|-----------|-------|
| **Frontend** | Next.js (App Router) | TypeScript, componentes React |
| **Backend** | API Routes de Next.js | Lógica de negocio en `/src/app/api/` |
| **Base de datos** | PostgreSQL | Gestionada por Supabase |
| **BaaS** | Supabase | Auth, Storage, RLS, funciones SQL |
| **Autenticación** | Supabase Auth | Roles: alumno, instructor, admin |
| **Almacenamiento** | Supabase Storage | PDFs, imágenes, certificados |
| **Estilo** | CSS / Tailwind | Según contexto del componente |

> **Regla:** No se deben proponer tecnologías fuera de este stack salvo que el usuario lo pida explícitamente. No introducir Firebase, Prisma, Auth0, MongoDB, ni ningún otro servicio externo.

---

# 3. ESTRUCTURA DE LA ACADEMIA

## 3.1 Jerarquía académica

```
NIVEL FORMATIVO (7 niveles)
 └── CURSO (1-2 por nivel)
       └── MÓDULO (3-4 por curso)
             └── UNIDAD DIDÁCTICA (2-4 por módulo)
                   ├── Contenido teórico
                   ├── Contenido práctico
                   ├── Actividades interactivas
                   └── Quiz evaluable
```

## 3.2 Los 7 niveles formativos

| Orden | Nivel | Tipo |
|-------|-------|------|
| 1 | Iniciación a la Vela | Secuencial |
| 2 | Perfeccionamiento | Secuencial |
| 3 | Vela Ligera | Secuencial |
| 4 | Crucero | Secuencial |
| 5 | Maniobras Avanzadas | Secuencial |
| 6 | Seguridad y Emergencias | Transversal (requiere nivel 2) |
| 7 | Meteorología Náutica | Transversal (requiere nivel 2) |

## 3.3 Contenido por unidad

Cada unidad didáctica puede incluir:

- **Lección teórica** — Texto enriquecido (markdown) con ilustraciones
- **Práctica en el agua** — Ejercicios para realizar en el barco
- **Errores comunes** — Listado con explicaciones
- **Recurso descargable** — PDF, ficha técnica, checklist
- **Juego interactivo** — Actividad gamificada (arrastrar, emparejar, etc.)
- **Quiz evaluable** — 5 preguntas aleatorias del banco, con nota mínima

## 3.4 Evaluaciones

| Tipo | Preguntas | Umbral | Tiempo | Reintentos |
|------|-----------|--------|--------|------------|
| Quiz de unidad | 5 | 60% | Sin límite | Ilimitados (cooldown 2 min) |
| Examen de módulo | 15 | 70% | 20 min | 3 por cada 24h |
| Examen final de curso | 30 + 2 casos | 75% | 45 min | 2 por cada 48h |

---

# 4. ESTADO ACTUAL DEL PROYECTO

## 4.1 Lo que YA existe

### Base de datos (migraciones ejecutadas)
- `001_academia_fase1_niveles.sql` — Tablas: `niveles_formacion`, `modulos`, `unidades_didacticas`. Los 7 niveles seeded.
- `002_academia_fase2_progreso.sql` — Tablas: `progreso_alumno`, `habilidades`, `habilidades_alumno`, `logros`, `logros_alumno`, `horas_navegacion`, `certificados`. 12 habilidades y 8 logros seeded.
- `003_academia_fase3_evaluacion.sql` — Tablas: `preguntas`, `evaluaciones`, `intentos_evaluacion`, `actividades`, `intentos_actividad`. Función `calcular_puntuacion_intento`.
- Tablas de gestión: `boats`, `sessions`, `maintenance_logs`.

### Seed data
- `001_curso_iniciacion.sql` — Curso 1 completo con 3 unidades seeded (Seguridad, Partes del Barco, Cómo Funciona la Vela).

### Contenido académico (archivos markdown)
- 12 unidades completas (3 en seed SQL + 9 en `contenido_academico/curso1_unidades_4_a_12.md`)
- 200 preguntas en 4 archivos (`curso1_banco_preguntas_parte1.md` a `parte4.md`)
- 10 casos prácticos con soluciones (`curso1_casos_practicos.md`)

### APIs existentes
- `GET /api/academy/progress` — Progreso completo del alumno
- `POST /api/academy/progress/update` — Actualizar progreso
- `POST /api/academy/evaluation/start` — Iniciar evaluación
- `POST /api/academy/evaluation/submit` — Enviar respuestas
- `GET /api/academy/course/[slug]` — Detalle de curso
- `GET /api/academy/module/[id]` — Detalle de módulo
- `GET /api/academy/unit/[id]` — Detalle de unidad
- `GET /api/academy/levels` — Niveles formativos
- `GET /api/academy/courses` — Lista de cursos

### Frontend existente
- `/academy` — Página principal de la academia
- `/academy/course/[slug]` — Página de curso
- `/academy/module/[id]` — Página de módulo
- `/academy/unit/[id]` — Página de unidad
- `/academy/level/[id]` — Página de nivel

## 4.2 Lo que se está implementando AHORA

El proyecto sigue un plan de **14 fases** documentado en `PLAN_IMPLEMENTACION_FASES.md`.
El diseño funcional del sistema de progreso está en `DISENO_SISTEMA_PROGRESO.md`.

La fase actual es la implementación de:
- Lógica de progreso académico (completado de unidad → módulo → curso → nivel)
- Sistema de desbloqueo secuencial
- Motor de habilidades y logros
- Motor de certificados
- Dashboard del alumno

## 4.3 Lo que NO existe todavía
- Las 200 preguntas no están en la base de datos (solo en markdown)
- Evaluaciones (quizzes/exámenes) no están seeded
- Lógica de cooldown entre reintentos
- Motor de desbloqueo secuencial
- Motor automático de habilidades y logros
- Emisión de certificados
- Dashboard del alumno
- Frontend de quiz con timer
- Animaciones y notificaciones
- PDF de certificados

---

# 5. DOCUMENTOS DE REFERENCIA

| Documento | Qué contiene |
|-----------|-------------|
| `DISENO_SISTEMA_PROGRESO.md` | Diseño funcional completo: progreso, desbloqueos, habilidades, 30 logros, certificados, UX |
| `PLAN_IMPLEMENTACION_FASES.md` | 14 fases de implementación con dependencias, objetivos y verificación |
| `ANALISIS_PROGRESO_PLAN_MAESTRO.md` | Estado general del proyecto y análisis de lo completado vs pendiente |
| `contenido_academico/` | Unidades, preguntas y casos prácticos del Curso 1 |
| `supabase/migrations/` | Esquema de base de datos (3 migraciones académicas) |
| `supabase/seeds/` | Datos iniciales del Curso 1 |

---

# 6. ❗ REGLAS QUE NO SE PUEDEN ROMPER

### Base de datos
1. **No modificar tablas existentes** sin instrucción explícita del usuario. Nuevas columnas o tablas deben crearse en migraciones separadas.
2. **No eliminar datos de seed** existentes. Solo ampliar.
3. **Respetar RLS** (Row Level Security). Toda tabla nueva debe tener RLS habilitado con políticas adecuadas.

### Arquitectura
4. **No saltarse fases del plan de implementación.** Cada fase depende de las anteriores. No implementar Fase 8 sin que Fase 4 esté completa.
5. **No mezclar frontend y backend** en la misma tarea si no se pide explícitamente.
6. **No introducir tecnologías fuera del stack** definido (Next.js, Supabase, PostgreSQL).
7. **No crear endpoints duplicados.** Verificar qué APIs ya existen antes de crear nuevas.

### Sistema académico
8. **Todo el progreso del alumno debe estar basado en resultados reales.** No se puede marcar nada como completado sin quiz aprobado, secciones leídas, o examen superado.
9. **El progreso solo sube, nunca baja.** Una unidad completada permanece completada. Las notas guardan la mejor marca.
10. **El desbloqueo es estrictamente secuencial** dentro de cada eje (unidad → siguiente unidad, módulo → siguiente módulo). No se puede saltar contenido.
11. **No inventar funcionalidades** fuera del sistema académico definido en el diseño funcional.

### Escalabilidad
12. **El sistema debe funcionar para múltiples cursos y niveles.** No hardcodear IDs de curso, módulo ni unidad. Usar relaciones y consultas dinámicas.
13. **Todo el contenido debe ser bilingüe** (español `_es` y euskera `_eu`). Las columnas de texto siempre van en pares.

### Calidad
14. **No dejar `console.log` en producción.** Usar manejo de errores adecuado.
15. **Validar inputs** en todas las APIs. Nunca confiar en datos del cliente.
16. **Los endpoints deben requerir autenticación** excepto los expresamente públicos (verificación de certificados, catálogo de cursos/niveles).

---

# 7. OBJETIVO DE ESTE DOCUMENTO

Este archivo existe para:

1. **Dar contexto inmediato** a cualquier agente de IA que trabaje en cualquier parte del proyecto.
2. **Evitar decisiones incoherentes** entre distintas fases, sesiones o agentes.
3. **Servir como fuente de verdad** sobre qué existe, qué falta, y qué reglas se aplican.
4. **Prevenir errores de implementación** al dejar claro el stack, la estructura y las restricciones.

Antes de escribir cualquier código, el agente debe:
1. Leer este documento
2. Consultar `PLAN_IMPLEMENTACION_FASES.md` para saber en qué fase se trabaja
3. Consultar `DISENO_SISTEMA_PROGRESO.md` para las reglas funcionales

---

*Última actualización: Febrero 2026*
