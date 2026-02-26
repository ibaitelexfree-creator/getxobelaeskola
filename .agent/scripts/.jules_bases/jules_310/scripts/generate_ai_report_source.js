const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function generateReport() {
    console.log('--- Iniciando Generación de Reporte para NotebookLM ---');

    // 1. Obtener logs de Git (últimos 7 días)
    let gitLogs = '';
    try {
        gitLogs = execSync('git log --since="7 days ago" --pretty=format:"%h - %an, %ar : %s" --reverse', { encoding: 'utf8' });
    } catch (e) {
        gitLogs = 'No se pudieron obtener los logs de git.';
    }

    // 2. Leer Tareas de Agentes
    const tasksPath = path.join(process.cwd(), 'project_memory', 'AGENT_TASKS.md');
    let tasksContent = '';
    if (fs.existsSync(tasksPath)) {
        tasksContent = fs.readFileSync(tasksPath, 'utf8');
    }

    // 3. Leer Estado Global
    const globalStatePath = path.join(process.cwd(), 'project_memory', 'GLOBAL_STATE.md');
    let globalState = '';
    if (fs.existsSync(globalStatePath)) {
        globalState = fs.readFileSync(globalStatePath, 'utf8');
    }

    // 4. Compilar Resumen
    const reportDate = new Date().toLocaleDateString();
    const sourceText = `
# REPORTE DE PROGRESO DEL PROYECTO - ${reportDate}

## 🚀 RESUMEN DE LOS ÚLTIMOS 7 DÍAS (GIT)
${gitLogs}

## 📝 TAREAS Y ESTADO ACTUAL (AGENT_TASKS)
${tasksContent}

## 🌐 CONTEXTO GLOBAL Y ARQUITECTURA
${globalState}

## 💡 PRÓXIMOS PASOS RECOMENDADOS (Sugerencias IA)
1. Continuar con la integración de geolocalización avanzada en el simulador.
2. Optimizar la entrega de notificaciones en la APK de Mission Control.
3. Revisar la cuota de tokens de Jules para evitar interrupciones en el flujo de desarrollo.
4. Implementar el sistema de auditoría automatizada para PRs de mayor complejidad.

---
Este documento es la fuente oficial para generar el Podcast de Audio e Infografía en NotebookLM.
`;

    const outputPath = path.join(process.cwd(), 'notebooklm_source.txt');
    fs.writeFileSync(outputPath, sourceText);
    console.log(`Reporte generado con éxito en: ${outputPath}`);
}

generateReport();
