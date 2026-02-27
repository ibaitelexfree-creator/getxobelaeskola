import QdrantClient from '../lib/qdrant-client.js';

const COLLECTIONS = [
    'git-history',
    'errors-solutions',
    'jules-architect',
    'jules-data',
    'jules-ui',
    'pipeline-rca',
    'swarm-lessons'
];

async function initQdrant() {
    console.log('🔍 Inicializando Colecciones Qdrant (1536 dims)...');

    for (const name of COLLECTIONS) {
        try {
            await QdrantClient.ensureCollection(name, 1536);
            console.log(`✅ Colección ${name} lista.`);
        } catch (error) {
            console.error(`❌ Error en colección ${name}:`, error.message);
        }
    }
}

initQdrant().then(() => {
    console.log('✨ Qdrant configurado correctamente.');
    process.exit(0);
});
