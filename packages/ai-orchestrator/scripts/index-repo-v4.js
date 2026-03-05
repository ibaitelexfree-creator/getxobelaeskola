import fs from 'fs';
import path from 'path';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || 'maestro_seguro_qdrant_2026';
const COLLECTION_NAME = 'global_knowledge';
const EMBEDDING_URL = 'http://localhost:8765/embed';
const TARGET_DIR = process.cwd();
const PROGRESS_FILE = path.join(TARGET_DIR, 'packages', 'ai-orchestrator', '.index-progress-v4.json');

const IGNORE_DIRS = [
    '.git', 'node_modules', 'dist', 'build', '.next', 'out',
    '.agent', '.jules_bases', 'tmp', 'brain', '.gemini',
    '.n8n_local', '.cache', 'logs', 'coverage', '.docker'
];
const ALLOWED_EXTS = ['.js', '.ts', '.tsx', '.md', '.json', '.html', '.css', '.py'];

async function generateEmbedding(text) {
    try {
        const response = await axios.post(EMBEDDING_URL, {
            text: text,
            model: "qwen3-vl"
        }, { timeout: 15000 });

        if (response.data && response.data.embedding) {
            return response.data.embedding;
        }
        throw new Error('Invalid embedding response');
    } catch (error) {
        console.error(`  ❌ Embedding error: ${error.message}`);
        return null;
    }
}

async function ensureCollection() {
    const headers = { 'api-key': QDRANT_API_KEY };
    try {
        await axios.get(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, { headers });
        console.log(`✅ Collection ${COLLECTION_NAME} exists.`);
    } catch (error) {
        console.log(`📡 Creating collection ${COLLECTION_NAME}...`);
        await axios.put(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
            vectors: { size: 4096, distance: 'Cosine' }
        }, { headers });
    }
}

async function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (IGNORE_DIRS.includes(file)) continue;
        const filePath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(filePath);
        } catch (e) { continue; }

        if (stat.isDirectory()) {
            await walk(filePath, fileList);
        } else {
            if (ALLOWED_EXTS.includes(path.extname(file))) {
                fileList.push(filePath);
            }
        }
    }
    return fileList;
}

function chunkText(text, size = 1000) {
    const chunks = [];
    if (!text) return chunks;
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
    }
    return chunks;
}

async function index() {
    console.log('🚀 INICIANDO INDEXACIÓN CEREBRO GLOBAL v4');
    await ensureCollection();

    let progress = {};
    if (fs.existsSync(PROGRESS_FILE)) {
        try {
            progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
            console.log(`♻️ Resuming indexing. ${Object.keys(progress).length} files already processed.`);
        } catch (e) {
            console.error('⚠️ Could not parse progress file. Starting fresh.');
        }
    }

    console.log('🔍 Scanning files...');
    const allFiles = await walk(TARGET_DIR);
    console.log(`📊 Encontrados ${allFiles.length} archivos para indexar.`);

    const headers = { 'api-key': QDRANT_API_KEY };
    let count = 0;

    for (const file of allFiles) {
        const relPath = path.relative(TARGET_DIR, file);
        count++;

        if (progress[relPath]) continue;

        console.log(`  📄 [${count}/${allFiles.length}] Indexando: ${relPath} ...`);

        try {
            const content = fs.readFileSync(file, 'utf-8');
            const chunks = chunkText(content);

            for (let i = 0; i < chunks.length; i++) {
                const vector = await generateEmbedding(chunks[i]);
                if (!vector) continue;

                const pointId = crypto.createHash('md5').update(`${relPath}_${i}`).digest('hex');
                await axios.put(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points?wait=true`, {
                    points: [{
                        id: pointId,
                        vector: vector,
                        payload: {
                            path: relPath,
                            content: chunks[i],
                            chunk: i,
                            indexed_at: new Date().toISOString()
                        }
                    }]
                }, { headers });
            }

            progress[relPath] = true;
            fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
            console.log(`    ✅ O.K.`);
        } catch (error) {
            console.error(`    ❌ Error en ${relPath}: ${error.message}`);
        }
    }

    console.log('🏁 INDEXACIÓN COMPLETADA.');
}

index().catch(console.error);
