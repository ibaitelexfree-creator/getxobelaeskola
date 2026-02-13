const fs = require('fs');
const path = require('path');

const esPath = path.join(__dirname, '../messages/es.json');
const data = JSON.parse(fs.readFileSync(esPath, 'utf8'));

// Traducir staff_panel completo
data.staff_panel = {
    "tabs": {
        "overview": "Resumen",
        "rentals": "Salidas",
        "courses": "Gestión Cursos",
        "academia": "Academia Online",
        "communication": "Comunicación",
        "staff_mgmt": "Gestión de Equipo"
    },
    "overview": {
        "title": "Panel de Gestión",
        "subtitle": "Control Administrativo Getxo Bela",
        "activity_log": "Bitácora de Actividad",
        "fleet_monitor": "Monitor Flota",
        "weather_note": "Nota Meteorológica",
        "wind_title": "Viento Hoy",
        "knots": "NUDOS",
        "loading_weather": "Cargando información meteorológica...",
        "stats": {
            "in_water": "Agua",
            "returned": "Retorno",
            "pending": "Pend.",
            "revenue_today": "Caja Hoy",
            "this_month": "Este Mes",
            "yearly": "Anual",
            "partners": "Socios",
            "students": "Alumnos",
            "students_water": "Alumnos Agua",
            "individuals": "Particulares",
            "tooltips": {
                "revenue_today": "Ingresos totales registrados durante el día de hoy.",
                "this_month": "Acumulado de ingresos en el mes natural actual.",
                "yearly": "Total de ingresos contabilizados en el último año.",
                "partners": "Número total de usuarios registrados con cuota de socio activa.",
                "students": "Alumnos totales registrados en la base de datos de la escuela.",
                "students_water": "Alumnos que tienen actualmente una reserva o actividad en el agua.",
                "individuals": "Clientes ocasionales o particulares sin vinculación de socio o alumno regular."
            }
        },
        "recent_ops": "Control de Operaciones",
        "today": "Hoy",
        "operator": "Operador",
        "subject": "Sujeto",
        "notice": "Aviso",
        "system": "SISTEMA",
        "rental": "ALQUILER",
        "service": "Servicio",
        "no_notes": "Sin observaciones",
        "no_activity": "Sin actividad reciente",
        "real_time_audit": "Auditoría en Tiempo Real",
        "sync_log": "Sincronizar Bitácora"
    },
    "rentals": {
        "title": "Control de Salidas",
        "active_departures": "Salidas Activas",
        "search_placeholder": "Buscar por cliente o equipo...",
        "fleet_scan": "Escaneo de Flota",
        "status_filter": {
            "all": "TODOS LOS ESTADOS",
            "pending": "PENDIENTE",
            "in_water": "EN EL AGUA",
            "finished": "FINALIZADOS"
        },
        "no_results": "No hay salidas que coincidan con los filtros.",
        "history_btn": "HISTORIAL ✍︎",
        "status": {
            "pending": "pendiente",
            "in_water": "entregado",
            "returned": "devuelto"
        },
        "status_modal": {
            "title": "Control de Flota",
            "change_to": "Cambiar a {status}",
            "note_placeholder": "Nota opcional...",
            "confirm": "Confirmar"
        }
    },
    "courses": {
        "title": "Académico",
        "subtitle": "Gestión de expedientes y alumnos",
        "search_placeholder": "Buscar por nombre o apellido...",
        "base_scan": "Escaneo de Base 🔍",
        "record": "EXPEDIENTE",
        "history": "Historial Académico",
        "no_history": "No hay registros en la bitácora académica.",
        "officer": "Oficial de Cargo",
        "close_log": "Cerrar Bitácora",
        "update_payment": "Actualizar Pago",
        "payment_modal": {
            "title": "Gestión Académica",
            "change_to": "Cambiar Pago a {status}",
            "reason_placeholder": "Razón del cambio...",
            "confirm": "Actualizar Estado"
        },
        "edit_profile": {
            "title": "Expediente Activo",
            "edit_btn": "Editar Datos",
            "cancel_btn": "Cancelar",
            "close_btn": "Cerrar",
            "name": "Nombre",
            "last_name": "Apellidos",
            "phone": "Teléfono",
            "save_btn": "Guardar Cambios ⚓",
            "saving": "Guardando...",
            "role": {
                "student": "Alumno",
                "partner": "Socio",
                "instructor": "Instructor",
                "admin": "Admin"
            }
        },
        "inscriptions_title": "Inscripciones y Cursos",
        "equipment_rental": "Reserva de Equipo",
        "delete_confirm": "¿Eliminar esta inscripción?",
        "delete_error": "Error al borrar",
        "delete_btn": "— Eliminar",
        "view_logbook": "Ver historial de cambios",
        "select_student_hint": "Selecciona un alumno para consultar sus inscripciones y material"
    },
    "communication": {
        "title": "Central de Comunicaciones",
        "subtitle": "Newsletter y Avisos a Alumnos",
        "new_message": "Redactar Nuevo Mensaje",
        "subject": "Asunto del Correo",
        "content": "Contenido del Mensaje",
        "schedule": "Programar Envío (Opcional)",
        "save_schedule": "GUARDAR Y PROGRAMAR ⚓",
        "processing": "PROCESANDO...",
        "history": "Historial de Comunicaciones",
        "messages_count": "Mensajes",
        "no_messages": "No hay comunicaciones registradas.",
        "scheduled_for": "PROGRAMADO PARA"
    },
    "staff_mgmt": {
        "title": "Gestión de Equipo",
        "subtitle": "Instructores y personal Getxo Bela",
        "search_placeholder": "Buscar instructor...",
        "team_scan": "Escaneo de Equipo",
        "instructors_list": "Instructores del Centro",
        "loading_staff": "Cargando lista de instructores...",
        "view_activity": "Ver Actividad",
        "edit_data": "Editar Datos",
        "remove_staff": "Dar de baja",
        "confirm_remove": "¿Estás seguro de que quieres dar de baja a {name}?",
        "loading": "Cargando lista de instructores...",
        "register_instructor": "Dar de Alta Instructor",
        "invite_staff_subtitle": "Invitar nuevo personal al panel de gestión",
        "invite_success": "Instructor invitado correctamente. Recibirá un email de acceso.",
        "error": "Error: ",
        "connection_error": "Error de conexión",
        "name_placeholder": "Nombre",
        "last_name_placeholder": "Apellidos",
        "phone_placeholder": "Teléfono",
        "email_placeholder": "Email profesional",
        "send_invitation": "Enviar Invitación de Acceso ⚓",
        "active_staff": "Plantilla Activa",
        "instructors_count": "Instructores",
        "filtered": "Filtrado",
        "search_instructor_placeholder": "Buscar instructor...",
        "team_label": "Equipo",
        "edit_modal": {
            "title": "Perfil de Staff",
            "edit_profile": "Editar Perfil",
            "id": "ID",
            "name": "Nombre",
            "last_name": "Apellidos",
            "email": "Email (Acceso)",
            "phone": "Teléfono",
            "discard": "Descartar",
            "apply_changes": "Aplicar Cambios ⚓",
            "saving": "Guardando..."
        }
    },
    "audit_editor": {
        "title": "Modificar Historial",
        "header": "Editor de Auditoría",
        "description": "Descripción del Evento",
        "target_id": "ID Objetivo",
        "target_type": "Tipo Objetivo",
        "metadata_json": "Metadata (JSON)",
        "cancel": "Cancelar",
        "update": "Actualizar Registro ⚓",
        "saving": "Guardando...",
        "edit_btn": "[ EDITAR ]"
    },
    "activity_page": {
        "back": "← Volver al Panel",
        "title": "Actividad de",
        "search_label": "Buscar Término",
        "search_placeholder": "Ej: Windsurf, entregado...",
        "from": "Desde",
        "to": "Hasta",
        "action_type": "Tipo de Acción",
        "status_rental": "Estado (Alquiler)",
        "sort_by": "Ordenar Por",
        "apply_btn": "EJECUTAR BÚSQUEDA 🔍",
        "results_found": "Resultados encontrados",
        "no_results": "No se han encontrado registros con esos criterios.",
        "clear_filters": "Limpiar Filtros",
        "responsible": "Responsable (Instructor)",
        "subject": "Sujeto (Cliente/Alumno)",
        "tech_ref": "Referencia Técnica",
        "process_metadata": "Metadata del Proceso:",
        "operator": "Operador",
        "ref_system": "SISTEMA",
        "ref_rental": "ALQUILER",
        "sort": {
            "newest": "MÁS RECIENTES ↓",
            "oldest": "MÁS ANTIGUOS ↑",
            "type_az": "TIPO (A-Z)",
            "type_za": "TIPO (Z-A)"
        },
        "status": {
            "all": "TODAS",
            "all_statuses": "TODOS LOS ESTADOS",
            "pending": "PENDIENTE",
            "delivered": "ENTREGADO",
            "returned": "DEVUELTO (COMPLETADO)"
        },
        "update_error": "Error al actualizar el registro",
        "connection_error": "Error de conexión"
    },
    "financials": {
        "today": "Hoy",
        "month": "Este Mes",
        "year": "Anual",
        "from": "Desde",
        "to": "Hasta",
        "total_revenue": "Total Ingresos",
        "chart_title": "Gráfica de Rendimiento",
        "download_report": "Descargar Reporte Completo",
        "loading_chart": "Cargando gráfica...",
        "no_data": "No hay datos para el periodo seleccionado ({count} registros totales)",
        "initializing": "Inicializando filtros...",
        "trans_details": "Detalle de Transacciones",
        "date": "Fecha",
        "client": "Cliente",
        "service": "Servicio",
        "status_payment": "Estado Pago",
        "amount": "Monto",
        "total_sum": "Suma Total",
        "no_records": "No se han encontrado registros.",
        "various": "Varios",
        "reporting_scan": "Análisis Financiero"
    },
    "academia": {
        "title": "Academia Online",
        "subtitle": "Seguimiento de progreso y certificaciones",
        "search_student": "Buscar alumno para ver expediente...",
        "academic_progress": "Progreso Académico",
        "skills": "Habilidades Obtenidas",
        "logros": "Logros y Medallas",
        "certificates": "Certificaciones Emitidas",
        "no_data": "Selecciona un alumno para cargar su expediente académico.",
        "unidades_leidas": "Lecciones Completadas",
        "quizzes_aprobados": "Quizzes Superados",
        "download_certificate": "Descargar PDF",
        "no_certificates": "Sin certificados emitidos.",
        "progress_details": "Detalle de Avance",
        "no_records": "Sin actividad registrada aún."
    }
};

// Traducir academy completo
data.academy = {
    "title": "Academia Digital",
    "subtitle": "Tu viaje de formación náutica",
    "loading": "Cargando Academia...",
    "map": {
        "eyebrow": "Escuela Náutica Digital",
        "title_prefix": "Tu Viaje de",
        "title_highlight": "Formación",
        "description": "Navega por los 7 niveles de formación náutica. Cada nivel te prepara para el siguiente, desde marinero principiante hasta capitán experimentado.",
        "theory_hours": "h teoría",
        "practice_hours": "h práctica",
        "view_courses": "Ver Cursos →",
        "transversal": "Transversal"
    },
    "status": {
        "completed": "✓ Completado",
        "in_progress": "En Progreso",
        "locked": "🔒 Bloqueado",
        "available": "Disponible"
    },
    "levels": {
        "level": "Nivel"
    },
    "access_denied": {
        "title": "Travesía Interrumpida",
        "subtitle": "No tienes permiso para navegar esta sección",
        "reason_parent_locked": "Esta sección está bloqueada porque el nivel, curso o módulo superior aún no ha sido desbloqueado.",
        "reason_insufficient_progress": "Debes completar los requisitos anteriores y alcanzar el nivel de experiencia necesario.",
        "back_to_dashboard": "Volver al Dashboard",
        "view_requirements": "Ver Requisitos de Desbloqueo"
    }
};

// Escribir de vuelta
fs.writeFileSync(esPath, JSON.stringify(data, null, 4), 'utf8');

console.log('✅ Secciones staff_panel y academy traducidas completamente al español');
console.log('📊 Total de subsecciones en staff_panel:', Object.keys(data.staff_panel).length);
console.log('📊 Total de subsecciones en academy:', Object.keys(data.academy).length);
