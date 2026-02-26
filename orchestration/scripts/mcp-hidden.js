import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MCP Hidden Launcher for Windows
 * 
 * Runs an MCP server command without showing a CMD window.
 * Usage: node mcp-hidden.js <command> [args...]
 */

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: node mcp-hidden.js <command> [args...]');
        process.exit(1);
    }

    const command = args[0];
    const cmdArgs = args.slice(1);

    // On Windows, npx is often the culprit. If command is 'npx', we use 'npx.cmd'
    const actualCommand = (command === 'npx' && process.platform === 'win32') ? 'npx.cmd' : command;

    const child = spawn(actualCommand, cmdArgs, {
        stdio: 'inherit', // Important for MCP protocol
        windowsHide: true,
        shell: true
    });

    child.on('exit', (code) => {
        process.exit(code || 0);
    });

    child.on('error', (err) => {
        console.error('Failed to start child process:', err);
        process.exit(1);
    });

    // Handle signals
    process.on('SIGTERM', () => child.kill());
    process.on('SIGINT', () => child.kill());
}

main().catch(console.error);
