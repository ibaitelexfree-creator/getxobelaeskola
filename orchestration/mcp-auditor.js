import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/auditor.log' })
    ]
});

const app = express();
app.use(bodyParser.json({ limit: '100kb' }));
const PORT = 8083;

function getHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

const VAGUE_TERMS = [
    'vago', 'ambiguo', 'nose', 'talvez', 'quizas', 'etc', 'maybe', 'possibly',
    'something', 'placeholder', 'insert here', 'todo', 'implement me', 'lorem ipsum'
];

/**
 * Función que simula la validación de la Inteligencia del Auditor,
 * confiando ÚNICAMENTE en disco (lectura real), manifest y la intención del plan.
 */
function auditIntention(plan, actualFilesOnDisk, manifest) {
    let score = 100;
    const feedback = [];
    let tamperDetected = false;
    let reasoningDepth = 0; // Cumulative complexity checked

    const fileNamesOnDisk = actualFilesOnDisk.map(f => f.name);
    const manifestFileNames = manifest.files.map(f => f.file);

    // 1️⃣ Verificamos que se crearon los archivos descritos en los steps del plan
    reasoningDepth += 10;
    for (const step of plan.steps) {
        if (step.type === 'file_write') {
            const expectedFn = step.params.filename;
            if (!fileNamesOnDisk.includes(expectedFn)) {
                score -= 40;
                feedback.push(`Falta el archivo crítico del plan: ${expectedFn}`);
            }
        }
    }

    // 2️⃣ Comprobar desalineación hash de manifiesto (Corrupción o modificación manual)
    reasoningDepth += 20;
    for (const f of manifest.files) {
        const diskFile = actualFilesOnDisk.find(xf => xf.name === f.file);
        if (!diskFile) {
            score -= 50;
            feedback.push(`Archivo declarado en manifest no existe en disco: ${f.file}`);
        } else if (diskFile.hash !== f.hash) {
            score -= 50;
            tamperDetected = true;
            feedback.push(`Divergencia de Hash en ${f.file}: Esperado ${f.hash}, Encontrado: ${diskFile.hash}`);
        }
    }

    // 3️⃣ Semantic & Ambiguity Audit (New Phase)
    reasoningDepth += 40;
    let semanticPenalty = 0;
    for (const file of actualFilesOnDisk) {
        const content = file.content.toLowerCase();

        // A. Ambiguity Penalty Factor
        const foundVague = VAGUE_TERMS.filter(term => content.includes(term));
        if (foundVague.length > 0) {
            const factor = 10; // Ambiguity Penalty Factor
            const p = foundVague.length * factor;
            semanticPenalty += p;
            feedback.push(`[SEMANTIC_ALERT] Ambigüedad detectada en ${file.name}: Encontrados [${foundVague.join(', ')}]`);
        }

        // B. Lexical Entropy (Simplified)
        const words = content.split(/\s+/).filter(w => w.length > 3);
        const uniqueWords = new Set(words);
        if (words.length > 30) {
            const ratio = uniqueWords.size / words.length;
            if (ratio < 0.35) {
                semanticPenalty += 20;
                feedback.push(`[SEMANTIC_ALERT] Alta entropía léxica detectada en ${file.name} (Texto muy repetitivo o genérico)`);
            }
        }

        // C. Specificity & Contradiction Check (Basic)
        if (content.length < 60 && !file.name.endsWith('.json')) {
            semanticPenalty += 15;
            feedback.push(`[SEMANTIC_ALERT] Baja especificidad en ${file.name}: El contenido parece ser boilerplate insuficiente.`);
        }

        // Simple contradiction: "enable" and "disable" in the same small scope without context
        if (content.includes('activado') && content.includes('desactivado') && words.length < 20) {
            semanticPenalty += 25;
            feedback.push(`[SEMANTIC_ALERT] Posible contradicción lógica interna en ${file.name}`);
        }
    }
    score -= semanticPenalty;

    // 4️⃣ Archivo extra no declarado en manifest
    reasoningDepth += 10;
    for (const diskFile of actualFilesOnDisk) {
        if (!manifestFileNames.includes(diskFile.name)) {
            score -= 50;
            tamperDetected = true;
            feedback.push(`Archivo extra no declarado en manifest detectado: ${diskFile.name}`);
        }
    }

    if (fileNamesOnDisk.length === 0) {
        score = 0;
        feedback.push("El Builder no generó ningún artefacto.");
    }

    if (score === 100) feedback.push("Intención validada correctamente frente a resultados.");
    return {
        score: Math.max(score, 0),
        feedback,
        tamperDetected,
        reasoningDepth,
        semanticPenalty
    };
}


app.post('/audit', async (req, res) => {
    const { plan: planWrapper, artifacts_path } = req.body;
    const correlationId = crypto.randomUUID();
    const startTime = Date.now();

    if (!planWrapper?.plan || !artifacts_path) {
        return res.status(400).json({ error: 'Contract violation: plan and artifacts_path required' });
    }

    const plan = planWrapper.plan;
    logger.info('Iniciando Auditoría', { correlationId, planId: plan.id });

    if (!fs.existsSync(artifacts_path)) {
        return res.status(404).json({ error: `Artifacts path not found: ${artifacts_path}` });
    }

    try {
        const manifestPath = path.join(artifacts_path, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
            return res.status(400).json({ error: 'Manifest missing in artifacts folder' });
        }

        // Leemos Manifest de disco
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

        // 1️⃣ Revalidador de Hashes y Lector de Artefactos Reales EXCLUSIVO de disco
        const actualFiles = [];
        const filesInDir = fs.readdirSync(artifacts_path);

        for (const file of filesInDir) {
            if (file === 'manifest.json') continue;
            const filePath = path.join(artifacts_path, file);
            const isDir = fs.statSync(filePath).isDirectory();
            if (!isDir) {
                // LECTURA REAL DESDE DISCO, IGNORANDO MEMORIA
                const content = fs.readFileSync(filePath);
                actualFiles.push({
                    name: file,
                    content: content.toString(),
                    hash: getHash(content)
                });
            }
        }

        // 2️⃣ Evaluación Causal (Plan vs Disco Físico)
        const { score, feedback, tamperDetected, reasoningDepth, semanticPenalty } = auditIntention(plan, actualFiles, manifest);

        // 3️⃣ Decisión Final
        let passed = score >= 80; // Quality Gate
        if (tamperDetected) {
            passed = false; // Override si hay manipulación
        }

        const executionTime = Date.now() - startTime;
        logger.info(`Auditoría completada`, {
            planId: plan.id,
            score,
            passed,
            tamperDetected,
            reasoning_depth: reasoningDepth,
            semantic_penalty: semanticPenalty
        });

        return res.json({
            status: passed ? 'AUDIT_SUCCESS' : 'AUDIT_FAILED',
            score,
            feedback,
            tamper_detected: tamperDetected,
            reasoning_depth: reasoningDepth,
            semantic_penalty: semanticPenalty,
            execution_time_ms: executionTime
        });


    } catch (error) {
        logger.error('Error in Auditor', { error: error.message });
        return res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    logger.info(`[Quality Auditor V2 - Strict] Running on port ${PORT}`);
});
