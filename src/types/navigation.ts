export interface NavigationPoint {
    id: string;
    fecha: string;
    zona_nombre?: string;
    ubicacion?: { lat: number; lng: number };
    tipo: string;
    duracion_h: number;
    track_log?: { lat: number; lng: number }[];
}
