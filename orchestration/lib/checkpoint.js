import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'v3_orchestration.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    plan_json TEXT,
    architect_response_raw TEXT,
    status TEXT NOT NULL,
    error_message TEXT,
    execution_time_ms INTEGER,
    
    -- Campos Fase 3: BUILDER
    build_artifacts_path TEXT,
    build_execution_time_ms INTEGER,
    build_error_message TEXT,
    plan_hash TEXT,
    
    -- Campos Fase 4: AUDITOR
    audit_score INTEGER,
    audit_feedback TEXT,
    audit_execution_time_ms INTEGER,
    tamper_detected BOOLEAN DEFAULT 0,
    
    -- Campos Fase 5: POLICY Y EJECUCIÓN
    execution_authorized_at DATETIME,
    execution_policy_version TEXT,
    execution_signature_hash TEXT,
    
    created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%f', 'NOW')),
    updated_at DATETIME DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%f', 'NOW')),
    
    -- Replay tracking
    replay_count INTEGER DEFAULT 0,
    last_replay_at DATETIME
  );
  
  CREATE INDEX IF NOT EXISTS idx_missions_status ON missions (status);
  CREATE INDEX IF NOT EXISTS idx_missions_plan_hash ON missions (plan_hash);

  CREATE TABLE IF NOT EXISTS semantic_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT,
    event_type TEXT, -- SEMANTIC_FAIL, BLOCK, HUMAN_REVIEW, AMBIGUITY_DETECTED
    details TEXT,
    created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%f', 'NOW'))
  );
  CREATE INDEX IF NOT EXISTS idx_semantic_type ON semantic_logs (event_type);
`);

try {
  db.exec('ALTER TABLE missions ADD COLUMN tamper_detected BOOLEAN DEFAULT 0;');
} catch (e) { }

try {
  db.exec(`
    ALTER TABLE missions ADD COLUMN replay_count INTEGER DEFAULT 0;
    ALTER TABLE missions ADD COLUMN last_replay_at DATETIME;
  `);
} catch (e) { }


export const missions = {
  create: db.transaction((id, prompt) => {
    const stmt = db.prepare('INSERT INTO missions (id, prompt, status) VALUES (?, ?, ?)');
    return stmt.run(id, prompt, 'INIT');
  }),

  updateArchitectResult: db.transaction((id, status, data = {}) => {
    const { planJson = null, rawResponse = null, errorMessage = null, executionTime = null, planHash = null } = data;
    const stmt = db.prepare(`
      UPDATE missions 
      SET status = ?, plan_json = ?, architect_response_raw = ?, error_message = ?, execution_time_ms = ?, plan_hash = ?, updated_at = (STRFTIME('%Y-%m-%dT%H:%M:%f', 'NOW'))
      WHERE id = ?
    `);
    return stmt.run(status, planJson ? JSON.stringify(planJson) : null, rawResponse ? JSON.stringify(rawResponse) : null, errorMessage, executionTime, planHash, id);
  }),

  updateBuilderResult: db.transaction((id, status, data = {}) => {
    const { artifactsPath = null, executionTime = null, errorMessage = null } = data;
    const stmt = db.prepare(`
      UPDATE missions 
      SET status = ?, build_artifacts_path = ?, build_execution_time_ms = ?, build_error_message = ?, updated_at = (STRFTIME('%Y-%m-%dT%H:%M:%f', 'NOW'))
      WHERE id = ?
    `);
    return stmt.run(status, artifactsPath, executionTime, errorMessage, id);
  }),

  updateAuditResult: db.transaction((id, status, data = {}) => {
    const { score = null, feedback = null, executionTime = null, tamperDetected = false } = data;
    const stmt = db.prepare(`
      UPDATE missions 
      SET status = ?, audit_score = ?, audit_feedback = ?, audit_execution_time_ms = ?, tamper_detected = ?, updated_at = (STRFTIME('%Y-%m-%dT%H:%M:%f', 'NOW'))
      WHERE id = ?
    `);
    return stmt.run(status, score, feedback ? JSON.stringify(feedback) : null, executionTime, tamperDetected ? 1 : 0, id);
  }),

  authorizeExecution: db.transaction((id, status, data = {}) => {
    const { authorizedAt, policyVersion, signatureHash } = data;
    const stmt = db.prepare(`
      UPDATE missions 
      SET status = ?, execution_authorized_at = ?, execution_policy_version = ?, execution_signature_hash = ?, updated_at = (STRFTIME('%Y-%m-%dT%H:%M:%f', 'NOW'))
      WHERE id = ?
    `);
    return stmt.run(status, authorizedAt, policyVersion, signatureHash, id);
  }),

  updateStatus: db.transaction((id, status) => {
    const stmt = db.prepare(`UPDATE missions SET status = ?, updated_at = (STRFTIME('%Y-%m-%dT%H:%M:%f', 'NOW')) WHERE id = ?`);
    return stmt.run(status, id);
  }),

  recordReplay: db.transaction((id) => {
    const stmt = db.prepare(`
      UPDATE missions 
      SET replay_count = replay_count + 1, 
          last_replay_at = (STRFTIME('%Y-%m-%dT%H:%M:%f', 'NOW')),
          updated_at = (STRFTIME('%Y-%m-%dT%H:%M:%f', 'NOW')) 
      WHERE id = ?
    `);
    return stmt.run(id);
  }),


  get: (id) => db.prepare('SELECT * FROM missions WHERE id = ?').get(id),

  getByHash: (hash) => db.prepare("SELECT * FROM missions WHERE plan_hash = ? AND status = 'READY_FOR_EXECUTION'").get(hash),

  listByStatus: (status) => db.prepare('SELECT * FROM missions WHERE status = ? ORDER BY created_at DESC').all(status),

  logSemantic: db.transaction((jobId, eventType, details = null) => {
    const stmt = db.prepare('INSERT INTO semantic_logs (job_id, event_type, details) VALUES (?, ?, ?)');
    return stmt.run(jobId, eventType, details ? JSON.stringify(details) : null);
  }),

  getTelemetryMetrics: () => {
    // 1️⃣ Scores in last 24h
    const scoreStats = db.prepare(`
        SELECT 
            AVG(audit_score) as avg24h,
            COUNT(*) as total_scored
        FROM missions 
        WHERE audit_score IS NOT NULL 
        AND created_at >= datetime('now', '-24 hours')
    `).get();

    // 2️⃣ Moving Average 20
    const ma20Rows = db.prepare(`
        SELECT audit_score 
        FROM missions 
        WHERE audit_score IS NOT NULL 
        ORDER BY created_at DESC 
        LIMIT 20
    `).all();
    const ma20 = ma20Rows.length ? ma20Rows.reduce((acc, row) => acc + row.audit_score, 0) / ma20Rows.length : 0;

    // 3️⃣ Tamper events 24h
    const tamperStats = db.prepare(`
        SELECT COUNT(*) as tamper_count
        FROM missions
        WHERE tamper_detected = 1
        AND created_at >= datetime('now', '-24 hours')
    `).get();

    // 4️⃣ Job counts 24h
    const jobStatsRows = db.prepare(`
        SELECT status, COUNT(*) as count
        FROM missions
        WHERE created_at >= datetime('now', '-24 hours')
        GROUP BY status
    `).all();

    const jobCounts = {
      total_24h: 0,
      audit_failed: 0,
      gateway_degraded: 0,
      execution_triggered: 0,
      ready_for_execution: 0
    };

    jobStatsRows.forEach(row => {
      jobCounts.total_24h += row.count;
      if (row.status === 'AUDIT_FAILED') jobCounts.audit_failed = row.count;
      if (row.status === 'GATEWAY_DEGRADED') jobCounts.gateway_degraded = row.count;
      if (row.status === 'EXECUTION_TRIGGERED') jobCounts.execution_triggered = row.count;
      if (row.status === 'READY_FOR_EXECUTION') jobCounts.ready_for_execution = row.count;
    });

    return {
      avg24h: scoreStats.avg24h || 0,
      ma20,
      ma20Scores: ma20Rows.map(r => r.audit_score), // For StdDev calculation
      tamper24h: tamperStats.tamper_count || 0,
      jobCounts,
      replays24h: db.prepare("SELECT SUM(replay_count) as total FROM missions WHERE created_at >= datetime('now', '-24 hours')").get().total || 0,
      semanticStats: db.prepare(`
          SELECT event_type, COUNT(*) as count 
          FROM semantic_logs 
          WHERE created_at >= datetime('now', '-24 hours') 
          GROUP BY event_type
      `).all()
    };
  }
};
