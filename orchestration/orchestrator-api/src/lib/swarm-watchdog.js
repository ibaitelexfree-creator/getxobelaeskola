import { query } from './db-client.js';
import { sendMessage } from '../telegram-bot.js';

/**
 * Watchdog to detect and handle stuck swarms.
 */
export async function runSwarmWatchdog() {
    console.log('[Watchdog] Checking for stuck swarms...');

    try {
        // Find swarms that have been 'running' for more than 1 hour
        const stuckRes = await query(`
            SELECT id, metadata->>'original_prompt' as original_prompt 
            FROM sw2_swarms 
            WHERE status = 'running' 
            AND updated_at < NOW() - INTERVAL '1 hour'
        `);

        if (stuckRes.rows.length === 0) {
            console.log('[Watchdog] No stuck swarms found.');
            return;
        }

        const chatId = process.env.TELEGRAM_CHAT_ID;

        for (const swarm of stuckRes.rows) {
            console.warn(`[Watchdog] Terminating stuck swarm: ${swarm.id}`);

            // Update DB status
            await query(`
                UPDATE sw2_swarms 
                SET status = 'failed', 
                    error_log = 'TERMINATED_BY_WATCHDOG: Timeout (> 1h)',
                    updated_at = NOW()
                WHERE id = $1
            `, [swarm.id]);

            if (chatId) {
                await sendMessage(chatId, `⚠️ *WATCHDOG:* Swarm \`#${swarm.id}\` detectado como bloqueado (>1h). Marcado como fallido.\n\n_Prompt:_ ${swarm.original_prompt?.slice(0, 100)}...`);
            }
        }
    } catch (error) {
        console.error('[Watchdog] Error:', error);
    }
}
