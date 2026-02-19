const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'supabase', '.temp');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'project-ref'), 'xbledhifomblirxurtyv');
console.log('Project ref written successfully');
