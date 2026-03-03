'use client';
import { useState, useCallback, useEffect } from 'react';

export function useNotionManagement(isAdmin: boolean) {
    const [notionMetrics, setNotionMetrics] = useState<any>(null);
    const [isSyncingNotion, setIsSyncingNotion] = useState(false);
    const [isUpdatingDashboard, setIsUpdatingDashboard] = useState(false);

    const fetchNotionMetrics = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/notion/metrics');
            const data = await res.json();
            if (res.ok) setNotionMetrics(data.summary);
        } catch (error) {
            console.error('Error fetching notion metrics:', error);
        }
    }, []);

    const handleTriggerSync = async () => {
        setIsSyncingNotion(true);
        try {
            const res = await fetch('/api/admin/notion/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ direction: 'pull' })
            });
            if (res.ok) {
                await fetchNotionMetrics();
            } else {
                const data = await res.json();
                alert(`Error en sincronización: ${data.error}`);
            }
        } catch (error) {
            console.error('Sync Error:', error);
        } finally {
            setIsSyncingNotion(false);
        }
    };

    const handleUpdateDashboard = async () => {
        setIsUpdatingDashboard(true);
        try {
            const res = await fetch('/api/admin/notion/update-dashboard', {
                method: 'POST'
            });
            if (res.ok) {
                alert('✅ Dashboard en Notion actualizado correctamente.');
                await fetchNotionMetrics();
            } else {
                const data = await res.json();
                alert(`Error al actualizar dashboard: ${data.error}`);
            }
        } catch (error) {
            console.error('Dashboard Update Error:', error);
        } finally {
            setIsUpdatingDashboard(false);
        }
    };

    useEffect(() => {
        if (isAdmin) fetchNotionMetrics();
    }, [isAdmin, fetchNotionMetrics]);

    return {
        notionMetrics,
        isSyncingNotion,
        isUpdatingDashboard,
        handleTriggerSync,
        handleUpdateDashboard,
        fetchNotionMetrics
    };
}
