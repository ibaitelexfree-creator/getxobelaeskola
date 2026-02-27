import pg from 'pg';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/jules'
});

async function sendTelegramAlert(message) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: `⚠️ [FINANCE GUARD] ⚠️\n\n${message}`,
            parse_mode: 'Markdown'
        });
    } catch (err) {
        console.error('Error sending Telegram alert:', err?.response?.data || err.message);
    }
}


// Pricing setup (simplified)
const MODEL_PRICING = {
    'claude-3-5-sonnet': { input: 3.0 / 1e6, output: 15.0 / 1e6 },
    'gemini-1.5-pro': { input: 3.5 / 1e6, output: 10.5 / 1e6 },
    'gemini-1.5-flash': { input: 0.075 / 1e6, output: 0.3 / 1e6 },
    'default': { input: 1.0 / 1e6, output: 2.0 / 1e6 }
};

export async function logTokenUsage(jobId, model, phase, inputTokens, outputTokens) {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING['default'];
    const cost = (inputTokens * pricing.input) + (outputTokens * pricing.output);
    const total = inputTokens + outputTokens;

    try {
        await pool.query(
            'INSERT INTO sw2_token_usage (job_id, model, phase, input_tokens, output_tokens, total_tokens, cost_usd) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [jobId, model, phase, inputTokens, outputTokens, total, cost]
        );

        // Perform threshold checks
        const thresholds = {
            maxDaily: parseFloat(process.env.MAX_DAILY_USD || '5.0'),
            maxJob: parseFloat(process.env.MAX_JOB_USD || '0.50'),
            maxTPM: parseFloat(process.env.MAX_TPM || '100000')
        };

        const metrics = await getTokenMetrics();
        if (!metrics) return { blocked: false };

        let blocked = false;
        let alertMsg = '';

        // 1. Job threshold
        const jobCostRes = await pool.query('SELECT SUM(cost_usd) as cost FROM sw2_token_usage WHERE job_id = $1', [jobId]);
        const currentJobCost = parseFloat(jobCostRes.rows[0].cost || 0);

        if (currentJobCost > thresholds.maxJob) {
            blocked = true;
            alertMsg = `🛑 *Job Blocked!* Job ID \`${jobId}\` cost $${currentJobCost.toFixed(4)} exceeds limit of $${thresholds.maxJob}.`;
        }

        // 2. Daily threshold
        if (parseFloat(metrics.summary.daily_cost_usd) > thresholds.maxDaily) {
            alertMsg += `\n🚨 *Daily Limit Exceeded!* Current: $${parseFloat(metrics.summary.daily_cost_usd).toFixed(2)} / Max: $${thresholds.maxDaily}.`;
        }

        // 3. TPM (last 5 min)
        if (metrics.tpm > thresholds.maxTPM) {
            alertMsg += `\n🔥 *High Burn Rate!* TPM is ${Math.round(metrics.tpm)} / Max: ${thresholds.maxTPM}.`;
        }

        // 4. Monthly projection
        if (metrics.projected_monthly_usd > thresholds.maxDaily * 30) {
            // Optional alert for high projection
        }

        if (alertMsg) {
            await sendTelegramAlert(alertMsg);
        }

        return { blocked, cost: currentJobCost };

    } catch (err) {
        console.error('Error logging token usage:', err);
        return { blocked: false };
    }
}

export async function getTokenMetrics() {
    try {
        const stats = await pool.query(`
            SELECT 
                COALESCE(SUM(cost_usd), 0) as total_cost_usd,
                COALESCE(SUM(total_tokens), 0) as total_tokens,
                COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE THEN total_tokens ELSE 0 END), 0) as daily_tokens,
                COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE THEN cost_usd ELSE 0 END), 0) as daily_cost_usd
            FROM sw2_token_usage
        `);

        // Proyected Monthly (simple estimate based on uptime or linear)
        const dailyCost = parseFloat(stats.rows[0].daily_cost_usd);
        const projectedMonthly = dailyCost * 30;

        // Top expensive missions
        const topMissions = await pool.query(`
            SELECT job_id, SUM(cost_usd) as cost, SUM(total_tokens) as tokens, MIN(created_at) as created_at
            FROM sw2_token_usage
            GROUP BY job_id
            ORDER BY cost DESC
            LIMIT 10
        `);

        // Tokens per minute (last 5 min)
        const tpmRes = await pool.query(`
            SELECT COALESCE(SUM(total_tokens) / 5.0, 0) as tpm
            FROM sw2_token_usage
            WHERE created_at >= NOW() - INTERVAL '5 minutes'
        `);
        const tpm = parseFloat(tpmRes.rows[0].tpm);

        // Burn Variance Calculation (last 15 minutes, minute by minute)
        const varianceRes = await pool.query(`
            WITH minute_stats AS (
                SELECT 
                    date_trunc('minute', created_at) as min,
                    SUM(total_tokens) as tokens
                FROM sw2_token_usage
                WHERE created_at >= NOW() - INTERVAL '15 minutes'
                GROUP BY 1
            )
            SELECT 
                AVG(tokens) as avg_tpm,
                STDDEV(tokens) as stddev_tpm,
                (SELECT SUM(total_tokens) FROM sw2_token_usage WHERE created_at >= NOW() - INTERVAL '1 minute') as last_minute_tokens,
                (SELECT SUM(total_tokens) FROM sw2_token_usage WHERE created_at >= NOW() - INTERVAL '2 minutes' AND created_at < NOW() - INTERVAL '1 minute') as prev_minute_tokens
            FROM minute_stats
        `);

        const vData = varianceRes.rows[0];
        const avg_tpm = parseFloat(vData?.avg_tpm || 0);
        const stddev_tpm = parseFloat(vData?.stddev_tpm || 0);
        const cv = avg_tpm > 0 ? (stddev_tpm / avg_tpm) : 0;
        const delta_tpm_60s = parseFloat(vData?.last_minute_tokens || 0) - parseFloat(vData?.prev_minute_tokens || 0);

        return {
            summary: stats.rows[0],
            projected_monthly_usd: projectedMonthly,
            top_expensive: topMissions.rows,
            tpm: tpm,
            variance: {
                cv: Number(cv.toFixed(4)),
                avg_15m: Number(avg_tpm.toFixed(2)),
                stddev_15m: Number(stddev_tpm.toFixed(2)),
                delta_tpm_60s: delta_tpm_60s
            }
        };

    } catch (err) {
        console.error('Error fetching token metrics:', err);
        return null;
    }
}
