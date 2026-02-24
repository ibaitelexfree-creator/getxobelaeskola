import fs from 'fs';
import { execSync } from 'child_process';
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'orchestration', '.env') });

const { GITHUB_TOKEN } = process.env;
const owner = 'ibaitelexfree-creator';
const repo = 'getxobelaeskola';

if (!GITHUB_TOKEN) {
    console.error('Missing GITHUB_TOKEN');
    process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const BRANCH_NAME = 'mega-test-integration';

async function runMegaMerge() {
    console.log('\n=============================================');
    console.log(`🤖 INITIALIZING MEGA-MERGE ON VPS...`);
    console.log(`Target Branch: ${BRANCH_NAME}`);
    console.log('=============================================\n');

    if (!fs.existsSync('analyzed_prs.json')) {
        console.error('❌ analyzed_prs.json not found. Make sure PRs are analyzed.');
        process.exit(1);
    }
    const prs = JSON.parse(fs.readFileSync('analyzed_prs.json', 'utf8'));

    // 1. Prepare branch
    console.log(`\n[1] Preparing branch: ${BRANCH_NAME}`);
    try {
        execSync(`git fetch --all`, { stdio: 'pipe' });

        // Checkout main and pull latest
        execSync(`git checkout main`, { stdio: 'pipe' });
        execSync(`git pull origin main`, { stdio: 'pipe' });

        // Delete the branch locally and remotely if it exists, to start fresh
        try { execSync(`git branch -D ${BRANCH_NAME}`, { stdio: 'pipe' }); } catch (e) { }
        try { execSync(`git push origin --delete ${BRANCH_NAME}`, { stdio: 'pipe' }); } catch (e) { }

        // Create new branch from main
        execSync(`git checkout -b ${BRANCH_NAME}`, { stdio: 'pipe' });
        execSync(`git push -u origin ${BRANCH_NAME}`, { stdio: 'pipe' });

        console.log(`✅ Branch ${BRANCH_NAME} ready and synced.`);
    } catch (e) {
        console.error('❌ Failed to prepare branch:', e.message);
        process.exit(1);
    }

    // 2. Merge all PRs into the mega branch locally
    console.log(`\n[2] Attempting to merge ${prs.length} PRs into ${BRANCH_NAME}...`);
    const successfulMerges = [];
    const conflictPrs = [];

    for (const pr of prs) {
        console.log(`➡️  Merging PR #${pr.number}: ${pr.title} (Branch: ${pr.branch})`);
        try {
            // Fetch the specific branch
            execSync(`git fetch origin ${pr.branch}`, { stdio: 'pipe' });
            // Attempt to merge using standard strategy without fast-forward
            execSync(`git merge --no-ff origin/${pr.branch} -m "Merge PR #${pr.number}"`, { stdio: 'pipe' });
            successfulMerges.push(pr.number);
            console.log(`   ✅ Success`);
        } catch (e) {
            console.warn(`   ⚠️ Conflict detected for PR #${pr.number}. Aborting this specific merge to keep tree clean.`);
            execSync(`git merge --abort`, { stdio: 'pipe' });
            conflictPrs.push(pr.number);
        }
    }

    console.log(`\n=============================================`);
    console.log(`🏁 MEGA-MERGE COMPLETED:`);
    console.log(`✅ Merged PRs (${successfulMerges.length}): ${successfulMerges.join(', ')}`);
    console.log(`⚠️ Conflicted PRs skipped (${conflictPrs.length}): ${conflictPrs.length > 0 ? conflictPrs.join(', ') : 'None'}`);
    console.log(`=============================================\n`);

    // push the result before verification
    try {
        execSync(`git push origin ${BRANCH_NAME}`, { stdio: 'pipe' });
        console.log(`✅ Successfully pushed ${BRANCH_NAME} to remote.`);
    } catch (e) {
        console.error('❌ Failed to push the mega branch:', e.message);
    }

    // 3. VPS Local Build & test verification
    console.log(`\n[3] Triggering full test and build verification on VPS...`);
    let verificationFailed = false;
    let errorOutput = '';

    try {
        console.log('Running: npm run build');
        execSync('npm run build', { stdio: 'pipe' });
        console.log('✅ Build successful.');

        console.log('Running: npm test');
        execSync('npm test', { stdio: 'pipe' });
        console.log('✅ Tests successful.');
    } catch (e) {
        verificationFailed = true;

        if (e.stdout || e.stderr) {
            errorOutput = (e.stdout ? e.stdout.toString() : '') + '\n' + (e.stderr ? e.stderr.toString() : '');
        } else {
            errorOutput = e.message;
        }
        console.error('❌ MEGA-MERGE BUILD/TEST FAILED!\n');
    }

    // 4. Fallback to Jules to fix the entire MEGA BRANCH
    if (verificationFailed) {
        console.log(`🤖 Dispatching Jules to fix build/test errors on ${BRANCH_NAME}...`);

        const fetch = (await import('node-fetch')).default || globalThis.fetch;
        try {
            const response = await fetch('http://127.0.0.1:3323/mcp/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'jules_create_session',
                    parameters: {
                        prompt: `We created an integration branch called '${BRANCH_NAME}' merging many PRs together.
However, it fails to build/test on our VPS with the following errors:

<error_logs>
${errorOutput.slice(-3000)}
</error_logs>

Please checkout the '${BRANCH_NAME}' branch, thoroughly fix those breaking build/test errors locally, ensure \`npm run build\` and \`npm test\` both pass, and then commit and force push directly to '${BRANCH_NAME}'.`,
                        source: 'sources/github/ibaitelexfree-creator/getxobelaeskola',
                        title: `🛠️ Mega-Merge Fix for ${BRANCH_NAME}`,
                        automationMode: 'AUTO_CREATE_PR'
                    }
                })
            });
            const responseData = await response.text();
            if (response.ok) {
                console.log(`✅ Jules Global Build-Fix sequence initiated properly.`);
                console.log(`Monitor the dashboard for Jules agent progress on branch ${BRANCH_NAME}.`);
            } else {
                console.error(`❌ Jules Auto-Heal spawn failed: HTTP ${response.status} - ${responseData}`);
            }
        } catch (fetchErr) {
            console.error('❌ Failed to spawn Jules:', fetchErr.message);
            console.log('Ensure the Orchestrator (npm start) is running on port 3323.');
        }
    } else if (conflictPrs.length > 0) {
        // If it built successfully, but we skipped conflicts, tell Jules to individually fix the skipped PRs against the mega-branch
        console.log(`\n[4] Build passed, but we have ${conflictPrs.length} conflicted branches.`);
        console.log(`Dispatching Jules to individually merge them...`);
        // We could spawn multiple sessions here, but let's do a summary session
    }
}

runMegaMerge().catch(err => {
    console.error('Fatal execution error:', err);
});
