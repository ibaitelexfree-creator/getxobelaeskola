
const fs = require('fs');
const path = require('path');

const logFiles = ['build_errors.log', 'dev.log', 'local_build.log'];

logFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) return;

    try {
        const content = fs.readFileSync(filePath, 'utf16le');
        console.log(`--- Content of ${file} (UTF-16LE) ---`);
        console.log(content.substring(content.length - 2000)); // Show last 2000 chars
    } catch (e) {
        console.error(`Failed to read ${file}:`, e.message);
    }
});
