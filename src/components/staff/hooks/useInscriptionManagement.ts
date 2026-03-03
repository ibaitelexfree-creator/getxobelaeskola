'use client';
import { useState } from 'react';
import { Inscription, StaffProfile } from '../StaffShared';
import { apiUrl } from '@/lib/api';

export function useInscriptionManagement(
    userProfile: StaffProfile,
    logActivity: (action: string, targetId: string, targetType: string, description: string, metadata?: any) => Promise<void>
) {
    const [studentInscriptions, setStudentInscriptions] = useState<Inscription[]>([]);
    const [updatingInscription, setUpdatingInscription] = useState<{ id: string, nextStatus: string } | null>(null);
    const [viewingInsHistory, setViewingInsHistory] = useState<Inscription | null>(null);
    const [statusNote, setStatusNote] = useState('');

    const fetchInscriptions = async (studentId: string) => {
        try {
            const response = await fetch(apiUrl(`/api/admin/list-inscriptions?studentId=${studentId}`));
            const data = await response.json();
            if (data && Array.isArray(data.inscriptions)) {
                setStudentInscriptions(data.inscriptions);
            }
        } catch (err) {
            console.error('Fetch inscriptions error:', err);
        }
    };

    const confirmInscriptionStatusChange = async () => {
        if (!updatingInscription) return;
        const { id, nextStatus } = updatingInscription;
        const ins = studentInscriptions.find(i => i.id === id);
        if (!ins) return;

        const currentLog = Array.isArray(ins.log_seguimiento) ? ins.log_seguimiento : [];
        const newLogEntry = {
            timestamp: new Date().toISOString(),
            status: nextStatus,
            note: statusNote || 'Cambio de estado de pago',
            staff: userProfile?.nombre || 'Personal Escuela'
        };
        const newLog = [...currentLog, newLogEntry];

        try {
            const res = await fetch(apiUrl('/api/admin/update-inscription'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, estado_pago: nextStatus, log_seguimiento: newLog })
            });

            if (res.ok) {
                const data = await res.json();
                const updatedIns = data.inscription || { ...ins, estado_pago: nextStatus, log_seguimiento: newLog };

                setStudentInscriptions(prev => prev.map(i => i.id === id ? updatedIns : i));
                if (viewingInsHistory?.id === id) setViewingInsHistory(updatedIns);

                setUpdatingInscription(null);
                setStatusNote('');

                await logActivity(
                    'INSCRIPTION_STATUS_CHANGE',
                    id,
                    'inscription',
                    `Cambio estado inscripción: ${ins.cursos?.nombre_es || 'Curso'} → ${nextStatus}`,
                    { previousStatus: ins.estado_pago, nextStatus, note: statusNote }
                );
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Update Inscription Error:', error);
            alert(`Error de red: ${error.message}`);
        }
    };

    const deleteInsLogEntry = async (insId: string, timestamp: string) => {
        if (!confirm('¿Borrar este registro del historial?')) return;
        const ins = studentInscriptions.find(i => i.id === insId);
        if (!ins) return;

        const newLog = (Array.isArray(ins.log_seguimiento) ? ins.log_seguimiento : [])
            .filter(l => l.timestamp !== timestamp);

        try {
            const res = await fetch(apiUrl('/api/admin/update-inscription'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: insId, log_seguimiento: newLog, estado_pago: ins.estado_pago })
            });

            if (res.ok) {
                const updatedIns = { ...ins, log_seguimiento: newLog };
                setStudentInscriptions(prev => prev.map(i => i.id === insId ? updatedIns : i));
                if (viewingInsHistory?.id === insId) setViewingInsHistory(updatedIns);
            }
        } catch (err: unknown) {
            const error = err as Error;
            alert(`Error al borrar log: ${error.message}`);
        }
    };

    const handleAddLogEntry = async () => {
        if (!viewingInsHistory || !statusNote.trim()) return;
        const currentLog = Array.isArray(viewingInsHistory.log_seguimiento) ? viewingInsHistory.log_seguimiento : [];
        const newEntry = {
            timestamp: new Date().toISOString(),
            status: viewingInsHistory.estado_pago,
            note: statusNote,
            staff: userProfile?.nombre || 'Personal Escuela'
        };
        const newLog = [...currentLog, newEntry];

        try {
            const res = await fetch(apiUrl('/api/admin/update-inscription'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: viewingInsHistory.id, log_seguimiento: newLog })
            });
            if (res.ok) {
                const data = await res.json();
                const updated = data.inscription || { ...viewingInsHistory, log_seguimiento: newLog };
                setStudentInscriptions(prev => prev.map(i => i.id === updated.id ? updated : i));
                setViewingInsHistory(updated);
                setStatusNote('');
            }
        } catch (err) {
            alert('Error al añadir entrada');
        }
    };

    return {
        studentInscriptions,
        setStudentInscriptions,
        updatingInscription,
        setUpdatingInscription,
        viewingInsHistory,
        setViewingInsHistory,
        statusNote,
        setStatusNote,
        fetchInscriptions,
        confirmInscriptionStatusChange,
        deleteInsLogEntry,
        handleAddLogEntry
    };
}
