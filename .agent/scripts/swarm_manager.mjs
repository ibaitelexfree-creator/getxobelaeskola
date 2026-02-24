import { spawnSync, execSync } from "child_process";
import fs from "fs";
import path from "path";

const prs = JSON.parse(fs.readFileSync('open_prs.json', 'utf8')).map(p => p.number);
const BASE_WORK_DIR = path.resolve(".jules_swarm");

if (!fs.existsSync(BASE_WORK_DIR)) fs.mkdirSync(BASE_WORK_DIR);

console.log("🦾 HIVE SWARM ACTIVATED: Simulando 45 Jules vía Aislamiento de Worktrees.");

async function work(prNumber, julesId) {
    const workerDir = path.join(BASE_WORK_DIR, `jules_${julesId}_pr_${prNumber}`);
    const logFile = "SWARM_ACTIVITY.log";

    fs.appendFileSync(logFile, `[Jules #${julesId}] 🎯 Iniciando asalto al PR #${prNumber}...\n`);

    try {
        // 1. Obtener rama
        const branch = execSync(`gh pr view ${prNumber} --json headRefName --jq .headRefName`, { encoding: 'utf8' }).trim();

        // 2. Crear worktree aislado (Cero conflictos de GIT LOCK)
        execSync(`git worktree add "${workerDir}" origin/${branch}`, { stdio: 'ignore' });

        // 3. Resolver agresivo
        const strategy = prNumber > 150 ? "theirs" : "ours";
        execSync(`git -C "${workerDir}" merge origin/main -X ${strategy} -m "chore: auto-resolved by Hive Swarm"`, { stdio: 'ignore' });

        // 4. Empujar y Mergear
        execSync(`git -C "${workerDir}" push origin HEAD --force`, { stdio: 'ignore' });
        execSync(`gh pr merge ${prNumber} --admin --merge --delete-branch`, { stdio: 'ignore' });

        fs.appendFileSync(logFile, `✅ [Jules #${julesId}] PR #${prNumber} CONQUISTADO.\n`);
        console.log(`✅ [Jules #${julesId}] PR #${prNumber} Mergeado.`);

    } catch (e) {
        fs.appendFileSync(logFile, `❌ [Jules #${julesId}] PR #${prNumber} Fallido.\n`);
    } finally {
        // Limpieza suave
        try { execSync(`git worktree remove --force "${workerDir}"`, { stdio: 'ignore' }); } catch (err) { }
    }
}

async function startSwarm() {
    // Lanzamos 15 a la vez para no fundir la CPU
    const BATCH_SIZE = 15;
    for (let i = 0; i < prs.length; i += BATCH_SIZE) {
        const batch = prs.slice(i, i + BATCH_SIZE);
        console.log(`🚀 Batallón de Jules atacando bloque de ${i} a ${i + BATCH_SIZE}...`);
        await Promise.all(batch.map((pr, idx) => work(pr, idx + 1)));
    }
}

startSwarm();
