import { useState, useEffect, useCallback } from 'react';

interface UseUnitProgressProps {
    unidadId: string | undefined;
    isCompletado: boolean;
    erroresComunes: string[] | undefined;
}

export function useUnitProgress({ unidadId, isCompletado, erroresComunes }: UseUnitProgressProps) {
    const [tiempoLectura, setTiempoLectura] = useState(0);
    const [seccionesVistas, setSeccionesVistas] = useState<string[]>([]);

    // Timer for reading time
    useEffect(() => {
        if (!unidadId || isCompletado) return;

        const interval = setInterval(() => {
            setTiempoLectura(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [unidadId, isCompletado]);

    // Register section view
    const registrarLectura = useCallback(async (seccion: string) => {
        if (!unidadId) return;

        // Optimistic update to avoid double fetching
        setSeccionesVistas(prev =>
            prev.includes(seccion) ? prev : [...prev, seccion]
        );

        try {
            const res = await fetch('/api/academy/progress/unit-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    unidad_id: unidadId,
                    seccion: seccion
                })
            });
            const data = await res.json();
            // If server fails, we might want to rollback or just ignore for now as it's not critical
            if (!data.success) {
                console.warn('Failed to register section read');
            }
        } catch (error) {
            console.error('Error registering read:', error);
        }
    }, [unidadId]);

    // Initialize/Sync with server state if needed (optional if passed via props, 
    // but here we assume the parent component handles initial data fetching).
    // In this specific refactor, we are extracting the logic that was local to UnitReaderMain.

    const requiereErrores = erroresComunes && erroresComunes.length > 0;
    const totalSecciones = requiereErrores ? 3 : 2;
    const faltanSecciones = seccionesVistas.length < totalSecciones;
    // Reduced time for training/test phase (30 seconds instead of 5 minutes)
    const faltaTiempo = tiempoLectura < 30;

    const puedeCompletar = !faltanSecciones && !faltaTiempo;

    const mensajeRequisito = faltanSecciones
        ? 'Debes leer todas las secciones antes de completar.'
        : faltaTiempo
            ? 'Debes dedicar al menos 5 minutos a la lectura.'
            : null;

    return {
        tiempoLectura,
        seccionesVistas,
        registrarLectura,
        puedeCompletar,
        mensajeRequisito,
        setSeccionesVistas, // Exposed to set initial state from server
        setTiempoLectura // Exposed if needed
    };
}
