# Protocolo de Autonomía con Preview Deployments (TRIO)

Este documento define el flujo obligatorio para la evolución del código en **Getxo Bela Eskola**. Ningún agente (Jules) ni humano debe saltarse este pipeline para garantizar autonomía 100% sin riesgo en producción.

---

## 🏗️ Los 3 Dominios de Poder (Aislamiento Estricto)

### 🥇 Dominio 1: Analytics & Testing (Jules 1)
- **Herramientas:** Tinybird MCP (Read-Only) + Lighthouse Audit.
- **Jurisdicción:** Entornos efímeros (Preview) de Render.
- **Responsabilidad:** 
  - Monitorear logs de error en tiempo real durante el despliegue.
  - Validar que la nueva URL de preview no degrada el performance ni rompe flujos críticos.
  - Emitir el veredicto final (Success/Failure) basado en datos.

### 🥈 Dominio 2: Data Engineering (Jules 2)
- **Herramientas:** Neon MCP (SQL + Branching).
- **Jurisdicción:** Branches de base de datos.
- **Responsabilidad:** 
  - Crear ramas de la base de datos de producción instantáneamente.
  - Ejecutar migraciones SQL sobre esas ramas para que la Preview tenga datos reales sin tocar la DB de producción.
  - Validar integridad relacional.

### 🥉 Dominio 3: Dev/Orquestador (Jules 3)
- **Herramientas:** Context7 MCP + Render MCP + Antigravity.
- **Jurisdicción:** Código fuente (Github) y Gestión de Despliegues.
- **Responsabilidad:** 
  - Crear ramas de código (`feature/*`).
  - Abrir Pull Requests que disparan automáticamente un **Preview Deployment** en Render.
  - Ejecutar `python .agent/scripts/verify_all.py` en el entorno local/preview.
  - Realizar el **Merge** final a `main` solo si Analytics ha validado la Preview.

---

## 🔄 El Pipeline de Ejecución (Orden Obligatorio)

1. **TRIGGER:** Una tarea llega desde Mission Control o Antigravity.
2. **FASE 1 - DEV (Haciendo el cambio):** Jules 3 crea una rama de Git, aplica el código (Context7) y sube el cambio. Render genera una **Preview URL**.
3. **FASE 2 - DATA (Preparando datos):** Jules 2 crea un branch de Neon y lo conecta a la Preview de Render (vía variables de entorno efímeras).
4. **FASE 3 - ANALYTICS (Validación):** Jules 1 "ataca" la Preview URL. Tinybird analiza los logs. Si no hay errores SQL ni regresiones, aprueba.
5. **FASE 4 - MERGE (Paso a Producción):** Jules 3 recibe la aprobación, lanza los tests finales y fusiona la rama a `main`. Render despliega a producción.

---

## 🚨 Reglas Críticas (No violar)

1. **Prohibido tocar main directamente:** Todo cambio nace en una rama y muere en un merge automatizado.
2. **Uso de Neon Branching:** Nunca se ejecuta una migración en producción sin haberla testeado en una rama de base de datos conectada a una preview de código.
3. **Validación 100% Verde:** Si `verify_all.py` o los tests de Analytics detectan un fallo de 1%, el orquestador **aborta** y revierte el cambio.
4. **Salida Estructurada:** Todo reporte de los agentes debe ser JSON para que el siguiente Jules en la cadena pueda parsearlo.

---

## 🎯 Objetivo: Autonomía Real
Buscamos un sistema que decida y ejecute sin permiso humano. La seguridad no se logra con burocracia, sino con **Preview Environments** efímeros donde la IA de Analytics puede "romper" cosas sin que los alumnos de la academia lo noten.
