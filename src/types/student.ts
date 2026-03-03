export interface Course {
  id: string;
  nombre_es: string;
  nombre_eu?: string;
  slug?: string;
}

export interface CourseEdition {
  id: string;
  fecha_inicio: string;
  fecha_fin?: string;
  cursos?: Course;
}

export interface Inscripcion {
  id: string;
  edicion_id?: string;
  curso_id?: string;
  ediciones_curso?: CourseEdition;
  cursos?: Course;
  metadata?: {
    start_date: string;
    end_date?: string;
  };
  estado_pago?: string;
  fecha_reserva?: string;
}

export interface RentalService {
  id: string;
  nombre_es: string;
  nombre_eu?: string;
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
