/**
 * RAG (Retrieval-Augmented Generation) Module
<<<<<<< HEAD
 * Integrates with Qdrant for vector storage and Google Gemini for embeddings.
=======
 * Enables codebase-aware LLM responses by indexing and searching local files
>>>>>>> pr-286
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
<<<<<<< HEAD
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
=======
import { ollamaCompletion } from './ollama.js';

// In-memory index (for simplicity - production would use vector DB)
const ragIndex = {
    documents: [],        // { id, path, content, chunks }
    lastUpdated: null
};

/**
 * Split text into overlapping chunks for better context
 */
function chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const content = text.slice(start, end);
        chunks.push({
            content,
            contentLower: content.toLowerCase(),
            start,
            end
        });
        start += chunkSize - overlap;
    }

    return chunks;
}

/**
 * Generate a simple hash for document identity
 */
function hashContent(content) {
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

/**
 * Calculate simple similarity score using keyword matching
 * (Production would use embeddings for semantic search)
 */
function calculateSimilarity(queryWords, textLower) {
    let matches = 0;
    for (const word of queryWords) {
        if (textLower.includes(word)) {
            matches++;
        }
    }

    return queryWords.length > 0 ? matches / queryWords.length : 0;
}

/**
 * Index a single file asynchronously
 */
async function indexFileAsync(filePath) {
    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const chunks = chunkText(content);
        const id = hashContent(filePath + content);

        return {
            id,
            path: filePath,
            filename: path.basename(filePath),
            extension: path.extname(filePath),
            content: content.slice(0, 5000), // Store truncated for reference
            chunks: chunks.map((c, i) => ({
                ...c,
                id: `${id}-${i}`
            })),
            indexed: new Date().toISOString()
        };
    } catch (error) {
>>>>>>> pr-286
        return null;
    }
}

<<<<<<< HEAD
=======
/**
 * Get supported file extensions for indexing
 */
function getSupportedExtensions() {
    return [
        '.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs',
        '.py', '.rb', '.go', '.rs', '.java', '.kt',
        '.c', '.cpp', '.h', '.hpp', '.cs',
        '.md', '.txt', '.json', '.yaml', '.yml',
        '.html', '.css', '.scss', '.less',
        '.sql', '.sh', '.ps1', '.bat'
    ];
}

/**
 * Index a directory recursively
 */
>>>>>>> pr-286
export async function ragIndexDirectory(params) {
    const {
        directory,
        extensions = getSupportedExtensions(),
<<<<<<< HEAD
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
=======
        maxFiles = 100,
        excludePatterns = ['node_modules', '.git', 'dist', 'build', '__pycache__']
    } = params;

    // SECURITY FIX: Validate directory is within project root to prevent path traversal
    const projectRoot = process.cwd();
    const resolvedDir = path.resolve(projectRoot, directory);

    // Ensure the resolved path is within the project root
    if (!resolvedDir.startsWith(projectRoot)) {
        return { success: false, error: 'Path traversal is not allowed. Directory must be within project root.' };
    }

    try {
        await fs.promises.access(resolvedDir);
    } catch {
        return { success: false, error: `Directory not found: ${resolvedDir}` };
    }

    const files = [];

    async function walkDir(dir, depth = 0) {
        if (depth > 10 || files.length >= maxFiles) return;

        try {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });

            // Process subdirectories sequentially to respect maxFiles early exit (mostly)
            // or parallel if we don't care about strict order or over-fetching a bit.
            // For simplicity and strictness on maxFiles, we can do it somewhat sequentially or accumulate.
            // Given the original was sync and DFS, let's keep it simple but async.

            for (const entry of entries) {
                if (files.length >= maxFiles) break;

                const fullPath = path.join(dir, entry.name);

                // Skip excluded patterns
                if (excludePatterns.some(p => entry.name.includes(p))) continue;

                if (entry.isDirectory()) {
                    await walkDir(fullPath, depth + 1);
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (e) {
            // Skip directories we can't read
        }
    }

    await walkDir(resolvedDir);

    // Index files in batches to control concurrency
    const CONCURRENCY = 10;
    const indexed = [];

    for (let i = 0; i < files.length; i += CONCURRENCY) {
        const batch = files.slice(i, i + CONCURRENCY);
        const results = await Promise.all(batch.map(file => indexFileAsync(file)));

        for (const doc of results) {
            if (doc) {
                 // Check if already indexed
                const existing = ragIndex.documents.findIndex(d => d.path === doc.path);
                if (existing >= 0) {
                    ragIndex.documents[existing] = doc;
                } else {
                    ragIndex.documents.push(doc);
                }
                indexed.push({
                    path: doc.path,
                    chunks: doc.chunks.length
                });
>>>>>>> pr-286
            }
        }
    }

<<<<<<< HEAD
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
=======
    ragIndex.lastUpdated = new Date().toISOString();

    return {
        success: true,
        indexed: indexed.length,
        totalDocuments: ragIndex.documents.length,
        totalChunks: ragIndex.documents.reduce((sum, d) => sum + d.chunks.length, 0),
        files: indexed.slice(0, 20) // Show first 20
    };
}

/**
 * Search indexed documents and return relevant context
 */
function searchIndex(query, topK = 5) {
    const results = [];
    // Optimization: Process query once
    const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);

    for (const doc of ragIndex.documents) {
        for (const chunk of doc.chunks) {
            // Use pre-computed lowercase content if available
            const textLower = chunk.contentLower || chunk.content.toLowerCase();
            const score = calculateSimilarity(queryWords, textLower);
            if (score > 0.1) {
                results.push({
                    path: doc.path,
                    filename: doc.filename,
                    content: chunk.content,
                    score
                });
            }
        }
    }

    // Sort by score and return top results
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
}

/**
 * Query with RAG - search context and generate response
 */
export async function ragQuery(params) {
    const {
        query,
        model = 'qwen2.5-coder:7b',
        topK = 5
    } = params;

    if (ragIndex.documents.length === 0) {
        return {
            success: false,
            error: 'No documents indexed. Use ollama_rag_index first.'
        };
    }

    // Search for relevant context
    const searchResults = searchIndex(query, topK);

    if (searchResults.length === 0) {
        return {
            success: false,
            error: 'No relevant context found for your query.'
        };
    }

    // Build context from search results
    const context = searchResults
        .map(r => `--- ${r.filename} ---\n${r.content}`)
        .join('\n\n');

    // Generate response with context
    const systemPrompt = `You are a helpful coding assistant with access to the user's codebase.
Use the following context from their files to answer questions accurately.
If the answer isn't in the context, say so but try to be helpful.

CODEBASE CONTEXT:
${context}`;

    const response = await ollamaCompletion({
        prompt: query,
        systemPrompt,
        model
    });

    return {
        success: true,
        response: response.content,
        model,
        sourcesUsed: searchResults.map(r => ({
            file: r.filename,
            path: r.path,
            relevance: Math.round(r.score * 100) + '%'
        })),
        totalIndexed: ragIndex.documents.length
    };
}

/**
 * Get RAG index status
 */
export function ragStatus() {
    return {
        indexed: ragIndex.documents.length > 0,
        documents: ragIndex.documents.length,
        totalChunks: ragIndex.documents.reduce((sum, d) => sum + d.chunks.length, 0),
        lastUpdated: ragIndex.lastUpdated,
        files: ragIndex.documents.map(d => ({
            path: d.path,
            chunks: d.chunks.length
        }))
    };
}

/**
 * Clear the RAG index
 */
export function ragClear() {
    ragIndex.documents = [];
    ragIndex.lastUpdated = null;
    return { success: true, message: 'RAG index cleared' };
>>>>>>> pr-286
}
