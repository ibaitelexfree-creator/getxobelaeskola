const fs = require('fs');
const path = require('path');

async function main() {
    console.log('Starting CI Self-Healing Process...');

    // Read environment variables
    const repo = process.env.GITHUB_REPOSITORY;
    const branch = process.env.GITHUB_REF_NAME;
    const workflow = process.env.GITHUB_WORKFLOW;
    const runNumber = process.env.GITHUB_RUN_NUMBER;

    if (!repo || !branch) {
        console.error('Missing required environment variables (GITHUB_REPOSITORY, GITHUB_REF_NAME).');
        process.exit(1);
    }

    // Read log files
    let logContent = '';
    const logFiles = ['oxlint.log', 'biome.log'];

    for (const logFile of logFiles) {
        const filePath = path.join(process.cwd(), logFile);
        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.trim()) {
                    logContent += `\n--- ${logFile} ---\n${content}\n`;
                }
            } catch (err) {
                console.warn(`Failed to read log file ${logFile}: ${err.message}`);
            }
        }
    }

    if (!logContent) {
        console.log('No failure logs found to report.');
        return;
    }

    // Truncate logs if too large
    if (logContent.length > 8000) {
        logContent = logContent.substring(0, 8000) + '\n...[Logs Truncated]...';
    }

    // Construct prompt
    const prompt = `CI Verification Failed in ${repo} on branch ${branch} (Workflow: ${workflow} #${runNumber}).\n\nErrors:\n${logContent}\n\nPlease analyze the errors and fix the issues in the codebase.`;

    // Construct payload
    const payload = {
        tool: 'jules_create_session',
        parameters: {
            prompt: prompt,
            source: `sources/github/${repo}`,
            title: `Fix CI Failure: ${workflow} #${runNumber}`,
            branch: branch,
            automationMode: 'AUTO_CREATE_PR',
            requirePlanApproval: false
        }
    };

    console.log('Sending report to AI Orchestrator...');
    console.log(`Endpoint: https://agent.scarmonit.com/mcp/execute`);
    console.log(`Payload Summary: Tool=${payload.tool}, Source=${payload.parameters.source}, Branch=${payload.parameters.branch}`);

    try {
        const response = await fetch('https://agent.scarmonit.com/mcp/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to report failure. Status: ${response.status} ${response.statusText}`);
            console.error(`Response: ${errorText}`);
        } else {
            const data = await response.json();
            console.log('Successfully reported failure to AI Orchestrator.');
            console.log('Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Network error reporting failure:', error.message);
    }
}

main().catch(err => {
    console.error('Unhandled error in self-healing script:', err);
    // Do not exit with error code to avoid failing the CI job again
});
