
export interface SupabaseRow {
    id: string | number;
    [key: string]: any;
}

export interface DashboardStats {
    revenue: {
        today: number;
        month: number;
        year: number;
    };
    counts: {
        students: number;
        socios: number;
        staff: number;
        boats: number;
        subs: number;
        rentals_pending: number;
    };
    auditLogs: AuditLog[];
    recentRentals: RentalInfo[];
    boats: BoatInfo[];
}

export interface AuditLog {
    action: string;
    desc: string;
    time: string;
    operator: string;
}

export interface RentalInfo {
    customer: string;
    amount: number;
    service: string;
    status: string;
    time: string;
}

export interface BoatInfo {
    nombre: string;
    estado: string;
}

export interface NotionBlock {
    type: string;
    [key: string]: any;
}

export interface NotionSyncConfig {
    definitions: Record<string, {
        properties: Record<string, {
            type: string;
            format?: string;
        }>;
    }>;
}

export interface NotionTableMap {
    [tableName: string]: string;
}
