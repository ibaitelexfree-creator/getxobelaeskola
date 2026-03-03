const fs = require('fs');

function removeSsrFalse(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  content = content.replace(/,\s*\{\s*ssr:\s*false\s*\}/g, "");
  fs.writeFileSync(filepath, content);
  console.log(`Patched ${filepath}`);
}

removeSsrFalse('src/app/[locale]/layout.tsx');
removeSsrFalse('src/app/[locale]/page.tsx');
removeSsrFalse('src/app/[locale]/courses/[slug]/page.tsx');
