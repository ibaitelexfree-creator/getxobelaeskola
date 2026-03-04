const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  if (!content.includes("'use client'") && !content.includes('"use client"')) {
    content = "'use client';\n" + content;
    fs.writeFileSync(filepath, content);
    console.log(`Patched ${filepath}`);
  }
}

patchFile('src/app/[locale]/layout.tsx');
patchFile('src/app/[locale]/page.tsx');
patchFile('src/app/[locale]/academy/layout.tsx');
patchFile('src/app/[locale]/courses/[slug]/page.tsx');
