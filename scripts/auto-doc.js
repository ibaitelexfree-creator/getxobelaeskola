const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');
const { glob } = require('glob');

// Config
const OUTPUT_FILE = 'ARCHITECTURE.md';
const IGNORE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  '.git/**',
  '.vscode/**',
  'dist/**',
  'build/**',
  '.openclaw/**',
  'coverage/**',
  '**/*.lock',
  '**/*.log',
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.webp',
  '**/*.ico',
  '**/*.svg',
  '**/*.pdf',
  '**/*.mp4',
  '**/*.mp3',
  '**/*.zip',
  '**/*.gz'
];

// Key files to read full content from (context for the LLM)
const KEY_FILES = [
  'package.json',
  'tsconfig.json',
  'next.config.mjs',
  'src/app/layout.tsx',
  'supabase/config.toml',
  'AGENTS.md',
  'README.md',
  'tailwind.config.js',
  'middleware.ts',
  'src/middleware.ts'
];

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY is not defined in .env file.');
    console.log('Please add your API key to use the auto-documenter.');
    process.exit(1);
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log('🔍 Scanning codebase...');

  // 1. Generate File Tree
  let allFiles = [];
  try {
    allFiles = await glob('**/*', {
      ignore: IGNORE_PATTERNS,
      nodir: true,
      dot: true
    });
  } catch (e) {
    console.error("Error scanning files with glob:", e);
    process.exit(1);
  }

  // Sort files for consistency
  allFiles.sort();

  const fileTree = allFiles.join('\n');
  console.log(`📂 Found ${allFiles.length} files.`);

  // 2. Read Key Files
  let keyFileContents = '';
  for (const file of KEY_FILES) {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        // Truncate if too large to save tokens (limit to ~300 lines or 10k chars)
        const truncated = content.length > 10000 ? content.substring(0, 10000) + '\n...[TRUNCATED]' : content;
        keyFileContents += `\n--- START OF FILE: ${file} ---\n${truncated}\n--- END OF FILE: ${file} ---\n`;
      } catch (err) {
        console.warn(`⚠️ Could not read ${file}: ${err.message}`);
      }
    }
  }

  // 3. Read Existing Architecture Doc
  let existingDoc = '';
  if (fs.existsSync(OUTPUT_FILE)) {
    existingDoc = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    console.log(`📄 Found existing ${OUTPUT_FILE}, reading content...`);
  } else {
    console.log(`📄 No existing ${OUTPUT_FILE}, creating new...`);
  }

  // 4. Construct Prompt
  const systemPrompt = `You are a Senior Software Architect. Your goal is to maintain the ARCHITECTURE.md file for this project.

  The user will provide:
  1. A list of all files in the project (File Tree).
  2. The content of key configuration and source files.
  3. The current content of ARCHITECTURE.md (if any).

  Your task:
  - Analyze the project structure and stack based on the file tree and contents.
  - Update or Create the ARCHITECTURE.md file.
  - Keep the documentation concise but comprehensive.
  - Section headers should typically include:
    - Overview
    - Tech Stack
    - Directory Structure (Key folders explanation)
    - Key Components
    - Data Flow / Architecture Patterns
    - Deployment & CI/CD
  - IF an existing ARCHITECTURE.md is provided, RESPECT its structure and only update sections that are outdated, add missing information, or fix errors. Do not rewrite existing valid documentation unnecessarily.
  - Identify interesting patterns (e.g., Supabase integration, Next.js App Router, Capacitor for mobile).
  - Output ONLY the Markdown content for the file. Do not include "Here is the file" chatter.`;

  const userPrompt = `
  # Project File Tree:
  ${fileTree}

  # Key File Contents:
  ${keyFileContents}

  # Current ARCHITECTURE.md:
  ${existingDoc || "(File does not exist yet)"}

  Please generate the updated ARCHITECTURE.md content.
  `;

  console.log('🤖 Sending request to OpenAI...');

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    let newContent = completion.choices[0].message.content;

    // Clean up markdown code blocks if the LLM wraps the output
    if (newContent.startsWith('```markdown')) {
        newContent = newContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    } else if (newContent.startsWith('```')) {
        newContent = newContent.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    fs.writeFileSync(OUTPUT_FILE, newContent);
    console.log(`✅ Successfully updated ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('❌ Error generating documentation:', error.message);
    if (error.status === 401) {
        console.error('Please check your OPENAI_API_KEY.');
    }
    process.exit(1);
  }
}

main();
