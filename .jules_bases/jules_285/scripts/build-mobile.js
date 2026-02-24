const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apiPath = path.join(__dirname, '..', 'src', 'app', 'api');
const apiBackupPath = path.join(__dirname, '..', 'src', 'app', '_api');

try {
    console.log('Moving API folder to _api...');
    if (fs.existsSync(apiPath)) {
        fs.renameSync(apiPath, apiBackupPath);
    }

    console.log('Starting Next.js build...');
    execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

    console.log('Build successful! Moving API folder back...');
} catch (error) {
    console.error('Build failed:', error);
} finally {
    if (fs.existsSync(apiBackupPath)) {
        fs.renameSync(apiBackupPath, apiPath);
        console.log('Restored API folder.');
    }
}
