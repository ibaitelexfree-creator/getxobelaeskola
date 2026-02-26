const fs = require('fs');
const path = require('path');

const esPath = path.join(__dirname, '../messages/es.json');

try {
    // Leer el archivo como texto plano
    let content = fs.readFileSync(esPath, 'utf8');

    // Eliminar cualquier línea que contenga `n (escape mal formado)
    const lines = content.split('\n');
    const cleanLines = lines.filter(line => !line.includes('`n'));
    content = cleanLines.join('\n');

    // Intentar parsear
    let data;
    try {
        data = JSON.parse(content);
    } catch (parseError) {
        console.log('❌ El archivo aún tiene errores de sintaxis');
        console.log('Intentando reparación manual...');

        // Buscar y eliminar la sección booking corrupta si existe
        content = content.replace(/,?\s*"booking":\s*{[^}]*}/g, '');

        // Intentar parsear de nuevo
        data = JSON.parse(content);
    }

    // Ahora añadir la sección booking limpia
    if (!data.booking) {
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
    }

    // Escribir de vuelta
    fs.writeFileSync(esPath, JSON.stringify(data, null, 4), 'utf8');

    // Verificar
    const verify = JSON.parse(fs.readFileSync(esPath, 'utf8'));
    console.log('✅ Archivo es.json reparado y validado');
    console.log(`📊 Total de secciones: ${Object.keys(verify).length}`);
    console.log(`✅ Sección booking añadida: ${verify.booking ? 'SÍ' : 'NO'}`);

} catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
}
