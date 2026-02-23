
export interface Course {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    nombre_en?: string;
    nombre_fr?: string;
    descripcion_es?: string;
    descripcion_eu?: string;
    descripcion_en?: string;
    descripcion_fr?: string;
    precio: number;
    duracion_h: number;
    nivel: string;
    imagen_url: string | null;
    activo: boolean;
    visible?: boolean;
    stripe_product_id?: string | null;
    detalles?: {
        es: string[];
        eu: string[];
    };
    created_at?: string;
}

export interface CourseEdition {
    id: string;
    curso_id: string;
    fecha_inicio: string;
    fecha_fin: string;
    plazas_totales: number;
    plazas_ocupadas: number;
    created_at?: string;
    cursos?: Course;
}

export interface Inscription {
    id?: string;
    perfil_id: string;
    curso_id: string;
    edicion_id: string | null;
    estado_pago: 'pendiente' | 'pagado' | 'cancelado' | string;
    monto_total: number;
    stripe_session_id: string;
    metadata?: {
        start_date?: string;
        end_date?: string;
        [key: string]: any;
    };
    created_at?: string;
}
