import fs from 'fs';

const prs = JSON.parse(fs.readFileSync('open_prs.json', 'utf8')).map(p => p.number).slice(0, 20);

console.log("🦾 Cerebro Antigravity: Inyectando tareas vía Native Fetch...");

async function delegateToJules(prNumber) {
    try {
        const response = await fetch('http://localhost:3323/mcp/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "jules_create_session",
                arguments: {
                    name: `Session_PR_${prNumber}`,
                    source: `ibaitelexfree-creator/getxobelaeskola/pull/${prNumber}`,
                    instructions: "Auto-merge agresivo. Resolver conflictos priorizando 'main' en archivos de config y la rama en archivos de UI."
                }
            })
        });
        const data = await response.json();
        if (data.success) {
            console.log(`📡 Jules ha aceptado la misión del PR #${prNumber}`);
        } else {
            console.log(`⚠️ Jules ha rechazado el PR #${prNumber}: ${data.error}`);
        }
    } catch (e) {
        console.log(`❌ Error de conexión con la API de Jules para el PR #${prNumber}`);
    }
}

async function main() {
    for (const pr of prs) {
        await delegateToJules(pr);
        await new Promise(r => setTimeout(r, 300));
    }
    console.log("🏁 Órdenes enviadas. Los Jules están operando.");
}

main();
