const fs = require('fs/promises');
const path = require('path');
const { QdrantClient } = require('@qdrant/js-client-rest');
const glob = require('fast-glob');
const { v4: uuidv4 } = require('uuid');

// Configuration
const QDRANT_URL = process.env.QDRANT_URL || 'http://127.0.0.1:6333';
const COLLECTION_NAME = 'codebase_documentation';
const VECTOR_SIZE = 384; // Dimensions for all-MiniLM-L6-v2
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const BATCH_SIZE = 50;

// Parse CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

async function main() {
    console.log(`🚀 Starting ingestion script...`);
    if (DRY_RUN) console.log(`🚧 DRY RUN MODE: No changes will be made to Qdrant.`);

    // 1. Initialize Qdrant Client
    // We pass checkCompatibility: false to avoid warnings when server is not reachable in dry-run
    // or if we just want to suppress it.
    const client = new QdrantClient({ url: QDRANT_URL, checkCompatibility: !DRY_RUN });

    if (!DRY_RUN) {
        try {
            // Check connection
            await client.getCollections();
            console.log(`✅ Connected to Qdrant at ${QDRANT_URL}`);
        } catch (error) {
            console.error(`❌ Could not connect to Qdrant at ${QDRANT_URL}. Ensure it is running.`);
            console.error(`   Error: ${error.message}`);
            console.log(`   💡 Tip: You can run this script with --dry-run to test without Qdrant.`);
            process.exit(1);
        }

        // 2. Initialize Collection
        try {
            const collections = await client.getCollections();
            const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

            if (!exists) {
                console.log(`📦 Creating collection '${COLLECTION_NAME}'...`);
                await client.createCollection(COLLECTION_NAME, {
                    vectors: {
                        size: VECTOR_SIZE,
                        distance: 'Cosine',
                    },
                });
                console.log(`✅ Collection created.`);
            } else {
                console.log(`ℹ️ Collection '${COLLECTION_NAME}' already exists.`);
            }
        } catch (error) {
            console.error(`❌ Error managing collection:`, error);
            process.exit(1);
        }
    }

    // 3. Load Embedding Model
    console.log(`🧠 Loading embedding model (Xenova/all-MiniLM-L6-v2)...`);
    // Dynamic import for ESM-only package
    const { pipeline } = await import('@xenova/transformers');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    // 4. Find Files
    console.log(`🔍 Scanning for markdown files...`);
    const files = await glob(['**/*.md'], {
        ignore: ['node_modules/**', '.git/**', 'dist/**', '.next/**', 'build/**', 'coverage/**'],
        cwd: process.cwd(),
    });
    console.log(`found ${files.length} markdown files.`);

    let totalChunks = 0;
    let points = [];

    // 5. Process Files
    for (const file of files) {
        const filePath = path.join(process.cwd(), file);
        const content = await fs.readFile(filePath, 'utf-8');

        if (!content.trim()) continue;

        const chunks = chunkText(content, CHUNK_SIZE, CHUNK_OVERLAP);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            // Generate embedding
            const output = await extractor(chunk, { pooling: 'mean', normalize: true });
            const vector = Array.from(output.data);

            points.push({
                id: uuidv4(),
                vector: vector,
                payload: {
                    path: file,
                    content: chunk,
                    chunk_index: i,
                    total_chunks: chunks.length
                }
            });
        }
        totalChunks += chunks.length;
        process.stdout.write(`\rProcessed ${files.indexOf(file) + 1}/${files.length} files (${points.length} vectors buffer)...`);

        // Batch Upload
        if (points.length >= BATCH_SIZE) {
            if (!DRY_RUN) {
                await client.upsert(COLLECTION_NAME, {
                    wait: true,
                    points: points,
                });
            }
            points = []; // Clear buffer
        }
    }

    // Upload remaining points
    if (points.length > 0) {
        if (!DRY_RUN) {
            await client.upsert(COLLECTION_NAME, {
                wait: true,
                points: points,
            });
        }
    }

    console.log(`\n\n✅ Ingestion complete!`);
    console.log(`📄 Files processed: ${files.length}`);
    console.log(`🧩 Total chunks: ${totalChunks}`);
    if (DRY_RUN) console.log(`🚧 (Dry run - no vectors uploaded)`);
}

function chunkText(text, size, overlap) {
    if (!text) return [];

    const chunks = [];
    if (size <= overlap) {
        // Fallback or error? Let's just clamp overlap
        overlap = Math.floor(size / 2);
    }

    // Simple sliding window
    for (let i = 0; i < text.length; i += (size - overlap)) {
        chunks.push(text.slice(i, i + size));
    }

    return chunks;
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
