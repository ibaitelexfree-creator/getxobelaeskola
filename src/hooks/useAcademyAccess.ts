import { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '@/lib/api';

export type UnlockStatus = 'locked' | 'available' | 'en_progreso' | 'completado' | 'distincion';

export type EntityType = 'nivel' | 'curso' | 'modulo' | 'unidad';

export interface UnlockStatusMap {
    niveles: Record<string, UnlockStatus>;
    cursos: Record<string, UnlockStatus>;
    modulos: Record<string, UnlockStatus>;
    unidades: Record<string, UnlockStatus>;
}

export function useAcademyAccess() {
    const [statusMap, setStatusMap] = useState<UnlockStatusMap | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(apiUrl('/api/unlock-status'));
            const data = await res.json();
            setStatusMap(data);
        } catch (err) {
            console.error('Error fetching unlock status', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    /**
     * Comprueba si una entidad es accesible.
     * Con el nuevo RPC recursivo, solo necesitamos mirar el estado de la entidad misma,
     * ya que el estado 'locked' se propaga hacia abajo.
     */
    const canAccess = useCallback((type: EntityType, id: string): boolean => {
        if (!statusMap) return false;

        let status: UnlockStatus | undefined;

        switch (type) {
            case 'nivel': status = statusMap.niveles[id]; break;
            case 'curso': status = statusMap.cursos[id]; break;
            case 'modulo': status = statusMap.modulos[id]; break;
            case 'unidad': status = statusMap.unidades[id]; break;
        }

        // Si es undefined (no existe en el mapa) o es 'locked', no es accesible
        return !!status && status !== 'locked';
    }, [statusMap]);

    return {
        statusMap,
        loading,
        canAccess,
        refresh: fetchStatus
    };
}
