import { useState, useCallback } from 'react';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { apiUrl } from '@/lib/api';

export interface Badge {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    descripcion_eu: string;
    icono: string;
    puntos: number;
    rareza: 'comun' | 'raro' | 'epico' | 'legendario';
    categoria: string;
    obtained: boolean;
    dateObtained: string | null;
}

export function useGamification() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(false);
    const addNotification = useNotificationStore(state => state.addNotification);

    const fetchBadges = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(apiUrl('/api/achievements'));
            if (!res.ok) throw new Error('Error fetching badges');
            const data = await res.json();
            setBadges(data);
        } catch (error) {
            console.error('Error loading badges:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const unlockBadge = useCallback(async (slug: string) => {
        try {
            const res = await fetch(apiUrl('/api/achievements'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug })
            });

            const data = await res.json();

            if (res.ok && data.new) {
                // Trigger notification
                addNotification({
                    type: 'badge',
                    title: data.achievement.nombre,
                    message: '¡Nuevo Badge Desbloqueado!',
                    icon: '🏆',
                    duration: 0, // Manual dismiss or handled by modal
                    data: { points: data.achievement.puntos }
                });

                // Refresh list
                fetchBadges();
            }
        } catch (error) {
            console.error('Error unlocking badge:', error);
        }
    }, [addNotification, fetchBadges]);

    return {
        badges,
        loading,
        fetchBadges,
        unlockBadge
    };
}
