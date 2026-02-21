/**
 * CreditMonitor — Unified Usage & Cost Dashboard
 * 
 * Aggregates consumption from all execution layers:
 *   - Jules Pool (tasks/day per account)
 *   - Flash Executor (tokens + credits)
 *   - ClawdBot (sessions + estimated cost)
 */

export class CreditMonitor {
    constructor(julesPool, flashExecutor, clawdbot) {
        this.pool = julesPool;
        this.flash = flashExecutor;
        this.clawdbot = clawdbot;
    }

    julesUsage() {
        const status = this.pool.getStatus();
        return {
            accounts: status.accounts.map(a => ({
                id: a.id,
                name: a.name,
                used: a.dailyUsed,
                limit: 100,
                active: a.active,
                paused: a.paused
            })),
            totalUsed: status.totalUsed,
            totalLimit: 300,
            pct: Math.round((status.totalUsed / 300) * 100)
        };
    }

    flashCredits() {
        const status = this.flash.getStatus();
        return {
            enabled: status.enabled,
            hasCredits: status.hasCredits,
            tasksToday: status.stats.tasksExecuted,
            tokensUsed: status.stats.tokensUsed,
            errors: status.stats.errorsCount,
            model: status.model
        };
    }

    clawdbotCost() {
        const status = this.clawdbot.getStatus();
        return {
            available: status.available,
            sessionsToday: status.sessionsToday || 0,
            healthy: status.healthy
        };
    }

    getSummaryMessage() {
        const jules = this.julesUsage();
        const flash = this.flashCredits();
        const claw = this.clawdbotCost();

        const julesLines = jules.accounts.map(a => {
            const bar = this._progressBar(a.used, a.limit);
            const emoji = a.paused ? '⏸️' : (a.used >= a.limit ? '🔴' : '🟢');
            return `  ${emoji} ${a.name}: ${a.used}/${a.limit} ${bar}`;
        });

        const flashEmoji = flash.hasCredits ? '🟢' : (flash.enabled ? '🟡' : '🔴');
        const clawEmoji = claw.available ? '🟢' : '🔴';

        return [
            `📊 **Usage Dashboard**`,
            `━━━━━━━━━━━━━━━━━━━━`,
            '',
            `**Jules Pool** (${jules.totalUsed}/${jules.totalLimit})`,
            ...julesLines,
            '',
            `**Flash** ${flashEmoji} — ${flash.tasksToday} tareas | ${flash.tokensUsed.toLocaleString()} tokens`,
            `**ClawdBot** ${clawEmoji} — ${claw.sessionsToday} sesiones hoy`,
            '',
            `🏗️ Prioridad: Jules → Flash → ClawdBot`
        ].join('\n');
    }

    _progressBar(current, max) {
        const pct = Math.min(current / max, 1);
        const filled = Math.round(pct * 8);
        return '▓'.repeat(filled) + '░'.repeat(8 - filled);
    }
}

export default CreditMonitor;
