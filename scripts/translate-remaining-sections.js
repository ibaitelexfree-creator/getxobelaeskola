const fs = require('fs');
const path = require('path');

const esPath = path.join(__dirname, '../messages/es.json');
const data = JSON.parse(fs.readFileSync(esPath, 'utf8'));

// Traducir las secciones que están en euskera a español
data.about_page = {
    "header_badge": "Getxo Bela Eskola",
    "header_title": "Nuestra Pasión es el",
    "header_highlight": "Mar",
    "header_suffix": "Excelencia Náutica en Arriluze",
    "since": "Fundada en Getxo",
    "desc1": "Getxo Bela Eskola nace con el propósito de acercar el mundo de la vela a todas aquellas personas que deseen disfrutar del Cantábrico de una forma diferente. Ubicada en el Muelle Arriluzea, contamos con unas instalaciones privilegiadas para que tu experiencia sea completa.",
    "desc2": "Desde la navegación recreativa hasta la competición y la vida a bordo, nuestra metodología se basa en la práctica constante y el respeto por el medio marino. Formamos tripulaciones, no solo navegantes.",
    "values": {
        "v1_title": "Nuestras Instalaciones",
        "v1_desc": "Visítanos en el Muelle Arriluzea. Disponemos de aulas para clases teóricas, sala de audiovisuales, pañol, taller y vestuarios con acceso privado al puerto.",
        "v2_title": "Equipo Humano",
        "v2_desc": "Un grupo apasionado que incluye educadores sociales, biólogos marinos y técnicos expertos en mantenimiento naval.",
        "v3_title": "Filosofía y Vida",
        "v3_desc": "Entendemos la navegación como un viaje de crecimiento personal, basado en la máxima preparación técnica y el respeto al mar."
    },
    "team_section_title": "La Tripulación",
    "team": {
        "member1_name": "Angharad Arambalza",
        "member1_role": "Coordinadora de Tierra",
        "member1_desc": "Educadora social y amante del mar. Su empatía y energía son el corazón de nuestra logística en tierra.",
        "member2_name": "Urko Santillán",
        "member2_role": "Jefe Técnico",
        "member2_desc": "Nuestro experto en mantenimiento. Se asegura de que cada embarcación de la flota esté en estado impecable.",
        "member3_name": "Ana de Lara",
        "member3_role": "Bióloga Marina",
        "member3_desc": "Científica y buceadora. Nos asesora sobre la biodiversidad del Cantábrico y la geografía de nuestra costa."
    },
    "commitment_title": "Comprometidos con la",
    "commitment_highlight": "Cultura del Mar",
    "define_badge": "Nuestra Esencia",
    "define_title": "Lo que nos define",
    "cta_title": "¿Listo para zarpar?",
    "cta_desc": "Únete a nuestra escuela y descubre por qué somos el referente de navegación en el Cantábrico.",
    "cta_button": "Ver Cursos Disponibles"
};

data.contact_page = {
    "header_badge": "Contacto",
    "header_title": "Hablemos de",
    "header_highlight": "Navegar",
    "location_label": "Ubicación",
    "location_val": "Muelle Arriluzea, s/n\n48990 Getxo, Vizcaya",
    "contact_label": "Email & Teléfono",
    "hours_label": "Horario",
    "hours_val": "Lunes a Domingo\n09:00 — 20:00"
};

data.newsletter = {
    "title": "Suscríbete a la Newsletter",
    "subtitle": "Recibe noticias, ofertas exclusivas y consejos de navegación en tu correo.",
    "email_placeholder": "tu@correo.com",
    "button": "Suscribirse",
    "success": "¡Te has suscrito correctamente!",
    "error": "Error al suscribirse. Inténtalo de nuevo."
};

data.contact_form = {
    "name": "Nombre",
    "name_placeholder": "Tu nombre completo",
    "apellidos": "Apellidos",
    "email": "Email",
    "email_placeholder": "ejemplo@correo.com",
    "phone": "Teléfono (Opcional)",
    "phone_placeholder": "+34 000 000 000",
    "subject": "Asunto",
    "subject_placeholder": "¿En qué podemos ayudarte?",
    "message": "Mensaje",
    "message_placeholder": "Escribe aquí tu consulta...",
    "send": "Enviar Mensaje",
    "sending": "Enviando...",
    "success_title": "¡Mensaje Enviado!",
    "success_desc": "Gracias por contactar con Getxo Bela Eskola. Te responderemos lo antes posible.",
    "send_another": "Enviar otro mensaje",
    "error": "Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo."
};

data.auth = {
    "login_title": "Bienvenido",
    "login_desc": "Accede a tu zona de alumno para gestionar tus cursos.",
    "hero_text": "El mar te espera.",
    "no_account": "¿No tienes cuenta?",
    "create_one": "Crea una aquí",
    "register_title": "Únete a la Escuela",
    "register_desc": "Crea tu cuenta para comenzar tu formación náutica.",
    "has_account": "¿Ya tienes cuenta?",
    "login_here": "Inicia sesión aquí"
};

data.auth_form = {
    "email": "Email",
    "password": "Contraseña",
    "login_btn": "Iniciar Sesión",
    "logging_in": "Accediendo...",
    "invalid_creds": "Credenciales incorrectas",
    "register_btn": "Registrarse",
    "registering": "Creando cuenta...",
    "confirm_password": "Confirmar Contraseña",
    "password_mismatch": "Las contraseñas no coinciden",
    "newsletter_checkbox": "Estar al tanto de eventos y novedades de la escuela"
};

data.footer = {
    "courses": "Cursos",
    "rental": "Alquiler",
    "school": "La Escuela",
    "contact": "Contacto",
    "copyright": "© 2026 Getxo Bela Eskola · Experiencia Náutica Premium"
};

// Escribir de vuelta
fs.writeFileSync(esPath, JSON.stringify(data, null, 4), 'utf8');

console.log('✅ Todas las secciones traducidas al español');
console.log('📊 Secciones actualizadas: about_page, contact_page, newsletter, contact_form, auth, auth_form, footer');
