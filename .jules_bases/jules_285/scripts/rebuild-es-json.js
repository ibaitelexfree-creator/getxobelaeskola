const fs = require('fs');
const path = require('path');

// Leer el archivo EU que sabemos que funciona como referencia de estructura
const euPath = path.join(__dirname, '../messages/eu.json');
const esPath = path.join(__dirname, '../messages/es.json');
const esBackupPath = path.join(__dirname, '../messages/es.json.original');

try {
    // Hacer backup del archivo corrupto
    if (fs.existsSync(esPath)) {
        fs.copyFileSync(esPath, esBackupPath);
        console.log('📦 Backup creado: es.json.original');
    }

    // Leer EU como base de estructura
    const euData = JSON.parse(fs.readFileSync(euPath, 'utf8'));

    // Crear estructura ES con todas las traducciones en español
    const esData = {
        "nav": {
            "home": "Inicio",
            "courses": "Cursos",
            "academy": "Academia",
            "rental": "Alquiler",
            "teams": "Equipos",
            "about": "La Escuela",
            "contact": "Contacto",
            "login": "Acceso",
            "dashboard": "Mi Área",
            "admin_panel": "Panel de Control",
            "logout": "Cerrar Sesión",
            "language_selector": "Cambiar Idioma"
        },
        "hero": {
            "title": "Elegancia en el mar",
            "subtitle": "Formación náutica premium en Getxo"
        },
        "courses": {
            "title": "Cursos de Navegación",
            "duration": "Duración",
            "view_more": "Ver Detalles",
            "levels": {
                "iniciacion": "Iniciación",
                "intermedio": "Perfeccionamiento",
                "avanzado": "Avanzado",
                "profesional": "Profesional"
            },
            "back_to_catalog": "Volver al catálogo"
        },
        "rental_page": euData.rental_page ? {
            "header_eyebrow": "Equipamiento y Flota",
            "title_prefix": "Alquiler de",
            "title_highlight": "Material",
            "description": "Optimist, Laser, J80, Paddle Surf con turbina, Windsurf y más. Todo el material necesario para tu aventura en el mar.",
            "footer_note": "* El alquiler de veleros requiere titulación mínima. Para Paddle Surf con turbina se incluye formación básica de manejo.",
            "categories": {
                "all": "Todos",
                "veleros": "Veleros",
                "windsurf": "Windsurf",
                "paddlesurf": "Paddle Surf",
                "kayak": "Kayak",
                "piragua": "Piragua"
            },
            "booking": {
                "from": "desde",
                "date_label": "Fecha de Reserva",
                "time_label": "Hora",
                "extra_option": "Opción Extra:",
                "cancel": "Cancelar",
                "confirm": "Confirmar Reserva",
                "book_now": "Reservar Ahora",
                "image_placeholder": "Imagen de",
                "invalid_date": "Por favor, completa la fecha correctamente (DD/MM/AAAA)",
                "booking_error": "Error al procesar la reserva. Por favor, inténtalo de nuevo."
            }
        } : {},
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

    // Copiar el resto de secciones del archivo EU traducidas
    const sectionsToTranslate = ['home', 'courses_page', 'about_page', 'contact_page', 'newsletter',
        'contact_form', 'auth', 'auth_form', 'footer', 'academy', 'staff_panel'];

    // Por ahora, voy a intentar leer el archivo corrupto y extraer lo que pueda
    let existingData = {};
    try {
        const rawContent = fs.readFileSync(esBackupPath, 'utf8');
        // Intentar extraer secciones válidas manualmente
        const match = rawContent.match(/"home":\s*{[\s\S]*?"features":\s*{[\s\S]*?}\s*}/);
        if (match) {
            console.log('📖 Intentando recuperar datos existentes...');
        }
    } catch (e) {
        console.log('⚠️  No se pudo recuperar datos del archivo corrupto');
    }

    // Escribir archivo limpio
    fs.writeFileSync(esPath, JSON.stringify(esData, null, 4), 'utf8');

    console.log('✅ Archivo es.json reconstruido con secciones básicas');
    console.log('⚠️  NOTA: Solo se han incluido las secciones nav, hero, courses, rental_page y booking');
    console.log('⚠️  Las demás secciones necesitan ser copiadas manualmente del archivo original');

} catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
}
