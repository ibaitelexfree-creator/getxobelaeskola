# Tareas de Agentes

## Cola de Tareas Pendientes
| ID | Prioridad | Agente | Tarea | Estado | Fecha |
|----|-----------|--------|-------|--------|-------|
| 1674567216437366258 | 3 | jules | 🆘 Self-Healing: Repairing Crash | running | 2026-02-23 |
| 5921019294389838983 | 3 | jules | enla apk de missiion control quita de la pesstania de tasks,  🚀 | running | 2026-02-23 |
| 391766544113020074 | 3 | jules | SIMULACIÓN TELEGRAM: Arreglar bug de colisión en simulador | running | 2026-02-23 |
| 13895023891030126704 | 3 | jules | Intercambia los logos de las aplicaciones apk, la de getxobela eskola tendra el logo de control manager apk y viceversa | running | 2026-02-23 |
| 2676968538456163746 | 3 | jules | en la aplicación de mission control en la primera pestaña en la de Dash ahí sigue offline no funciona mira a ver que puede estar pasando | running | 2026-02-23 |
| 885926027108893061 | 3 | jules | 🆘 Self-Healing: Repairing Crash | running | 2026-02-23 |
| T-MLXM4FQP | 3 | jules | en la aplicación de mission control en la primera pestaña en la de Dash ahí sigue offline no funciona mira a ver que puede estar pasando | running | 2026-02-23 |
| T-MLXE01D4 | 3 | jules | Intercambia los logos de las aplicaciones apk, la de getxobela eskola tendra el logo de control manager apk y viceversa | running | 2026-02-23 |
| TEST-TG-MLX5RAAA | 3 | jules | SIMULACIÓN TELEGRAM: Arreglar bug de colisión en simulador | running | 2026-02-23 |
| 7567651924309740607 | 3 | jules | enla apk de missiion control quita de la pesstania de tasks,  🚀 | running | 2026-02-23 |

## Tareas Completadas
| ID | Agente | Tarea | Resultado | Fecha |
|----|--------|-------|-----------|-------|

## Reglas
- **Prioridad:** 1 (crítico) → 5 (nice-to-have)
- **Estado:** `pendiente` → `en_curso` → `review` → `completada`
- Solo Ibai o Antigravity pueden asignar tareas
- El agente asignado actualiza su estado aquí

## 🐝 Swarm Inyectado (Automático)

- [ ] swarm_45_jules_01: [CONTEXT: branch=feature/arch-db-capacity files=supabase/migrations/20260303_content_capacity.sql] Eres Jules 01. Asegura que la tabla de lecciones (4000 palabras) y 'banco_preguntas' tengan RLS eficiente. El texto debe guardarse como Markdown (texto largo). (jules)
- [ ] swarm_45_jules_02: [CONTEXT: branch=feature/arch-indexes files=supabase/migrations/20260303_indexes.sql] Eres Jules 02. Crea índices GIN en la tabla 'banco_preguntas' y 'micro_lecciones' para búsqueda de texto completo y optimización de paginación (offset). (jules)
- [ ] swarm_45_jules_03: [CONTEXT: branch=feature/arch-api-quiz files=src/app/api/quiz/validate/route.ts] Eres Jules 03. Crea un endpoint protegido para validar las respuestas de los Quizzes sin mandar todas las flags 'is_correct' al cliente por adelantado. (jules)
- [ ] swarm_45_jules_04: [CONTEXT: branch=feature/arch-api-content files=src/app/api/content/route.ts] Eres Jules 04. Crea un endpoint para inyectar 4000 palabras por curso al frontend con paginación optimizada. (jules)
- [ ] swarm_45_jules_05: [CONTEXT: branch=feature/arch-storage-assets files=scripts/data_ingestion/init_storage.js] Eres Jules 05. Asegura los buckets para el material de apoyo (pdfs y videos) de los Cursos 2-7 con CDN setup. (jules)
- [ ] swarm_45_jules_06: [CONTEXT: branch=feature/data-c2-text files=scripts/content_gen/generate_c2_text.js] Eres J06. Usa el SDK de OpenAI. Genera 4000 palabras de contenido académico riguroso para el Curso 2 (formato MD). Insértalo en la tabla micro_lecciones. (jules)
- [ ] swarm_45_jules_07: [CONTEXT: branch=feature/data-c2-quiz files=scripts/content_gen/generate_c2_quiz.js] Eres J07. Script Node para generar e insertar 200 preguntas tipo test estrictas y náuticas para el Curso 2 a la tabla 'banco_preguntas'. (jules)
- [ ] swarm_45_jules_08: [CONTEXT: branch=feature/data-c2-assets files=scripts/content_gen/link_c2_assets.js] Eres J08. Asocia y sube todos los anexos (gífs, PDFs, etc.) correspondientes al Curso 2. (jules)
- [ ] swarm_45_jules_09: [CONTEXT: branch=feature/data-c3-text files=scripts/content_gen/generate_c3_text.js] Eres J09. Igual que J06, pero enfocado rígidamente al temario oficial del Curso 3 (4000 palabras). (jules)
- [ ] swarm_45_jules_10: [CONTEXT: branch=feature/data-c3-quiz files=scripts/content_gen/generate_c3_quiz.js] Eres J10. Igual que J07, genera e inserta 200 preguntas estrictas para el Curso 3. (jules)
- [ ] swarm_45_jules_11: [CONTEXT: branch=feature/data-c3-assets files=scripts/content_gen/link_c3_assets.js] Eres J11. Sube y enlaza los materiales extra correspondientes al Curso 3 terminando la estructura. (jules)
- [ ] swarm_45_jules_12: [CONTEXT: branch=feature/data-c4-text files=scripts/content_gen/generate_c4_text.js] Eres J12. Redacta, estructura (Markdown) e inyecta 4000 palabras del temario del Curso 4 en la base de datos. (jules)
- [ ] swarm_45_jules_13: [CONTEXT: branch=feature/data-c4-quiz files=scripts/content_gen/generate_c4_quiz.js] Eres J13. Haz un script masivo para crear, verificar y poblar 200 preguntas en BD para el Curso 4. (jules)
- [ ] swarm_45_jules_14: [CONTEXT: branch=feature/data-c4-assets files=scripts/content_gen/link_c4_assets.js] Eres J14. Descarga y sincroniza anexos de Storage con las nuevas IDs del Curso 4. (jules)
- [ ] swarm_45_jules_15: [CONTEXT: branch=feature/data-c5-text files=scripts/content_gen/generate_c5_text.js] Eres J15. Redacción exhaustiva y experta de 4000 palabras en crudo (Markdown) inyectadas a DB para Curso 5. (jules)
- [ ] swarm_45_jules_16: [CONTEXT: branch=feature/data-c5-quiz files=scripts/content_gen/generate_c5_quiz.js] Eres J16. Población estricta de 200 preguntas técnicas/teóricas en la tabla 'banco_preguntas' (ID: Curso 5). (jules)
- [ ] swarm_45_jules_17: [CONTEXT: branch=feature/data-c5-assets files=scripts/content_gen/link_c5_assets.js] Eres J17. Asociar PDFs y Videos ya subidos a las nuevas entradas del Curso 5. (jules)
- [ ] swarm_45_jules_18: [CONTEXT: branch=feature/data-c6-text files=scripts/content_gen/generate_c6_text.js] Eres J18. Script para redactar (con LLM) 4000 palabras al máximo detalle e insertarlas en lecciones del Curso 6. (jules)
- [ ] swarm_45_jules_19: [CONTEXT: branch=feature/data-c6-quiz files=scripts/content_gen/generate_c6_quiz.js] Eres J19. Script de generación en batch y carga de 200 items de evaluación para Curso 6. (jules)
- [ ] swarm_45_jules_20: [CONTEXT: branch=feature/data-c7-text files=scripts/content_gen/generate_c7_text.js] Eres J20. Generación, limpieza Markdown e inserción de 4000 palabras clave (Módulos 1 al final) del Curso 7. (jules)
- [ ] swarm_45_jules_21: [CONTEXT: branch=feature/data-c7-quiz files=scripts/content_gen/generate_c7_quiz.js] Eres J21. 200 preguntas para Curso 7, verificando que contengan arrays de respuestas tipo {id, text, is_correct: bool}. (jules)
- [ ] swarm_45_jules_22: [CONTEXT: branch=feature/data-embed-part1 files=scripts/content_gen/embed_c2_c4.js] Eres J22. Lee las 12,000 palabras de C2 a C4 de la BD y envíalas a Qdrant/Embeddings para el cerebro GPT. (jules)
- [ ] swarm_45_jules_23: [CONTEXT: branch=feature/data-embed-part2 files=scripts/content_gen/embed_c5_c7.js] Eres J23. Igual que J22, pero vectores de C5 a C7 (otras 12,000 palabras) directas a Qdrant Colección Global. (jules)
- [ ] swarm_45_jules_24: [CONTEXT: branch=feature/data-qa-wordcount files=scripts/content_gen/test_wordcounts.js] Eres J24. Script de reporte que verifique que la media ponderada por curso sea exactamente 4000 palabras (Cursos 2-7). (jules)
- [ ] swarm_45_jules_25: [CONTEXT: branch=feature/data-qa-quizzes files=scripts/content_gen/test_quizzes.js] Eres J25. Script para validar que 'SELECT count(*) FROM banco_preguntas' == 1200 (para C2-C7), y que solo hay 1 correcta por pregunta. (jules)
- [ ] swarm_45_jules_26: [CONTEXT: branch=feature/ui-reader-core files=src/components/academy/reading/ArticleReader.tsx] Eres J26. Construye 'ArticleReader.tsx' (Zen Mode, tipografía perfecta, MD rendering) para leer 4000 palabras de un tirón. (jules)
- [ ] swarm_45_jules_27: [CONTEXT: branch=feature/ui-quiz-engine files=src/components/academy/quiz/QuizEngine.tsx] Eres J27. Motor React optimizado para manejar arrays de cientos de preguntas, con animaciones sin tirones. (jules)
- [ ] swarm_45_jules_28: [CONTEXT: branch=feature/ui-progress-bar files=src/components/academy/quiz/QuizProgress.tsx] Eres J28. Componente que visualiza el progreso (ej: Pg 15/200) y tiempo restante. (jules)
- [ ] swarm_45_jules_29: [CONTEXT: branch=feature/ui-feedback-alert files=src/components/academy/quiz/LiveFeedback.tsx] Eres J29. UI que vibra o parpadea verde/rojo según si le pegaste o no a la API '/validate'. Animaciones mágicas. (jules)
- [ ] swarm_45_jules_30: [CONTEXT: branch=feature/ui-result-screen files=src/components/academy/quiz/QuizResults.tsx] Eres J30. Pantalla fastuosa premium al completar 200 preguntas. Barras circulares, XP otorgada. (jules)
- [ ] swarm_45_jules_31: [CONTEXT: branch=feature/ui-pdf-core files=src/components/academy/materials/PDFViewer.tsx] Eres J31. Crea visor de anexo PDF. No interfieras con la lectura de Markdown del texto base. (jules)
- [ ] swarm_45_jules_32: [CONTEXT: branch=feature/ui-pdf-download files=src/components/academy/materials/DownloadButton.tsx] Eres J32. Botón de descarga de anexos con UI interactiva Tailwind. (jules)
- [ ] swarm_45_jules_33: [CONTEXT: branch=feature/ui-mobile-tweaks files=src/components/academy/reading/ReadingMobile.tsx] Eres J33. Asegura el swiping nativo para cambiar secciones leyendo los artículos largos en móviles iOS. (jules)
- [ ] swarm_45_jules_34: [CONTEXT: branch=feature/ui-reader-i18n files=messages/en.json,messages/eu.json] Eres J34. Variables estáticas i18n para los verbos: Leer, Siguiente Lección, Tomar Examen, Terminar. (jules)
- [ ] swarm_45_jules_35: [CONTEXT: branch=feature/ui-dark-mode files=src/components/academy/reading/DarkModeToggle.tsx] Eres J35. Botón flotante para Switch DarkMode. El 'ArticleReader' a fondo negro ayuda en navegación nocturna. (jules)
- [ ] swarm_45_jules_36: [CONTEXT: branch=feature/ui-video-player files=src/components/academy/materials/VideoPlayer.tsx] Eres J36. Reproductor para el contenido anexo de apoyo. (jules)
- [ ] swarm_45_jules_37: [CONTEXT: branch=feature/ui-transcript files=src/components/academy/materials/TranscriptSide.tsx] Eres J37. Panel lateral para transcripciones vtt. (jules)
- [ ] swarm_45_jules_38: [CONTEXT: branch=feature/ui-material-tab files=src/components/academy/dashboard/MaterialTabs.tsx] Eres J38. Pestañas de separación: '📚 Texto Central (4000w)', '🗒️ Quizzes de Retención', '📎 Material Anexo'. (jules)
- [ ] swarm_45_jules_39: [CONTEXT: branch=feature/ui-reading-haptics files=src/components/academy/reading/useHaptics.ts] Eres J39. Micro-interacciones móviles. Vibraciones hápticas suaves al ir pasando páginas o adivinar tests. (jules)
- [ ] swarm_45_jules_40: [CONTEXT: branch=feature/ui-index-navigator files=src/components/academy/reading/TableOfContents.tsx] Eres J40. Mini mapa semántico (h2, h3) automático del contenido de las 4000 palabras. (jules)
- [ ] swarm_45_jules_41: [CONTEXT: branch=feature/ui-error-catcher files=src/components/academy/reading/ErrorReporter.tsx] Eres J41. Botón 'Reportar errata en el texto'. (jules)
- [ ] swarm_45_jules_42: [CONTEXT: branch=feature/ui-scroll-memory files=src/components/academy/reading/useScrollPersist.ts] Eres J42. Guarda la posición Y del scroll, si estás en la palabra 2000, vuelve ahí al recargar la web. (jules)
- [ ] swarm_45_jules_43: [CONTEXT: branch=feature/ui-lazy-image files=src/components/academy/reading/MDXImage.tsx] Eres J43. Imágenes embebidas en el markdown del contentivo deben tener Blur Data y next/image. (jules)
- [ ] swarm_45_jules_44: [CONTEXT: branch=feature/ui-a11y-focus files=src/components/academy/quiz/A11yQuiz.tsx] Eres J44. Contorno de enfoque fuerte y atajos de teclado para las opciones A,B,C,D en los quizzes (1,2,3,4 numpad). (jules)
- [ ] swarm_45_jules_45: [CONTEXT: branch=feature/ui-dash-notify files=src/components/academy/dashboard/CourseCompleter.tsx] Eres J45. Interfaz de celebración de 'Curso completado'. Solo aparece si leíste las 4000 palabras y pasaste los 200 tests. (jules)
