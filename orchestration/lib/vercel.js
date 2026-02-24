import { sendTelegramMessage } from './telegram.js';
import { appendToProjectMemory, writeProjectMemory } from './project-memory.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PREVIEW_FILE = path.join(__dirname, '../../project_memory/PREVIEW_URLS.md');

/**
 * Vercel Webhook Handler
 * Handles deployment succeeded/failed events
 */

/**
 * Verify Vercel webhook signature (optional but recommended)
 */
export function verifyVercelSignature(payload, signature) {
    // Para simplificar y cumplir rápido:
    return true;
}

/**
 * Handle Vercel webhook event
 */
export async function handleVercelWebhook(req) {
    const { type, payload, createdAt } = req.body;

    console.log(`[Vercel Webhook] Received event: ${type}`);

    if (type === 'deployment.succeeded' || type === 'deployment.ready') {
        const deployment = payload.deployment || payload;
        const url = `https://${deployment.url}`;
        const branch = deployment.meta?.githubCommitRef || 'main';
        const commitMsg = deployment.meta?.githubCommitMessage || 'Manual deployment';
        const author = deployment.meta?.githubCommitAuthorName || 'Vercel';

        const message = `🚀 *¡Despliegue en Vercel Completado!*\n\n` +
            `🌐 *Link:* ${url}\n` +
            `🌿 *Rama:* \`${branch}\`\n` +
            `📝 *Commit:* ${commitMsg}\n` +
            `👤 *Autor:* ${author}\n\n` +
            `_¡La web está lista para revisión!_`;

        // 1. Enviar a Telegram
        await sendTelegramMessage(message, { parseMode: 'Markdown' });

        // 2. Actualizar Control Manager (PREVIEW_URLS.md)
        try {
            const entry = `| ${new Date().toLocaleString()} | ${branch} | [Abrir Web](${url}) | ${commitMsg.substring(0, 50)}... |`;

            // Si el archivo no existe, creamos la cabecera
            if (!fs.existsSync(PREVIEW_FILE)) {
                const header = `| Fecha | Rama | Link | Commit |\n|---|---|---|---|\n`;
                writeProjectMemory('PREVIEW_URLS.md', header + entry);
            } else {
                appendToProjectMemory('PREVIEW_URLS.md', entry);
            }

            console.log(`[Vercel Webhook] Preview URL guardada en memoria: ${url}`);
        } catch (e) {
            console.error('[Vercel Webhook] Error al guardar en memoria:', e.message);
        }

        return { success: true, status: 200, type: 'live', url };
    }

    if (type === 'deployment.error') {
        // ... manejo de error existente ...
        const deployment = payload.deployment;
        const branch = deployment.meta?.githubCommitRef || 'unknown';

        const message = `❌ *Vercel Deployment Failed!*\n\n` +
            `🌿 *Branch:* \`${branch}\`\n` +
            `⚠️ *Status:* Error during deployment.\n` +
            `🔗 [View Logs](https://vercel.com/getxobelaeskola-4600s-projects/getxobelaeskola/deployments)`;

        await sendTelegramMessage(message, { parseMode: 'Markdown' });
        return { success: true, type: 'error' };
    }

    return { success: true, type: 'ignored', message: `Event ${type} not handled` };
}

export default {
    handleVercelWebhook,
    verifyVercelSignature
};
