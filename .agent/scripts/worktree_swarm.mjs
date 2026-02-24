import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";

const prs = JSON.parse(fs.readFileSync("open_prs.json", "utf8")).map(p => p.number);
const BASE_DIR = path.resolve(".jules_bases");
const LOG_FILE = "HIVE_FINAL_ASSAULT.log";

// Asignar estrategias por lote de PR (simulando los batallones)
// Lote 1 (Alfa): Infra
// Lote 2 (Beta): UI
// Lote 3 (Gamma): API

console.log(`🚀 HIVE FINAL ASSAULT: Desplegando Jules con Worktrees aislados en ${BASE_DIR}`);

async function work(prNumber, strategy) {
    const workerId = `jules_${prNumber}`;
    const workerPath = path.join(BASE_DIR, workerId);

    try {
        fs.appendFileSync(LOG_FILE, `[Worker ${workerId}] Iniciando asalto a PR #${prNumber} con ${strategy}...\\n`);

        // 1. Crear el worktree para este PR
        // Buscamos el nombre de la rama primero
        const branchName = execSync(`gh pr view ${prNumber} --json headRefName --jq .headRefName`, { encoding: 'utf8' }).trim();

        execSync(`git worktree add "${workerPath}" origin/${branchName}`, { stdio: 'ignore' });

        // 2. Operar dentro del worktree
        execSync(`git -C "${workerPath}" merge origin/main -X ${strategy} -m "chore: auto-resolve by Jules Swarm"`, { stdio: 'ignore' });

        // 3. Empujar cambios
        execSync(`git -C "${workerPath}" push origin HEAD --force`, { stdio: 'ignore' });

        // 4. Merge final
        execSync(`gh pr merge ${prNumber} --admin --merge --delete-branch`, { stdio: 'ignore' });

        fs.appendFileSync(LOG_FILE, `✅ [Worker ${workerId}] PR #${prNumber} MERGEADO.\\n`);
        console.log(`✅ Jules[${prNumber}] PR Cerrado correctamente.`);

    } catch (e) {
        fs.appendFileSync(LOG_FILE, `❌ [Worker ${workerId}] PR #${prNumber} BLOQUEADO: ${e.message}\\n`);
    } finally {
        // Limpiar worktree
        try {
            execSync(`git worktree remove --force "${workerPath}"`, { stdio: 'ignore' });
        } catch (err) { }
    }
}

async function swarm() {
    // Procesamos en lotes de 10 para no saturar la CPU
    const CONCURRENCY = 10;
    for (let i = 0; i < prs.length; i += CONCURRENCY) {
        const batch = prs.slice(i, i + CONCURRENCY);
        console.log(`--- Procesando lote de Jules ${i} a ${i + CONCURRENCY} ---`);
        await Promise.all(batch.map(pr => {
            // Estrategia heurística: si es un numero bajo suele ser mas antiguo (theirs)
            // Si es alto es mas nuevo (ours)
            const strategy = pr > 150 ? "theirs" : "ours";
            return work(pr, strategy);
        }));
    }
}

swarm();
