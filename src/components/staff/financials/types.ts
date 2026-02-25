export interface HistoryEntry {
    id: string;
    created_at: string;
    field_name: string;
    old_value: string;
    new_value: string;
    profiles?: { nombre: string; apellidos?: string };
}

export interface FinancialTransaction {
    id: string;
    created_at?: string;
    fecha_reserva?: string;
    fecha_pago?: string | null;
    monto_total: number | string;
    estado_pago: string;
    profiles?: { nombre: string; apellidos?: string };
    servicios_alquiler?: { nombre_es: string };
    history?: HistoryEntry[];
    _field?: string;
    [key: string]: any;
}

export interface FinancialReportsClientProps {
    initialData: FinancialTransaction[];
    initialView?: 'today' | 'month' | 'year' | undefined | null;
    totalRecords?: number;
    error?: string | null;
}

export interface ChartDataPoint {
    label: string;
    amount: number;
    sortKey: string;
    dateObj: Date;
}
