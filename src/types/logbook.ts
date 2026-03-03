
export interface LogbookEntry {
  id: string;
  alumno_id: string;
  fecha: string; // TIMESTAMPTZ
  contenido: string; // Description/Observaciones fallback? Or main content?
  estado_animo: 'confident' | 'challenging' | 'discovery';
  tags: string[]; // Generic tags

  // New nautical fields
  puerto_salida?: string;
  tripulacion?: string; // Names separated by commas
  viento_nudos?: number;
  viento_direccion?: string; // N, NW, 315, etc.
  maniobras?: string; // Free text of maneuvers practiced
  observaciones?: string; // Additional notes

  created_at: string;
  updated_at: string;
}

export interface LogbookFormData {
  fecha: string;
  puerto_salida: string;
  tripulacion: string;
  viento_nudos: number;
  viento_direccion: string;
  maniobras: string;
  observaciones: string;
  estado_animo: 'confident' | 'challenging' | 'discovery';
}
