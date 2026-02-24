/**
 * CreditMonitor — Unified Usage & Cost Dashboard
 * 
 * Aggregates consumption from all execution layers:
 *   - Jules Pool (tasks/day per account)
 *   - Flash Executor (tokens + credits)
 *   - ClawdBot (sessions + estimated cost)
 */

export class CreditMonitor {
    constructor(julesPool, flashExecutor, clawdbot, visualRelay, vercelMonitor) {
        this.pool = julesPool;
        this.flash = flashExecutor;
        this.clawdbot = clawdbot;
        this.visual = visualRelay;
        this.vercel = vercelMonitor;
    }

    vercelUsage() {
        if (!this.vercel) return null;
        const status = this.vercel.getStatus();

        // Pick primary metrics to display in summary
        const primaryMetrics = [
            'fast_data_transfer',
            'function_invocations',
            'edge_requests',
            'image_transformations'
        ];

        return primaryMetrics.map(key => {
            const m = status.quotas[key];
            return {
                name: m.displayName,
                used: m.used,
                limit: m.limit,
                unit: m.unit,
                pct: Math.round((m.used / m.limit) * 100)
            };
        });
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

    async browserlessUsage() {
        if (!this.visual) return { enabled: false };
        const usage = await this.visual.getUsage();
        return {
            enabled: this.visual.enabled,
            used: usage?.used || 0,
            limit: usage?.limit || 0,
            remaining: usage?.remaining || 0
        };
    }

    async getSummaryMessage() {
        const jules = this.julesUsage();
        const flash = this.flashCredits();
        const claw = this.clawdbotCost();
        const browse = await this.browserlessUsage();
        const vercel = this.vercelUsage();

        const julesLines = jules.accounts.map(a => {
            const bar = this._progressBar(a.used, a.limit);
            const emoji = a.paused ? '⏸️' : (a.used >= a.limit ? '🔴' : '🟢');
            return `  ${emoji} ${a.name}: ${a.used}/${a.limit} ${bar}`;
        });

        const vercelLines = vercel ? vercel.map(v => {
            const bar = this._progressBar(v.used, v.limit);
            const emoji = v.pct >= 90 ? '🔴' : (v.pct >= 70 ? '🟡' : '🟢');
            return `  ${emoji} ${v.name}: ${v.used}/${v.limit} ${v.unit} ${bar}`;
        }) : [];

        const flashEmoji = flash.hasCredits ? '🟢' : (flash.enabled ? '🟡' : '🔴');
        const clawEmoji = claw.available ? '🟢' : '🔴';

        return [
            `📊 **Usage Dashboard**`,
            `━━━━━━━━━━━━━━━━━━━━`,
            '',
            `**Jules Pool** (${jules.totalUsed}/${jules.totalLimit})`,
            ...julesLines,
            '',
            `**Vercel Quotas** (Limit 100%)`,
            ...vercelLines,
            '',
            `**Flash** ${flashEmoji} — ${flash.tasksToday} tareas | ${flash.tokensUsed.toLocaleString()} tokens`,
            `**ClawdBot** ${clawEmoji} — ${claw.sessionsToday} sesiones hoy`,
            `**Browserless** ${browse.enabled ? '🟢' : '🔴'} — ${browse.used}/${browse.limit} hoy`,
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
