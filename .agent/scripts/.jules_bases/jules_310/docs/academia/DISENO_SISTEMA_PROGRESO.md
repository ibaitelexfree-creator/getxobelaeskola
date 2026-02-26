# ⛵ DISEÑO FUNCIONAL — SISTEMA DE PROGRESO, DESBLOQUEOS Y LOGROS
## Academia Digital de Vela — Getxo Bela Eskola

---

## 📋 ÍNDICE

1. Lógica de Progreso Académico
2. Sistema de Desbloqueo
3. Sistema de Habilidades
4. Sistema de Logros (30 logros)
5. Sistema de Certificados
6. Experiencia del Alumno (UX)

---

# 🧭 PARTE 1 — LÓGICA DE PROGRESO ACADÉMICO

## Jerarquía de progreso

```
NIVEL (7 niveles)
  └── CURSO (1-2 por nivel)
        └── MÓDULO (3-4 por curso)
              └── UNIDAD DIDÁCTICA (2-4 por módulo)
```

El progreso fluye siempre de abajo hacia arriba: **completar unidades → completa módulos → completa cursos → completa niveles.**

---

## 1.1 Completar una Unidad Didáctica

Una unidad se marca como **completada** cuando el alumno cumple **las tres condiciones**:

| Condición | Detalle |
|-----------|---------|
| **Lectura completa** | El alumno ha visualizado las 3 secciones (Teoría, Práctica, Errores comunes). El sistema registra la apertura de cada sección. |
| **Tiempo mínimo** | Al menos 5 minutos entre abrir la unidad y marcarla como completada (evita "clics rápidos"). |
| **Quiz de unidad aprobado** | Quiz de 5 preguntas aleatorias del banco de esa unidad, con un umbral mínimo del **60% (3/5 aciertos)**. |

### Reintentos del quiz de unidad
- **Ilimitados.** El alumno puede repetir el quiz cuantas veces quiera.
- Se guarda **la mejor nota**, nunca baja.
- Entre cada intento debe esperar **2 minutos** (cooldown) para fomentar la reflexión.

### ¿El progreso puede bajar?
- **No.** Una unidad completada permanece completada para siempre.
- La nota de un quiz solo puede **subir o mantenerse**, nunca bajar.

---

## 1.2 Completar un Módulo

Un módulo se marca como **completado** cuando:

| Condición | Detalle |
|-----------|---------|
| **Todas las unidades completadas** | El 100% de las unidades del módulo deben estar en estado "completado". |
| **Examen de módulo aprobado** | Examen de **15 preguntas** aleatorias del banco de todas las unidades del módulo, con un umbral del **70% (11/15 aciertos)**. |
| **Tiempo del examen** | Máximo **20 minutos** para completar el examen. |

### Reintentos del examen de módulo
- **3 intentos máximos** por periodo de 24 horas.
- Se guarda **la mejor nota** de todos los intentos.
- Si falla 3 veces en un día, debe esperar 24 horas antes de reintentar.

### Nota del módulo
La nota final del módulo es **la mejor nota obtenida en el examen de módulo**.

| Rango | Calificación |
|-------|-------------|
| 90–100% | Sobresaliente ⭐ |
| 80–89% | Notable |
| 70–79% | Aprobado |
| < 70% | Suspenso (repetir) |

---

## 1.3 Completar un Curso

Un curso se marca como **aprobado** cuando:

| Condición | Detalle |
|-----------|---------|
| **Todos los módulos completados** | 100% de módulos del curso en estado "completado". |
| **Examen final de curso aprobado** | Examen de **30 preguntas** (mezcla de todas las unidades del curso) + **2 casos prácticos**, con umbral del **75%**. |
| **Horas de navegación mínimas** | El alumno tiene registradas al menos las horas prácticas requeridas por el curso (ver tabla abajo). |
| **Tiempo del examen** | Máximo **45 minutos**. |

### Horas de navegación por curso

| Nivel | Curso | Horas prácticas mínimas |
|-------|-------|------------------------|
| Iniciación | Iniciación a la Vela Ligera | 10 horas |
| Perfeccionamiento | Perfeccionamiento de Vela | 20 horas |
| Vela Ligera | Vela Ligera Avanzada | 30 horas |
| Crucero | Navegación de Crucero | 40 horas |
| Maniobras Avanzadas | Maniobras Avanzadas | 30 horas |
| Seguridad y Emergencias | Seguridad Integral | 15 horas |
| Meteorología | Meteorología Aplicada | 10 horas |

### Reintentos del examen final
- **2 intentos** por periodo de 48 horas.
- Si suspende ambos, debe esperar 48 horas.
- No hay límite total de intentos, solo el cooldown.

### Nota del curso
Media ponderada:
- **60% nota del examen final**
- **30% media de notas de módulos**
- **10% bonus por logros obtenidos durante el curso** (máx. 10 puntos extra)

---

## 1.4 Completar un Nivel

Un nivel se marca como **superado** cuando:

| Condición | Detalle |
|-----------|---------|
| **Todos los cursos del nivel aprobados** | 100% de cursos del nivel completados. |
| **Habilidades mínimas requeridas** | El alumno posee las habilidades vinculadas a ese nivel (ver Parte 3). |

### Nota del nivel
Media de las notas de todos los cursos del nivel.

---

## 1.5 Tabla resumen de progreso

| Entidad | Condición de completado | Umbral nota | Reintentos | Cooldown |
|---------|------------------------|-------------|------------|----------|
| Unidad | Leer + quiz 5 preg. | 60% | Ilimitados | 2 min |
| Módulo | Todas unidades + examen 15 preg. | 70% | 3/día | 24 h |
| Curso | Todos módulos + examen 30 preg. + horas nav. | 75% | 2/48h | 48 h |
| Nivel | Todos cursos + habilidades | Media cursos | — | — |

---

# 🔓 PARTE 2 — SISTEMA DE DESBLOQUEO

El desbloqueo es estrictamente secuencial dentro de cada eje, con excepciones controladas para los niveles transversales.

## 2.1 Desbloqueo de Unidades

| Regla | Detalle |
|-------|---------|
| **Primera unidad de cada módulo** | Desbloqueada automáticamente cuando el módulo está desbloqueado. |
| **Siguientes unidades** | Se desbloquean al **completar la unidad anterior** del mismo módulo. |

> No se requieren habilidades ni horas para desbloquear unidades. El flujo es puramente secuencial.

## 2.2 Desbloqueo de Módulos

| Regla | Detalle |
|-------|---------|
| **Primer módulo del curso** | Desbloqueado automáticamente cuando el curso está desbloqueado. |
| **Siguientes módulos** | Se desbloquean al **completar el módulo anterior** (todas sus unidades + examen aprobado). |

## 2.3 Desbloqueo de Cursos

| Regla | Detalle |
|-------|---------|
| **Primer curso de un nivel** | Desbloqueado automáticamente cuando el nivel está desbloqueado. |
| **Siguientes cursos del mismo nivel** | Se desbloquean al **aprobar el curso anterior** del mismo nivel. |

## 2.4 Desbloqueo de Niveles

Este es el punto más importante de la progresión. Cada nivel tiene requisitos específicos:

| Nivel | Prerequisito nivel | Horas nav. acumuladas | Habilidades requeridas | Logros requeridos |
|-------|--------------------|----------------------|----------------------|-------------------|
| **1. Iniciación** | Ninguno (siempre abierto) | 0 h | Ninguna | Ninguno |
| **2. Perfeccionamiento** | Iniciación completado | 10 h | Marinero de Agua Dulce, Domador del Viento | "Primer Día" |
| **3. Vela Ligera** | Perfeccionamiento completado | 30 h | Trimador, Manos de Marinero | "10 Horas Navegadas" |
| **4. Crucero** | Vela Ligera completado | 60 h | Patrón de Bahía, Táctico | "50 Horas Navegadas" |
| **5. Maniobras Avanzadas** | Crucero completado | 80 h | Lobo de Mar | — |
| **6. Seguridad** (transversal) | Perfeccionamiento completado | 20 h | — | — |
| **7. Meteorología** (transversal) | Perfeccionamiento completado | 20 h | — | — |

### Niveles transversales (6 y 7)
Los niveles de Seguridad y Meteorología son **transversales**: no requieren completar los niveles 3-5 para acceder. Solo requieren haber completado el nivel 2 (Perfeccionamiento). Esto permite que un alumno que navega solo en crucero pueda formarse en seguridad y meteorología sin haber pasado por Vela Ligera competitiva.

### Indicador visual de desbloqueo

Cada nivel/curso/módulo/unidad muestra uno de estos estados:

| Estado | Icono | Significado |
|--------|-------|-------------|
| 🔒 Bloqueado | Candado gris | No cumple requisitos para acceder |
| 🔓 Disponible | Candado abierto verde | Cumple requisitos, puede empezar |
| 🔄 En progreso | Círculo parcial azul | Ha empezado pero no completado |
| ✅ Completado | Check verde | Completado con éxito |
| ⭐ Completado con distinción | Estrella dorada | Completado con nota ≥ 90% |

---

# 🧠 PARTE 3 — SISTEMA DE HABILIDADES

Las habilidades representan **competencias reales** que un navegante desarrolla. No son simplemente badges: reflejan capacidades demostradas y pueden ser requisito para desbloquear niveles superiores.

## 3.1 Categorías de habilidades

| Categoría | Icono | Descripción |
|-----------|-------|-------------|
| **Técnica** | ⛵ | Manejo del barco, velas, maniobras |
| **Táctica** | 🧭 | Toma de decisiones, lectura de regatas |
| **Seguridad** | 🛟 | Protocolos de emergencia, rescate |
| **Meteorología** | 🌤️ | Predicción y decisión meteorológica |
| **Excelencia** | ⭐ | Logros máximos globales |

## 3.2 Catálogo completo de habilidades (12)

| # | Habilidad | Categoría | Nivel mín. | Cómo se obtiene |
|---|-----------|-----------|------------|-----------------|
| 1 | **Marinero de Agua Dulce** | Técnica | 1 | Completar el Módulo 1 de Iniciación (Seguridad + Partes del barco) |
| 2 | **Domador del Viento** | Técnica | 1 | Completar el Módulo 2 de Iniciación (Teoría de la Navegación — viento, rumbos, aparejado) |
| 3 | **Manos de Marinero** | Técnica | 1 | Completar la Unidad de Nudos + obtener ≥ 90% en quiz de nudos |
| 4 | **Trimador** | Técnica | 2 | Completar el módulo de Trimado en Perfeccionamiento con nota ≥ 80% |
| 5 | **Táctico** | Táctica | 2 | Completar el módulo de Reglas y Táctica en Perfeccionamiento |
| 6 | **Patrón de Rescate** | Seguridad | 2 | Completar todas las unidades de Seguridad + aprobar examen de módulo con ≥ 85% |
| 7 | **Regatista** | Táctica | 3 | Completar el curso de Vela Ligera + registrar al menos 1 hora de tipo "regata" |
| 8 | **Patrón de Bahía** | Técnica | 4 | Completar el nivel Crucero en su totalidad |
| 9 | **Lobo de Mar** | Técnica | 5 | Completar Maniobras Avanzadas + 80 horas de navegación acumuladas |
| 10 | **Oficial de Seguridad** | Seguridad | 6 | Completar nivel Seguridad y Emergencias con nota media ≥ 80% |
| 11 | **Meteorólogo de Abordo** | Meteorología | 7 | Completar nivel Meteorología con nota media ≥ 80% |
| 12 | **Capitán** | Excelencia | 7 | Completar TODOS los niveles (1-7) + 100 horas de navegación |

## 3.3 Niveles de dominio de habilidad

Cada habilidad tiene **un solo estado: obtenida o no obtenida.** No hay niveles intermedios (principiante, intermedio, etc.) dentro de cada habilidad individual.

Sin embargo, el **conjunto de habilidades** del alumno define su **Rango de Navegante**:

| Rango | Habilidades obtenidas | Título equivalente |
|-------|----------------------|-------------------|
| 🟤 Grumete | 0 | Recién llegado |
| 🟢 Marinero | 1–3 | Alumno de iniciación |
| 🔵 Timonel | 4–6 | Navegante en formación |
| 🟣 Patrón | 7–9 | Navegante autónomo |
| 🟡 Capitán | 10–12 | Navegante completo |

Este rango se muestra como **"Nivel de Capitán"** en el dashboard del alumno, sugiriendo progresión hacia el objetivo final.

## 3.4 Cómo las habilidades influyen en los desbloqueos

Las habilidades son **requisitos de entrada** para niveles superiores (ver tabla de la Parte 2.4). Si un alumno ha completado todos los cursos de un nivel pero le falta una habilidad requerida para el siguiente nivel, el sistema le indica exactamente qué le falta:

> *"Para desbloquear el nivel Crucero, necesitas la habilidad **Patrón de Bahía**. Completa el módulo de Navegación Costera para obtenerla."*

---

# 🏅 PARTE 4 — SISTEMA DE LOGROS (30 ACHIEVEMENTS)

Los logros se dividen en 5 categorías y 4 niveles de rareza.

## 4.1 Niveles de rareza

| Rareza | Color | Frecuencia esperada |
|--------|-------|-------------------|
| **Común** | 🟤 Bronce | Lo obtiene el 80% de alumnos |
| **Raro** | 🔵 Plata | Lo obtiene el 40% de alumnos |
| **Épico** | 🟣 Oro | Lo obtiene el 15% de alumnos |
| **Legendario** | 🟡 Diamante | Lo obtiene el 5% de alumnos |

## 4.2 Catálogo completo de logros

### Categoría: Progreso Académico (8 logros)

| # | Logro | Rareza | Condición exacta | Puntos |
|---|-------|--------|-------------------|--------|
| 1 | **Primer Día** | Común | Completar 1 unidad didáctica. | 10 |
| 2 | **Estudiante Aplicado** | Común | Completar 5 unidades didácticas. | 25 |
| 3 | **Módulo Superado** | Común | Completar 1 módulo (todas las unidades + examen). | 50 |
| 4 | **Graduado** | Raro | Aprobar 1 curso completo. | 100 |
| 5 | **Doble Graduado** | Raro | Aprobar 2 cursos completos. | 150 |
| 6 | **Nivel Conquistado** | Épico | Completar 1 nivel formativo entero. | 200 |
| 7 | **Polivalente** | Épico | Completar los niveles transversales (Seguridad + Meteorología). | 250 |
| 8 | **Capitán Completo** | Legendario | Completar los 7 niveles formativos. | 500 |

### Categoría: Rendimiento en Evaluaciones (6 logros)

| # | Logro | Rareza | Condición exacta | Puntos |
|---|-------|--------|-------------------|--------|
| 9 | **Primera Matrícula** | Común | Obtener 100% en cualquier quiz. | 15 |
| 10 | **Perfeccionista** | Épico | Obtener 100% en 3 exámenes de módulo distintos. | 150 |
| 11 | **Mente Brillante** | Épico | Obtener ≥ 90% en el examen final de un curso. | 175 |
| 12 | **Sin Fallos** | Legendario | Completar un módulo entero (todas las unidades + examen) sin suspender ningún quiz ni examen en el primer intento. | 300 |
| 13 | **A la Primera** | Raro | Aprobar un examen de módulo en el primer intento. | 75 |
| 14 | **Rachazo** | Raro | Aprobar 5 quizzes consecutivos con ≥ 80%. | 80 |

### Categoría: Constancia (6 logros)

| # | Logro | Rareza | Condición exacta | Puntos |
|---|-------|--------|-------------------|--------|
| 15 | **Día 1** | Común | Acceder a la academia por primera vez. | 5 |
| 16 | **Semana Activa** | Raro | Acceder 7 días consecutivos. | 50 |
| 17 | **Mes Activo** | Épico | Acceder 30 días en total (no necesariamente consecutivos). | 100 |
| 18 | **Trimestre Marino** | Legendario | Acceder 90 días en total. | 200 |
| 19 | **Estudio Diario** | Raro | Completar al menos 1 unidad 5 días seguidos. | 60 |
| 20 | **Madrugador del Mar** | Raro | Acceder a la academia antes de las 8:00 AM en 5 ocasiones distintas. | 40 |

### Categoría: Habilidades Específicas (5 logros)

| # | Logro | Rareza | Condición exacta | Puntos |
|---|-------|--------|-------------------|--------|
| 21 | **Nudos de Acero** | Raro | Obtener habilidad "Manos de Marinero" (≥ 90% en quiz de nudos). | 75 |
| 22 | **Señor del Viento** | Épico | Obtener habilidades "Domador del Viento" + "Trimador". | 125 |
| 23 | **Guardián del Mar** | Épico | Obtener habilidades "Patrón de Rescate" + "Oficial de Seguridad". | 150 |
| 24 | **Maestro de Maniobras** | Raro | Completar todas las unidades de Virada + Trasluchada con ≥ 85%. | 100 |
| 25 | **Habilidades Completas** | Legendario | Obtener las 12 habilidades. | 500 |

### Categoría: Experiencia Práctica (5 logros)

| # | Logro | Rareza | Condición exacta | Puntos |
|---|-------|--------|-------------------|--------|
| 26 | **10 Horas Navegadas** | Común | Acumular 10 horas de navegación registradas y verificadas. | 50 |
| 27 | **50 Horas Navegadas** | Raro | Acumular 50 horas de navegación registradas. | 200 |
| 28 | **100 Horas Navegadas** | Épico | Acumular 100 horas de navegación registradas. | 350 |
| 29 | **Primer Regatista** | Raro | Registrar al menos 1 hora de tipo "regata". | 75 |
| 30 | **Travesía Completada** | Épico | Registrar al menos 1 hora de tipo "travesia". | 125 |

## 4.3 Motor de evaluación de logros

El motor chequea las condiciones de logros en **3 momentos**:

1. **Al completar una unidad** → chequea logros de progreso, rendimiento y habilidades.
2. **Al aprobar un examen** → chequea logros de rendimiento y progreso.
3. **Al registrar horas de navegación** → chequea logros de experiencia práctica.
4. **Al hacer login** → chequea logros de constancia.

Cuando un logro se desbloquea, se registra con la fecha actual y **nunca se pierde**.

---

# 🎓 PARTE 5 — SISTEMA DE CERTIFICADOS

## 5.1 Tipos de certificado

| Tipo | Cuándo se emite | Formato numeración |
|------|-----------------|-------------------|
| **Certificado de Curso** | Al aprobar un curso completo | GBE-2026-XXXXXX |
| **Diploma de Nivel** | Al completar todos los cursos de un nivel | GBE-2026-XXXXXX |
| **Diploma de Capitán** | Al completar los 7 niveles | GBE-2026-CAP-XXX |

## 5.2 Niveles de certificado

Cada certificado tiene un **nivel de distinción** basado en la nota final:

| Nota del curso/nivel | Certificado emitido | Insignia |
|---------------------|--------------------|---------| 
| 75–84% | **Certificado Estándar** | Sello bronce |
| 85–94% | **Certificado de Mérito** | Sello plata |
| 95–100% | **Certificado de Excelencia** | Sello oro + "Con Honores" |

## 5.3 Requisitos por certificado

### Certificado de Curso
| Requisito | Detalle |
|-----------|---------|
| Todos los módulos completados | ✅ |
| Examen final aprobado (≥ 75%) | ✅ |
| Horas de navegación mínimas del curso | ✅ |
| Ningún logro específico requerido | — |

### Diploma de Nivel
| Requisito | Detalle |
|-----------|---------|
| Todos los cursos del nivel aprobados | ✅ |
| Habilidades del nivel obtenidas | ✅ |
| Nota media del nivel ≥ 75% | ✅ |

### Diploma de Capitán
| Requisito | Detalle |
|-----------|---------|
| Los 7 niveles completados | ✅ |
| Las 12 habilidades obtenidas | ✅ |
| ≥ 100 horas de navegación | ✅ |
| Logro "Capitán Completo" obtenido | ✅ |
| Nota media global ≥ 80% | ✅ |

## 5.4 Contenido del certificado

Cada certificado incluye:

- **Nombre del alumno**
- **Nombre del curso/nivel**
- **Nota final con distinción**
- **Fecha de emisión**
- **Número de certificado único** (verificable)
- **Firma digital** de la escuela
- **Horas de formación** (teóricas + prácticas)
- **Código QR** para verificación online
- **Habilidades demostradas** (lista de habilidades obtenidas en ese nivel)

## 5.5 Relación certificados ↔ logros ↔ habilidades

```
LOGROS → prueban CONSTANCIA y RENDIMIENTO
HABILIDADES → prueban COMPETENCIAS TÉCNICAS
CERTIFICADOS → acreditan FORMACIÓN COMPLETA (requieren ambos)
```

Un certificado sin habilidades no se emite; garantiza que el alumno no solo ha aprobado los exámenes sino que ha demostrado competencias reales.

---

# 📈 PARTE 6 — EXPERIENCIA DEL ALUMNO (UX)

## 6.1 Dashboard del Alumno

El dashboard es la "home" del alumno en la academia. Muestra de un vistazo:

### Sección superior: Identidad del Navegante
- **Avatar + nombre**
- **Rango actual** (Grumete → Marinero → Timonel → Patrón → Capitán) con icono de color
- **Barra de progreso global** hacia Capitán (% de habilidades obtenidas: X/12)
- **Puntos totales** acumulados de logros

### Sección central: Actividad actual
- **Curso activo** con barra de progreso (% unidades completadas)
- **Próxima unidad** a completar (acceso directo)
- **Racha de días** activos (icono de fuego 🔥 + número)
- **Horas de navegación** acumuladas (con gráfico lineal mensual)

### Sección inferior: Logros recientes
- **Últimos 3 logros obtenidos** con fecha
- **Logro más cercano a desbloquear** con barra de progreso ("¡Te faltan 2 unidades para Estudiante Aplicado!")

## 6.2 Barras de progreso

Barras de progreso visibles en cada nivel de la jerarquía:

| Nivel | Barra muestra |
|-------|-------------|
| **Unidad** | Secciones leídas (0/3) + quiz aprobado |
| **Módulo** | Unidades completadas (ej. 2/4) + examen |
| **Curso** | Módulos completados (ej. 1/4) + horas nav. |
| **Nivel** | Cursos aprobados (ej. 1/2) + habilidades |
| **Global** | Niveles completados (ej. 2/7) → "Camino a Capitán" |

Cada barra tiene **color progresivo**: rojo → naranja → amarillo → verde a medida que avanzas.

## 6.3 Mensajes motivacionales

El sistema muestra **mensajes contextuales** en momentos clave:

| Momento | Mensaje ejemplo |
|---------|----------------|
| Al completar 1 unidad | *"¡Primer paso dado! Cada milla náutica empieza con una unidad."* |
| Al aprobar un quiz a la primera | *"¡A la primera! El viento sopla a tu favor."* |
| Al completar un módulo | *"¡Módulo superado! Estás más cerca del horizonte."* |
| Al obtener una habilidad | *"Nueva habilidad desbloqueada: Domador del Viento 💨. Ya sabes leer el viento."* |
| Al suspender un quiz | *"El mar tiene días difíciles. Repasa la teoría y vuelve a intentarlo."* |
| Racha de 7 días | *"¡7 días seguidos! Un marinero constante llega más lejos que uno rápido."* |
| Al aprobar un curso | *"¡Curso completado! Tu certificado te espera."* |
| Al desbloquear un nivel | *"Nuevo nivel desbloqueado: Perfeccionamiento ⛵. El horizonte se amplía."* |

## 6.4 Animaciones de desbloqueo

Cuando se desbloquea algo importante, el sistema muestra una **animación tipo "cofre que se abre"**:

| Evento | Animación |
|--------|-----------|
| **Logro obtenido** | Badge que aparece con efecto dorado pulsante + nombre + descripción. |
| **Habilidad desbloqueada** | Icono de la habilidad que "crece" desde el centro + confetti marino (anclas, estrellas, olas). |
| **Nivel desbloqueado** | Pantalla completa con fondo marino + texto grande + el icono del nivel con brillo. |
| **Certificado emitido** | Pergamino que se despliega + sello que estampa + botón "Ver mi certificado". |
| **Rango subido** | La barra de rango se llena + estrella que explota + nuevo rango con animación de texto. |

Todas las animaciones son **opcionales** (el alumno puede desactivarlas en ajustes) y **duran máximo 3 segundos** para no ser molestas.

## 6.5 Galería de logros y certificados

### Galería de Logros
- Grid de todos los logros posibles
- Los obtenidos se muestran en color con fecha
- Los no obtenidos se ven en escala de grises con un candado sutil
- Hover/tap muestra la condición de desbloqueo
- Filtrable por categoría
- Ordenable por: fecha obtenido, rareza, categoría

### Galería de Certificados
- Lista vertical tipo "estantería" con los certificados obtenidos
- Cada certificado muestra: nombre, nota, fecha, distinción
- Botón para descargar PDF
- Botón para compartir (URL de verificación pública)

## 6.6 Notificaciones

| Tipo | Canal | Ejemplo |
|------|-------|---------|
| Logro obtenido | In-app + toast | "🏅 ¡Has desbloqueado: Semana Activa!" |
| Nivel desbloqueado | In-app + animación | "🔓 Nuevo nivel: Perfeccionamiento" |
| Certificado listo | In-app + email | "🎓 Tu certificado está listo para descargar" |
| Racha en riesgo | In-app (sutil) | "🔥 No pierdas tu racha de 5 días — entra hoy" |
| Habilidad cercana | In-app (sutil) | "💪 ¡Te falta 1 quiz para Manos de Marinero!" |

---

# 📊 RESUMEN DE MECÁNICAS

```
┌─────────────────────────────────────────────────┐
│           CICLO DE PROGRESO DEL ALUMNO          │
│                                                 │
│   Leer Unidad → Quiz Unidad (60%)               │
│       ↓                                         │
│   Completar Módulo → Examen Módulo (70%)        │
│       ↓                                         │
│   Completar Curso → Examen Final (75%) + Horas  │
│       ↓                                         │
│   Completar Nivel → Habilidades requeridas      │
│       ↓                                         │
│   ══════ CERTIFICADO EMITIDO ══════             │
│       ↓                                         │
│   Siguiente Nivel Desbloqueado                  │
│                                                 │
│   ─── En paralelo ───                           │
│   • Logros por progreso, rendimiento y horas    │
│   • Habilidades por módulos específicos          │
│   • Rango sube con más habilidades              │
│   • Puntos acumulados por logros                │
└─────────────────────────────────────────────────┘
```

---

*Documento de diseño funcional v1.0 — Getxo Bela Eskola — Febrero 2026*
