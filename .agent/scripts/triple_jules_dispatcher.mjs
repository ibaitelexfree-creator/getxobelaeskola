import fs from 'fs';

const prs = JSON.parse(fs.readFileSync('open_prs.json', 'utf8')).map(p => p.number);
const JULES_AGENTS = [
    { name: "Jules 1", email: "getxobelaeskola@gmail.com", token: "AQ.Ab8RN6IxYON1pdwnIqrV5bg34MSHtNdob6V5IEs9OlrrcpKMAg" },
    { name: "Jules 2", email: "ibaitnt@gmail.com", token: "AQ.Ab8RN6KOmjxBlgXxqjqmy8RDaybozQq-qEFUVrsCrHfXDdJOSg" },
    { name: "Jules 3", email: "ibaitelexfree@gmail.com", token: "AQ.Ab8RN6KuO_oIVKmEwsq12zZgha3DHOeGeQ4-TiEW_pGAmVOxvg" }
];

console.log("🚀 HIVE DISPATCHER: Activando Jules 1, 2 y 3 con sus credenciales maestras.");

async function delegateTask(prNumber, agent) {
    console.log(`📡 [${agent.name}] (${agent.email}) asaltando PR #${prNumber}...`);
    try {
        // Llamada directa a la API de Jules de Google usando su token
        const response = await fetch('https://jules.googleapis.com/v1alpha/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${agent.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `Session_PR_${prNumber}_${agent.name.replace(' ', '_')}`,
                source: `ibaitelexfree-creator/getxobelaeskola/pull/${prNumber}`,
                instructions: "Resuelve conflictos (Theirs para UI, Ours para Config) y mergea --admin."
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log(`✅ [${agent.name}] Misión aceptada para PR #${prNumber}. ID Sesión: ${data.id}`);
        } else {
            console.log(`⚠️ [${agent.name}] Error en PR #${prNumber}: ${data.error?.message || response.statusText}`);
        }
    } catch (e) {
        console.log(`❌ [${agent.name}] Error de red en PR #${prNumber}`);
    }
}

async function startTripleAssault() {
    // Procesamos en lotes de 3 (uno para cada Jules) para no saturar
    for (let i = 0; i < prs.length; i += 3) {
        const batch = prs.slice(i, i + 3);
        await Promise.all(batch.map((pr, idx) => delegateTask(pr, JULES_AGENTS[idx % 3])));
        // Esperamos un poco para que los agentes respiren
        await new Promise(r => setTimeout(r, 1000));
    }
}

startTripleAssault();
