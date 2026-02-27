import db from './src/lib/db-client.js';
import dotenv from 'dotenv';
dotenv.config();

async function findCandidate() {
    try {
        console.log("Searching for replay candidate...");
        const res = await db.query(`
            SELECT swarm_id, role, vote, category, vote_reason, rca, created_at 
            FROM sw2_rate_limits 
            WHERE vote = 'FAIL' 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        if (res.rows.length === 0 || res.rows[0].command === 'MOCK') {
            console.log("No real history in DB (using Mock or Empty). Selecting a deliberate test case.");
            // Si no hay candidatos reales en DB (debido a la resiliencia/mock), 
            // crearemos uno para el replay inaugural si es necesario, 
            // pero primero intentemos ver si hay algo.
            console.log(JSON.stringify(res.rows, null, 2));
            return;
        }

        console.log("REPLAY CANDIDATES FOUND:");
        console.table(res.rows.map(r => ({
            swarm_id: r.swarm_id,
            role: r.role,
            category: r.category,
            reason: (r.vote_reason || '').substring(0, 50) + '...',
            has_rca: !!r.rca
        })));

    } catch (err) {
        console.error("Error finding candidate:", err.message);
    } finally {
        process.exit(0);
    }
}

findCandidate();
