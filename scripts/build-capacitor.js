const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api');
const targetApiPath = path.join(__dirname, '..', 'src', 'api_temp');

function moveDir(src, dest) {
    if (!fs.existsSync(src)) return false;
    try {
        // Try simple rename first
        fs.renameSync(src, dest);
        return true;
    } catch (e) {
        // Fallback to copy and delete
        console.log(`Rename failed, trying copy: ${e.message}`);
        fs.cpSync(src, dest, { recursive: true });
        fs.rmSync(src, { recursive: true, force: true });
        return true;
    }
}

try {
    // 1. Move API folder out of src/app
    if (moveDir(apiPath, targetApiPath)) {
        console.log('✅ API folder moved to temporary location.');
    }

    // 2. Run the build
    console.log('🚀 Running Next.js build...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully.');

} catch (error) {
    console.error('❌ Build failed:', error.message);
} finally {
    // 3. Restore API folder
    if (moveDir(targetApiPath, apiPath)) {
        console.log('✅ API folder restored to src/app/api.');
    }
}
