import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function run() {
    try {
        const prsData = execSync("gh pr list --limit 50 --json number,title,headRefName", { encoding: "utf8" });
        const prs = JSON.parse(prsData);

        console.log(`\n🐝 HIVE COMMANDER V4: Launching swarm for ${prs.length} targets...\n`);

        for (const pr of prs) {
            console.log(`\n🎯 [Jules #${pr.number}] ----------------------------------`);
            console.log(`   Task: ${pr.title}`);

            try {
                // 1. Try clean merge first (safest)
                console.log(`   🔍 [Jules #${pr.number}] Attempting clean merge...`);
                try {
                    execSync(`gh pr merge ${pr.number} --admin --merge --delete-branch`, { stdio: "inherit" });
                    console.log(`   ✅ [Jules #${pr.number}] Mission Accomplished (Clean Merge).`);
                    continue;
                } catch (e) {
                    console.log(`   ⚠️ [Jules #${pr.number}] Clean merge failed. Initiating aggressive resolution...`);
                }

                // 2. Aggressive resolution using a temporary worktree
                const worktreePath = path.join(process.cwd(), `.swarm_${pr.number}`);

                // Cleanup old if exists
                if (fs.existsSync(worktreePath)) {
                    try { execSync(`git worktree remove --force "${worktreePath}"`, { stdio: "ignore" }); } catch (err) { }
                    fs.rmSync(worktreePath, { recursive: true, force: true });
                }

                console.log(`   🏗️ [Jules #${pr.number}] Creating isolated environment...`);
                // Ensure we have the branch
                execSync(`git fetch origin ${pr.headRefName}`, { stdio: "ignore" });

                // Create worktree
                execSync(`git worktree add "${worktreePath}" origin/${pr.headRefName}`, { stdio: "ignore" });

                console.log(`   ⚔️ [Jules #${pr.number}] Forcing merge with main (Strategy: theirs)...`);
                // Merge main into PR branch resolving conflicts in favor of PR
                execSync(`git -C "${worktreePath}" merge origin/main -X theirs -m "chore: auto-resolve by Jules Swarm"`, { stdio: "ignore" });

                console.log(`   📤 [Jules #${pr.number}] Pushing resolved state...`);
                execSync(`git -C "${worktreePath}" push origin HEAD --force`, { stdio: "ignore" });

                console.log(`   🚀 [Jules #${pr.number}] Final merge trigger...`);
                execSync(`gh pr merge ${pr.number} --admin --merge --delete-branch`, { stdio: "inherit" });

                console.log(`   ✅ [Jules #${pr.number}] PR #${pr.number} successfully processed.`);

                // Cleanup
                console.log(`   🧹 [Jules #${pr.number}] Cleaning up...`);
                execSync(`git worktree remove --force "${worktreePath}"`, { stdio: "ignore" });
                if (fs.existsSync(worktreePath)) fs.rmSync(worktreePath, { recursive: true, force: true });

            } catch (err) {
                console.error(`   ❌ [Jules #${pr.number}] Operation failed: ${err.message}`);
                // Cleanup on failure
                const worktreePath = path.join(process.cwd(), `.swarm_${pr.number}`);
                if (fs.existsSync(worktreePath)) {
                    try { execSync(`git worktree remove --force "${worktreePath}"`, { stdio: "ignore" }); } catch (err) { }
                    try { fs.rmSync(worktreePath, { recursive: true, force: true }); } catch (err) { }
                }
            }
        }

        console.log(`\n🏁 HIVE COMMANDER: All units have returned. Check results.\n`);

    } catch (globalErr) {
        console.error(`🛑 Global Hive Error: ${globalErr.message}`);
    }
}

run();
