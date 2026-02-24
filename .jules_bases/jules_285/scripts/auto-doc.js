#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const SOURCE_ROOT = path.join(__dirname, '../src');
const OUTPUT_FILE = path.join(__dirname, '../ARCHITECTURE.md');

// Helper to extract JSDoc comments
function getJSDocComment(node, sourceFile) {
    const fullText = sourceFile.getFullText();
    const comments = ts.getLeadingCommentRanges(fullText, node.pos);

    if (!comments) return '';

    return comments.map(comment => {
        const commentText = fullText.slice(comment.pos, comment.end);
        if (commentText.startsWith('/**')) {
            // Clean up the JSDoc syntax to get just the text
            return commentText
                .replace(/^\/\*\*/, '')
                .replace(/\*\/$/, '')
                .split('\n')
                .map(line => line.replace(/^\s*\*\s?/, '').trim())
                .filter(line => line.length > 0) // Remove empty lines
                .join(' ');
        }
        return '';
    }).filter(Boolean).join('\n');
}

// Helper to determine the type of export
function getExportType(node) {
    if (ts.isFunctionDeclaration(node)) return 'Function';
    if (ts.isClassDeclaration(node)) return 'Class';
    if (ts.isInterfaceDeclaration(node)) return 'Interface';
    if (ts.isTypeAliasDeclaration(node)) return 'Type Alias';
    if (ts.isVariableStatement(node)) return 'Variable';
    if (ts.isEnumDeclaration(node)) return 'Enum';
    return 'Unknown';
}

function parseFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
        filePath,
        fileContent,
        ts.ScriptTarget.Latest,
        true
    );

    const exports = [];

    function visit(node) {
        // Check for "export" keyword modifier
        const isExported = node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        const isDefaultExport = node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.DefaultKeyword);

        if (isExported || isDefaultExport) {
            let name = '';
            let type = getExportType(node);
            let description = getJSDocComment(node, sourceFile);

            if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) {
                name = node.name ? node.name.text : (isDefaultExport ? 'default' : '');
            } else if (ts.isVariableStatement(node)) {
                // Handle "export const x = ..."
                node.declarationList.declarations.forEach(declaration => {
                    const varName = declaration.name.getText(sourceFile);
                    exports.push({
                        name: varName,
                        type: 'Variable',
                        description: description // Attach same JSDoc to all variables in statement
                    });
                });
                return; // Already pushed, skip the general push
            }

            if (name) {
                exports.push({ name, type, description });
            }
        }

        // Handle "export { x } from ..."
        if (ts.isExportDeclaration(node)) {
             if (node.exportClause && ts.isNamedExports(node.exportClause)) {
                 node.exportClause.elements.forEach(element => {
                     exports.push({
                         name: element.name.text,
                         type: 'Re-export',
                         description: `Re-exports ${element.propertyName ? element.propertyName.text : element.name.text}`
                     });
                 });
             }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return exports;
}

function walkDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            walkDir(filePath, fileList);
        } else {
            if (/\.(ts|tsx|js|jsx)$/.test(file) && !file.endsWith('.d.ts') && !file.includes('.test.') && !file.includes('.spec.')) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

function generateMarkdown(fileData) {
    let md = `# Architecture Documentation\n\n`;
    md += `*Auto-generated on ${new Date().toISOString()}*\n\n`;
    md += `This document provides an overview of the project's source code structure and exported modules.\n\n`;

    // Group by directory
    const grouped = {};
    fileData.forEach(file => {
        const relativePath = path.relative(path.join(__dirname, '../'), file.path);
        const dir = path.dirname(relativePath);
        if (!grouped[dir]) grouped[dir] = [];
        grouped[dir].push(file);
    });

    const sortedDirs = Object.keys(grouped).sort();

    sortedDirs.forEach(dir => {
        md += `## Directory: \`${dir}\`\n\n`;

        const files = grouped[dir].sort((a, b) => a.path.localeCompare(b.path));

        files.forEach(file => {
            const fileName = path.basename(file.path);
            if (file.exports.length > 0) {
                md += `### ${fileName}\n\n`;
                md += `| Export Name | Type | Description |\n`;
                md += `| :--- | :--- | :--- |\n`;

                file.exports.forEach(exp => {
                    const desc = exp.description ? exp.description.replace(/\n/g, ' ') : '-';
                    md += `| \`${exp.name}\` | ${exp.type} | ${desc} |\n`;
                });
                md += `\n`;
            }
        });
    });

    return md;
}

async function main() {
    console.log('Starting documentation generation...');
    try {
        const files = walkDir(SOURCE_ROOT);
        console.log(`Found ${files.length} files in ${SOURCE_ROOT}`);

        const fileData = files.map(filePath => {
            try {
                const exports = parseFile(filePath);
                return { path: filePath, exports };
            } catch (err) {
                console.error(`Error parsing ${filePath}:`, err.message);
                return { path: filePath, exports: [] };
            }
        });

        const markdown = generateMarkdown(fileData);
        fs.writeFileSync(OUTPUT_FILE, markdown);
        console.log(`Documentation generated at ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();
