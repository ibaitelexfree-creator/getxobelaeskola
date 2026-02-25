export interface Course {
  id: string;
  nombre_es: string;
  nombre_eu?: string;
  nombre_en?: string;
  nombre_fr?: string;
  slug?: string;
  descripcion_es?: string;
  descripcion_eu?: string;
  descripcion_en?: string;
  descripcion_fr?: string;
  precio?: number;
  duracion_h?: number;
  nivel?: string;
  imagen_url?: string;
  detalles?: {
    es?: string[];
    eu?: string[];
    en?: string[];
    fr?: string[];
    [key: string]: any;
  };
}

export interface CourseEdition {
  id: string;
  fecha_inicio: string;
  fecha_fin?: string;
  plazas_totales?: number;
  plazas_ocupadas?: number;
  created_at?: string;
  curso_id?: string;
  cursos?: Course;
}

export interface Inscripcion {
  id: string;
  perfil_id?: string;
  edicion_id?: string;
  curso_id?: string;
  ediciones_curso?: CourseEdition;
  cursos?: Course;
  monto_total?: number;
  stripe_session_id?: string;
  metadata?: {
    start_date: string;
    end_date?: string;
    [key: string]: any;
  };
  estado_pago?: string;
  fecha_reserva?: string;
  created_at?: string;
}

export interface RentalService {
  id: string;
  nombre_es?: string;
  nombre_eu?: string;
  nombre_en?: string;
  nombre_fr?: string;
  nombre?: string;
  descripcion_es?: string;
  descripcion_eu?: string;
  descripcion_en?: string;
  descripcion_fr?: string;
  descripcion?: string;
  imagen_url?: string;
  precio_base?: number;
  precio_hora?: number;
  slug?: string;
  activo?: boolean;
  categoria?: string;
  opciones?: { label?: string; extra: number;[key: string]: any }[];
}

export interface Rental {
  id: string;
  fecha_reserva: string;
  hora_inicio?: string;
  servicios_alquiler?: RentalService;
  estado_pago?: string;
}

export interface Profile {
  id: string;
  nombre: string;
  apellidos?: string;
  telefono?: string;
  rol?: string;
  status_socio?: string;
  dni?: string;
  xp?: number;
  total_xp?: number;
}

export interface AcademyStats {
  totalMiles: number;
  academyLevels: number;
  academyCerts: number;
  totalHours: number;
  hasAcademyActivity: boolean;
}
