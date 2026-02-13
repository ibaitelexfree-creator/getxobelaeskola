/**
 * Plantillas de correo premium con diseño náutico.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://getxo-sailing-school.vercel.app';
const LOGO_URL = `${BASE_URL}/logo.png`; // Placeholder
const BRAND_COLOR = '#0ea5e9'; // Accent color de la web
const BG_COLOR = '#020617'; // Nautical black

/**
 * Estructura base para todos los correos electrónicos de la escuela.
 * Incluye el diseño responsivo, colores de marca y pie de página legal.
 * 
 * @param content - El cuerpo del mensaje en formato HTML.
 * @returns Un string HTML completo listo para ser enviado.
 */
const baseLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background-color: ${BG_COLOR}; padding: 40px 20px; text-align: center; border-bottom: 4px solid ${BRAND_COLOR}; }
    .content { padding: 40px; color: #333333; line-height: 1.6; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .button { display: inline-block; padding: 14px 28px; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
    h1 { color: #0f172a; margin-top: 0; font-style: italic; }
    .accent { color: ${BRAND_COLOR}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="color: white; margin: 0; letter-spacing: 4px; text-transform: uppercase;">Getxo Sailing School</h2>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Getxo Sailing School. Todos los derechos reservados.</p>
      <p>Puerto Deportivo de Getxo, Bizkaia.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Plantilla de bienvenida para nuevos usuarios registrados.
 * 
 * @param name - Nombre del usuario.
 * @returns HTML del correo de bienvenida.
 */
export const welcomeTemplate = (name: string) => baseLayout(`
  <h1>¡Bienvenido a bordo, <span class="accent">${name}</span>!</h1>
  <p>Es un placer saludarte. Has dado el primer paso para convertirte en un experto navegante con Getxo Sailing School.</p>
  <p>Ya puedes acceder a nuestra Academia Online para empezar a explorar los cursos y niveles disponibles.</p>
  <div style="text-align: center;">
    <a href="${BASE_URL}/academy" class="button">IR A LA ACADEMIA</a>
  </div>
  <p>Viento en popa y buena travesía.</p>
`);

/**
 * Confirmación de inscripción a un curso presencial u online.
 * 
 * @param courseName - Nombre del curso seleccionado.
 * @param name - Nombre del alumno.
 * @returns HTML del correo de confirmación de inscripción.
 */
export const inscriptionTemplate = (courseName: string, name: string) => baseLayout(`
  <h1>Confirmación de Inscripción</h1>
  <p>Hola ${name},</p>
  <p>Tu inscripción al curso <strong class="accent">${courseName}</strong> ha sido procesada correctamente.</p>
  <p>Estamos preparando todo para tu formación. Pronto recibirás más detalles sobre las sesiones prácticas y el material necesario.</p>
  <p>Puedes ver el estado de tu curso en tu área personal.</p>
  <div style="text-align: center;">
    <a href="${BASE_URL}/dashboard" class="button">MI ÁREA PERSONAL</a>
  </div>
`);

/**
 * Notificación de obtención de certificado tras completar un curso.
 * 
 * @param courseName - Nombre del curso completado.
 * @param name - Nombre del alumno graduado.
 * @returns HTML del correo de felicitación y descarga.
 */
export const certificateTemplate = (courseName: string, name: string) => baseLayout(`
  <h1>¡Enhorabuena, Capitán! 🏆</h1>
  <p>Hola ${name},</p>
  <p>Has completado satisfactoriamente toda la formación de <strong class="accent">${courseName}</strong>.</p>
  <p>Adjuntamos tu certificado oficial en formato digital. Este es un gran hito en tu carrera náutica.</p>
  <p>¡Nos vemos en el agua!</p>
  <div style="text-align: center;">
    <a href="${BASE_URL}/dashboard/certificates" class="button">DESCARGAR DIPLOMA</a>
  </div>
`);

/**
 * Confirmación de reserva de alquiler de material o embarcación.
 * 
 * @param serviceName - Tipo de equipo o barco alquilado.
 * @param date - Fecha de la reserva (formato DD/MM/AAAA recomendado).
 * @param time - Hora de inicio de la actividad.
 * @param name - Nombre del cliente.
 * @returns HTML del correo de confirmación de alquiler.
 */
export const rentalTemplate = (serviceName: string, date: string, time: string, name: string) => baseLayout(`
  <h1>Confirmación de Alquiler ⛵</h1>
  <p>Hola ${name},</p>
  <p>Tu reserva de <strong class="accent">${serviceName}</strong> ha sido confirmada.</p>
  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_COLOR};">
    <p style="margin: 0;"><strong>Fecha:</strong> ${date}</p>
    <p style="margin: 0;"><strong>Hora:</strong> ${time}</p>
  </div>
  <p>Recuerda estar en el punto de encuentro 15 minutos antes de la hora acordada.</p>
  <p>¡Disfruta de la navegación!</p>
  <div style="text-align: center;">
    <a href="${BASE_URL}/dashboard/rentals" class="button">VER MIS RESERVAS</a>
  </div>
`);

/**
 * Notificación interna para el equipo de la escuela cuando se recibe un nuevo mensaje de contacto.
 * 
 * @param data - Objeto con los datos del formulario (nombre, email, asunto, mensaje, telefono).
 * @returns HTML del correo de notificación técnica.
 */
export const contactNotificationTemplate = (data: {
  nombre: string,
  email: string,
  asunto: string,
  mensaje: string,
  telefono?: string
}) => baseLayout(`
  <h1>Nuevo Mensaje de Contacto ⚓</h1>
  <p>Se ha recibido una nueva consulta desde el formulario de la web.</p>
  
  <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>De:</strong> ${data.nombre} (${data.email})</p>
    ${data.telefono ? `<p style="margin: 5px 0;"><strong>Teléfono:</strong> ${data.telefono}</p>` : ''}
    <p style="margin: 5px 0;"><strong>Asunto:</strong> ${data.asunto}</p>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
    <p style="margin: 0; white-space: pre-wrap;">${data.mensaje}</p>
  </div>
  
  <p style="font-size: 11px; color: #94a3b8; text-align: center;">
    Este es un mensaje automático generado por el sistema de Getxo Sailing School.
  </p>
`);
