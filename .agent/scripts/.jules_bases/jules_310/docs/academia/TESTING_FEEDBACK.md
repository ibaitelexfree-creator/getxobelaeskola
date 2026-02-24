# 🧪 Plan de Testing End-to-End - Sistema de Feedback

## Fecha: 2026-02-11
## Objetivo: Validar el flujo completo de notificaciones de logros y habilidades

---

## 🎯 Escenarios de Testing

### ✅ Escenario 1: Primer Logro - "Primer Día"
**Precondición:** Usuario nuevo sin progreso previo

**Pasos:**
1. Iniciar sesión con usuario de prueba
2. Navegar a `/academy/level/[id]` (Nivel 1 - Iniciación)
3. Abrir la primera unidad
4. Leer las 3 secciones (Teoría, Práctica, Errores)
5. Esperar 5+ minutos (o ajustar timer en dev)
6. Iniciar el quiz de unidad
7. Responder correctamente al menos 3/5 preguntas (60%)
8. Enviar el quiz

**Resultado Esperado:**
- ✅ Quiz marcado como aprobado
- ✅ Unidad marcada como completada
- ✅ Toast dorado aparece con "🏆 Primer Día"
- ✅ Mensaje: "Completar 1 unidad didáctica"
- ✅ Toast desaparece automáticamente tras 7 segundos
- ✅ Mensaje motivacional aleatorio de `quiz_passed`

**Verificación Backend:**
```sql
SELECT * FROM logros_alumno 
WHERE alumno_id = '[user_id]' 
AND logro_id = (SELECT id FROM logros WHERE nombre_es = 'Primer Día');
```

---

### ✅ Escenario 2: Habilidad - "Marinero de Agua Dulce"
**Precondición:** Completar todas las unidades del Módulo 1

**Pasos:**
1. Completar Unidad 1, 2, 3 del Módulo 1 (Seguridad + Partes del barco)
2. Aprobar el examen de módulo (15 preguntas, 70% mínimo)
3. Enviar el examen

**Resultado Esperado:**
- ✅ Examen marcado como aprobado
- ✅ Módulo marcado como completado
- ✅ Modal con confetti aparece "⚡ Marinero de Agua Dulce"
- ✅ Descripción: "Completar el Módulo 1 de Iniciación"
- ✅ Modal requiere cierre manual (botón X)
- ✅ Mensaje motivacional si la nota es ≥90%

**Verificación Backend:**
```sql
SELECT * FROM habilidades_alumno 
WHERE alumno_id = '[user_id]' 
AND habilidad_id = (SELECT id FROM habilidades WHERE nombre_es = 'Marinero de Agua Dulce');
```

---

### ✅ Escenario 3: Múltiples Logros Simultáneos
**Precondición:** Usuario con 4 unidades completadas

**Pasos:**
1. Completar la 5ª unidad (desbloquea "Estudiante Aplicado")
2. Si es el primer acceso del día (desbloquea "Día 1" o actualiza racha)
3. Aprobar el quiz

**Resultado Esperado:**
- ✅ Aparecen 2 toasts (uno por cada logro)
- ✅ Los toasts se apilan verticalmente
- ✅ Cada uno tiene su propio timer de 7 segundos
- ✅ Se pueden cerrar manualmente con la X

---

### ✅ Escenario 4: Nota Alta (≥90%)
**Precondición:** Usuario preparado para un quiz

**Pasos:**
1. Iniciar quiz de unidad
2. Responder correctamente 5/5 preguntas (100%)
3. Enviar el quiz

**Resultado Esperado:**
- ✅ Mensaje motivacional de `high_score` en lugar de `quiz_passed`
- ✅ Ejemplos: "¡Impecable! Navegación de precisión." o "¡Brillante! Como un faro en la noche."
- ✅ Si es la primera vez con 100%, logro "Primera Matrícula" aparece

---

### ✅ Escenario 5: Quiz Suspendido
**Precondición:** Usuario en un quiz

**Pasos:**
1. Iniciar quiz de unidad
2. Responder incorrectamente 3+ preguntas (< 60%)
3. Enviar el quiz

**Resultado Esperado:**
- ✅ Quiz marcado como suspendido
- ✅ Mensaje motivacional de `quiz_failed`
- ✅ Ejemplos: "El mar tiene días difíciles. Repasa la teoría y vuelve a intentarlo."
- ✅ NO aparecen toasts de logros (porque no se completó la unidad)
- ✅ Botón "Reintentar" visible con cooldown de 2 minutos

---

### ✅ Escenario 6: Ventana de Detección (Edge Case)
**Objetivo:** Verificar que solo se muestran logros recientes

**Pasos:**
1. Completar un quiz que otorga un logro
2. Esperar 10 segundos
3. Recargar la página
4. Completar otro quiz

**Resultado Esperado:**
- ✅ Solo aparece el toast del nuevo logro
- ✅ NO aparece el toast del logro anterior (fuera de la ventana de 5 segundos)

---

## 🔧 Ajustes de UX Identificados

### 1. **Timing de Notificaciones**
- ✅ Logros: 7 segundos (actual) - **CORRECTO**
- ✅ Habilidades: Cierre manual (actual) - **CORRECTO**
- ⚠️ **Sugerencia:** Añadir un pequeño delay (500ms) entre múltiples notificaciones para que no aparezcan todas a la vez

### 2. **Stacking de Toasts**
- ✅ Actual: Se apilan verticalmente
- ⚠️ **Sugerencia:** Limitar a máximo 3 toasts visibles simultáneamente

### 3. **Sonido (Opcional)**
- ❌ Actual: Sin sonido
- 💡 **Mejora futura:** Añadir un sonido sutil para logros (opcional, desactivable)

### 4. **Animaciones**
- ✅ Slide-in desde la derecha (actual)
- ✅ Confetti para habilidades (actual)
- ⚠️ **Sugerencia:** Añadir un pequeño "bounce" al aparecer para más impacto

### 5. **Accesibilidad**
- ⚠️ **Pendiente:** Añadir `role="alert"` y `aria-live="polite"` a los toasts
- ⚠️ **Pendiente:** Asegurar que los toasts sean navegables con teclado (Tab + Enter para cerrar)

---

## 📊 Checklist de Validación

### Backend
- [ ] `/api/academy/evaluation/submit` devuelve `feedback.logros`
- [ ] `/api/academy/evaluation/submit` devuelve `feedback.habilidades`
- [ ] `/api/academy/progress/update` devuelve `feedback.logros`
- [ ] `/api/academy/progress/update` devuelve `feedback.habilidades`
- [ ] Ventana de detección de 5 segundos funciona correctamente
- [ ] Los triggers de DB insertan en `logros_alumno` y `habilidades_alumno`

### Frontend
- [ ] `useEvaluation` procesa `data.feedback.logros`
- [ ] `useEvaluation` procesa `data.feedback.habilidades`
- [ ] `addNotification` se llama por cada logro/habilidad
- [ ] Toasts aparecen en `NotificationContainer`
- [ ] Mensajes motivacionales se muestran correctamente
- [ ] Toasts se cierran automáticamente tras 7 segundos
- [ ] Modales de habilidades requieren cierre manual

### UX
- [ ] Animaciones son fluidas (60fps)
- [ ] Los toasts no bloquean la interacción con la página
- [ ] El texto es legible en todos los tamaños de pantalla
- [ ] Los iconos son apropiados para cada tipo de logro/habilidad
- [ ] Los colores siguen la paleta de la aplicación

---

## 🐛 Bugs Conocidos a Verificar

1. **Duplicación de notificaciones:** Si el usuario recarga la página justo después de completar un quiz
2. **Race condition:** Si dos quizzes se completan casi simultáneamente
3. **Overflow de toasts:** Si se desbloquean más de 5 logros a la vez
4. **Memoria:** Los toasts antiguos se eliminan del store correctamente

---

## 📝 Notas de Testing

- **Entorno:** Desarrollo local (http://localhost:3000)
- **Base de datos:** Supabase (desarrollo)
- **Usuario de prueba:** Crear usuario nuevo para testing limpio
- **Logs:** Revisar console.log en el navegador y terminal de Next.js

---

*Plan de testing generado por Antigravity - 2026-02-11*
