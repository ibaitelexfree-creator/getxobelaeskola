'use client';
import { useState, useEffect } from 'react';
import { Rental, StaffProfile } from '../StaffShared';
import { apiUrl } from '@/lib/api';

export function useRentalManagement(
    initialRentals: Rental[],
    allRentals: Rental[],
    activeTab: string,
    userProfile: StaffProfile,
    logActivity: (action: string, targetId: string, targetType: string, description: string, metadata?: any) => Promise<void>
) {
    const [rentals, setRentals] = useState<Rental[]>(initialRentals || []);
    const [recentRentals, setRecentRentals] = useState<Rental[]>(allRentals || []);
    const [paginatedRentals, setPaginatedRentals] = useState<Rental[]>([]);
    const [rentalsPage, setRentalsPage] = useState(1);
    const [rentalsTotalPages, setRentalsTotalPages] = useState(1);
    const [isLoadingRentals, setIsLoadingRentals] = useState(false);

    const [rentalSearch, setRentalSearch] = useState('');
    const [rentalStatusFilter, setRentalStatusFilter] = useState('all');
    const [rentalSort, setRentalSort] = useState('date_desc');

    const [updatingStatus, setUpdatingStatus] = useState<{ id: string, nextStatus: string } | null>(null);
    const [statusNote, setStatusNote] = useState('');
    const [viewingHistory, setViewingHistory] = useState<Rental | null>(null);

    useEffect(() => {
        setRentalsPage(1);
    }, [rentalSearch, rentalStatusFilter, rentalSort]);

    useEffect(() => {
        if (activeTab === 'rentals') {
            const fetchRentals = async () => {
                setIsLoadingRentals(true);
                try {
                    const params = new URLSearchParams({
                        page: rentalsPage.toString(),
                        limit: '20',
                        q: rentalSearch,
                        status: rentalStatusFilter,
                        sort: rentalSort
                    });
                    const res = await fetch(apiUrl(`/api/admin/rentals/list?${params.toString()}`));
                    const data = await res.json();
                    if (res.ok) {
                        setPaginatedRentals(data.rentals || []);
                        setRentalsTotalPages(data.meta?.totalPages || 1);
                    }
                } catch (err) {
                    console.error('Error fetching rentals:', err);
                } finally {
                    setIsLoadingRentals(false);
                }
            };

            const debounce = setTimeout(fetchRentals, 300);
            return () => clearTimeout(debounce);
        }
    }, [activeTab, rentalsPage, rentalSearch, rentalStatusFilter, rentalSort]);

    useEffect(() => {
        if (initialRentals.length > 0 && paginatedRentals.length === 0) {
            setPaginatedRentals(initialRentals);
        }
    }, [initialRentals, paginatedRentals.length]);

    const confirmStatusChange = async () => {
        if (!updatingStatus) return;
        const { id, nextStatus } = updatingStatus;
        const previousRentals = [...rentals];
        const rental = rentals.find(r => r.id === id) || paginatedRentals.find(r => r.id === id);
        if (!rental) return;

        const currentLog = Array.isArray(rental.log_seguimiento) ? rental.log_seguimiento : [];
        const newLogEntry = {
            timestamp: new Date().toISOString(),
            status: nextStatus,
            note: statusNote || 'Sin observación adicional',
            staff: userProfile?.nombre || 'Personal Escuela'
        };

        const newLog = [...currentLog, newLogEntry];

        const updatedRental = { ...rental, estado_entrega: nextStatus, log_seguimiento: newLog };
        setRentals(prev => prev.map(r => r.id === id ? updatedRental : r));
        setRecentRentals(prev => prev.map(r => r.id === id ? updatedRental : r));
        setPaginatedRentals(prev => prev.map(r => r.id === id ? updatedRental : r));

        setUpdatingStatus(null);
        setStatusNote('');

        try {
            const res = await fetch(apiUrl('/api/admin/update-rental'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, estado_entrega: nextStatus, log_seguimiento: newLog })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            await logActivity(
                'RENTAL_STATUS_CHANGE',
                id,
                'rental',
                `Cambio estado alquiler: ${rental.servicios_alquiler?.nombre_es} → ${nextStatus}`,
                { previousStatus: rental.estado_entrega, nextStatus, note: statusNote }
            );
        } catch (err: unknown) {
            const error = err as Error;
            setRentals(previousRentals);
            alert(`Error: ${error.message}`);
        }
    };

    const deleteLogEntry = async (rentalId: string, timestamp: string) => {
        if (!confirm('¿Seguro que quieres borrar este registro del historial?')) return;

        const rental = rentals.find(r => r.id === rentalId) || paginatedRentals.find(r => r.id === rentalId);
        if (!rental) return;

        const newLog = (Array.isArray(rental.log_seguimiento) ? rental.log_seguimiento : [])
            .filter(l => l.timestamp !== timestamp);

        const updatedRental = { ...rental, log_seguimiento: newLog };
        setRentals(prev => prev.map(r => r.id === rentalId ? updatedRental : r));
        setRecentRentals(prev => prev.map(r => r.id === rentalId ? updatedRental : r));
        setPaginatedRentals(prev => prev.map(r => r.id === rentalId ? updatedRental : r));

        if (viewingHistory && viewingHistory.id === rentalId) {
            setViewingHistory(updatedRental);
        }

        try {
            const res = await fetch(apiUrl('/api/admin/update-rental'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: rentalId, log_seguimiento: newLog })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
        } catch (err: unknown) {
            const error = err as Error;
            alert(`Error borrando log: ${error.message}`);
        }
    };

    return {
        rentals,
        recentRentals,
        paginatedRentals,
        rentalsPage,
        setRentalsPage,
        rentalsTotalPages,
        isLoadingRentals,
        rentalSearch,
        setRentalSearch,
        rentalStatusFilter,
        setRentalStatusFilter,
        rentalSort,
        setRentalSort,
        updatingStatus,
        setUpdatingStatus,
        statusNote,
        setStatusNote,
        viewingHistory,
        setViewingHistory,
        confirmStatusChange,
        deleteLogEntry
    };
}
