const fs = require('fs');

function revertPatch(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  if (content.startsWith("'use client';\n")) {
    content = content.replace("'use client';\n", "");
    fs.writeFileSync(filepath, content);
    console.log(`Reverted ${filepath}`);
  }
}

revertPatch('src/app/[locale]/layout.tsx');
revertPatch('src/app/[locale]/page.tsx');
revertPatch('src/app/[locale]/academy/layout.tsx');
revertPatch('src/app/[locale]/courses/[slug]/page.tsx');
