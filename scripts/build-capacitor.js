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

let exitCode = 0;

try {
    // 1. Move API folder out of src/app
    if (moveDir(apiPath, targetApiPath)) {
        console.log('✅ API folder moved to temporary location.');
    }

    // 2. Run the build for Capacitor
    console.log('🚀 Running Next.js build for Capacitor...');
    const env = { ...process.env, IS_CAPACITOR: 'true' };
    execSync('next build', { stdio: 'inherit', env });
    console.log('✅ Build completed successfully.');

    // 2.5 Create root index.html for Capacitor entry point (with redirect to default locale)
    console.log('📄 Creating root index.html for localized export...');
    const outDir = path.join(__dirname, '..', 'out');
    const indexHtmlPath = path.join(outDir, 'index.html');

    const indexContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0;url=./es/index.html" />
    <title>Redirecting...</title>
    <script>
      window.location.href = "./es/index.html";
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="./es/index.html">Spanish version</a>...</p>
  </body>
</html>`;

    if (fs.existsSync(outDir)) {
        fs.writeFileSync(indexHtmlPath, indexContent);
        console.log('✅ Created root index.html with redirect to /es/');
    } else {
        console.warn('⚠️ out directory not found, skipping index.html creation');
    }

} catch (error) {
    console.error('❌ Build failed:', error);
    exitCode = 1;
} finally {
    // 3. Restore API folder
    if (moveDir(targetApiPath, apiPath)) {
        console.log('✅ API folder restored to src/app/api.');
    }
    if (exitCode !== 0) {
        process.exit(exitCode);
    }
}
