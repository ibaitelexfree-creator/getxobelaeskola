const { spawn } = require('child_process');
const build = spawn('npx', ['next', 'build'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=8192' }
});
build.on('close', (code) => process.exit(code));
