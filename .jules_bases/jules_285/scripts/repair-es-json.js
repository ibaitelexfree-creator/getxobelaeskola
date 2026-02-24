const fs = require('fs');
const path = require('path');

// Leer el archivo corrupto
const corruptedPath = path.join(__dirname, '../messages/es.json.corrupted');
const cleanPath = path.join(__dirname, '../messages/es.json');

try {
    let content = fs.readFileSync(corruptedPath, 'utf8');

    // Eliminar las líneas problemáticas de booking mal formadas
    // Buscar desde "auth_form" hasta "footer" y reconstruir

    const lines = content.split('\n');
    const cleanLines = [];
    let skipMode = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detectar inicio de sección corrupta
        if (line.includes('`n')) {
            skipMode = true;
            continue;
        }

        // Detectar fin de sección corrupta (cuando llegamos a "footer")
        if (skipMode && line.trim().startsWith('"footer"')) {
            skipMode = false;
        }

        if (!skipMode) {
            cleanLines.push(line);
        }
    }

    // Unir y parsear
    let cleanContent = cleanLines.join('\n');

    // Intentar parsear
    const data = JSON.parse(cleanContent);

    // Añadir la sección booking correctamente
    data.booking = {
        "select_date": "Selecciona una fecha",
        "from_date": "Del",
        "to_date": "Al",
        "full": "Completo",
        "seats": "Plazas",
        "no_dates_available": "No hay fechas programadas actualmente.",
        "processing": "Procesando...",
        "book_for": "Reservar por",
        "online_course_instant": "Curso Online - Acceso Inmediato",
        "no_dates_needed": "No es necesario seleccionar fechas. Empieza ahora mismo.",
        "error_generic": "Algo salió mal",
        "payment_gateway_error": "Error al conectar con la pasarela de pago"
    };

    // Escribir archivo limpio
    fs.writeFileSync(cleanPath, JSON.stringify(data, null, 4), 'utf8');

    console.log('✅ Archivo es.json reparado y actualizado con traducciones de booking');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
