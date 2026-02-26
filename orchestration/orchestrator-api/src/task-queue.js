import crypto from 'crypto';

/**
 * Task Queue - PostgreSQL-backed persistent task management
 * Stores swarm proposals and decomposed tasks with dependency tracking.
 */

// ─── Schema Migration ───

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS swarm_proposals (
  id VARCHAR(8) PRIMARY KEY,
  telegram_chat_id VARCHAR(50),
  original_prompt TEXT NOT NULL,
  max_jules INT DEFAULT 9,
  ai_analysis JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS swarm_tasks (
  id SERIAL PRIMARY KEY,
  swarm_id VARCHAR(8) NOT NULL REFERENCES swarm_proposals(id),
  task_id VARCHAR(50) NOT NULL,
  phase_order INT NOT NULL,
  role VARCHAR(50) NOT NULL,
  account_email VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  depends_on TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending',
  jules_session_id TEXT,
  pr_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  result JSONB,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  UNIQUE(swarm_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_swarm_tasks_swarm ON swarm_tasks(swarm_id);
CREATE INDEX IF NOT EXISTS idx_swarm_tasks_status ON swarm_tasks(status);
`;

/**
 * Initialize the task queue schema
 * @param {import('pg').Pool} db - PostgreSQL connection pool
 */
export async function initializeSchema(db) {
    if (!db) {
        console.warn('[TaskQueue] No database configured, queue will be in-memory only');
        return false;
    }

    try {
        await db.query(MIGRATION_SQL);
        console.log('[TaskQueue] Schema initialized');
        return true;
    } catch (e) {
        console.error('[TaskQueue] Schema migration failed:', e.message);
        return false;
    }
}

// ─── In-Memory Fallback ───
// Used when PostgreSQL is not available (local dev)

const memProposals = new Map();
const memTasks = new Map();

// ─── Proposal Operations ───

function generateShortId() {
    return crypto.randomBytes(4).toString('hex').slice(0, 6);
}

/**
 * Create a new swarm proposal
 */
export async function createProposal(db, { chatId, prompt, maxJules, analysis }) {
    const id = generateShortId();

    if (db) {
        await db.query(
            `INSERT INTO swarm_proposals (id, telegram_chat_id, original_prompt, max_jules, ai_analysis)
       VALUES ($1, $2, $3, $4, $5)`,
            [id, String(chatId), prompt, maxJules, JSON.stringify(analysis)]
        );
    } else {
        memProposals.set(id, { id, chatId, prompt, maxJules, analysis, status: 'pending', createdAt: new Date() });
    }

    return id;
}

/**
 * Approve a proposal and enqueue its tasks
 */
export async function approveProposal(db, proposalId) {
    let proposal;

    if (db) {
        const res = await db.query('UPDATE swarm_proposals SET status = $1, approved_at = NOW() WHERE id = $2 AND status = $3 RETURNING *',
            ['approved', proposalId, 'pending']);
        proposal = res.rows[0];
    } else {
        proposal = memProposals.get(proposalId);
        if (proposal && proposal.status === 'pending') {
            proposal.status = 'approved';
            proposal.approvedAt = new Date();
        }
    }

    if (!proposal) return null;

    // Parse analysis
    const rawAnalysis = proposal.ai_analysis || proposal.analysis;
    const analysis = typeof rawAnalysis === 'string'
        ? JSON.parse(rawAnalysis)
        : rawAnalysis;

    // Enqueue all tasks
    await enqueueTasks(db, proposalId, analysis.phases);

    return { proposal, taskCount: analysis.phases.reduce((sum, p) => sum + p.tasks.length, 0) };
}

/**
 * Cancel a proposal
 */
export async function cancelProposal(db, proposalId) {
    if (db) {
        const res = await db.query('UPDATE swarm_proposals SET status = $1 WHERE id = $2 AND status = $3 RETURNING *',
            ['cancelled', proposalId, 'pending']);
        return res.rows[0] || null;
    } else {
        const p = memProposals.get(proposalId);
        if (p && p.status === 'pending') { p.status = 'cancelled'; return p; }
        return null;
    }
}

/**
 * Get proposal by ID
 */
export async function getProposal(db, proposalId) {
    if (db) {
        const res = await db.query('SELECT * FROM swarm_proposals WHERE id = $1', [proposalId]);
        return res.rows[0] || null;
    }
    return memProposals.get(proposalId) || null;
}

// ─── Task Operations ───

/**
 * Enqueue tasks from phases into the queue
 */
async function enqueueTasks(db, swarmId, phases) {
    for (const phase of phases) {
        for (const task of phase.tasks) {
            if (db) {
                await db.query(
                    `INSERT INTO swarm_tasks (swarm_id, task_id, phase_order, role, account_email, title, prompt, depends_on)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (swarm_id, task_id) DO NOTHING`,
                    [swarmId, task.id, phase.order, phase.role, phase.account, task.title, task.prompt, task.depends_on || []]
                );
            } else {
                const key = `${swarmId}:${task.id}`;
                memTasks.set(key, {
                    swarmId, taskId: task.id, phaseOrder: phase.order,
                    role: phase.role, accountEmail: phase.account,
                    title: task.title, prompt: task.prompt,
                    dependsOn: task.depends_on || [],
                    status: 'pending', createdAt: new Date()
                });
            }
        }
    }
}

/**
 * Get tasks ready to execute (dependencies completed)
 */
export async function getReadyTasks(db, swarmId) {
    if (db) {
        const res = await db.query(`
      SELECT t.* FROM swarm_tasks t
      WHERE t.swarm_id = $1
        AND t.status = 'pending'
        AND NOT EXISTS (
          SELECT 1 FROM unnest(t.depends_on) AS dep
          WHERE dep NOT IN (
            SELECT task_id FROM swarm_tasks
            WHERE swarm_id = $1 AND status = 'completed'
          )
        )
      ORDER BY t.phase_order, t.id
    `, [swarmId]);
        return res.rows;
    }

    // In-memory fallback
    const completed = new Set();
    for (const [, t] of memTasks) {
        if (t.swarmId === swarmId && t.status === 'completed') completed.add(t.taskId);
    }
    return [...memTasks.values()]
        .filter(t => t.swarmId === swarmId && t.status === 'pending' &&
            t.dependsOn.every(d => completed.has(d)))
        .sort((a, b) => a.phaseOrder - b.phaseOrder);
}

/**
 * Update task status
 */
export async function updateTaskStatus(db, swarmId, taskId, status, extra = {}) {
    const { julesSessionId, prUrl, result, errorMessage } = extra;

    if (db) {
        const setClauses = ['status = $3'];
        const params = [swarmId, taskId, status];
        let idx = 4;

        if (status === 'running') {
            setClauses.push(`started_at = NOW()`);
        }
        if (status === 'completed' || status === 'failed') {
            setClauses.push(`completed_at = NOW()`);
        }
        if (julesSessionId) { setClauses.push(`jules_session_id = $${idx}`); params.push(julesSessionId); idx++; }
        if (prUrl) { setClauses.push(`pr_url = $${idx}`); params.push(prUrl); idx++; }
        if (result) { setClauses.push(`result = $${idx}`); params.push(JSON.stringify(result)); idx++; }
        if (errorMessage) { setClauses.push(`error_message = $${idx}`); params.push(errorMessage); idx++; }
        if (status === 'failed') { setClauses.push(`retry_count = retry_count + 1`); }

        await db.query(
            `UPDATE swarm_tasks SET ${setClauses.join(', ')} WHERE swarm_id = $1 AND task_id = $2`,
            params
        );
    } else {
        const key = `${swarmId}:${taskId}`;
        const t = memTasks.get(key);
        if (t) {
            t.status = status;
            if (julesSessionId) t.julesSessionId = julesSessionId;
            if (prUrl) t.prUrl = prUrl;
            if (result) t.result = result;
            if (errorMessage) t.errorMessage = errorMessage;
            if (status === 'running') t.startedAt = new Date();
            if (status === 'completed' || status === 'failed') t.completedAt = new Date();
        }
    }
}

/**
 * Get swarm progress summary
 */
export async function getSwarmProgress(db, swarmId) {
    if (db) {
        const res = await db.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
        COUNT(*) FILTER (WHERE status = 'running')::int AS running,
        COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending
      FROM swarm_tasks WHERE swarm_id = $1
    `, [swarmId]);
        return res.rows[0];
    }

    const tasks = [...memTasks.values()].filter(t => t.swarmId === swarmId);
    return {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        running: tasks.filter(t => t.status === 'running').length,
        failed: tasks.filter(t => t.status === 'failed').length,
        pending: tasks.filter(t => t.status === 'pending').length
    };
}

/**
 * Get all tasks for a swarm, grouped by phase
 */
export async function getSwarmTasks(db, swarmId) {
    if (db) {
        const res = await db.query(
            'SELECT * FROM swarm_tasks WHERE swarm_id = $1 ORDER BY phase_order, id', [swarmId]);
        return res.rows;
    }
    return [...memTasks.values()]
        .filter(t => t.swarmId === swarmId)
        .sort((a, b) => a.phaseOrder - b.phaseOrder);
}
