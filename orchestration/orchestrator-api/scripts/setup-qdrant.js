import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const PREFIX = process.env.QDRANT_COLLECTION_PREFIX || 'swarm_v2_';

if (!QDRANT_API_KEY) {
    console.error('❌ QDRANT_API_KEY not found in .env file!');
    process.exit(1);
}


const collections = [
    'git-history',
    'errors-solutions',
    'jules-architect',
    'jules-data',
    'jules-ui',
    'pipeline-rca',
    'swarm-lessons',
    'audit-history'
];

async function setup() {
    console.log(`Setting up Qdrant at ${QDRANT_URL}...`);

    for (const name of collections) {
        const fullName = `${PREFIX}${name}`;
        try {
            await axios.put(`${QDRANT_URL}/collections/${fullName}`, {
                vectors: {
                    size: 1536, // Standard for OpenAI/Gemini embeddings if used, adjust if needed
                    distance: 'Cosine'
                }
            }, {
                headers: {
                    'api-key': QDRANT_API_KEY
                }

            });
            console.log(`✅ Collection ${fullName} created.`);

        } catch (err) {
            if (err.response?.status === 409) {
                console.log(`ℹ️ Collection ${fullName} already exists.`);
            } else {
                console.error(`❌ Failed to create ${fullName}:`, err.message);
            }
        }
    }
}

setup();
