export interface StaffProfile {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
    rol: string;
    telefono?: string;
    created_at?: string;
    [key: string]: any;
}

export interface Rental {
    id: string;
    perfil_id: string;
    fecha_reserva: string;
    hora_inicio: string;
    monto_total: number;
    estado_entrega: string;
    profiles?: StaffProfile;
    servicios_alquiler?: {
        nombre_es: string;
    };
    log_seguimiento?: {
        timestamp: string;
        status: string;
        note: string;
        staff: string;
    }[];
}

export interface AuditLog {
    id: string;
    staff_id: string;
    target_id: string;
    target_type: string;
    action_type: string;
    description: string;
    metadata?: Record<string, unknown>;
    created_at: string;
}

export interface StaffStats {
    todayRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    studentCount: number;
    socioCount: number;
    studentRentersCount: number;
    nonStudentRentersCount: number;
}

export interface Newsletter {
    id: string;
    title: string;
    content: string;
    status: string;
    created_at: string;
    scheduled_for?: string;
    sent_at?: string;
    recipients_count?: number;
}

export interface Inscription {
    id: string;
    perfil_id: string;
    curso_id?: string;
    edicion_id?: string;
    estado_pago: string;
    created_at: string;
    log_seguimiento?: {
        timestamp: string;
        status: string;
        note: string;
        staff: string;
    }[];
    cursos?: {
        nombre_es: string;
        nombre_eu: string;
    } | null;
    ediciones_curso?: {
        id: string;
        fecha_inicio: string;
        cursos?: {
            nombre_es: string;
            nombre_eu: string;
        } | null;
    } | null;
}
