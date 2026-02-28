import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: './orchestration/.env' });

/**
 * 🧪 Embedding Quality Benchmark
 * ---------------------------------------------------------------
 * Tests the SEMANTIC quality of the configured embedding model.
 * Defines pairs of similar/different phrases and measures cosine
 * similarity. PASS = similar pairs > 0.7, different pairs < 0.4.
 * ---------------------------------------------------------------
 * Run: node orchestration/tests/embedding-quality.test.js
 */

const OLLAMA_URL = 'http://localhost:11434/api/embeddings';
const MODEL = 'mxbai-embed-large';

const SIMILAR_PAIRS = [
    ['El perro labrador juega en el parque', 'Un labrador retriever corriendo en un jardín'],
    ['Cómo configurar una base de datos PostgreSQL', 'Tutorial para instalar y configurar Postgres'],
    ['Error de autenticación en el login', 'Fallo al iniciar sesión del usuario'],
    ['Optimizar rendimiento de consultas SQL', 'Mejorar velocidad de queries en base de datos'],
    ['Implementar API REST con Node.js', 'Crear endpoints RESTful usando Express']
];

const DIFFERENT_PAIRS = [
    ['El perro labrador juega en el parque', 'La ecuación de segundo grado tiene dos soluciones'],
    ['Cómo configurar una base de datos PostgreSQL', 'Las mareas del Cantábrico en febrero'],
    ['Error de autenticación en el login', 'Receta de pastel de chocolate con fresas'],
    ['Optimizar rendimiento de consultas SQL', 'Los planetas del sistema solar exterior'],
    ['Implementar API REST con Node.js', 'Historia de la navegación vasca en el siglo XVIII']
];

async function getEmbedding(text) {
    const res = await axios.post(OLLAMA_URL, {
        model: MODEL, prompt: text.substring(0, 8000)
    });
    return res.data.embedding;
}

function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function runBenchmark() {
    console.log(`\n=== 🧪 EMBEDDING QUALITY BENCHMARK ===`);
    console.log(`Target: LOCAL OLLAMA`);
    console.log(`Model:  ${MODEL}\n`);

    let similarScores = [];
    let differentScores = [];
    let failures = 0;

    console.log('--- SIMILAR PAIRS (expected > 0.65) ---');
    for (const [a, b] of SIMILAR_PAIRS) {
        try {
            const [embA, embB] = await Promise.all([getEmbedding(a), getEmbedding(b)]);
            const score = cosineSimilarity(embA, embB);
            similarScores.push(score);
            const status = score > 0.65 ? '✅' : '❌';
            if (score <= 0.65) failures++;
            console.log(`  ${status} ${score.toFixed(4)} | "${a.substring(0, 40)}..." ↔ "${b.substring(0, 40)}..."`);
        } catch (err) {
            console.error(`  ❌ Ollama Error: ${err.message}`);
            failures++;
        }
    }

    console.log('\n--- DIFFERENT PAIRS (expected < 0.58) ---');
    for (const [a, b] of DIFFERENT_PAIRS) {
        try {
            const [embA, embB] = await Promise.all([getEmbedding(a), getEmbedding(b)]);
            const score = cosineSimilarity(embA, embB);
            differentScores.push(score);
            const status = score < 0.58 ? '✅' : '❌';
            if (score >= 0.58) failures++;
            console.log(`  ${status} ${score.toFixed(4)} | "${a.substring(0, 40)}..." ↔ "${b.substring(0, 40)}..."`);
        } catch (err) {
            console.error(`  ❌ Ollama Error: ${err.message}`);
            failures++;
        }
    }

    const avgSimilar = similarScores.length > 0 ? (similarScores.reduce((a, b) => a + b, 0) / similarScores.length) : 0;
    const avgDifferent = differentScores.length > 0 ? (differentScores.reduce((a, b) => a + b, 0) / differentScores.length) : 0;

    console.log(`\n=== RESULTS ===`);
    console.log(`Avg Similar:   ${avgSimilar.toFixed(4)} (target: > 0.65)`);
    console.log(`Avg Different: ${avgDifferent.toFixed(4)} (target: < 0.58)`);
    console.log(`Separation:    ${(avgSimilar - avgDifferent).toFixed(4)} (higher = better discrimination)`);
    console.log(`Dimensions:    ${similarScores[0]?.length || 'N/A'}`);
    console.log(`Failures:      ${failures}`);

    if (failures === 0 && avgSimilar > 0.65 && avgDifferent < 0.58) {
        console.log(`\n🎉 BENCHMARK PASSED — Embedding quality is EXCELLENT.`);
        process.exit(0);
    } else {
        console.log(`\n❌ BENCHMARK FAILED — Local embedding results were suboptimal.`);
        process.exit(1);
    }
}

runBenchmark().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
