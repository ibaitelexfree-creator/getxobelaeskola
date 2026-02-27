import { sendTelegramMessage } from '../telegram.js';

let lastAlertTime = 0;
const ALERT_COOLDOWN_MS = 3600000; // 1 hr

let statsHistory = {
    memory: [], // { timestamp, heapUsedMB }
    lag: [] // { timestamp, lagMs }
};

export function startNodeHealthMonitor() {
    console.log('🛡️ Starting Node.js Fatigue Monitor (Memory & Event Loop)...');

    // 1. Memory Monitor (check every 5s for trending)
    setInterval(() => {
        const mem = process.memoryUsage();
        const heapUsedMB = mem.heapUsed / 1024 / 1024;

        statsHistory.memory.push({ t: Date.now(), v: heapUsedMB });
        if (statsHistory.memory.length > 600) statsHistory.memory.shift(); // keep 1 hour at 6s interval approx, here 5s

        if (heapUsedMB > 512) {
            console.warn(`⚠️ [MEMORY] High Heap Usage: ${heapUsedMB.toFixed(2)} MB`);
            notifyIfCooldown('⚠️ *ALERTA NODE.JS:* Alto uso de Heap Memory', `${heapUsedMB.toFixed(2)} MB usados. Posible Memory Leak.`);
        }
    }, 5000);

    // 2. Event Loop Lag Monitor (check every 1s)
    let lastTime = Date.now();
    setInterval(() => {
        const now = Date.now();
        const lag = Math.max(0, now - lastTime - 1000);
        lastTime = now;

        statsHistory.lag.push({ t: now, v: lag });
        if (statsHistory.lag.length > 3600) statsHistory.lag.shift(); // keep 1 hour at 1s interval

        if (lag > 200) {
            console.warn(`🟡 [EVENT LOOP] High lag detected: ${lag}ms`);
            notifyIfCooldown('🟡 *NODE.JS FATIGUE:* Event loop bloqueado', `Lag de ${lag}ms sostenido. Verifica tareas síncronas pesadas.`);
        }
    }, 1000);
}

export function getHealthStats() {
    const memValues = statsHistory.memory.map(m => m.v);
    const lagValues = statsHistory.lag.map(l => l.v);

    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const p95 = (arr) => {
        if (!arr.length) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const index = Math.floor(sorted.length * 0.95);
        return sorted[index];
    };

    return {
        memory: {
            current: memValues[memValues.length - 1] || 0,
            avg: avg(memValues),
            trend: memValues.length > 5 ? (memValues[memValues.length - 1] - memValues[0]) / (statsHistory.memory[memValues.length - 1].t - statsHistory.memory[0].t) * 60000 : 0 // MB per minute
        },
        lag: {
            current: lagValues[lagValues.length - 1] || 0,
            avg: avg(lagValues),
            p95: p95(lagValues)
        }
    };
}

function notifyIfCooldown(title, desc) {
    const now = Date.now();
    if (now - lastAlertTime > ALERT_COOLDOWN_MS) {
        lastAlertTime = now;
        sendTelegramMessage(`${title}\n${desc}`).catch(e => console.error(e));
    }
}
