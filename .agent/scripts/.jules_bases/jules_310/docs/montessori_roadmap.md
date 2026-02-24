# Plan de Mejora Pedagógica "Montessori Digital"

Este documento detalla la hoja de ruta para transformar la academia online utilizando principios Montessori: Autonomía, Materiales Manipulativos, Control de Error, y Aislamiento de la Cualidad.

Cada fase está diseñada para ser ejecutada por un Agente de IA independiente.

## Fase 0: Cierre y Consolidación (Foundation)
**Objetivo:** Finalizar las tareas pendientes del plan de mejora original para asegurar una base sólida antes de la expansión Montessori.
**Agente Recomendado:** 🤖 AI Developer (Standard) Model: Gemini 2.0 Flash o Sonnet 3.5 (Fast & Efficient) Mode: EXECUTION

### Tareas Detalladas:
1. **Integración de Quizzes en Unidades:**
   - Revisar `SimpleEvaluation.tsx` y asegurarse de que soporta el modo "sin servidor" si es necesario, o conectar con `start/route.ts`.
   - Editar `src/app/[locale]/academy/unit/[id]/UnitReaderMain.tsx` para sustituir el placeholder del quiz con el componente `SimpleEvaluation` totalmente funcional.
   - Asegurar que al aprobar el quiz, se desbloquee la siguiente unidad (actualizar estado en progreso_alumno).
2. **Panel de Progreso Avanzado (Heatmap):**
   - Crear componente `src/components/academy/dashboard/ActivityHeatmap.tsx`.
   - Debe visualizar los últimos 365 días como una cuadrícula (estilo GitHub).
   - Conectar con datos reales de `acceos_alumno` o `sesiones`.
3. **Análisis de Debilidades/Fortalezas:**
   - Crear componente `src/components/academy/dashboard/SkillRadar.tsx` usando recharts o CSS puro.
   - Mapear las etiquetas de las preguntas falladas en los quizzes para sugerir temas de repaso.

## Fase 1: El Ambiente Preparado (Navegación Exploratoria)
**Principio Montessori:** Libertad dentro de límites. El alumno debe poder explorar el contenido de forma no lineal si lo desea, guiado por su interés, pero con una estructura clara.
**Agente Recomendado:** 🧠 AI Architect Model: Gemini 1.5 Pro (High Context/Reasoning) o Opus Mode: PLANNING -> EXECUTION

### Tareas Detalladas:
1. **Mapa de Constelaciones (Interfaz de Navegación):**
   - Diseñar y construir `src/components/academy/navigation/ConstellationMap.tsx`.
   - En lugar de una lista vertical tradicional, crear una visualización SVG interactiva donde cada "Estrella" es una unidad/tema.
   - Las líneas entre estrellas representan dependencias (prerrequisitos).
   - Implementar zoom y pan (arrastrar) para dar sensación de exploración espacial.
2. **Modo "Trabajo Libre" vs "Curso Estructurado":**
   - Modificar el estado global (Context/Store) para permitir un `mode: 'exploration'`.
   - En modo exploración, permitir el acceso de "solo lectura" a unidades avanzadas sin registrar progreso oficial, fomentando la curiosidad sin miedo a "suspender".
3. **Refactorización de UI Limpia:**
   - Eliminar distracciones visuales en la vista de lectura (`UnitReader`).
   - Implementar un "Modo Zen" que oculte barras laterales y cabeceras, dejando solo el contenido y controles mínimos.

## Fase 2: Materiales Manipulativos I - La Mesa de Cartas Virtual
**Principio Montessori:** Aprender haciendo (Hands-on). La abstracción debe venir después de la experiencia concreta.
**Agente Recomendado:** ⚡ AI Frontend Specialist Model: Sonnet 3.5 o Gemini 2.0 Pro (Strong Coding Logic) Mode: EXECUTION (Requires deep concentration)

### Tareas Detalladas (Duración estimada: >30 min para IA):
1. **Lienzo de Carta Náutica (Canvas Core):**
   - Crear `src/components/tools/ChartPlotter/ChartCanvas.tsx`.
   - Implementar sistema de coordenadas geográficas (lat/long) mapeado a píxeles.
   - Cargar una imagen de carta náutica de entrenamiento como fondo.
   - Implementar zoom y pan eficiente en Canvas.
2. **Herramienta: Regla Paralela (Transportador):**
   - Implementar una herramienta interactiva que el usuario pueda "agarrar" y rotar.
   - Debe mostrar el ángulo actual respecto al norte verdadero.
   - Permite "caminar" con la regla sobre el mapa (traslación manteniendo ángulo).
3. **Herramienta: Compás de Puntas:**
   - Herramienta para medir distancias.
   - Click A (punta 1) + Drag + Click B (punta 2).
   - Mostrar distancia en Millas Náuticas (convertir px a MN según escala de la carta).
4. **Sistema de Ejercicios de Rumbo:**
   - Crear un generador de problemas: "Traza un rumbo verdadero de 045° desde el Faro A".
   - Algoritmo de validación: Comprobar si la línea dibujada por el usuario está dentro de un margen de error aceptable (±1°).

## Fase 3: Materiales Manipulativos II - El Laboratorio de Viento
**Principio Montessori:** Aislamiento de la cualidad. Enfocarse en una sola variable física (el viento) para entender su efecto en las velas.
**Agente Recomendado:** 🧪 AI Physics/Simulation Model: Claude 3 Opus o o1 (Thinking/Reasoning para lógica física) Mode: EXECUTION

### Tareas Detalladas:
1. **Simulador de Vectores de Viento:**
   - Crear `src/components/simulation/WindTunnel.tsx`.
   - Visualizar el viento como flujo de partículas.
   - Permitir al usuario cambiar la dirección e intensidad del viento (sliders).
2. **Modelo de Velas Interactivo:**
   - Dibujar un barco (vista superior) simple.
   - Implementar controles para "Cazar" (tighten) y "Amollar" (loosen) escota de Mayor y Génova.
   - Lógica Física (Simplified Lift): Calcular la eficiencia de la vela basándose en el ángulo de ataque.
   - Visualizar el "flujo laminar" vs "flujo turbulento" en la vela usando colores (Verde = Ok, Rojo = Turbulencia/Flameo).
3. **Feedback Intrínseco (Control de Error):**
   - Si las velas están mal ajustadas, el barco virtual debe "detenerse" o "escorar excesivamente" (visual feedback).
   - No mostrar texto de "Error", dejar que la simulación muestre la consecuencia.

## Fase 4: Taxonomía y Nomenclatura (Tarjetas de 3 Partes)
**Principio Montessori:** Nomenclatura precisa. Uso de tarjetas clasificadas para enriquecer el vocabulario técnico.
**Agente Recomendado:** 📚 AI Content Curator Model: Gemini 2.0 Flash (High Volume Processing) Mode: EXECUTION

### Tareas Detalladas:
1. **Sistema de Tarjetas de 3 Partes:**
   - Evolucionar `Flashcards` a `ThreePartCards`.
   - Modo Presentación: Se muestra Imagen + Etiqueta ("Esto es una Driza").
   - Modo Asociación: Se muestran imágenes y etiquetas por separado. El usuario debe arrastrar la etiqueta a la imagen correcta.
   - Modo Definición: Se añade la definición como tercera pieza del puzzle.
2. **Base de Datos de Partes del Barco:**
   - Generar un JSON masivo de partes (Proa, Popa, Babor, Estribor, Amura, Aleta, Obra viva, Obra muerta...).
   - Para cada parte, generar visuales (SVG resaltado sobre un esquema del barco).
3. **Lección de los Tres Tiempos:**
   - Implementar la lógica pedagógica:
     - Introducción: "Esto es X".
     - Reconocimiento: "¿Cuál es X?" (Selección).
     - Recuerdo: "¿Qué es esto?" (Input/Escritura o selección difícil).

## Fase 5: El Cuaderno de Bitácora (Reflexión y Meta-cognición)
**Principio Montessori:** Auto-evaluación. El alumno debe ser consciente de su propio proceso de aprendizaje.
**Agente Recomendado:** 📝 AI UX Designer Model: Sonnet 3.5 Mode: EXECUTION

### Tareas Detalladas:
1. **Diario de Navegación Personal:**
   - Crear `/academy/logbook`.
   - Interfaz tipo "Journal" donde el alumno puede escribir notas libres después de cada lección.
   - Prompts automáticos: "¿Qué concepto te costó más hoy?", "¿Cómo aplicarías esto en el mar?".
2. **Seguimiento de "Estado de Ánimo":**
   - Antes/Después de estudiar, permitir registrar nivel de confianza y energía.
   - Correlacionar en el Dashboard: "¿Aprendes mejor por la mañana o por la noche?".
3. **Colección de "Tesoros":**
   - Permitir al usuario "guardar" (bookmark) conceptos, imágenes o nudos específicos en su "Cofre del Capitán" para referencia rápida.
