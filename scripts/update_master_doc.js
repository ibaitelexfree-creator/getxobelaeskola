const fs = require('fs');
const path = require('path');

/**
 * Update Master Doc - Intelligence Compiler
 * This script unifies the project's documentation into GETXO_MASTER_DOC.md
 */

async function updateMasterDoc() {
    console.log('--- ⚓ Orchestrator: Updating Master Document ---');

    const filesToRead = {
        readme: 'README.md',
        soul: 'SOUL.md',
        identity: 'IDENTITY.md',
        technical: 'docs/CORE_TECHNICAL_DOCUMENTATION.md',
        arch: 'docs/ARCHITECTURE.md',
        multiAgent: 'docs/GUIA_OPERATIVA_MULTI_AGENTE.md',
        progress: 'docs/PROGRESS.md',
        sbrm: 'SBRM_STATUS.md',
        globalState: 'project_memory/GLOBAL_STATE.md',
        tasks: 'project_memory/AGENT_TASKS.md'
    };

    let content = {};

    for (const [key, filePath] of Object.entries(filesToRead)) {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
            content[key] = fs.readFileSync(fullPath, 'utf8');
        } else {
            console.warn(`Warning: File ${filePath} not found.`);
            content[key] = `[Content not found for ${filePath}]`;
        }
    }

    const masterDocTemplate = `# ⚓ GETXO BELA ESKOLA - EXTENSIVE MASTER DOCUMENT (SSOT) v2.2
> **Autonomous Single Source of Truth** for humans and AI agents.
> *Last Sync: ${new Date().toISOString()}*

---

## 1. 📂 MASTER README & ARCHITECTURE
### README.md Summary
${content.readme.split('## 🔑 Environment Variables')[0]}

### CORE_TECHNICAL_DOCUMENTATION.md
${content.technical}

### ARCHITECTURE.md
${content.arch}

---

## 2. 🤖 MULTI-AGENT OPERATIONAL GUIDE
### Philosophy & Protocol (From GUIA_OPERATIVA_MULTI_AGENTE.md)
${content.multiAgent.substring(0, 5000)}... [Truncated for brevity in Master Doc. See full file for technical details]

### Multi-Agent Coordination Rules (From AGENTS.md)
- Domain tracking and file permission enforcement active.
- Orchestrator (Antigravity) maintains visual validation and task assignment.

---

## 3. 🧠 AGENT PHILOSOPHY & IDENTITY
### SOUL.md
${content.soul}

### IDENTITY.md
${content.identity}

---

## 4. 📈 PROJECT PROGRESS & CURRENT STATE
### PROGRESS.md
${content.progress}

### SBRM_STATUS.md
${content.sbrm}

### GLOBAL_STATE.md
${content.globalState}

---

## 📋 CURRENT TASK POOL (AGENT_TASKS.md)
${content.tasks}

---
*Unified and Autonomously Updated by Antigravity AI*
`;

    const outputPath = path.join(process.cwd(), 'GETXO_MASTER_DOC.md');
    fs.writeFileSync(outputPath, masterDocTemplate);
    console.log(`✅ Master Document successfully updated at: ${outputPath}`);
}

updateMasterDoc().catch(err => {
    console.error('Error updating Master Doc:', err);
    process.exit(1);
});
