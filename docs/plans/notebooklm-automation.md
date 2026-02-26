# Plan de Implementación: Automatización de Reportes con NotebookLM

Este plan detalla la creación de un sistema de informes automatizados que genera podcasts e infografías sobre el progreso del proyecto utilizando NotebookLM, y los envía por Email y WhatsApp mediante n8n.

## 📋 Objetivos
- [ ] Analizar el progreso del proyecto (Git + Logs de Agentes).
- [ ] Generar un texto estructurado con: Lo hecho hoy, lo hecho en los últimos 7 días y próximos pasos.
- [ ] Automatizar NotebookLM para generar un Podcast (español) y una Infografía a partir de dicho texto.
- [ ] Integrar el envío automático vía n8n (Email: ibaitnnt@gmail.com, WA: +447541364266).
- [ ] Añadir un botón disparador en el Mission Control Dashboard.

---

## 🏗️ Fase 1: Generación de Datos (Report Generator)
- [ ] **Crear `scripts/generate_ai_report_source.js`**:
    - Ejecutar `git log --since="7 days ago"`.
    - Leer `project_memory/AGENT_TASKS.md` y `project_memory/GLOBAL_STATE.md`.
    - Compilar un resumen en formato texto limpio optimizado para ser "fuente" de NotebookLM.
- [ ] **Validación**: Comprobar que el archivo generado contiene información relevante y estructurada.

## 📡 Fase 2: Orquestación n8n
- [ ] **Configurar Workflow en n8n**:
    - Nodo Webhook para recibir el trigger del dashboard.
    - Nodo HTTP Request para recibir los archivos finales (Podcast/Imagen).
    - Nodo Gmail para enviar el reporte a `ibaitnnt@gmail.com`.
    - Nodo de WhatsApp (via provider configurado) para enviar a `+447541364266`.
- [ ] **Guardar Configuración**: Documentar el webhook URL para el componente de UI.

## 🤖 Fase 3: Automatización NotebookLM (The "Ghost" Flow)
- [ ] **Script de Automatización con Browser Subagent**:
    - Punto de entrada: `scripts/notebooklm_automation.js`.
    - Flujo: Login (sesión actual) -> Subir archivo fuente -> Personalizar Audio Overview (Español) -> Generar -> Descargar Podcasts e Infografía.
- [ ] **Manejo de Descargas**: Mover los archivos descargados a un lugar accesible para el paso de envío.

## 🎨 Fase 4: Mission Control UI
- [ ] **Modificar `mission-control/src/components/Dashboard.tsx`**:
    - Crear sección `AI Intelligence Hub`.
    - Añadir botón interactivo con estado de carga ("Generando Informe...").
    - Conectar el botón al endpoint del orquestador que ejecuta el script de automatización.

---

## 🚀 Ejecución Inmediata (Paso 1)
Voy a empezar creando el generador de texto fuente para el informe.

---
*Orquestado por Antigravity - Febrero 2026*
