import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getBranchesStatus() {
    console.log('\n--- 🚀 ESTADO DEL SWARM (3 Unidades) ---');

    const agents = [
        { name: '🧠 LEAD (Jules 3)', prefix: 'jules/orchestrator', account: 'ibaitelexfree@gmail.com' },
        { name: '🗄️ DATA (Jules 1)', prefix: 'jules/db', account: 'getxobelaeskola@gmail.com' },
        { name: '🎨 UI (Jules 2)', prefix: 'jules/ui', account: 'ibaitnt@gmail.com' }
    ];

    try {
        const branches = execSync('git branch -a').toString();

        agents.forEach(agent => {
            const activeBranches = branches.split('\n')
                .filter(b => b.includes(agent.prefix))
                .map(b => b.trim().replace('* ', ''));

            console.log(`\n${agent.name} [${agent.account}]`);
            if (activeBranches.length > 0) {
                activeBranches.forEach(b => console.log(`  ✅ Rama activa: ${b}`));
            } else {
                console.log(`  💤 En espera...`);
            }
        });

    } catch (e) {
        console.error('Error leyendo ramas:', e.message);
    }
}

function verifyFileSystem() {
    console.log('\n--- 📁 VERIFICACIÓN DE ARCHIVOS DE IDENTIDAD ---');
    const required = [
        '.jules/roles/DATA_MASTER.md',
        '.jules/roles/UI_ENGINE.md',
        '.jules/roles/LEAD_ORCHESTRATOR.md',
        '.jules/PIPELINE.md',
        '.github/workflows/auto-fix.yml',
        '.github/CODEOWNERS'
    ];

    required.forEach(file => {
        try {
            if (fs.existsSync(file)) {
                console.log(`  ✅ ${file}`);
            } else {
                console.log(`  ❌ ${file} (FALTA)`);
            }
        } catch (e) {
            console.log(`  ❌ ${file} (Error: ${e.message})`);
        }
    });
}

console.log('⚓ Iniciando diagnóstico del Swarm...');
verifyFileSystem();
getBranchesStatus();
console.log('\n--- ⚓ FIN DEL DIAGNÓSTICO ---\n');
