import { query } from './db-client.js';
import { sendMessage } from '../telegram-bot.js';

/**
 * Generates a summary report of the last 24h of operation.
 */
export async function generateDailyReport() {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!chatId) return;

    try {
        // 1. Stats from DB
        const statsRes = await query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE status = 'failed') as failed,
                SUM(COALESCE(total_jules, 0)) as total_jules
            FROM sw2_swarms
            WHERE created_at > NOW() - INTERVAL '24 hours'
        `);

        const stats = statsRes.rows[0];
        const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

        // 2. Models used (Estimated)
        const modelsRes = await query(`
            SELECT role, COUNT(*) as count
            FROM sw2_tasks
            WHERE created_at > NOW() - INTERVAL '24 hours'
            GROUP BY role
        `);

        const modelStats = modelsRes.rows.map(r => `• ${r.role}: ${r.count} tasks`).join('\n');

        const message = [
            '📊 *REPORTE DIARIO - SWARM CI/CD 2.0*',
            '━━━━━━━━━━━━━━━━━━━━━━━',
            `🚀 Swarms Iniciados: ${stats.total}`,
            `✅ Completados: ${stats.completed} (${successRate}%)`,
            `❌ Fallidos: ${stats.failed}`,
            `🔧 Jules Consumidos: ${stats.total_jules || 0}`,
            '',
            '*Carga por Rol:*',
            modelStats || 'Sin actividad',
            '━━━━━━━━━━━━━━━━━━━━━━━',
            '_Operación 24/7 Activa_'
        ].join('\n');

        await sendMessage(chatId, message);
        return { success: true };
    } catch (error) {
        console.error('Daily Report Error:', error);
        return { success: false, error: error.message };
    }
}
