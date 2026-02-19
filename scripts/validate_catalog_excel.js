
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

// Supabase Setup
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Paths
const EXCEL_PATH = path.join(process.cwd(), 'public', 'Documentos', 'Cursos y Actividades.xlsx');
const REPORT_PATH = path.join(process.cwd(), 'docs', 'VALIDACION_CATALOGO_EXCEL.md');

// Utility: Normalize strings for comparison
const normalize = (val) => {
    if (val === null || val === undefined) return '';
    return String(val).toLowerCase().trim().replace(/[áéíóú]/g, (m) => ({ 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' }[m]));
};

async function run() {
    console.log(`📂 Leyendo archivo Excel: ${EXCEL_PATH}`);

    if (!fs.existsSync(EXCEL_PATH)) {
        console.error('❌ Error: El archivo Excel no existe en la ruta especificada.');
        return;
    }

    // Read Excel
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Use header: 1 to get raw array of arrays first to inspect headers
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Convert back to object array using the detected header row (assuming row 1 or 2)
    // Finding the first row that looks like a header (contains 'Actividad', 'Curso', 'Precio', etc.)
    let headerRowIndex = 0;
    const headerKeywords = ['curso', 'actividad', 'nombre', 'precio', 'pvp', 'tarifas'];

    for (let i = 0; i < Math.min(rawData.length, 5); i++) {
        const rowStr = JSON.stringify(rawData[i]).toLowerCase();
        if (headerKeywords.some(k => rowStr.includes(k))) {
            headerRowIndex = i;
            break;
        }
    }

    console.log(`🔍 Cabecera detectada en la fila ${headerRowIndex + 1}`);
    const headers = rawData[headerRowIndex] || [];
    console.log('📝 Columnas detectadas:', headers);

    const excelData = XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex });

    console.log(`📊 Encontradas ${excelData.length} filas de datos.`);

    // Fetch DB Data
    console.log('🌐 Obteniendo catálogo actual de la base de datos...');
    const { data: dbCourses, error: courseError } = await supabase.from('cursos').select('*');
    const { data: dbRentals, error: rentalError } = await supabase.from('servicios_alquiler').select('*');

    if (courseError || rentalError) {
        console.error('❌ Error obteniendo datos de Supabase:', courseError || rentalError);
        return;
    }

    console.log(`✅ Base de datos cargada: ${dbCourses.length} Cursos, ${dbRentals.length} Servicios de Alquiler.\n`);

    let report = `# Reporte de Validación: Excel vs Web Catalog
**Fecha:** ${new Date().toLocaleString()}
**Archivo Analizado:** ${path.basename(EXCEL_PATH)}

## Resumen Ejecutivo
- **Total Ítems en Excel:** ${excelData.length}
- **Ítems en Base de Datos (Web):** ${dbCourses.length + dbRentals.length}

---

## Detalle de Validación

| Estado | Ítem (Excel) | Precio Excel | Coincidencia Web | Precio Web | Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
`;

    let foundCount = 0;
    let missingCount = 0;

    // Detect likely keys
    const nameKey = headers.find(h => h && (normalize(h).includes('nombre') || normalize(h).includes('actividad') || normalize(h).includes('curso'))) || headers[0];
    const priceKey = headers.find(h => h && (normalize(h).includes('precio') || normalize(h).includes('pvp') || normalize(h).includes('general') || normalize(h).includes('socio'))) || headers.find(h => typeof h === 'string' && h.includes('€'));

    console.log(`🔑 Clave usada para Nombre: "${nameKey}"`);
    console.log(`💰 Clave usada para Precio: "${priceKey}"`);

    for (const row of excelData) {
        const excelName = row[nameKey];
        const excelPrice = row[priceKey];
        const normName = normalize(excelName);

        if (!excelName || normName.length < 3) continue; // Skip empty or too short rows

        // Search in Courses
        let match = dbCourses.find(c => {
            const dbN = normalize(c.nombre);
            return dbN === normName || dbN.includes(normName) || normName.includes(dbN);
        });

        let dbName = match ? match.nombre : '';
        let dbPriceVal = match ? match.precio : null;

        // If not found, search in Rentals
        if (!match) {
            match = dbRentals.find(r => {
                const dbN = normalize(r.nombre_es);
                return dbN === normName || dbN.includes(normName) || normName.includes(dbN);
            });
            dbName = match ? match.nombre_es : '';
            dbPriceVal = match ? match.precio_base : null;
        }

        let statusIcon = '🔴';
        let matchName = '-';
        let notes = ' **NO ENCONTRADO**';

        if (match) {
            statusIcon = '✅';
            foundCount++;
            matchName = dbName;

            // Check Price
            if (excelPrice && dbPriceVal) {
                // Remove currency symbols and parse
                const p1 = parseFloat(String(excelPrice).replace(/[^\d.,]/g, '').replace(',', '.'));
                const p2 = parseFloat(String(dbPriceVal));

                if (!isNaN(p1) && !isNaN(p2)) {
                    if (Math.abs(p1 - p2) > 1) {
                        statusIcon = '⚠️';
                        notes = `Diferencia Precio (>1€)`;
                    } else {
                        statusIcon = '✅';
                        notes = 'Coincide';
                    }
                } else {
                    notes = 'Error formato precio';
                }
            } else {
                notes = 'Precio no verificable';
            }
        } else {
            missingCount++;
            // Try lenient search
            if (dbCourses.some(c => normalize(c.nombre).split(' ')[0] === normName.split(' ')[0])) {
                notes = 'Posible coincidencia parcial (revisar nombre)';
                statusIcon = '🟠';
            }
        }

        report += `| ${statusIcon} | ${excelName} | ${excelPrice || '-'} | ${matchName} | ${dbPriceVal || '-'} | ${notes} |\n`;
    }

    report += `
\n## Estadísticas Finales
- ✅ **Coincidencias Detectadas:** ${foundCount}
- 🔴 **Posibles Faltantes:** ${missingCount}

**Nota:** Este reporte compara nombres normalizados. Diferencias pequeñas en la redacción pueden causar falsos negativos ("🔴"). Revise manualmente los ítems marcados con 🟠.
`;

    // Write Report
    fs.writeFileSync(REPORT_PATH, report);
    console.log(`\n📄 Reporte generado en: ${REPORT_PATH}`);
}

run();
