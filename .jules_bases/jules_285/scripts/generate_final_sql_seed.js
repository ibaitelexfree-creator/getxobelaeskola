const fs = require('fs');
const path = require('path');

const COURSE_SLUG = 'iniciacion-vela-ligera';
const OUTPUT_FILE = path.join(__dirname, '../supabase/seeds/FINAL_SEED_CURSO1.sql');

const HEADER_UNIT_MAP = {
    1: 'seguridad-en-el-mar', 2: 'partes-del-barco', 3: 'como-funciona-la-vela', 4: 'la-terminologia-nautica',
    5: 'los-rumbos-respecto-al-viento', 6: 'preparacion-aparejado', 7: 'la-virada-por-avante', 8: 'la-trasluchada',
    9: 'parar-arrancar-seguridad', 10: 'reglas-navegacion-basicas', 11: 'nudos-esenciales', 12: 'tu-primera-navegacion'
};

const MODULES = [
    {
        slug: 'introduccion-seguridad', nombre_es: 'Introducción y Seguridad', orden: 1,
        units: [
            { slug: 'seguridad-en-el-mar', nombre_es: 'Seguridad en el Mar', orden: 1 },
            { slug: 'partes-del-barco', nombre_es: 'Partes del Barco', orden: 2 }
        ]
    },
    {
        slug: 'teoria-navegacion', nombre_es: 'Teoría de la Navegación', orden: 2,
        units: [
            { slug: 'como-funciona-la-vela', nombre_es: 'Cómo Funciona la Vela', orden: 1 },
            { slug: 'la-terminologia-nautica', nombre_es: 'La Terminología Náutica', orden: 2 },
            { slug: 'los-rumbos-respecto-al-viento', nombre_es: 'Los Rumbos Respecto al Viento', orden: 3 }
        ]
    },
    {
        slug: 'tecnica-navegacion', nombre_es: 'Técnica de Navegación', orden: 3,
        units: [
            { slug: 'preparacion-aparejado', nombre_es: 'Preparación y Aparejado del Barco', orden: 1 },
            { slug: 'la-virada-por-avante', nombre_es: 'La Virada por Avante', orden: 2 },
            { slug: 'la-trasluchada', nombre_es: 'La Trasluchada', orden: 3 },
            { slug: 'parar-arrancar-seguridad', nombre_es: 'Parar, Arrancar y Posición de Seguridad', orden: 4 }
        ]
    },
    {
        slug: 'reglamento-marineria', nombre_es: 'Reglamento y Marinería', orden: 4,
        units: [
            { slug: 'reglas-navegacion-basicas', nombre_es: 'Reglas de Navegación Básicas', orden: 1 },
            { slug: 'nudos-esenciales', nombre_es: 'Nudos Esenciales', orden: 2 },
            { slug: 'tu-primera-navegacion', nombre_es: 'Tu Primera Navegación Completa', orden: 3 }
        ]
    }
];

function main() {
    let sql = `-- FINAL_SEED_CURSO1.sql\n-- Generated on ${new Date().toISOString()}\n\n`;
    sql += `BEGIN;\n\n`;

    // 0. Level
    sql += `-- 0. Level\n`;
    sql += `INSERT INTO niveles_formacion (slug, nombre_es, nombre_eu, orden, duracion_teorica_h, duracion_practica_h, icono)\n`;
    sql += `VALUES ('iniciacion', 'Iniciación a la Vela', 'Belaren Hasiera', 1, 20, 10, '⚓')\n`;
    sql += `ON CONFLICT (slug) DO NOTHING;\n\n`;

    // 1. Course
    sql += `-- 1. Course\n`;
    sql += `INSERT INTO cursos (slug, nivel_formacion_id, nombre_es, nombre_eu, descripcion_es, activo, objetivos_json, competencias_json)\n`;
    sql += `SELECT '${COURSE_SLUG}', id, 'Iniciación a la Vela Ligera', 'Bela Arinaren Hasiera', 'Curso completo de iniciación.', true, '[]'::jsonb, '[]'::jsonb\n`;
    sql += `FROM niveles_formacion WHERE slug = 'iniciacion'\n`;
    sql += `ON CONFLICT (slug) DO NOTHING;\n\n`;

    // 2. Modules & Units
    sql += `-- 2. Modules & Units\n`;
    MODULES.forEach(mod => {
        sql += `INSERT INTO modulos (curso_id, slug, nombre_es, nombre_eu, orden)\n`;
        sql += `SELECT id, '${mod.slug}', '${mod.nombre_es}', '${mod.nombre_es}', ${mod.orden} FROM cursos WHERE slug = '${COURSE_SLUG}'\n`;
        sql += `ON CONFLICT (curso_id, slug) DO NOTHING;\n`;

        mod.units.forEach(unit => {
            sql += `INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min)\n`;
            sql += `SELECT id, '${unit.slug}', '${unit.nombre_es}', '${unit.nombre_es}', ${unit.orden}, 45 FROM modulos WHERE slug = '${mod.slug}' AND curso_id = (SELECT id FROM cursos WHERE slug = '${COURSE_SLUG}' LIMIT 1)\n`;
            sql += `ON CONFLICT (modulo_id, slug) DO NOTHING;\n`;
        });
    });
    sql += `\n`;

    // 3. Questions
    sql += `-- 3. Questions\n`;
    sql += `DELETE FROM preguntas WHERE entidad_tipo = 'unidad' AND entidad_id IN (SELECT id FROM unidades_didacticas WHERE modulo_id IN (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE slug = '${COURSE_SLUG}' LIMIT 1)));\n\n`;

    const files = [
        'contenido_academico/curso1_banco_preguntas_parte1.md',
        'contenido_academico/curso1_banco_preguntas_parte2.md',
        'contenido_academico/curso1_banco_preguntas_parte3.md',
        'contenido_academico/curso1_banco_preguntas_parte4.md'
    ];

    files.forEach(file => {
        const fullPath = path.join(__dirname, '../', file);
        if (!fs.existsSync(fullPath)) return;
        const content = fs.readFileSync(fullPath, 'utf-8');
        const parts = content.split(/(?=## UNIDAD \d+)/);

        parts.forEach(part => {
            const titleMatch = part.match(/## UNIDAD (\d+)/);
            if (!titleMatch) return;
            const unitNum = parseInt(titleMatch[1]);
            const unitSlug = HEADER_UNIT_MAP[unitNum];

            const blocks = part.split(/\*\*Pregunta/).slice(1);
            blocks.forEach(block => {
                const q = parseQuestion('**Pregunta' + block);
                if (q) {
                    const statement = q.statement.replace(/'/g, "''");
                    const options = JSON.stringify(q.options).replace(/'/g, "''");
                    const explanation = q.explanation.replace(/'/g, "''");

                    sql += `INSERT INTO preguntas (entidad_tipo, entidad_id, pregunta_es, opciones_json, respuesta_correcta, explicacion_es, tipo, dificultad, puntos)\n`;
                    sql += `SELECT 'unidad', id, '${statement}', '${options}'::jsonb, '${q.correct}', '${explanation}', '${q.type}', 'basico', 10 FROM unidades_didacticas WHERE slug = '${unitSlug}' LIMIT 1;\n`;
                }
            });
        });
    });

    sql += `\nCOMMIT;`;
    fs.writeFileSync(OUTPUT_FILE, sql);
    console.log(`Generated ${OUTPUT_FILE}`);
}

function parseQuestion(block) {
    let statement = '';
    let options = {};
    let correct = '';
    let explanation = '';
    let type = 'multiple_choice';

    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    const isStructured = lines.some(l => l.startsWith('Tipo:'));

    if (isStructured) {
        lines.forEach(line => {
            if (line.startsWith('Tipo:')) {
                const t = line.split(':')[1].toLowerCase();
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
            } else if (!line.startsWith('**Pregunta') && !line.startsWith('Tipo:') && !Object.keys(options).length && !line.startsWith('Respuesta')) {
                if (statement && !line.match(/^[A-D]\)/)) statement += ' ' + line;
            }
        });
        if (type === 'true_false' && Object.keys(options).length === 0) {
            options = { a: 'Verdadero', b: 'Falso' };
        }
    } else {
        let optionStart = lines.findIndex(l => l.match(/^[A-D]\)/));
        if (optionStart === -1) return null;
        statement = lines.slice(1, optionStart).join(' ').trim();
        for (let i = optionStart; i < lines.length; i++) {
            const line = lines[i];
            if (line.match(/^[A-D]\)/)) {
                const letter = line.charAt(0).toLowerCase();
                options[letter] = line.substring(2).trim();
            } else if (line.startsWith('**Correcta:')) {
                correct = line.split(':')[1].trim().toLowerCase().replace(/\*/g, '');
            }
        }
    }
    if (!statement || !correct) return null;
    return { statement, options, correct, explanation, type };
}

main();
