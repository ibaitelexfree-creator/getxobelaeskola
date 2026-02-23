
const fs = require('fs');
try {
    const content = fs.readFileSync('dev.log', 'utf16le');
    const lines = content.split('\n');
    console.log("Searching for 500 errors in dev.log...");

    // Find lines with 500 status codes or "error" near course routes
    const results = lines.filter(line =>
        (line.includes(' 500 ') || line.toLowerCase().includes('error')) &&
        (line.includes('/courses/') || line.includes('CourseDetailPage'))
    );

    console.log(`Found ${results.length} relevant lines.`);
    console.log(results.slice(-10).join('\n'));
} catch (e) {
    console.error(e);
}
