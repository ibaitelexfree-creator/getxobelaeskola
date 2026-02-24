const fs = require('fs');
const path = require('path');

// Leer el archivo EU que funciona
const euPath = path.join(__dirname, '../messages/eu.json');
const esPath = path.join(__dirname, '../messages/es.json');

const euData = JSON.parse(fs.readFileSync(euPath, 'utf8'));

// Crear el objeto ES completo con TODAS las traducciones
// Basándonos en la estructura de EU pero con textos en español

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
    "rental_page": {
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
    },
    "home": {
        "hero": {
            "slide1_title": "Elegancia en el Mar",
            "slide1_subtitle": "Formación náutica de élite en la Bahía de Getxo con nuestra flota de J80.",
            "slide1_action": "Explorar Cursos",
            "slide2_title": "Libertad sobre Olas",
            "slide2_subtitle": "Mejora tu técnica y táctica de navegación con instructores profesionales.",
            "slide2_action": "Ver Flota",
            "slide3_title": "Tu Propio Rumbo",
            "slide3_subtitle": "Obtén tu Licencia de Navegación en una sola jornada y comienza a navegar.",
            "slide3_action": "Saber Más",
            "slide4_title": "Futuros Navegantes",
            "slide4_subtitle": "Cursos de Vela Ligera para todas las edades. El comienzo de una pasión.",
            "slide4_action": "Ver Vela Ligera"
        },
        "stats": {
            "pasion": "Años de Pasión",
            "alumnos": "Alumnos Formados",
            "flota": "Barcos en Flota",
            "clases": "Clases Semanales"
        },
        "programs": {
            "badge": "Formación de Élite",
            "title": "Nuestros Programas",
            "learn_more": "Saber más",
            "licencia_title": "Licencia de Navegación",
            "licencia_price": "120€",
            "licencia_desc": "La puerta de entrada al mar. Sin examen y en un solo día.",
            "j80_title": "Iniciación J80",
            "j80_price": "150€",
            "j80_desc": "Domina los conceptos básicos en el velero más divertido del Cantábrico.",
            "rental_title": "Alquiler de Flota",
            "rental_desc": "Libertad total para navegantes titulados con nuestra flota J80.",
            "price_rental": "Desde 80€"
        },
        "fleet_cta": {
            "title": "Nuestra Flota",
            "highlight": "Exclusiva",
            "action": "Explorar J80"
        },
        "experience": {
            "filosofia": "Nuestra Filosofía",
            "lifestyle_title": "Más que una Escuela,",
            "lifestyle_subtitle": "Un Estilo de Vida",
            "desc1": "En Getxo Bela Eskola no solo enseñamos a navegar. Ofrecemos la llave para conectar con el Cantábrico desde un prisma de excelencia, respeto y tradición.",
            "desc2": "Nuestra flota de J80, ubicada en el prestigioso Puerto Deportivo de Getxo, es el escenario donde forjamos navegantes apasionados bajo los más altos estándares de seguridad y confort.",
            "about_link": "Descubre nuestra Escuela",
            "live": "Vive",
            "the": "la",
            "passion": "Pasión"
        },
        "features": {
            "title": "Por qué elegirnos",
            "cert_title": "Certificación Oficial",
            "cert_desc": "Titulaciones reconocidas para navegar en cualquier mar.",
            "staff_title": "Instructores Expertos",
            "staff_desc": "Aprende de navegantes con miles de millas de experiencia.",
            "comm_title": "Comunidad Activa",
            "comm_desc": "Únete a un club de apasionados por la vela y el Cantábrico."
        }
    },
    "courses_page": {
        "header_badge": "Nuestra Oferta",
        "header_title": "Cursos de",
        "header_highlight": "Navegación",
        "header_desc": "Desde los primeros pasos en la vela ligera hasta las titulaciones de recreo más avanzadas. En nuestra escuela en Getxo, cada curso es una experiencia diseñada para la excelencia.",
        "duration": "h",
        "price_from": "Desde"
    },
    "about_page": euData.about_page,
    "contact_page": euData.contact_page,
    "newsletter": euData.newsletter,
    "contact_form": euData.contact_form,
    "auth": euData.auth,
    "auth_form": euData.auth_form,
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
    },
    "staff_panel": euData.staff_panel,
    "footer": euData.footer,
    "academy": euData.academy
};

// Escribir
fs.writeFileSync(esPath, JSON.stringify(esData, null, 4), 'utf8');

// Verificar
const verify = JSON.parse(fs.readFileSync(esPath, 'utf8'));
console.log('✅ Archivo es.json creado desde cero');
console.log(`📊 Total de secciones: ${Object.keys(verify).length}`);
console.log(`✅ Sección booking: ${verify.booking ? 'SÍ' : 'NO'}`);
console.log(`✅ Sección staff_panel: ${verify.staff_panel ? 'SÍ' : 'NO'}`);
console.log(`✅ Sección academy: ${verify.academy ? 'SÍ' : 'NO'}`);
