# Plan de Implementación: Auditoría Visual y Documentación Técnica

Este plan detalla el proceso para capturar sistemáticamente todos los estados visuales de la aplicación y generar un documento técnico para la evaluación de Claude Opus 4.6 Thinking.

## 📋 Fase 1: Mapeo de Rutas (Discovery)
- [ ] Analizar `src/app/[locale]` para identificar todas las rutas públicas y privadas del core.
- [ ] Analizar `mission-control/src/app` para identificar las rutas de gestión táctica.
- [ ] Crear una lista jerárquica de URLs locales para el rastreo.

## 🚀 Fase 2: Configuración del Entorno
- [ ] Levantar el servidor de desarrollo del Core (`npm run dev` -> port 3000).
- [ ] Levantar el servidor de desarrollo de Mission Control (`npm run dev` -> port 3100).
- [ ] Verificar accesibilidad de ruteo sin credenciales (aplicar parches temporales de bypass si es necesario).

## 📸 Fase 3: Captura Sistemática (Browser Subagent)
- [ ] Ejecutar el subagente para visitar cada ruta mapeada.
- [ ] Capturar screenshots a pantalla completa (web y mobile view).
- [ ] Organizar las capturas en `screenshots/audit_v1/`.

## 📄 Fase 4: Generación del Documento
- [ ] Crear `VISUAL_AUDIT_REPORT.md` con:
    - Tabla de contenidos por módulos.
    - Imágenes incrustadas con su ruta técnica.
    - Metadatos de cada vista (componentes detectados, estado de la UI).
    - Sección de "Prompt de Evaluación" para Claude Opus 4.6.

## 🏁 Entrega
- [ ] Compilar el Markdown final listo para ser procesado por el modelo de razonamiento profundo.

---
*Orquestado por Antigravity - Febrero 2026*
