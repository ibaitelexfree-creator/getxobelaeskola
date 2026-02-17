/**
 * Plantillas de correo premium con diseño náutico.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://getxobelaeskola.cloud' : 'http://localhost:3000');
const LOGO_URL = `${BASE_URL}/images/LogoGetxoBelaEskola.png`;
const BRAND_COLOR = '#38bdf8'; // Sky 400
const SECONDARY_COLOR = '#0ea5e9'; // Sky 500
const DARK_NAVY = '#0f172a'; // Slate 900
const LIGHT_BG = '#f8fafc'; // Slate 50

type EmailLocale = 'es' | 'en' | 'eu' | 'fr';

const translations = {
  es: {
    welcome_title: '¡Bienvenido a bordo, {name}! ⛵',
    welcome_p1: 'Es un auténtico placer darte la bienvenida a nuestra tripulación. Has dado el primer paso oficial para convertirte en un experto navegante con la <strong>Getxo Sailing School</strong>.',
    welcome_p2: 'Tu cuenta ha sido creada con éxito. Ya puedes acceder a nuestra Academia Online para empezar a explorar los cursos, niveles y material teórico disponible.',
    welcome_button: 'IR A LA ACADEMIA',
    welcome_footer: '¿Tienes alguna duda inicial? Estamos aquí para ayudarte. Simplemente responde a este correo o visítanos en el puerto.',
    welcome_signoff: 'Viento en popa y buena travesía.',
    inscription_title: 'Confirmación de Inscripción ⚓',
    inscription_p1: 'Hola {name},',
    inscription_p2: 'Tu inscripción al curso <strong>{courseName}</strong> ha sido procesada correctamente. ¡Ya formas parte de esta nueva promoción!',
    inscription_selected: 'Curso seleccionado',
    inscription_p3: 'Estamos preparando todo para tu formación. En los próximos días recibirás más detalles sobre el calendario de sesiones prácticas y el material necesario.',
    inscription_p4: 'Puedes empezar a revisar el contenido teórico ya mismo desde tu área personal.',
    inscription_button: 'MI ÁREA PERSONAL',
    inscription_footer: '¡Nos vemos muy pronto en el agua!',
    certificate_congrats: '🏆 ¡Enhorabuena, Capitán!',
    certificate_p1: 'Hola {name},',
    certificate_p2: 'Has completado satisfactoriamente toda la formación de <strong>{courseName}</strong>.',
    certificate_p3: 'Este es un gran hito en tu carrera náutica. Ya puedes descargar tu certificado oficial en formato digital desde tu perfil.',
    certificate_button: 'DESCARGAR DIPLOMA',
    certificate_p4: 'Tu esfuerzo tiene recompensa. ¡Sigue navegando hacia tus metas!',
    rental_title: 'Confirmación de Alquiler ⛵',
    rental_p1: 'Hola {name},',
    rental_p2: 'Tu reserva de <strong>{serviceName}</strong> ha sido confirmada y el equipo estará listo para ti.',
    rental_item: 'Material / Barco',
    rental_date: 'Fecha',
    rental_time: 'Hora de Inicio',
    rental_important: 'Información Importante:',
    rental_note1: 'Por favor, llega al Puerto Deportivo 15 minutos antes de la hora acordada.',
    rental_note2: 'No olvides traer calzado adecuado (suela blanca o náuticos) y protección solar.',
    rental_note3: 'La actividad está sujeta a las condiciones meteorológicas por seguridad.',
    rental_button: 'VER MIS RESERVAS',
    rental_footer: '¡Disfruta de la navegación!',
    membership_title: '¡Ya eres Socio de Getxo Sailing School! 🎖️',
    membership_p1: 'Hola {name},',
    membership_p2: 'Es un orgullo para nosotros que pases a formar parte de nuestra comunidad de socios. A partir de ahora tienes acceso a todos los privilegios exclusivos:',
    membership_item1: 'Descuentos exclusivos en alquileres de material.',
    membership_item2: 'Tarifas especiales en cursos y formaciones.',
    membership_item3: 'Acceso prioritario a eventos y regatas de la escuela.',
    membership_item4: 'Uso de instalaciones y vestuarios.',
    membership_p3: 'Ya puedes ver tu estado de socio actualizado en tu perfil.',
    membership_button: 'IR A MI ÁREA SOCIO',
    membership_footer: '¡Gracias por confiar en nosotros para tu aventura náutica!',
    footer_copy: '&copy; {year} <strong>Getxo Sailing School</strong>',
    footer_address: 'Puerto Deportivo de Getxo, Bizkaia.',
    footer_unsubscribe: 'Estás recibiendo este correo porque has realizado una actividad con nosotros. Si no deseas recibir más correos, puedes gestionar tus preferencias en tu perfil.',
    contact_title: 'Nuevo Mensaje de Contacto ⚓',
    contact_p1: 'Se ha recibido una nueva consulta desde el formulario de la web.',
    contact_from: 'De:',
    contact_phone: 'Teléfono:',
    contact_subject: 'Asunto:',
    contact_button: 'RESPONDER DIRECTAMENTE',
    contact_footer: 'Este es un mensaje automático generado por el sistema de gestión de Getxo Sailing School.'
  },
  en: {
    welcome_title: 'Welcome aboard, {name}! ⛵',
    welcome_p1: 'It is a real pleasure to welcome you to our crew. You have taken the first official step to becoming an expert sailor with <strong>Getxo Sailing School</strong>.',
    welcome_p2: 'Your account has been successfully created. You can now access our Online Academy to start exploring the courses, levels, and theoretical material available.',
    welcome_button: 'GO TO THE ACADEMY',
    welcome_footer: 'Do you have any initial questions? We are here to help. Simply reply to this email or visit us at the port.',
    welcome_signoff: 'Fair winds and following seas.',
    inscription_title: 'Enrollment Confirmation ⚓',
    inscription_p1: 'Hello {name},',
    inscription_p2: 'Your enrollment in the course <strong>{courseName}</strong> has been successfully processed. You are now part of this new promotion!',
    inscription_selected: 'Selected course',
    inscription_p3: 'We are preparing everything for your training. In the coming days, you will receive more details about the schedule of practical sessions and the necessary material.',
    inscription_p4: 'You can start reviewing the theoretical content right now from your personal area.',
    inscription_button: 'MY PERSONAL AREA',
    inscription_footer: 'See you very soon on the water!',
    certificate_congrats: '🏆 Congratulations, Captain!',
    certificate_p1: 'Hello {name},',
    certificate_p2: 'You have successfully completed all the training for <strong>{courseName}</strong>.',
    certificate_p3: 'This is a great milestone in your nautical career. You can now download your official digital certificate from your profile.',
    certificate_button: 'DOWNLOAD DIPLOMA',
    certificate_p4: 'Your effort has its reward. Keep sailing towards your goals!',
    rental_title: 'Rental Confirmation ⛵',
    rental_p1: 'Hello {name},',
    rental_p2: 'Your reservation for <strong>{serviceName}</strong> has been confirmed, and the team will be ready for you.',
    rental_item: 'Equipment / Boat',
    rental_date: 'Date',
    rental_time: 'Start Time',
    rental_important: 'Important Information:',
    rental_note1: 'Please arrive at the Marina 15 minutes before the agreed time.',
    rental_note2: 'Don\'t forget to bring suitable footwear (white soles or deck shoes) and sunscreen.',
    rental_note3: 'The activity is subject to weather conditions for safety.',
    rental_button: 'VIEW MY BOOKINGS',
    rental_footer: 'Enjoy your sailing!',
    membership_title: 'You are now a Member of Getxo Sailing School! 🎖️',
    membership_p1: 'Hello {name},',
    membership_p2: 'We are proud to have you as part of our community of members. You now have access to all exclusive privileges:',
    membership_item1: 'Exclusive discounts on equipment rentals.',
    membership_item2: 'Special rates on courses and training.',
    membership_item3: 'Priority access to school events and regattas.',
    membership_item4: 'Use of facilities and locker rooms.',
    membership_p3: 'You can already see your updated member status in your profile.',
    membership_button: 'GO TO MY MEMBER AREA',
    membership_footer: 'Thank you for trusting us for your nautical adventure!',
    footer_copy: '&copy; {year} <strong>Getxo Sailing School</strong>',
    footer_address: 'Getxo Marina, Biscay.',
    footer_unsubscribe: 'You are receiving this email because you have performed an activity with us. If you do not wish to receive more emails, you can manage your preferences in your profile.',
    contact_title: 'New Contact Message ⚓',
    contact_p1: 'A new inquiry has been received from the website form.',
    contact_from: 'From:',
    contact_phone: 'Phone:',
    contact_subject: 'Subject:',
    contact_button: 'REPLY DIRECTLY',
    contact_footer: 'This is an automatic message generated by the Getxo Sailing School management system.'
  },
  fr: {
    welcome_title: 'Bienvenue à bord, {name} ! ⛵',
    welcome_p1: 'C\'est un réel plaisir de vous accueillir dans notre équipage. Vous avez fait le premier pas officiel pour devenir un marin expert avec la <strong>Getxo Sailing School</strong>.',
    welcome_p2: 'Votre compte a été créé avec succès. Vous pouvez désormais accéder à notre Académie en ligne pour commencer à explorer les cours, les niveaux et le matériel théorique disponible.',
    welcome_button: 'ALLER À L\'ACADÉMIE',
    welcome_footer: 'Avez-vous des questions initiales ? Nous sommes là pour vous aider. Répondez simplement à cet e-mail ou rendez-nous visite au port.',
    welcome_signoff: 'Bon vent et bonne navigation.',
    inscription_title: 'Confirmation d\'inscription ⚓',
    inscription_p1: 'Bonjour {name},',
    inscription_p2: 'Votre inscription au cours <strong>{courseName}</strong> a été traitée avec succès. Vous faites désormais partie de cette nouvelle promotion !',
    inscription_selected: 'Cours sélectionné',
    inscription_p3: 'Nous préparons tout pour votre formation. Dans les prochains jours, vous recevrez plus de détails sur le calendrier des sessions pratiques et le matériel nécessaire.',
    inscription_p4: 'Vous pouvez commencer à réviser le contenu théorique dès maintenant depuis votre espace personnel.',
    inscription_button: 'MON ESPACE PERSONNEL',
    inscription_footer: 'À très bientôt sur l\'eau !',
    certificate_congrats: '🏆 Félicitations, Capitaine !',
    certificate_p1: 'Bonjour {name},',
    certificate_p2: 'Vous avez terminé avec succès toute la formation de <strong>{courseName}</strong>.',
    certificate_p3: 'C\'est une étape importante dans votre carrière nautique. Vous pouvez désormais télécharger votre certificat numérique officiel depuis votre profil.',
    certificate_button: 'TÉLÉCHARGER LE DIPLÔME',
    certificate_p4: 'Votre effort est récompensé. Continuez à naviguer vers vos objectifs !',
    rental_title: 'Confirmation de location ⛵',
    rental_p1: 'Bonjour {name},',
    rental_p2: 'Votre réservation de <strong>{serviceName}</strong> a été confirmée et l\'équipe sera prête pour vous.',
    rental_item: 'Matériel / Bateau',
    rental_date: 'Date',
    rental_time: 'Heure de début',
    rental_important: 'Informations importantes :',
    rental_note1: 'Veuillez arriver au port de plaisance 15 minutes avant l\'heure convenue.',
    rental_note2: 'N\'oubliez pas d\'apporter des chaussures adaptées (semelles blanches ou chaussures de pont) et de la crème solaire.',
    rental_note3: 'L\'activité est soumise aux conditions météorologiques pour votre sécurité.',
    rental_button: 'VOIR MES RÉSERVATIONS',
    rental_footer: 'Bonne navigation !',
    membership_title: 'Vous êtes maintenant membre de Getxo Sailing School ! 🎖️',
    membership_p1: 'Bonjour {name},',
    membership_p2: 'Nous sommes fiers de vous compter parmi notre communauté de membres. Vous avez désormais accès à tous les privilèges exclusifs :',
    membership_item1: 'Remises exclusives sur la location de matériel.',
    membership_item2: 'Tarifs spéciaux sur les cours et formations.',
    membership_item3: 'Accès prioritaire aux événements et régates de l\'école.',
    membership_item4: 'Utilisation des installations et des vestiaires.',
    membership_p3: 'Vous pouvez déjà voir votre statut de membre mis à jour dans votre profil.',
    membership_button: 'ALLER À MON ESPACE MEMBRE',
    membership_footer: 'Merci de nous faire confiance pour votre aventure nautique !',
    footer_copy: '&copy; {year} <strong>Getxo Sailing School</strong>',
    footer_address: 'Port de plaisance de Getxo, Biscaye.',
    footer_unsubscribe: 'Vous recevez cet e-mail parce que vous avez effectué une activité avec nous. Si vous ne souhaitez plus recevoir d\'e-mails, vous pouvez gérer vos préférences dans votre profil.',
    contact_title: 'Nouveau message de contact ⚓',
    contact_p1: 'Une nouvelle demande a été reçue via le formulaire du site web.',
    contact_from: 'De :',
    contact_phone: 'Téléphone :',
    contact_subject: 'Sujet :',
    contact_button: 'RÉPONDRE DIRECTEMENT',
    contact_footer: 'Ceci est un message automatique généré par le système de gestion de Getxo Sailing School.'
  },
  eu: {
    welcome_title: 'Ongi etorri ontziratuta, {name}! ⛵',
    welcome_p1: 'Plazer handia da gure eskifaira ongi etorria ematea. Getxo Bela Eskolarekin nabigatzaile aditua izateko lehen urrats ofiziala eman duzu.',
    welcome_p2: 'Zure kontua ondo sortu da. Dagoeneko gure Online Akademian sar zaitezke ikastaroak, mailak eta eskuragarri dagoen material teorikoa arakatzen hasteko.',
    welcome_button: 'JOAN AKADEMIARA',
    welcome_footer: 'Hasierako zalantzarik al duzu? Hemen gaude laguntzeko. Mezua erantzun besterik ez duzu edo etorri portura.',
    welcome_signoff: 'Haize on eta nabigazio ona.',
    inscription_title: 'Izen-ematearen Baieztapena ⚓',
    inscription_p1: 'Kaixo {name},',
    inscription_p2: 'Zure izen-ematea <strong>{courseName}</strong> ikastaroan ondo prozesatu da. Dagoeneko promozio berri honen parte zara!',
    inscription_selected: 'Hautatutako ikastaroa',
    inscription_p3: 'Dena prestatzen ari gara zure prestakuntzarako. Hurrengo egunetan saio praktikoen egutegiari eta beharrezko materialari buruzko xehetasun gehiago jasoko dituzu.',
    inscription_p4: 'Dagoeneko eduki teorikoa berrikusten has zaitezke zure eremu pertsonaletik.',
    inscription_button: 'NIRE EREMU PERTSONALA',
    inscription_footer: 'Laster arte uretan!',
    certificate_congrats: '🏆 Zorionak, Kapitaina!',
    certificate_p1: 'Kaixo {name},',
    certificate_p2: '<strong>{courseName}</strong> prestakuntza guztia ondo osatu duzu.',
    certificate_p3: 'Mugarri handia da hau zure itsas ibilbidean. Dagoeneko zure ziurtagiri ofiziala formatu digitalean deskarga dezakezu zure profiletik.',
    certificate_button: 'DESKARGATU DIPLOMA',
    certificate_p4: 'Zure ahaleginak saria du. Jarraitu zure helburuetara nabigatzen!',
    rental_title: 'Alokairuaren Baieztapena ⛵',
    rental_p1: 'Kaixo {name},',
    rental_p2: 'Zure <strong>{serviceName}</strong> erreserba baieztatu da eta taldea prest egongo da zuretzat.',
    rental_item: 'Materiala / Ontzia',
    rental_date: 'Data',
    rental_time: 'Hasiera Ordua',
    rental_important: 'Informazio Garrantzitsua:',
    rental_note1: 'Mesedez, iritsi Getxoko Kirol Portura adostutako ordua baino 15 minutu lehenago.',
    rental_note2: 'Ez ahaztu oinetako egokiak (zola zuria edo nautikoak) eta eguzki-babesa ekartea.',
    rental_note3: 'Segurtasunagatik, jarduera baldintza meteorologikoen mende dago.',
    rental_button: 'IKUSI NIRE ERRESERBAK',
    rental_footer: 'Gozatu nabigazioaz!',
    membership_title: 'Dagoeneko Getxo Bela Eskolako Bazkidea zara! 🎖️',
    membership_p1: 'Kaixo {name},',
    membership_p2: 'Harrotasuna da guretzat gure bazkide komunitatearen parte izatea. Hemendik aurrera pribilegio esklusibo guztietarako sarbidea duzu:',
    membership_item1: 'Deskontu esklusiboak material alokairuetan.',
    membership_item2: 'Tarifa bereziak ikastaroetan eta prestakuntzetan.',
    membership_item3: 'Lehentasunezko sarbidea eskolako ekitaldi eta estropadetara.',
    membership_item4: 'Instalazioak eta aldagelak erabiltzeko aukera.',
    membership_p3: 'Dagoeneko ikus dezakezu zure bazkide egoera eguneratuta zure profilean.',
    membership_button: 'JOAN NIRE BAZKIDE EREMURA',
    membership_footer: 'Eskerrik asko guregan konfiantza izateagatik zure itsas abenturarako!',
    footer_copy: '&copy; {year} <strong>Getxo Bela Eskola</strong>',
    footer_address: 'Getxoko Kirol Portua, Bizkaia.',
    footer_unsubscribe: 'Mezu hau jasotzen ari zara gurekin jardueraren bat egin duzulako. Mezu gehiago jaso nahi ez baduzu, zure hobespenak kudea ditzakezu zure profilean.',
    contact_title: 'Harremanetarako Mezu Berria ⚓',
    contact_p1: 'Webguneko formulariotik kontsulta berri bat jaso da.',
    contact_from: 'Norena:',
    contact_phone: 'Telefonoa:',
    contact_subject: 'Gaia:',
    contact_button: 'ERANTZUN ZUZENEAN',
    contact_footer: 'Hau Getxo Bela Eskolako kudeaketa sistemak sortutako mezu automatikoa da.'
  }
};

/**
 * Estructura base para todos los correos electrónicos de la escuela.
 */
const baseLayout = (content: string, locale: EmailLocale = 'es') => {
  const t = translations[locale] || translations.es;
  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding-bottom: 40px; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .header { background-color: ${DARK_NAVY}; padding: 40px 20px; text-align: center; border-bottom: 4px solid ${BRAND_COLOR}; background-image: linear-gradient(to bottom right, ${DARK_NAVY}, #1e293b); }
    .header img { max-width: 200px; height: auto; }
    .content { padding: 40px 30px; color: #334155; line-height: 1.8; font-size: 16px; }
    .footer { background-color: #f8fafc; padding: 30px 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .button { display: inline-block; padding: 16px 32px; background-color: ${SECONDARY_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 30px 0; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3); }
    h1 { color: ${DARK_NAVY}; margin-top: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
    .accent { color: ${SECONDARY_COLOR}; font-weight: 700; }
    .card { background-color: ${LIGHT_BG}; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .divider { height: 1px; background-color: #e2e8f0; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${LOGO_URL}" alt="Getxo Sailing School">
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p style="margin-bottom: 10px;">${t.footer_copy.replace('{year}', new Date().getFullYear().toString())}</p>
        <p style="margin-bottom: 5px;">${t.footer_address}</p>
        <p style="font-size: 11px; margin-top: 15px;">${t.footer_unsubscribe}</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Plantilla de bienvenida para nuevos usuarios registrados.
 */
export const welcomeTemplate = (name: string, locale: EmailLocale = 'es') => {
  const t = translations[locale] || translations.es;
  return baseLayout(`
  <h1>${t.welcome_title.replace('{name}', `<span class="accent">${name}</span>`)}</h1>
  <p>${t.welcome_p1}</p>
  <p>${t.welcome_p2}</p>
  <div style="text-align: center;">
    <a href="${BASE_URL}/academy" class="button">${t.welcome_button}</a>
  </div>
  <div class="divider"></div>
  <p style="font-size: 14px; color: #64748b;">${t.welcome_footer}</p>
  <p>${t.welcome_signoff}</p>
`, locale);
};

/**
 * Confirmación de inscripción a un curso presencial u online.
 */
export const inscriptionTemplate = (courseName: string, name: string, locale: EmailLocale = 'es') => {
  const t = translations[locale] || translations.es;
  return baseLayout(`
  <h1>${t.inscription_title}</h1>
  <p>${t.inscription_p1.replace('{name}', `<span class="accent">${name}</span>`)}</p>
  <p>${t.inscription_p2.replace('{courseName}', courseName)}</p>
  <div class="card">
    <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">${t.inscription_selected}</p>
    <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: 700; color: ${DARK_NAVY};">${courseName}</p>
  </div>
  <p>${t.inscription_p3}</p>
  <p>${t.inscription_p4}</p>
  <div style="text-align: center;">
    <a href="${BASE_URL}/dashboard" class="button">${t.inscription_button}</a>
  </div>
  <p>${t.inscription_footer}</p>
`, locale);
};

/**
 * Notificación de obtención de certificado tras completar un curso.
 */
export const certificateTemplate = (courseName: string, name: string, certificateId?: string, locale: EmailLocale = 'es') => {
  const t = translations[locale] || translations.es;
  const downloadUrl = certificateId ? `${BASE_URL}/academy/certificates/${certificateId}` : `${BASE_URL}/student/dashboard/certificates`;

  return baseLayout(`
  <div style="text-align: center; padding: 20px 0;">
    <div style="font-size: 60px; margin-bottom: 20px;">🏆</div>
    <h1 style="font-size: 32px; color: ${DARK_NAVY};">${t.certificate_congrats}</h1>
    <p style="font-size: 18px; color: #475569;">${t.certificate_p1.replace('{name}', `<span class="accent">${name}</span>`)}</p>
    <p style="font-size: 16px;">${t.certificate_p2.replace('{courseName}', `<strong>${courseName}</strong>`)}</p>
  </div>
  
  <div class="card" style="text-align: center; border: 2px solid #fbbf24; background-color: #fffbeb; border-radius: 16px;">
    <p style="color: #92400e; font-weight: 600;">${t.certificate_p3}</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${downloadUrl}" class="button" style="background-color: ${DARK_NAVY}; padding: 18px 36px; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.4);">${t.certificate_button}</a>
    </div>
    <p style="font-size: 12px; color: #b45309;">ID Verificación: ${certificateId || 'PENDIENTE'}</p>
  </div>
  
  <div style="margin-top: 40px; text-align: center;">
    <p style="color: #64748b;">${t.certificate_p4}</p>
    <div style="margin-top: 20px;">
        <img src="${LOGO_URL}" alt="Getxo Sailing School" style="width: 120px; opacity: 0.8;">
        <p style="font-size: 14px; color: #94a3b8; margin-top: 5px;">Academy Division</p>
    </div>
  </div>
`, locale);
};

/**
 * Confirmación de reserva de alquiler de material o embarcación.
 */
export const rentalTemplate = (serviceName: string, date: string, time: string, name: string, locale: EmailLocale = 'es') => {
  const t = translations[locale] || translations.es;
  return baseLayout(`
  <h1>${t.rental_title}</h1>
  <p>${t.rental_p1.replace('{name}', `<span class="accent">${name}</span>`)}</p>
  <p>${t.rental_p2.replace('{serviceName}', serviceName)}</p>
  <div class="card" style="border-left: 6px solid ${SECONDARY_COLOR};">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding: 10px 0;">
          <strong style="color: #64748b; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">${t.rental_item}</strong><br>
          <span style="font-size: 18px; font-weight: 700; color: ${DARK_NAVY};">${serviceName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0;">
          <strong style="color: #64748b; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">${t.rental_date}</strong><br>
          <span style="font-size: 18px; font-weight: 700; color: ${DARK_NAVY};">${date}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0;">
          <strong style="color: #64748b; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">${t.rental_time}</strong><br>
          <span style="font-size: 18px; font-weight: 700; color: ${DARK_NAVY};">${time}</span>
        </td>
      </tr>
    </table>
  </div>
  <p><strong>${t.rental_important}</strong></p>
  <ul style="padding-left: 20px;">
    <li>${t.rental_note1}</li>
    <li>${t.rental_note2}</li>
    <li>${t.rental_note3}</li>
  </ul>
  <div style="text-align: center;">
    <a href="${BASE_URL}/dashboard/rentals" class="button">${t.rental_button}</a>
  </div>
  <p>${t.rental_footer}</p>
`, locale);
};

/**
 * Confirmación de suscripción a la membresía de socio.
 */
export const membershipTemplate = (name: string, locale: EmailLocale = 'es') => {
  const t = translations[locale] || translations.es;
  return baseLayout(`
  <h1>${t.membership_title}</h1>
  <p>${t.membership_p1.replace('{name}', `<span class="accent">${name}</span>`)}</p>
  <p>${t.membership_p2}</p>
  <div class="card">
    <ul style="margin: 0; padding-left: 20px;">
      <li>${t.membership_item1}</li>
      <li>${t.membership_item2}</li>
      <li>${t.membership_item3}</li>
      <li>${t.membership_item4}</li>
    </ul>
  </div>
  <p>${t.membership_p3}</p>
  <div style="text-align: center;">
    <a href="${BASE_URL}/dashboard" class="button">${t.membership_button}</a>
  </div>
  <p>${t.membership_footer}</p>
`, locale);
};

/**
 * Notificación interna para el equipo de la escuela cuando se recibe un nuevo mensaje de contacto.
 */
export const contactNotificationTemplate = (data: {
  nombre: string,
  email: string,
  asunto: string,
  mensaje: string,
  telefono?: string
}, locale: EmailLocale = 'es') => {
  const t = translations[locale] || translations.es;
  return baseLayout(`
  <h1>${t.contact_title}</h1>
  <p>${t.contact_p1}</p>
  
  <div class="card">
    <p style="margin: 5px 0;"><strong>${t.contact_from}</strong> ${data.nombre} (<a href="mailto:${data.email}" style="color: ${SECONDARY_COLOR};">${data.email}</a>)</p>
    ${data.telefono ? `<p style="margin: 5px 0;"><strong>${t.contact_phone}</strong> ${data.telefono}</p>` : ''}
    <p style="margin: 5px 0;"><strong>${t.contact_subject}</strong> ${data.asunto}</p>
    <div class="divider"></div>
    <p style="margin: 0; white-space: pre-wrap; color: ${DARK_NAVY}; font-style: italic;">"${data.mensaje}"</p>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <a href="mailto:${data.email}" class="button" style="background-color: ${DARK_NAVY}; font-size: 12px; padding: 12px 24px;">${t.contact_button}</a>
  </div>
  
  <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px;">
    ${t.contact_footer}
  </p>
`, locale);
};
/**
 * Notificación interna para el equipo cuando hay una nueva venta o reserva.
 */
export const internalOrderNotificationTemplate = (type: 'rental' | 'course' | 'membership', details: any) => baseLayout(`
  <h1>Nueva Venta Detectada ⚓</h1>
  <p>Se ha procesado una nueva transacción exitosa en la plataforma.</p>
  
  <div class="card">
    <p style="margin: 5px 0;"><strong>Tipo:</strong> ${type.toUpperCase()}</p>
    <p style="margin: 5px 0;"><strong>Cliente:</strong> ${details.userName || 'N/A'}</p>
    <p style="margin: 5px 0;"><strong>Item:</strong> ${details.itemName || 'N/A'}</p>
    <p style="margin: 5px 0;"><strong>Monto:</strong> ${details.amount}€</p>
    <div class="divider"></div>
    ${details.date ? `<p style="margin: 5px 0;"><strong>Fecha Actividad:</strong> ${details.date}</p>` : ''}
    ${details.time ? `<p style="margin: 5px 0;"><strong>Hora:</strong> ${details.time}</p>` : ''}
    <p style="margin: 5px 0; font-size: 12px; color: #64748b;">ID Transacción: ${details.sessionId}</p>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <a href="${BASE_URL}/es/staff" class="button" style="background-color: ${DARK_NAVY};">ABRIR PANEL ADMINISTRATIVO</a>
  </div>
`, 'es');
