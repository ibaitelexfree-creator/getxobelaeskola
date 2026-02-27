import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const AUDITOR_URL = 'http://localhost:8083/audit';

function getHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Configuración de prueba
const testPlanId = "plan_20260227_test1";
const artifactsPath = path.resolve('./artifacts', testPlanId);
const manifestPath = path.join(artifactsPath, 'manifest.json');

// Plan Falso pero válido estructuralmente
const mockPlan = {
    plan: {
        id: testPlanId,
        steps: [
            {
                step_id: "write_1",
                type: "file_write",
                params: { filename: "promised_file.txt", content: "hello world" }
            },
            {
                step_id: "write_2",
                type: "file_write",
                params: { filename: "second_file.txt", content: "data config" }
            }
        ]
    }
};

/**
 * Función que inicializa el estado "Base Exitoso" en disco
 */
function setupCleanArtifacts() {
    if (fs.existsSync(artifactsPath)) fs.rmSync(artifactsPath, { recursive: true, force: true });
    fs.mkdirSync(artifactsPath, { recursive: true });

    const f1 = 'hello world';
    const f2 = 'data config';

    fs.writeFileSync(path.join(artifactsPath, 'promised_file.txt'), f1);
    fs.writeFileSync(path.join(artifactsPath, 'second_file.txt'), f2);

    const manifest = {
        plan_id: testPlanId,
        files: [
            { file: 'promised_file.txt', hash: getHash(f1) },
            { file: 'second_file.txt', hash: getHash(f2) }
        ]
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
}

async function runAggressiveTests() {
    console.log('🧪 Iniciando Pruebas Agresivas del Auditor...\n');

    // SETUP: Estado Limpio y Exitoso
    setupCleanArtifacts();

    console.log('--- [0] Línea Base: Todo Correcto ---');
    let resp = await axios.post(AUDITOR_URL, { plan: mockPlan, artifacts_path: artifactsPath });
    console.log(`Línea base OK? ${resp.data.status === 'AUDIT_SUCCESS'} | Score: ${resp.data.score}\n`);


    // PRUEBA 1: Corrupción de Hash (-50)
    setupCleanArtifacts();
    console.log('--- [1] Prueba: Corrupción de Hash ---');
    // Modificamos el contenido manualmente en disco
    fs.writeFileSync(path.join(artifactsPath, 'promised_file.txt'), 'hello world TRAMPEADO');
    try {
        const r1 = await axios.post(AUDITOR_URL, { plan: mockPlan, artifacts_path: artifactsPath });
        if (r1.data.status === 'AUDIT_FAILED') {
            console.log(`✅ Éxito: Auditor lo reventó: ${r1.data.status}`);
            console.log(`   Score final: ${r1.data.score}`);
            console.log(`   Tamper detectado: ${r1.data.tamper_detected}`);
            console.log(`   Feedback:`, r1.data.feedback);
        } else {
            console.log(`❌ ERROR: Auditor aceptó la trampa. Status: ${r1.data.status}`);
        }
    } catch (err) {
        console.log(`❌ ERROR HTTP:`, err.message);
    }


    // PRUEBA 2: Archivo prometido no creado (-40 + -50 manifest)
    setupCleanArtifacts();
    console.log('\n--- [2] Prueba: Archivo prometido no creado ---');
    // Borramos de disco fisicamente
    fs.unlinkSync(path.join(artifactsPath, 'second_file.txt'));
    try {
        const r2 = await axios.post(AUDITOR_URL, { plan: mockPlan, artifacts_path: artifactsPath });
        if (r2.data.status === 'AUDIT_FAILED') {
            console.log(`✅ Éxito: Auditor detectó archivo ausente: ${r2.data.status}`);
            console.log(`   Score final: ${r2.data.score}`); // Será 100 - 40 - 50 = 10
            console.log(`   Feedback:`, r2.data.feedback);
        } else {
            console.log(`❌ ERROR: Auditor dejó pasar archivo ausente. Status: ${r2.data.status}`);
        }
    } catch (err) {
        console.log(`❌ ERROR HTTP:`, err.message);
    }


    // PRUEBA 3: Archivo extra no declarado (-20)
    setupCleanArtifacts();
    console.log('\n--- [3] Prueba: Archivo Fantasma / Extra ---');
    fs.writeFileSync(path.join(artifactsPath, 'virus_no_declarado.js'), 'malware');

    let r3;
    try {
        r3 = await axios.post(AUDITOR_URL, { plan: mockPlan, artifacts_path: artifactsPath });
        if (r3.data.status === 'AUDIT_FAILED') {
            console.log(`✅ Éxito: Auditor detectó archivo fantasma: ${r3.data.status}`);
            console.log(`   Score final: ${r3.data.score}`); // Será 100 - 50 = 50
            console.log(`   Tamper detectado: ${r3.data.tamper_detected}`);
            console.log(`   Feedback:`, r3.data.feedback);
        } else {
            console.log(`❌ ERROR: Auditor dejó pasar archivo fantasma. Status: ${r3.data.status}, Score: ${r3.data.score}`);
        }
    } catch (err) {
        console.log(`❌ ERROR HTTP:`, err.message);
    }


    // PRUEBA 4: Re-ejecución Idempotente
    setupCleanArtifacts();
    console.log('\n--- [4] Prueba: Re-ejecución Idempotente ---');
    const perfStart1 = Date.now();
    const rq1 = await axios.post(AUDITOR_URL, { plan: mockPlan, artifacts_path: artifactsPath });
    const t1 = Date.now() - perfStart1;

    const perfStart2 = Date.now();
    const rq2 = await axios.post(AUDITOR_URL, { plan: mockPlan, artifacts_path: artifactsPath });
    const t2 = Date.now() - perfStart2;

    console.log(`✅ Req 1 Score: ${rq1.data.score} (${t1}ms)`);
    console.log(`✅ Req 2 Score: ${rq2.data.score} (${t2}ms)`);
    if (rq1.data.score === rq2.data.score) {
        console.log("✅ Idempotencia matemática comprobada, la lectura a disco produce el mismo resultado penalizador/aprobatorio independientemente de estado de memoria.");
    }
}

runAggressiveTests();
