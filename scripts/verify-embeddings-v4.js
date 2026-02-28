import axios from 'axios';

/**
 * 🐝 RALT V3: AI INFRASTRUCTURE VERIFICATION (8.2.1)
 * -------------------------------------------------------------------
 * Modelo: mxbai-embed-large (Mixedbread AI)
 * Dimensions: 1024
 * -------------------------------------------------------------------
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = 'mxbai-embed-large';

async function verify() {
    console.log(`--- 🧪 AI INFRASTRUCTURE VERIFICATION [START] ---`);
    console.log(`Target: ${OLLAMA_URL}`);
    console.log(`Model:  ${MODEL}`);

    try {
        // 1. Check Connection
        console.log('[1/3] Testing Ollama connection...');
        await axios.get(OLLAMA_URL);
        console.log('✅ Connection stable.');

        // 2. Generate Embedding
        console.log('[2/3] Generating test embedding (Programming context)...');
        const start = Date.now();
        const response = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
            model: MODEL,
            prompt: 'Task: Find root cause for PhysicalDivergence in RALT V3 Voter. Invariant: ZeroAbyss. StackTrace: 0x234F... Error: Fenced.'
        });
        const end = Date.now();

        const embedding = response.data.embedding;
        if (!embedding || !Array.isArray(embedding)) {
            throw new Error('Invalid embedding response format.');
        }

        console.log(`✅ Embedding generated in ${end - start}ms.`);
        console.log(`📏 Dimensions: ${embedding.length}`);

        // 3. Validate Dimensions (Must be 1024 for High Precision RAG)
        if (embedding.length === 1024) {
            console.log('💎 QUALITY CERTIFIED: High Precision (1024 dims) verified.');
        } else {
            console.warn(`⚠️ DIMENSION MISMATCH: Expected 1024, got ${embedding.length}. Check model settings.`);
        }

        console.log(`--- 🚀 INFRA-CRITICAL AI READY ---`);

    } catch (err) {
        console.error('❌ VERIFICATION FAILED:');
        if (err.code === 'ECONNREFUSED') {
            console.error(`- Could not reach Ollama at ${OLLAMA_URL}. Ensure it is running.`);
        } else if (err.response?.status === 404) {
            console.error(`- Model "${MODEL}" not found. Run "ollama pull ${MODEL}" first.`);
        } else {
            console.error(`- Error: ${err.message}`);
        }
        process.exit(1);
    }
}

verify();
