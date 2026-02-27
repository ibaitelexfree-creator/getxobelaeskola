
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('v3_orchestration.sqlite');

// 1. Semantic Fail Containment Ratio
const semanticStats = db.prepare(`
    SELECT event_type, COUNT(*) as count 
    FROM semantic_logs 
    GROUP BY event_type
`).all();

const totalJobs = db.prepare(`SELECT COUNT(*) as count FROM missions`).get().count;
const auditFailures = db.prepare(`SELECT COUNT(*) as count FROM missions WHERE status = 'AUDIT_FAILED'`).get().count;

// 2. Scores/SSI Trend
const recentScores = db.prepare(`
    SELECT audit_score, created_at 
    FROM missions 
    WHERE audit_score IS NOT NULL 
    ORDER BY created_at ASC
`).all();

console.log(JSON.stringify({
    semanticStats,
    totalJobs,
    auditFailures,
    recentScores: recentScores.slice(-50)
}, null, 2));
