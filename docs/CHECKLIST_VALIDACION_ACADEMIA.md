# 🧪 CHECKLIST DE VALIDACIÓN MANUAL - FLUJO ACADEMIA

**Fecha de creación:** 2026-02-11
**Versión:** 1.0
**Tester:** _____________
**Fecha de test:** _____________

---

## 📋 INSTRUCCIONES

Este checklist debe completarse manualmente navegando por la aplicación en un navegador.
- Marcar ✅ si la funcionalidad funciona correctamente
- Marcar ❌ si hay un error
- Añadir notas en la columna "Observaciones"

**URL Base:** http://localhost:3000

---

## 1️⃣ AUTENTICACIÓN Y ACCESO

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 1.1 | Navegar a `/es/auth/login` | ☐ | |
| 1.2 | Intentar login con credenciales incorrectas | ☐ | Debe mostrar error |
| 1.3 | Registrar nueva cuenta en `/es/auth/register` | ☐ | |
| 1.4 | Verificar que el email de confirmación se envía | ☐ | |
| 1.5 | Login con credenciales correctas | ☐ | |
| 1.6 | Verificar redirección a dashboard | ☐ | |

---

## 2️⃣ MAPA DE ACADEMIA

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 2.1 | Navegar a `/es/academy` | ☐ | |
| 2.2 | Verificar que se muestran los 7 niveles | ☐ | |
| 2.3 | Verificar que Nivel 1 está disponible | ☐ | Sin candado |
| 2.4 | Verificar que Nivel 2-5 están bloqueados | ☐ | Con candado 🔒 |
| 2.5 | Verificar que Nivel 6-7 (transversales) están bloqueados | ☐ | |
| 2.6 | Verificar tooltips al hacer hover en niveles | ☐ | |
| 2.7 | Verificar que los badges de estado son correctos | ☐ | Disponible/Bloqueado/En Progreso/Completado |

---

## 3️⃣ NAVEGACIÓN POR NIVEL

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 3.1 | Click en "Nivel 1" | ☐ | |
| 3.2 | Verificar URL: `/es/academy/level/[slug]` | ☐ | |
| 3.3 | Verificar que se muestran los cursos del nivel | ☐ | |
| 3.4 | Verificar que el primer curso está disponible | ☐ | |
| 3.5 | Verificar que los demás cursos están bloqueados | ☐ | |
| 3.6 | Verificar breadcrumb de navegación | ☐ | Academia > Nivel 1 |
| 3.7 | Verificar botón "Volver al mapa" funciona | ☐ | |

---

## 4️⃣ NAVEGACIÓN POR CURSO

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 4.1 | Click en el primer curso disponible | ☐ | |
| 4.2 | Verificar URL: `/es/academy/course/[slug]` | ☐ | |
| 4.3 | Verificar que se muestran los módulos del curso | ☐ | |
| 4.4 | Verificar que el primer módulo está disponible | ☐ | |
| 4.5 | Verificar descripción del curso | ☐ | |
| 4.6 | Verificar horas de teoría y práctica | ☐ | |
| 4.7 | Verificar breadcrumb: Academia > Nivel > Curso | ☐ | |

---

## 5️⃣ NAVEGACIÓN POR MÓDULO

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 5.1 | Click en el primer módulo disponible | ☐ | |
| 5.2 | Verificar URL: `/es/academy/module/[id]` | ☐ | |
| 5.3 | Verificar que se muestran las unidades del módulo | ☐ | |
| 5.4 | Verificar que la primera unidad está disponible | ☐ | |
| 5.5 | Verificar progreso del módulo (0% al inicio) | ☐ | |
| 5.6 | Verificar breadcrumb completo | ☐ | |

---

## 6️⃣ LECTURA DE UNIDAD

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 6.1 | Click en la primera unidad | ☐ | |
| 6.2 | Verificar URL: `/es/academy/unit/[id]` | ☐ | |
| 6.3 | Verificar que el contenido markdown se renderiza | ☐ | |
| 6.4 | Verificar que las imágenes se cargan (si las hay) | ☐ | |
| 6.5 | Scroll hasta el final del contenido | ☐ | |
| 6.6 | Verificar botón "Marcar como leído" aparece | ☐ | |
| 6.7 | Click en "Marcar como leído" | ☐ | |
| 6.8 | Verificar que el botón cambia a "✓ Leído" | ☐ | |
| 6.9 | Verificar que aparece botón "Continuar al Quiz" | ☐ | |

---

## 7️⃣ EVALUACIÓN (QUIZ)

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 7.1 | Click en "Continuar al Quiz" | ☐ | |
| 7.2 | Verificar que carga la pantalla de evaluación | ☐ | |
| 7.3 | Verificar que se muestra la primera pregunta | ☐ | |
| 7.4 | Verificar contador de preguntas (ej: 1/10) | ☐ | |
| 7.5 | Verificar que el timer funciona (si aplica) | ☐ | |
| 7.6 | Seleccionar una respuesta | ☐ | |
| 7.7 | Verificar que la respuesta se marca visualmente | ☐ | |
| 7.8 | Click en "Siguiente" o usar flecha derecha | ☐ | |
| 7.9 | Verificar navegación a la siguiente pregunta | ☐ | |
| 7.10 | Probar navegación hacia atrás (flecha izquierda) | ☐ | |
| 7.11 | Verificar que las respuestas se mantienen | ☐ | |
| 7.12 | Completar todas las preguntas | ☐ | |
| 7.13 | Verificar botón "Enviar" en la última pregunta | ☐ | |
| 7.14 | Click en "Enviar" | ☐ | |
| 7.15 | Verificar modal de confirmación | ☐ | "¿Estás seguro?" |
| 7.16 | Confirmar envío | ☐ | |

---

## 8️⃣ RESULTADOS DE EVALUACIÓN

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 8.1 | Verificar que se muestra la pantalla de resultados | ☐ | |
| 8.2 | Verificar que se muestra la nota obtenida | ☐ | Porcentaje |
| 8.3 | Verificar mensaje de aprobado/reprobado | ☐ | Umbral: 70% |
| 8.4 | Verificar que se muestran respuestas correctas/incorrectas | ☐ | |
| 8.5 | Verificar botón "Volver al Dashboard" | ☐ | |
| 8.6 | Verificar botón "Repetir Quiz" (si reprobó) | ☐ | |
| 8.7 | Si aprobó: verificar mensaje de desbloqueo | ☐ | "Has desbloqueado..." |

---

## 9️⃣ DASHBOARD Y PROGRESO

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 9.1 | Navegar a `/es/academy/dashboard` | ☐ | |
| 9.2 | Verificar que se muestra el progreso actualizado | ☐ | |
| 9.3 | Verificar que la unidad completada tiene ✓ | ☐ | |
| 9.4 | Verificar que el módulo muestra progreso (ej: 1/5) | ☐ | |
| 9.5 | Verificar que el curso muestra progreso | ☐ | |
| 9.6 | Verificar que el nivel muestra progreso | ☐ | |
| 9.7 | Verificar sección "Habilidades Obtenidas" | ☐ | |
| 9.8 | Verificar sección "Logros y Medallas" | ☐ | |
| 9.9 | Verificar sección "Certificados" | ☐ | |

---

## 🔟 DESBLOQUEO DE CONTENIDO

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 10.1 | Completar la primera unidad y quiz | ☐ | |
| 10.2 | Verificar que la segunda unidad se desbloquea | ☐ | |
| 10.3 | Completar todas las unidades de un módulo | ☐ | |
| 10.4 | Verificar que el siguiente módulo se desbloquea | ☐ | |
| 10.5 | Completar todos los módulos de un curso | ☐ | |
| 10.6 | Verificar que el siguiente curso se desbloquea | ☐ | |
| 10.7 | Completar todos los cursos de un nivel | ☐ | |
| 10.8 | Verificar que el siguiente nivel se desbloquea | ☐ | |
| 10.9 | Completar Nivel 2 | ☐ | |
| 10.10 | Verificar que Niveles 6 y 7 (transversales) se desbloquean | ☐ | |

---

## 1️⃣1️⃣ CERTIFICADOS

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 11.1 | Completar un curso completo | ☐ | |
| 11.2 | Verificar que se genera un certificado | ☐ | |
| 11.3 | Verificar que aparece en el dashboard | ☐ | |
| 11.4 | Click en "Descargar PDF" | ☐ | |
| 11.5 | Verificar que el PDF se descarga | ☐ | |
| 11.6 | Abrir el PDF y verificar contenido | ☐ | Nombre, curso, fecha, hash |
| 11.7 | Copiar el número de certificado | ☐ | |
| 11.8 | Navegar a `/es/verify/id/[certificate_number]` | ☐ | |
| 11.9 | Verificar que el certificado se valida | ☐ | |
| 11.10 | Probar con número incorrecto | ☐ | Debe mostrar error |

---

## 1️⃣2️⃣ NOTIFICACIONES Y FEEDBACK

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 12.1 | Completar una unidad | ☐ | |
| 12.2 | Verificar que aparece toast de confirmación | ☐ | |
| 12.3 | Desbloquear una habilidad | ☐ | |
| 12.4 | Verificar que aparece notificación de habilidad | ☐ | |
| 12.5 | Conseguir un logro | ☐ | |
| 12.6 | Verificar que aparece modal de logro | ☐ | |
| 12.7 | Verificar animaciones de confetti (si aplica) | ☐ | |

---

## 1️⃣3️⃣ ACCESIBILIDAD

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 13.1 | Navegar usando solo el teclado (Tab) | ☐ | |
| 13.2 | Verificar que todos los botones son alcanzables | ☐ | |
| 13.3 | Verificar indicadores de foco visibles | ☐ | Anillo de foco |
| 13.4 | Usar atajos de teclado en quiz (1-4, flechas) | ☐ | |
| 13.5 | Verificar que los modales atrapan el foco | ☐ | |
| 13.6 | Usar lector de pantalla (NVDA/JAWS) | ☐ | |
| 13.7 | Verificar que los aria-labels son descriptivos | ☐ | |
| 13.8 | Verificar contraste de colores | ☐ | WCAG AA |

---

## 1️⃣4️⃣ PERSISTENCIA Y RECARGA

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 14.1 | Completar una unidad | ☐ | |
| 14.2 | Recargar la página (F5) | ☐ | |
| 14.3 | Verificar que el progreso se mantiene | ☐ | |
| 14.4 | Cerrar sesión | ☐ | |
| 14.5 | Volver a iniciar sesión | ☐ | |
| 14.6 | Verificar que el progreso se mantiene | ☐ | |
| 14.7 | Empezar un quiz | ☐ | |
| 14.8 | Responder 3 preguntas | ☐ | |
| 14.9 | Cerrar el navegador sin enviar | ☐ | |
| 14.10 | Volver al quiz | ☐ | |
| 14.11 | Verificar que las respuestas se guardaron | ☐ | |

---

## 1️⃣5️⃣ ACCESO DIRECTO POR URL

| # | Acción | Estado | Observaciones |
|---|--------|--------|---------------|
| 15.1 | Intentar acceder a unidad bloqueada por URL | ☐ | |
| 15.2 | Verificar que se muestra página de "Acceso Denegado" | ☐ | |
| 15.3 | Verificar mensaje explicativo | ☐ | |
| 15.4 | Verificar botón "Volver al Dashboard" | ☐ | |
| 15.5 | Intentar acceder a módulo bloqueado | ☐ | |
| 15.6 | Verificar que se bloquea correctamente | ☐ | |
| 15.7 | Intentar acceder a curso bloqueado | ☐ | |
| 15.8 | Verificar que se bloquea correctamente | ☐ | |

---

## 1️⃣6️⃣ BUGS CONOCIDOS A VERIFICAR

| # | Bug Potencial | Estado | Observaciones |
|---|---------------|--------|---------------|
| 16.1 | Desbloqueo de contenido no funciona | ☐ | |
| 16.2 | Progreso no se guarda en la base de datos | ☐ | |
| 16.3 | Quiz no calcula la nota correctamente | ☐ | |
| 16.4 | Certificados no se generan | ☐ | |
| 16.5 | Hash de verificación no es único | ☐ | |
| 16.6 | Notificaciones no aparecen | ☐ | |
| 16.7 | Timer del quiz no funciona | ☐ | |
| 16.8 | Navegación por teclado no funciona en quiz | ☐ | |

---

## 📊 RESUMEN DE RESULTADOS

**Total de checks:** 150+
**Completados:** _____ / _____
**Fallidos:** _____ / _____
**Porcentaje de éxito:** _____%

---

## 🐛 BUGS ENCONTRADOS

| # | Descripción | Severidad | Pasos para reproducir | Captura |
|---|-------------|-----------|----------------------|---------|
| 1 | | ☐ Crítico ☐ Alto ☐ Medio ☐ Bajo | | |
| 2 | | ☐ Crítico ☐ Alto ☐ Medio ☐ Bajo | | |
| 3 | | ☐ Crítico ☐ Alto ☐ Medio ☐ Bajo | | |
| 4 | | ☐ Crítico ☐ Alto ☐ Medio ☐ Bajo | | |
| 5 | | ☐ Crítico ☐ Alto ☐ Medio ☐ Bajo | | |

---

## ✅ APROBACIÓN FINAL

- [ ] Todos los flujos críticos funcionan correctamente
- [ ] No hay bugs bloqueantes
- [ ] La accesibilidad es aceptable
- [ ] El progreso se persiste correctamente
- [ ] Los certificados se generan correctamente

**Firma del Tester:** _____________
**Fecha:** _____________
**Estado:** ☐ APROBADO ☐ APROBADO CON OBSERVACIONES ☐ RECHAZADO

---

**Notas adicionales:**

