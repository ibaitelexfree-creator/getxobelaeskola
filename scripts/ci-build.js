const fs = require('fs');
const { spawn } = require('child_process');

// Ensure NODE_OPTIONS is set for memory
if (!process.env.NODE_OPTIONS) {
    process.env.NODE_OPTIONS = '--max-old-space-size=4096';
} else if (!process.env.NODE_OPTIONS.includes('--max-old-space-size')) {
    process.env.NODE_OPTIONS += ' --max-old-space-size=4096';
}

let createdDummyEnv = false;

// Create dummy .env.local if missing, to prevent build failures during SSG
if (!fs.existsSync('.env.local')) {
    console.log('Creating dummy .env.local for build (to satisfy static generation requirements)...');
    try {
        fs.writeFileSync('.env.local', 'NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:3000\nNEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder\n');
        createdDummyEnv = true;
    } catch (err) {
        console.error('Failed to create dummy .env.local:', err);
    }
}

// Run next build
const build = spawn('npx', ['next', 'build'], {
    stdio: 'inherit',
    env: process.env,
    shell: true
});

build.on('close', (code) => {
    if (createdDummyEnv && fs.existsSync('.env.local')) {
        try {
            fs.unlinkSync('.env.local');
            console.log('Cleaned up dummy .env.local after build.');
        } catch (err) {
            console.error('Failed to clean up dummy .env.local:', err);
        }
    }
    process.exit(code);
});
