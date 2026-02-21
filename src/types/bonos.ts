
export type NivelSocio = 'basico' | 'club' | 'premium' | 'honor';
export type EstadoBono = 'activo' | 'agotado' | 'expirado' | 'cancelado';
export type TipoMovimientoBono = 'compra' | 'consumo' | 'ajuste_manual' | 'devolucion' | 'expiracion';

export interface TipoBono {
    id: string;
    nombre: string;
    descripcion?: string;
    imagen_url?: string;
    horas_totales: number;
    precio: number;
    validez_dias: number;
    categorias_validas: string[]; // e.g., ['veleros', 'windsurf']
    activo: boolean;
    created_at?: string;
}

export interface BonoUsuario {
    id: string;
    usuario_id: string;
    tipo_bono_id: string; // FK -> TipoBono
    horas_iniciales: number;
    horas_restantes: number;
    fecha_compra: string;
    fecha_expiracion: string;
    estado: EstadoBono;
    created_at?: string;

    // Join fields (opcionales)
    tipo_bono?: TipoBono;
}

export interface MovimientoBono {
    id: string;
    bono_id: string;
    reserva_id?: string;
    tipo_movimiento: TipoMovimientoBono;
    horas: number; // Positivo o negativo
    descripcion?: string;
    created_at: string;
}

// Extension to Profile interface (if needed globally)
export interface PerfilSocio {
    nivel_socio: NivelSocio;
    socio_desde?: string;
    socio_validez_hasta?: string;
}
