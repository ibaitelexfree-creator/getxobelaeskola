import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

// Standardize environmental variables
dotenv.config({ path: './orchestration/.env' });

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION_NAME = 'swarm_v2_code_intelligence';
const TARGET_DIR = process.cwd();
const PROGRESS_FILE = path.join(TARGET_DIR, 'orchestration', '.index-progress.json');
const IGNORE_DIRS = [
    '.git', 'node_modules', 'dist', 'build', '.next', 'artifacts', 'tmp', 'brain', '.gemini', '.agent',
    '.n8n_local', '.cache', 'public', 'static', 'coverage', 'backups', 'out'
];
const IGNORE_FILES = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'composer.lock', 'state_dump.json', 'pool-state.json'];
const ALLOWED_EXTENSIONS = ['.js', '.ts', '.tsx', '.md', '.json', '.html', '.css', '.py', '.sh', '.ps1', '.sql', '.tla'];

/**
 * Real Embedding Generation via LOCAL Ollama
 */
async function generateEmbedding(text) {
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    const MODEL = 'mxbai-embed-large';

    try {
        const response = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
            model: MODEL,
            prompt: (text || '').substring(0, 8000)
        });
        return response.data.embedding;
    } catch (error) {
        throw new Error(`Ollama Error: ${error.message}`);
    }
}

/**
 * Ensure Collection exists with 1024 dims
 */
async function ensureCollection() {
    try {
        const info = await axios.get(`${QDRANT_URL}/collections/${COLLECTION_NAME}`);
        const currentSize = info.data.result.config.params.vectors.size;
        if (currentSize !== 1024) {
            console.log(`[Qdrant] Dimension mismatch (${currentSize} vs 1024). Recreating...`);
            await axios.delete(`${QDRANT_URL}/collections/${COLLECTION_NAME}`);
            throw { response: { status: 404 } };
        }
    } catch (error) {
        if (error.response?.status === 404) {
            console.log(`[Qdrant] Creating ${COLLECTION_NAME} (1024 dims)...`);
            await axios.put(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
                vectors: { size: 1024, distance: 'Cosine' }
            });
        } else {
            throw error;
        }
    }
}

async function walkDir(dir, files = []) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (e) { continue; }

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                await walkDir(fullPath, files);
            }
        } else {
            if (ALLOWED_EXTENSIONS.includes(path.extname(file)) && !IGNORE_FILES.includes(file)) {
                files.push(fullPath);
            }
        }
    }
    return files;
}

function chunkText(text, size = 3000, overlap = 300) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + size, text.length);
        chunks.push(text.substring(start, end));
        if (end === text.length) break;
        start = end - overlap;
    }
    return chunks;
}

async function runIndexer() {
    console.log(`\n🚀 INICIANDO INDEXACIÓN DE REPOSITORIO EN QDRANT`);
    console.log(`📍 Directorio: ${TARGET_DIR}`);
    console.log(`📦 Colección:  ${COLLECTION_NAME}\n`);

    await ensureCollection();

    let processedMap = {};
    if (fs.existsSync(PROGRESS_FILE)) {
        try {
            processedMap = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
            console.log(`♻️ Progreso anterior detectado. ${Object.keys(processedMap).length} archivos ya listos serán omitidos.`);
        } catch (e) {
            console.warn(`[Warning] No se pudo leer el archivo de progreso. Se re-indexará todo.`);
        }
    }

    console.log(`🔍 Escaneando archivos...`);
    const files = await walkDir(TARGET_DIR);
    console.log(`📊 Encontrados ${files.length} archivos relevantes.\n`);

    let totalChunks = 0;
    let processedFiles = 0;
    let skippedFiles = 0;

    for (const file of files) {
        const relativePath = path.relative(TARGET_DIR, file);

        // Skip check
        if (processedMap[relativePath]) {
            skippedFiles++;
            processedFiles++;
            continue;
        }

        let content;
        try {
            content = fs.readFileSync(file, 'utf8');
        } catch (e) { continue; }

        if (!content || content.length < 50) {
            processedMap[relativePath] = true; // Mark as done to avoid checking again
            continue;
        }

        const chunks = chunkText(content, 800, 80);
        let successChunks = 0;

        processedFiles++;
        console.log(`  📄 [${processedFiles}/${files.length - skippedFiles}] Indexando: ${relativePath} (${chunks.length} chunks) ...`);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i].trim(); // Trim spaces/newlines

            // Skip nearly empty chunks that might cause Ollama 400 Bad Request
            if (chunk.length < 10) {
                successChunks++;
                continue;
            }

            const id = crypto.createHash('md5').update(`${relativePath}_${i}`).digest('hex');

            try {
                // Throttle requests to not overwhelm local Ollama
                await new Promise(r => setTimeout(r, 50));

                // Prefix with 'passage: ' as recommended for mxbai-embed-large docs
                const vector = await generateEmbedding(`passage: ${chunk}`);
                await axios.put(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points?wait=false`, {
                    points: [{
                        id: id,
                        vector: vector,
                        payload: {
                            text: chunk,
                            file: relativePath,
                            chunk_index: i,
                            total_chunks: chunks.length,
                            timestamp: new Date().toISOString()
                        }
                    }]
                });
                successChunks++;
                totalChunks++;
            } catch (err) {
                console.error(`  ⚠️ Chunk ${i} de ${relativePath} falló: ${err.message}`);
                // Only skip on 500/timeout, stop on connection loss
                if (err.message.includes('ECONNREFUSED')) process.exit(1);

                // If it's a 400 Bad Request, treat the chunk as successfully bypassed so it
                // doesn't loop infinitely on the exact same error text next time
                if (err.response && (err.response.status === 400 || err.response.status === 500)) {
                    successChunks++;
                }
            }
        }

        // If we processed all chunks successfully, mark the file as completely indexed
        if (successChunks === chunks.length) {
            processedMap[relativePath] = true;
            fs.writeFileSync(PROGRESS_FILE, JSON.stringify(processedMap, null, 2));
            console.log(`     ✅ Completado: ${relativePath}`);
        }

        if ((processedFiles - skippedFiles) % 20 === 0 && (processedFiles - skippedFiles) !== 0) {
            console.log(`\n  🕒 RECORDER: ${totalChunks} chunks nuevos hasta ahora...\n`);
        }
    }

    console.log(`\n✅ REPOSITORIO "ENTRENADO" CORRECTAMENTE!`);
    console.log(`Archivos Omitidos (Ya Indexados): ${skippedFiles}`);
    console.log(`Archivos Procesados Nuevos: ${processedFiles - skippedFiles}`);
    console.log(`Vectores NUEVOS en Qdrant:  ${totalChunks}`);
    console.log(`\nAhora el orquestador puede usar esta memoria para RAG.`);
    process.exit(0);
}

runIndexer().catch(err => {
    console.error(`\n💥 Error Fatal:`, err.message);
    process.exit(1);
});

