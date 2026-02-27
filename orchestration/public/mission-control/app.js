/**
 * MISSION CONTROL - CORE LOGIC
 * Polling, State Management and UI Updates
 */

const POLL_INTERVAL = 3000;
let lastStatus = null;

async function fetchTelemetry() {
    try {
        const response = await fetch('/api/telemetry');
        if (!response.ok) throw new Error('Telemetry request failed');
        const data = await response.json();
        updateSystemUI(data);
    } catch (err) {
        console.error('Telemetry Error:', err);
        setOfflineState();
    }
}

async function fetchJobs() {
    try {
        const filter = document.getElementById('status-filter').value;
        const url = filter ? `/jobs?status=${filter}` : '/jobs';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Jobs request failed');
        const data = await response.json();
        updateJobsTable(data.jobs);
    } catch (err) {
        console.error('Jobs Error:', err);
    }
}

function updateSystemUI(data) {
    const { system, auditor, jobs, runtime, finance, semantic } = data;

    // 1. Header Status
    const indicator = document.getElementById('main-status-indicator');
    const statusText = document.getElementById('gateway-status-text');

    statusText.innerText = system.gateway_status;
    indicator.className = 'status-indicator';

    if (system.gateway_status === 'HEALTHY') {
        indicator.style.backgroundColor = 'var(--accent-success)';
        indicator.style.boxShadow = '0 0 10px var(--accent-success)';
    } else if (system.gateway_status === 'DEGRADING') {
        indicator.style.backgroundColor = 'var(--accent-warning)';
        indicator.style.boxShadow = '0 0 10px var(--accent-warning)';
        indicator.classList.add('pulse');
    } else {
        indicator.style.backgroundColor = 'var(--accent-danger)';
        indicator.style.boxShadow = '0 0 10px var(--accent-danger)';
        indicator.classList.add('pulse');
    }

    // 2. KPI Cards
    document.getElementById('kpi-gateway-failures').innerText = system.consecutive_failures;
    document.getElementById('kpi-canary-count').innerText = `Canary: ${system.canary_execution_count}`;

    document.getElementById('kpi-avg-score').innerText = auditor.average_score_24h;
    const killswitchVal = document.getElementById('kpi-killswitch-status');
    killswitchVal.innerText = system.kill_switch_active ? 'ACTIVE' : 'OFF';
    killswitchVal.className = system.kill_switch_active ? 'kpi-value status-danger' : 'kpi-value status-success';

    // Auditor
    document.getElementById('kpi-avg-score').innerText = auditor.average_score_24h;
    document.getElementById('kpi-drift').innerText = `${auditor.drift_percent}%`;
    document.getElementById('drift-progress').style.width = `${Math.min(auditor.drift_percent, 100)}%`;

    // Finance
    const dailyCost = Number(finance.daily_cost_usd) || 0;
    const totalCost = Number(finance.total_cost_usd) || 0;
    const projection = Number(finance.projected_monthly_usd) || 0;
    const dailyTokens = Number(finance.daily_tokens) || 0;
    const tpm = Number(finance.tpm) || 0;

    document.getElementById('kpi-daily-cost').innerText = dailyCost.toFixed(4);
    document.getElementById('kpi-daily-tokens').innerText = dailyTokens.toLocaleString();
    document.getElementById('kpi-total-cost').innerText = totalCost.toFixed(4);
    document.getElementById('kpi-projection').innerText = projection.toFixed(2);
    document.getElementById('kpi-tpm').innerText = Math.round(tpm);

    // Update Top Expensive Missions Table
    const expensiveTbody = document.getElementById('expensive-tbody');
    if (expensiveTbody && data.finance.top_expensive) {
        expensiveTbody.innerHTML = '';
        data.finance.top_expensive.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${m.job_id.substring(0, 8)}...</td>
                <td class="money">$${Number(m.cost).toFixed(4)}</td>
                <td>${Number(m.tokens).toLocaleString()}</td>
            `;
            expensiveTbody.appendChild(tr);
        });
    }

    // Runtime
    document.getElementById('kpi-heap').innerText = `${runtime.heap_used_mb} MB`;
    document.getElementById('kpi-lag').innerText = runtime.event_loop_lag_ms;

    // Expansion & Stability
    if (system.ssi) {
        document.getElementById('kpi-ssi-total').innerText = system.ssi.total;
        document.getElementById('kpi-limit-val').innerText = `${system.canary_limit}%`;

        const ssiCard = document.getElementById('card-ssi');
        if (system.ssi.total < 65) ssiCard.style.border = '1px solid var(--accent-danger)';
        else if (system.ssi.total < 75) ssiCard.style.border = '1px solid var(--accent-warning)';
        else ssiCard.style.border = '1px solid var(--accent-success)';
    }

    if (semantic) {
        const fails = semantic.stats.find(s => s.event_type === 'SEMANTIC_FAIL')?.count || 0;
        document.getElementById('kpi-semantic-total').innerText = fails;
    }

    // 3. Distribution Panel
    document.getElementById('dist-audit-failed').innerText = jobs.audit_failed;
    document.getElementById('dist-gateway-degraded').innerText = jobs.gateway_degraded;
    document.getElementById('dist-execution-triggered').innerText = jobs.execution_triggered;
    document.getElementById('dist-ready').innerText = jobs.ready_for_execution;

    document.getElementById('runtime-uptime').innerText = formatUptime(runtime.uptime_seconds);
}

function updateJobsTable(jobsList) {
    const tbody = document.getElementById('jobs-tbody');
    tbody.innerHTML = '';

    if (!jobsList || jobsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-dim)">No hay misiones recientes</td></tr>';
        return;
    }

    jobsList.slice(0, 15).forEach(job => {
        const tr = document.createElement('tr');

        const drift = job.audit_score ? (100 - job.audit_score) : 0;
        const statusClass = getStatusClass(job.status);

        tr.innerHTML = `
            <td title="${job.id}">${job.id.substring(0, 12)}...</td>
            <td><span class="badge ${statusClass}">${job.status}</span></td>
            <td>${job.audit_score || '-'}</td>
            <td class="${drift > 10 ? 'danger' : ''}">${drift}%</td>
            <td>${formatDate(job.updated_at)}</td>
            <td>
                ${job.status === 'READY_FOR_EXECUTION' ? `<button class="btn-action success" onclick="triggerExecution('${job.id}')">Ejecutar</button>` : ''}
                ${['EXECUTION_TRIGGERED', 'GATEWAY_DEGRADED', 'POLICY_REJECTED', 'FINANCE_GUARD_BLOCKED'].includes(job.status) ? `<button class="btn-action info" onclick="triggerReplay('${job.id}')">Replay</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getStatusClass(status) {
    if (status.includes('SUCCESS') || status.includes('TRIGGERED')) return 'badge-triggered';
    if (status.includes('READY')) return 'badge-ready';
    if (status.includes('FAILED') || status.includes('DEGRADED')) return 'badge-degraded';
    return '';
}

function formatDate(isoStr) {
    if (!isoStr) return '-';
    const date = new Date(isoStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
}

function setOfflineState() {
    const indicator = document.getElementById('main-status-indicator');
    if (indicator) indicator.style.backgroundColor = '#444';
    const statusText = document.getElementById('gateway-status-text');
    if (statusText) statusText.innerText = 'OFFLINE';
}

// Actions
async function triggerExecution(jobId) {
    if (!confirm(`¿Iniciar ejecución de la misión ${jobId.substring(0, 8)}?`)) return;
    try {
        const response = await fetch(`/execute/${jobId}`, { method: 'POST' });
        const data = await response.json();
        if (!response.ok) alert(`Error: ${data.error || 'Desconocido'}`);
        else fetchJobs();
    } catch (err) {
        alert('Error de conexión al ejecutar');
    }
}

async function triggerReplay(jobId) {
    if (!confirm(`¿Solicitar REPLAY de la misión ${jobId.substring(0, 8)}?`)) return;
    try {
        const response = await fetch(`/api/replay/${jobId}`, { method: 'POST' });
        const data = await response.json();
        if (!response.ok) alert(`Error: ${data.error || 'Desconocido'}`);
        else {
            alert('Replay autorizado. Ahora puedes ejecutar la misión.');
            fetchJobs();
        }
    } catch (err) {
        alert('Error de conexión al solicitar replay');
    }
}

// Initial Call
fetchTelemetry();
fetchJobs();

// Global Polling
setInterval(fetchTelemetry, POLL_INTERVAL);
setInterval(fetchJobs, POLL_INTERVAL);

// Filter change trigger
document.getElementById('status-filter').addEventListener('change', fetchJobs);
