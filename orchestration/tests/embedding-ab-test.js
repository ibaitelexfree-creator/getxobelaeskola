import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config({ path: './orchestration/.env' });

/**
 * 🧪 Embedding A/B Test: Hash (old) vs Real (new)
 * ---------------------------------------------------------------
 * Proves that the old SHA-256 hash-based "embeddings" had zero
 * semantic recall compared to real AI embeddings.
 * ---------------------------------------------------------------
 * Run: node orchestration/tests/embedding-ab-test.js
 */

const OLLAMA_URL = 'http://localhost:11434/api/embeddings';
const MODEL = 'mxbai-embed-large';

const DOCUMENTS = [
    'Cómo configurar Supabase con Next.js para autenticación SSR',
    'Tutorial de despliegue en Vercel con variables de entorno',
    'El componente de navegación del sailing simulator necesita refactoring',
    'Migración SQL para añadir la tabla de bonos y membresías',
    'Integración de Stripe para pagos recurrentes en la academia',
    'Configurar el webhook de Telegram para notificaciones',
    'Optimizar las imágenes del mapa de Getxo con Sharp',
    'Test unitario del sistema de puntuación del logbook',
    'Gestión de estados con Zustand para el panel de control',
    'Configuración de Redis como caché de sesiones del orchestrator'
];

const QUERIES = [
    { query: 'Cómo integrar pagos con tarjeta de crédito', expectedIdx: [4] },
    { query: 'Autenticación y login con Supabase', expectedIdx: [0] },
    { query: 'Subir la aplicación a producción en Vercel', expectedIdx: [1] },
    { query: 'Enviar mensajes al bot de Telegram', expectedIdx: [5] },
    { query: 'Caché y rendimiento con Redis', expectedIdx: [9] }
];

function hashEmbedding(text) {
    const hash = crypto.createHash('sha256').update(text || '').digest();
    const vector = new Array(1024).fill(0); // Match Ollama dim for comparison
    for (let i = 0; i < 1024; i++) {
        const byte1 = hash[i % 32];
        const byte2 = hash[(i + 7) % 32];
        const byte3 = hash[(i + 13) % 32];
        vector[i] = ((byte1 ^ byte2) + byte3) / 255.0 - 0.5;
    }
    return vector;
}

async function realEmbedding(text) {
    const res = await axios.post(OLLAMA_URL, {
        model: MODEL, prompt: text.substring(0, 8000)
    });
    return res.data.embedding;
}

function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i]; normA += a[i] * a[i]; normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function findTopK(queryVec, docVecs, k = 3) {
    return docVecs
        .map((vec, idx) => ({ idx, score: cosineSimilarity(queryVec, vec) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, k);
}

async function runABTest() {
    console.log(`\n=== 🧪 A/B TEST: Hash vs Real Embeddings (OLLAMA) ===`);
    console.log(`Model: ${MODEL}\n`);

    console.log('Generating document embeddings (hash)...');
    const hashDocVecs = DOCUMENTS.map(d => hashEmbedding(d));

    console.log('Generating document embeddings (Ollama AI)...');
    const realDocVecs = [];
    for (const doc of DOCUMENTS) {
        realDocVecs.push(await realEmbedding(doc));
    }

    let hashHits = 0, realHits = 0;

    console.log('\n--- QUERY RESULTS ---');
    for (const { query, expectedIdx } of QUERIES) {
        const hashQuery = hashEmbedding(query);
        const realQuery = await realEmbedding(query);

        const hashTop = findTopK(hashQuery, hashDocVecs, 3);
        const realTop = findTopK(realQuery, realDocVecs, 3);

        const hashHit = hashTop.some(r => expectedIdx.includes(r.idx));
        const realHit = realTop.some(r => expectedIdx.includes(r.idx));

        if (hashHit) hashHits++;
        if (realHit) realHits++;

        console.log(`\n  Query: "${query}"`);
        console.log(`  Expected doc #${expectedIdx[0]}: "${DOCUMENTS[expectedIdx[0]].substring(0, 50)}..."`);
        console.log(`  Hash Top3: ${hashTop.map(r => `#${r.idx}(${r.score.toFixed(3)})`).join(', ')} → ${hashHit ? '✅' : '❌'}`);
        console.log(`  Real Top3: ${realTop.map(r => `#${r.idx}(${r.score.toFixed(3)})`).join(', ')} → ${realHit ? '✅' : '❌'}`);
    }

    const hashRecall = (hashHits / QUERIES.length * 100).toFixed(0);
    const realRecall = (realHits / QUERIES.length * 100).toFixed(0);

    console.log(`\n=== RECALL COMPARISON ===`);
    console.log(`Hash (SHA-256): ${hashRecall}% recall (${hashHits}/${QUERIES.length})`);
    console.log(`Real (Ollama):  ${realRecall}% recall (${realHits}/${QUERIES.length})`);
    console.log(`Improvement:    +${realRecall - hashRecall}% absolute`);

    if (realHits > hashHits) {
        console.log(`\n🎉 A/B TEST PASSED — Local AI embeddings are dramatically better.`);
        process.exit(0);
    } else {
        console.log(`\n⚠️ A/B TEST: No improvement detected. Ensure Ollama is running correctly.`);
        process.exit(1);
    }
}

runABTest().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
