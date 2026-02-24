// Script para añadir traducciones de booking a messages/es.json y messages/eu.json
const fs = require('fs');
const path = require('path');

const bookingTranslationsES = {
    "booking": {
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
    }
};

const bookingTranslationsEU = {
    "booking": {
        "select_date": "Hautatu data bat",
        "from_date": "-tik",
        "to_date": "-ra",
        "full": "Beteta",
        "seats": "Leku",
        "no_dates_available": "Ez dago datarik programatuta une honetan.",
        "processing": "Prozesatzen...",
        "book_for": "Erreservatu",
        "online_course_instant": "Online Ikastaroa - Berehala Sarbidea",
        "no_dates_needed": "Ez da beharrezkoa datak hautatzea. Hasi orain.",
        "error_generic": "Zerbait gaizki joan da",
        "payment_gateway_error": "Errorea ordainketa pasabidearekin konektatzean"
    }
};

function addBookingTranslations(filePath, bookingTranslations) {
    try {
        // Leer archivo
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        // Añadir sección booking si no existe
        if (!data.booking) {
            data.booking = bookingTranslations.booking;

            // Escribir de vuelta
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
            console.log(`✅ Traducciones de booking añadidas a ${filePath}`);
        } else {
            console.log(`⚠️  La sección 'booking' ya existe en ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error procesando ${filePath}:`, error.message);
    }
}

// Ejecutar
const esPath = path.join(__dirname, '../messages/es.json');
const euPath = path.join(__dirname, '../messages/eu.json');

addBookingTranslations(esPath, bookingTranslationsES);
addBookingTranslations(euPath, bookingTranslationsEU);

console.log('\n✨ Proceso completado');
