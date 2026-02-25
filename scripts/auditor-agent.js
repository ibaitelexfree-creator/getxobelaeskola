const { exec } = require('child_process');

/**
 * Runs a command and returns true if it exits with code 0, false otherwise.
 */
const run = (cmd) => new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`[AUDIT] Command failed: ${cmd}`);
            if (stdout) console.error(stdout);
            if (stderr) console.error(stderr);
            resolve(false);
        } else {
            console.log(`[AUDIT] Command passed: ${cmd}`);
            resolve(true);
        }
    });
});

async function audit() {
    console.log("🔍 Auditor Agent starting investigation...");

    // Parallel checks
    const [lintPass, biomePass] = await Promise.all([
        run('oxlint ./src --quiet'),
        run('biome check ./src --diagnostic-level=error')
    ]);

    const verdict = {
        pass: lintPass && biomePass,
        timestamp: new Date().toISOString(),
        auditor: "IA-Tribunal-Agent-001"
    };

    console.log("\n⚖️ VERDICT:");
    console.log(JSON.stringify(verdict, null, 2));

    if (!verdict.pass) {
        process.exit(1);
    }
}

audit();
