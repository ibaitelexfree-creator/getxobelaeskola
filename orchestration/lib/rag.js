/**
 * RAG (Retrieval-Augmented Generation) Module
 * Integrates with Qdrant for vector storage and Google Gemini for embeddings.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ollamaCompletion } from './ollama.js';

const COLLECTION_NAME = 'getxobelaeskola_code';
const VECTOR_SIZE = 3072; // Gemini gemini-embedding-001 dimension

let qdrantClient = null;
let genAI = null;

function getQdrantClient() {
    if (!qdrantClient) {
        qdrantClient = new QdrantClient({ url: process.env.QDRANT_URL || 'http://localhost:6333' });
    }
    return qdrantClient;
}

function getGenAI() {
    if (!genAI) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing. Cannot generate embeddings.");
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
}

async function getEmbedding(text) {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

async function ensureCollection() {
    const client = getQdrantClient();
    try {
        const collections = await client.getCollections();
        const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
        if (!exists) {
            await client.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_SIZE,
                    distance: 'Cosine'
                }
            });
            console.log(`[RAG] Created Qdrant collection: ${COLLECTION_NAME}`);
        }
    } catch (error) {
        console.error(`[RAG] Error ensuring Qdrant collection: ${error.message}`);
        throw error;
    }
}

function chunkText(text, chunkSize = 1500, overlap = 300) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const content = text.slice(start, end);
        chunks.push({ content, start, end });
        start += chunkSize - overlap;
    }
    return chunks;
}

function hashContent(content) {
    return crypto.createHash('md5').update(content).digest('hex');
}

function getSupportedExtensions() {
    return ['.js', '.jsx', '.ts', '.tsx', '.md', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.css', '.html', '.json', '.yaml', '.yml'];
}

async function indexFileAsync(filePath) {
    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const filename = path.basename(filePath);
        const extension = path.extname(filePath).toLowerCase();

        const chunks = chunkText(content);
        const fileHash = hashContent(filePath + content);
        const client = getQdrantClient();

        const points = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const embedding = await getEmbedding(chunk.content);
            points.push({
                id: crypto.createHash('md5').update(`${fileHash}-${i}`).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5'),
                vector: embedding,
                payload: {
                    filepath: filePath,
                    filename,
                    extension,
                    content: chunk.content,
                    start: chunk.start,
                    end: chunk.end
                }
            });
            // Small delay to respect rate limits if not using batch
            await new Promise(r => setTimeout(r, 100));
        }

        if (points.length > 0) {
            await client.upsert(COLLECTION_NAME, { wait: true, points });
        }

        return { path: filePath, chunks: chunks.length };
    } catch (error) {
        console.error(`[RAG] Error indexing ${filePath}: ${error.message}`);
        return null;
    }
}

export async function ragIndexDirectory(params) {
    const {
        directory,
        extensions = getSupportedExtensions(),
        maxFiles = 500,
        excludePatterns = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.next']
    } = params;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const projectRoot = path.resolve(__dirname, '../../').toLowerCase();
    const resolvedDir = path.resolve(process.cwd(), directory || '.').toLowerCase();

    if (!resolvedDir.startsWith(projectRoot)) {
        return { success: false, error: 'Path traversal not allowed.' };
    }

    try {
        await ensureCollection();
    } catch (e) {
        return { success: false, error: `Qdrant connection error: ${e.message}` };
    }

    const files = [];
    async function walk(dir, depth = 0) {
        if (depth > 10 || files.length >= maxFiles) return;
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (excludePatterns.some(p => entry.name.includes(p))) continue;
            if (entry.isDirectory()) await walk(fullPath, depth + 1);
            else if (entry.isFile() && extensions.includes(path.extname(entry.name).toLowerCase())) {
                files.push(fullPath);
            }
        }
    }

    await walk(resolvedDir);

    const indexed = [];
    // Sequential processing to avoid Gemini rate limits
    for (const file of files) {
        const result = await indexFileAsync(file);
        if (result) indexed.push(result);
    }

    return { success: true, indexed: indexed.length, totalFiles: files.length };
}

export async function ragQuery(params) {
    const { query, topK = 5, systemPrompt = 'You are a technical assistant with access to the project codebase.' } = params;

    try {
        const client = getQdrantClient();
        const queryEmbedding = await getEmbedding(query);

        const searchResults = await client.search(COLLECTION_NAME, {
            vector: queryEmbedding,
            limit: topK,
            with_payload: true
        });

        if (searchResults.length === 0) {
            return { success: false, error: 'No relevant context found.' };
        }

        const context = searchResults.map(res => `[File: ${res.payload.filepath}]\n${res.payload.content}`).join('\n\n---\n\n');
        const finalPrompt = `Context from codebase:\n${context}\n\nUser Question: ${query}\nPlease answer based on the context above.`;

        const response = await ollamaCompletion({
            prompt: finalPrompt,
            system: systemPrompt
        });

        return {
            success: true,
            answer: response.response,
            sources: searchResults.map(r => ({ path: r.payload.filepath, score: r.score }))
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function ragStatus() {
    try {
        const client = getQdrantClient();
        const info = await client.getCollection(COLLECTION_NAME);
        return {
            success: true,
            collection: COLLECTION_NAME,
            points_count: info.points_count,
            status: info.status
        };
    } catch (error) {
        return { success: false, error: 'Collection not found or Qdrant offline.' };
    }
}

export async function ragClear() {
    try {
        const client = getQdrantClient();
        await client.deleteCollection(COLLECTION_NAME);
        return { success: true, message: `Collection ${COLLECTION_NAME} deleted.` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
