const fs = require('fs');
const path = require('path');

const COURSE_SLUG = 'iniciacion-vela-ligera';
const OUTPUT_FILE = path.join(__dirname, '../supabase/seeds/003_preguntas_curso1.sql');

// Map Unit "Title" or "Unit Number" to Slug
const UNIT_MAP = {
    1: 'seguridad-en-el-mar',
    2: 'partes-del-barco',
    3: 'como-funciona-la-vela',
    4: 'la-terminologia-nautica',
    5: 'los-rumbos-respecto-al-viento',
    6: 'preparacion-aparejado',
    7: 'la-virada-por-avante',
    8: 'la-trasluchada',
    9: 'parar-arrancar-seguridad',
    10: 'reglas-navegacion-basicas',
    11: 'nudos-esenciales',
    12: 'tu-primera-navegacion'
};

const FILES = [
    'contenido_academico/curso1_banco_preguntas_parte1.md',
    'contenido_academico/curso1_banco_preguntas_parte2.md',
    'contenido_academico/curso1_banco_preguntas_parte3.md',
    'contenido_academico/curso1_banco_preguntas_parte4.md'
];

let globalSql = '-- 003_preguntas_curso1.sql\n-- Seed de las 200 preguntas reales\n\nTRUNCATE TABLE preguntas CASCADE;\n\n';

FILES.forEach(file => {
    const content = fs.readFileSync(path.join(__dirname, '../', file), 'utf-8');
    const sections = content.split(/## UNIDAD \d+/);

    // First section is header, skip it.
    // However, split removed "## UNIDAD X", so we need to know WHICH unit it was.
    // Better to match with regex.

    // Re-do split to capture the number
    const parts = content.split(/(?=## UNIDAD \d+)/);

    parts.forEach(part => {
        const titleMatch = part.match(/## UNIDAD (\d+)/);
        if (!titleMatch) return; // Skip header parts

        const unitNum = parseInt(titleMatch[1]);
        const unitSlug = UNIT_MAP[unitNum];

        if (!unitSlug) {
            console.error(`Unit slug not found for Unit ${unitNum}`);
            return;
        }

        console.log(`Processing Unit ${unitNum} (${unitSlug})...`);

        // Split questions
        const questionsBlocks = part.split(/\*\*Pregunta \d+\*\*/).slice(1);

        questionsBlocks.forEach((block, index) => {
            const q = parseQuestion(block.trim());
            if (q) {
                globalSql += generateInsert(q, unitSlug);
            }
        });
    });
});

function parseQuestion(block) {
    // Regex for Format 1 (Simple)
    // Statement
    // A) ...
    // **Correcta: X**

    // Regex for Format 2 (Structured)
    // Tipo: ...
    // Pregunta: ...
    // A) ...
    // Respuesta correcta: X
    // Explicación: ...

    let statement = '';
    let options = {};
    let correct = '';
    let explanation = '';
    let type = 'multiple_choice';

    // Normalize newlines
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);

    // Detect format
    const isStructured = lines.some(l => l.startsWith('Tipo:'));

    if (isStructured) {
        // Structured Format
        let currentField = null;

        lines.forEach(line => {
            if (line.startsWith('Tipo:')) {
                const t = line.split(':')[1].trim().toLowerCase();
                if (t.includes('verdadero')) type = 'true_false';
            } else if (line.startsWith('Pregunta:')) {
                statement = line.replace('Pregunta:', '').trim();
            } else if (line.match(/^[A-D]\)/)) {
                const letter = line.charAt(0).toLowerCase();
                options[letter] = line.substring(2).trim();
            } else if (line.startsWith('Respuesta correcta:')) {
                let ans = line.split(':')[1].trim();
                if (ans === 'Verdadero') correct = 'a';
                else if (ans === 'Falso') correct = 'b';
                else correct = ans.toLowerCase();
            } else if (line.startsWith('Explicación:')) {
                explanation = line.replace('Explicación:', '').trim();
            } else if (!currentField && !line.match(/^[A-D]\)/) && !line.startsWith('Respuesta') && !line.startsWith('Tipo')) {
                // Continuation of statement?
                if (statement) statement += ' ' + line;
            }
        });

        if (type === 'true_false' && Object.keys(options).length === 0) {
            options = { a: 'Verdadero', b: 'Falso' };
        }

    } else {
        // Simple Format (Part 1)
        // First line is statement (or multiple lines until 'A)')
        let optionStart = lines.findIndex(l => l.match(/^[A-D]\)/));

        if (optionStart === -1) {
            console.error('No options found in block:', block.substring(0, 50));
            return null;
        }

        statement = lines.slice(0, optionStart).join(' ');

        // Options
        for (let i = optionStart; i < lines.length; i++) {
            const line = lines[i];
            if (line.match(/^[A-D]\)/)) {
                const letter = line.charAt(0).toLowerCase();
                options[letter] = line.substring(2).trim();
            } else if (line.startsWith('**Correcta:')) {
                correct = line.split(':')[1].trim().toLowerCase().replace('*', ''); // handle **B**
                // Remove any trailing **
                correct = correct.replace(/\*/g, '');
            }
        }
    }

    if (!statement || !correct) {
        console.error('Failed to parse question:', block.substring(0, 50));
        return null; // Skip invalid
    }

    return { statement, options, correct, explanation, type };
}

function generateInsert(q, unitSlug) {
    const escapedStatement = q.statement.replace(/'/g, "''");
    const escapedExplanation = q.explanation ? q.explanation.replace(/'/g, "''") : '';
    const optionsJson = JSON.stringify(q.options).replace(/'/g, "''"); // Escape single quotes inside JSON string

    return `
INSERT INTO preguntas (
    entidad_tipo, 
    entidad_id, 
    pregunta_es, 
    opciones_json, 
    respuesta_correcta, 
    explicacion_es, 
    tipo, 
    dificultad, 
    puntos
) 
SELECT 
    'unidad', 
    id, 
    '${escapedStatement}', 
    '${optionsJson}'::jsonb, 
    '${q.correct}', 
    '${escapedExplanation}', 
    '${q.type}', 
    'basico', 
    10 
FROM unidades_didacticas 
WHERE slug = '${unitSlug}';
`;
}

fs.writeFileSync(OUTPUT_FILE, globalSql);
console.log(`Generated ${OUTPUT_FILE}`);
