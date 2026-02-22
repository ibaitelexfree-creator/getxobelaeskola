const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { OpenAI } = require('openai');
const { QdrantClient } = require('@qdrant/js-client-rest');
const { v5: uuidv5 } = require('uuid');

// Configuration
const NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341'; // Fixed namespace for deterministic UUIDs
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || 'git_commits';
const BATCH_SIZE = 50;
const EMBEDDING_MODEL = 'text-embedding-3-small';
const VECTOR_SIZE = 1536;

// Separators
const FIELD_SEP = '\x1f'; // Unit Separator
const RECORD_SEP = '\x1e'; // Record Separator

async function main() {
    console.log('🚀 Starting Qdrant ingestion script...');

    // 1. Validate Environment
    const openaiKey = process.env.OPENAI_API_KEY;
    const qdrantUrl = process.env.QDRANT_URL;
    const qdrantKey = process.env.QDRANT_API_KEY;

    if (!openaiKey) {
        console.error('❌ Error: OPENAI_API_KEY is not set in .env');
        process.exit(1);
    }
    if (!qdrantUrl) {
        console.error('❌ Error: QDRANT_URL is not set in .env');
        process.exit(1);
    }

    const openai = new OpenAI({ apiKey: openaiKey });
    const qdrant = new QdrantClient({ url: qdrantUrl, apiKey: qdrantKey });

    // 2. Fetch Git Logs
    console.log('📜 Fetching git logs...');
    let gitLogOutput;
    try {
        // Use custom separators to handle multiline messages and special chars safely
        // %H: commit hash
        // %an: author name
        // %ad: author date (ISO 8601)
        // %s: subject
        // %b: body
        const cmd = `git log --pretty=format:"%H${FIELD_SEP}%an${FIELD_SEP}%ad${FIELD_SEP}%s %b${RECORD_SEP}" --date=iso`;
        gitLogOutput = execSync(cmd, {
            encoding: 'utf-8',
            maxBuffer: 20 * 1024 * 1024 // 20MB buffer
        });
    } catch (error) {
        console.error('❌ Error executing git log:', error.message);
        process.exit(1);
    }

    const commits = gitLogOutput.split(RECORD_SEP)
        .filter(line => line.trim() !== '')
        .map(record => {
            const parts = record.split(FIELD_SEP);
            if (parts.length < 4) return null;

            const hash = parts[0];
            const author = parts[1];
            const date = parts[2];
            const message = parts.slice(3).join(' '); // Join remaining parts just in case, though separator is unique

            return { hash, author, date, message: message.trim() };
        })
        .filter(c => c !== null);

    console.log(`✅ Found ${commits.length} commits.`);

    // 3. Ensure Collection Exists
    console.log(`📦 Checking collection '${COLLECTION_NAME}'...`);
    try {
        const collections = await qdrant.getCollections();
        const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

        if (!exists) {
            console.log(`✨ Creating collection '${COLLECTION_NAME}'...`);
            await qdrant.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_SIZE,
                    distance: 'Cosine',
                },
            });
            console.log('✅ Collection created.');
        } else {
            console.log('✅ Collection already exists.');
        }
    } catch (error) {
        console.error('❌ Error connecting to Qdrant:', error.message);
        console.error('Ensure QDRANT_URL is correct and the server is reachable.');
        process.exit(1);
    }

    // 4. Process Commits
    console.log('Processing commits...');

    // Reverse to process oldest first (optional)
    commits.reverse();

    let processedCount = 0;

    // We'll process in chunks
    const chunks = [];
    for (let i = 0; i < commits.length; i += BATCH_SIZE) {
        chunks.push(commits.slice(i, i + BATCH_SIZE));
    }

    for (let i = 0; i < chunks.length; i++) {
        const batch = chunks[i];
        console.log(`Processing batch ${i + 1}/${chunks.length} (${batch.length} commits)...`);

        try {
            // Prepare inputs for embedding
            const inputs = batch.map(c =>
                `Commit: ${c.hash}\nAuthor: ${c.author}\nDate: ${c.date}\nMessage: ${c.message}`
            );

            // Generate embeddings
            const embeddingResponse = await openai.embeddings.create({
                model: EMBEDDING_MODEL,
                input: inputs,
            });

            const points = batch.map((commit, index) => {
                const vector = embeddingResponse.data[index].embedding;
                // Generate deterministic UUID from commit hash
                // Namespace ensures we generate the same UUID for the same commit hash every time
                const id = uuidv5(commit.hash, NAMESPACE);

                return {
                    id,
                    vector,
                    payload: {
                        hash: commit.hash,
                        author: commit.author,
                        date: commit.date,
                        message: commit.message,
                        type: 'git_commit'
                    }
                };
            });

            // Upsert to Qdrant
            await qdrant.upsert(COLLECTION_NAME, {
                wait: true,
                points: points
            });

            processedCount += batch.length;
        } catch (error) {
            console.error(`⚠️ Error processing batch ${i + 1}:`, error.message);
            if (error.response) {
                console.error('API Response:', error.response.data);
            }
            // Continue to next batch
        }
    }

    console.log(`🎉 Ingestion complete! Processed ${processedCount}/${commits.length} commits.`);
}

main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
