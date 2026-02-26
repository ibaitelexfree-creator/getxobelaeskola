'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const OverviewTab = dynamic(() => import('./OverviewTab'), { ssr: false });
const RentalsTab = dynamic(() => import('./RentalsTab'), { ssr: false });
const AcademicTab = dynamic(() => import('./AcademicTab'), { ssr: false });
const CommunicationTab = dynamic(() => import('./CommunicationTab'), { ssr: false });
const StaffMgmtTab = dynamic(() => import('./StaffMgmtTab'), { ssr: false });
const CoursesTab = dynamic(() => import('./CoursesTab'), { ssr: false });
const BoatsTab = dynamic(() => import('./BoatsTab'), { ssr: false });
const SessionsTab = dynamic(() => import('./SessionsTab'), { ssr: false });
const AcademyStaffTab = dynamic(() => import('./AcademyStaffTab'), { ssr: false });
const FinancialReportsClient = dynamic(() => import('./FinancialReportsClient'), { ssr: false });
const BITab = dynamic(() => import('./BITab'), { ssr: false });
const DriveExplorerTab = dynamic(() => import('./DriveExplorerTab'), { ssr: false });
const DataExplorerTab = dynamic(() => import('./DataExplorerTab'), { ssr: false });

import AccessibleModal from '../shared/AccessibleModal';
import { apiUrl } from '@/lib/api';


import { ClientDate, StaffProfile } from './StaffShared';

interface Rental {
    id: string;
    perfil_id: string;
    fecha_reserva: string;
    hora_inicio: string;
    monto_total: number;
    estado_entrega: string;
    profiles?: StaffProfile;
    servicios_alquiler?: {
        nombre_es: string;
    };
    log_seguimiento?: {
        timestamp: string;
        status: string;
        note: string;
        staff: string;
    }[];
}

interface AuditLog {
    id: string;
    staff_id: string;
    target_id: string;
    target_type: string;
    action_type: string;
    description: string;
    metadata?: Record<string, unknown>;
    created_at: string;
}

interface StaffStats {
    todayRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    studentCount: number;
    socioCount: number;
    studentRentersCount: number;
    nonStudentRentersCount: number;
}

interface Newsletter {
    id: string;
    title: string;
    content: string;
    status: string;
    created_at: string;
    scheduled_for?: string;
    sent_at?: string;
    recipients_count?: number;
}

interface Inscription {
    id: string;
    perfil_id: string;
    curso_id?: string;
    edicion_id?: string;
    estado_pago: string;
    created_at: string;
    log_seguimiento?: {
        timestamp: string;
        status: string;
        note: string;
        staff: string;
    }[];
    cursos?: {
        nombre_es: string;
        nombre_eu: string;
    } | null;
    ediciones_curso?: {
        id: string;
        fecha_inicio: string;
        cursos?: {
            nombre_es: string;
            nombre_eu: string;
        } | null;
    } | null;
}

interface StaffClientProps {
    userProfile: StaffProfile;
    initialRentals: Rental[];
    allRentals?: Rental[];
    initialStaff?: StaffProfile[];
    initialAuditLogs?: AuditLog[];
    locale: string;
    stats?: StaffStats;
    chartData?: any[];
}

export default function StaffClient({
    userProfile, initialRentals = [], allRentals = [], initialStaff = [], locale, stats: initialStats, initialAuditLogs = [], chartData = []
}: StaffClientProps) {
    const t = useTranslations('staff_panel');
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'overview' | 'rentals' | 'courses' | 'academia' | 'catalog' | 'fleet' | 'sessions' | 'communication' | 'staff_mgmt' | 'financials' | 'bi' | 'drive' | 'explorer'>('overview');
    const [financialsViewMode, setFinancialsViewMode] = useState<'today' | 'month' | 'year' | undefined>('year');

    // Sync tab from URL
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            setActiveTab(tabParam as any);
        }
    }, [searchParams]);

    // Scroll to top when tab changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [activeTab]);

    const [rentals, setRentals] = useState<Rental[]>(initialRentals || []);
    const [recentRentals, setRecentRentals] = useState<Rental[]>(allRentals || []);
    const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>(initialStaff || []);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs || []);
    const [stats, setStats] = useState<StaffStats>(initialStats || {
        todayRevenue: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        studentCount: 0,
        socioCount: 0,
        studentRentersCount: 0,
        nonStudentRentersCount: 0
    });

    const userRole = (userProfile?.rol || '').toLowerCase();
    const isAdmin = userRole === 'admin';
<<<<<<< HEAD
=======
    const isInstructor = userRole === 'instructor' || userRole === 'admin';
>>>>>>> pr-286

    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<StaffProfile[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StaffProfile | null>(null);
    const [studentInscriptions, setStudentInscriptions] = useState<Inscription[]>([]);
    const [staffNote, setStaffNote] = useState('INFO ESCUELA: Condiciones para navegación seguras. Revisar avisos de Euskalmet si el viento supera los 20 nudos.');

    // Status Logic States
    const [updatingStatus, setUpdatingStatus] = useState<{ id: string, nextStatus: string } | null>(null);
    const [statusNote, setStatusNote] = useState('');
    const [viewingHistory, setViewingHistory] = useState<Rental | null>(null);

    // Editing State
    const [isEditingStudent, setIsEditingStudent] = useState(false);
    const [editStudentData, setEditStudentData] = useState<StaffProfile | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Inscription Modal State
    const [updatingInscription, setUpdatingInscription] = useState<{ id: string, nextStatus: string } | null>(null);
    const [viewingInsHistory, setViewingInsHistory] = useState<Inscription | null>(null);

    // Communication State
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);

    // Notion Integration State
    const [notionMetrics, setNotionMetrics] = useState<any>(null);
    const [isSyncingNotion, setIsSyncingNotion] = useState(false);
    const [isUpdatingDashboard, setIsUpdatingDashboard] = useState(false);

    // Staff Edit State
    const [isEditingStaff, setIsEditingStaff] = useState(false);
    const [editStaffData, setEditStaffData] = useState<StaffProfile | null>(null);
    const [isSavingStaff, setIsSavingStaff] = useState(false);

    // Activity Log Edit State
    const [editingLog, setEditingLog] = useState<AuditLog | null>(null);
    const [isSavingLog, setIsSavingLog] = useState(false);

    // Pagination State for Rentals
    const [paginatedRentals, setPaginatedRentals] = useState<Rental[]>([]);
    const [rentalsPage, setRentalsPage] = useState(1);
    const [rentalsTotalPages, setRentalsTotalPages] = useState(1);
    const [isLoadingRentals, setIsLoadingRentals] = useState(false);

    // Filter/Search/Sort State
    const [rentalSearch, setRentalSearch] = useState('');
    const [rentalStatusFilter, setRentalStatusFilter] = useState('all');
    const [rentalSort, setRentalSort] = useState('date_desc');

    // Reset page to 1 when search, filter or sort changes
    useEffect(() => {
        setRentalsPage(1);
    }, [rentalSearch, rentalStatusFilter, rentalSort]);

    const [financialsData, setFinancialsData] = useState<any[]>([]);
    const [financialsTotalCount, setFinancialsTotalCount] = useState(0);
    const [financialsError, setFinancialsError] = useState<string | null>(null);
    const [isLoadingFinancials, setIsLoadingFinancials] = useState(false);

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
                // Refresh metrics after sync
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

    const fetchFinancials = useCallback(async () => {
        setIsLoadingFinancials(true);
        setFinancialsError(null);
        try {
            const res = await fetch(apiUrl('/api/admin/rentals/financials'));
            const data = await res.json();
            if (res.ok) {
                setFinancialsData(data.rentals || []);
                setFinancialsTotalCount(data.totalCount || 0);
            } else {
                setFinancialsError(data.error || 'Server error');
            }
        } catch (err) {
            console.error('Error fetching financials:', err);
            setFinancialsError(err instanceof Error ? err.message : 'Network error');
        } finally {
            setIsLoadingFinancials(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'financials') {
            fetchFinancials();
        }
    }, [activeTab, fetchFinancials]);

    const handleViewReports = (view: 'today' | 'month' | 'year') => {
        setFinancialsViewMode(view);
        setActiveTab('financials');
    };

    const [staffSearch, setStaffSearch] = useState('');

    const supabase = createClient();

    const logActivity = async (action: string, targetId: string, targetType: string, description: string, metadata: Record<string, unknown> = {}) => {
        try {
            await fetch(apiUrl('/api/admin/log-activity'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action_type: action, target_id: targetId, target_type: targetType, description, metadata })
            });
        } catch (err: unknown) { console.error('Silent log failure', err); }
    };

    // Fetch Rentals (Server-Side Pagination)
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

    // Fetch Staff on demand
    useEffect(() => {
        if (activeTab === 'staff_mgmt' && staffProfiles.length === 0) {
            const fetchStaff = async () => {
                try {
                    const res = await fetch(apiUrl('/api/admin/list-staff'));
                    const data = await res.json();
                    if (res.ok) setStaffProfiles(data.staff || []);
                } catch (err) {
                    console.error('Error fetching staff:', err);
                }
            };
            fetchStaff();
        }
    }, [activeTab, staffProfiles.length]);

    // Fetch Audit Logs on demand
    const fetchLogs = useCallback(async () => {
        try {
            const res = await fetch(apiUrl('/api/admin/audit-logs/list?limit=50'));
            const data = await res.json();
            if (res.ok) setAuditLogs(data.logs || []);
        } catch (err: unknown) {
            console.error('Error fetching logs:', err);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'overview' && auditLogs.length === 0) {
            fetchLogs();
        }
    }, [activeTab, auditLogs.length, fetchLogs]);

    // Initialize paginatedRentals with initialRentals on load to avoid empty state
    useEffect(() => {
        if (initialRentals.length > 0 && paginatedRentals.length === 0) {
            setPaginatedRentals(initialRentals);
        }
    }, [initialRentals, paginatedRentals.length]);

    // Fetch Newsletters
    const fetchNewsletters = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('newsletters')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) setNewsletters(data);
        } catch (err) {
            console.error('Error fetching newsletters:', err);
        }
    }, [supabase]);

    useEffect(() => {
        if (activeTab === 'communication') {
            fetchNewsletters();
        }
    }, [activeTab, fetchNewsletters]);
    interface GlobalLog {
        timestamp: string;
        userName: string;
        targetName?: string;
        status: string;
        rentalName?: string;
        note: string;
        type: 'audit' | 'rental';
        rentalId?: string;
        [key: string]: unknown;
    }

    const globalLogs = React.useMemo(() => {
        const logs: GlobalLog[] = [];
        // Rental logs
        (recentRentals || []).forEach(r => {
            if (!r) return;
            const itemLogs = Array.isArray(r.log_seguimiento) ? r.log_seguimiento : [];
            itemLogs.forEach(l => {
                if (!l) return;
                logs.push({
                    ...l,
                    rentalId: r.id,
                    rentalName: r.servicios_alquiler?.nombre_es || 'Equipo',
                    userName: `${r.profiles?.nombre || 'Navegante'} ${r.profiles?.apellidos || ''}`,
                    type: 'rental'
                });
            });
        });

        // System Audit logs (already parsed)
        (auditLogs || []).forEach(l => {
            const operator = staffProfiles.find(p => p.id === l.staff_id);
            const target = staffProfiles.find(p => p.id === l.target_id);
            logs.push({
                timestamp: l.created_at,
                userName: operator ? `${operator.nombre} ${operator.apellidos || ''}` : 'Sistemas',
                targetName: target ? `${target.nombre} ${target.apellidos || ''}` : (String(l.metadata?.userName || 'N/A')),
                status: l.action_type,
                rentalName: l.description,
                note: l.target_type,
                type: 'audit'
            });
        });

        return logs.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
        });
    }, [recentRentals, auditLogs, staffProfiles]);

    const staffList = React.useMemo(() => {
        let list = staffProfiles.filter(p => ['instructor', 'admin'].includes(p.rol));

        if (staffSearch) {
            const low = staffSearch.toLowerCase();
            list = list.filter(p =>
                (p.nombre || '').toLowerCase().includes(low) ||
                (p.apellidos || '').toLowerCase().includes(low) ||
                (p.email || '').toLowerCase().includes(low)
            );
        }

        return list.sort((a, b) => {
            if (a.rol === 'admin' && b.rol !== 'admin') return -1;
            if (b.rol === 'admin' && a.rol !== 'admin') return 1;
            return (a.nombre || '').localeCompare(b.nombre || '');
        });
    }, [staffProfiles, staffSearch]);


    // Student search
    useEffect(() => {
        if (searchTerm.length < 2) { setStudents([]); return; }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(apiUrl(`/api/admin/search-students?q=${encodeURIComponent(searchTerm)}`));
                const data = await res.json();
                if (res.ok && data.students) {
                    const sorted = [...data.students].sort((a: StaffProfile, b: StaffProfile) => (a.nombre || '').localeCompare(b.nombre || ''));
                    setStudents(sorted);
                }
            } catch (err: unknown) { console.error('Search error:', err); }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const selectStudent = async (student: StaffProfile) => {
        if (!student) return;
        setSelectedStudent(student);
        setIsEditingStudent(false); // Reset editing mode
        setEditStudentData({ ...student });
        setSearchTerm(`${student.nombre || ''} ${student.apellidos || ''}`);
        setStudents([]);
        setStudentInscriptions([]);
        try {
            const response = await fetch(apiUrl(`/api/admin/list-inscriptions?studentId=${student.id}`));
            const data = await response.json();
            if (data && Array.isArray(data.inscriptions)) {
                setStudentInscriptions(data.inscriptions);
            }
        } catch (err) {
            console.error('Fetch inscriptions error:', err);
        }
    };

    const handleSaveProfile = async () => {
        if (!selectedStudent || !editStudentData) return;
        setIsSavingProfile(true);
        try {
            const res = await fetch(apiUrl('/api/admin/update-profile'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editStudentData)
            });
            const data = await res.json();
            if (res.ok) {
                const updated = data.profile;
                setSelectedStudent(updated);
                // Update in local lists too
                setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
                setIsEditingStudent(false);

                // Audit Log
                await logActivity(
                    'STUDENT_PROFILE_EDIT',
                    updated.id,
                    'profile',
                    `Modificado perfil de alumno: ${updated.nombre} ${updated.apellidos}`,
                    { old: selectedStudent, new: updated }
                );
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err: unknown) {
            const error = err as Error;
            alert(`Error al conectar con el servidor: ${error.message}`);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleUpdateStaff = async () => {
        if (!editStaffData) return;
        setIsSavingStaff(true);
        try {
            const res = await fetch(apiUrl('/api/admin/update-staff'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: editStaffData.id,
                    email: editStaffData.email,
                    nombre: editStaffData.nombre,
                    apellidos: editStaffData.apellidos,
                    telefono: editStaffData.telefono
                })
            });
            if (res.ok) {
                setStaffProfiles(prev => prev.map(p => p.id === editStaffData.id ? editStaffData : p));
                setIsEditingStaff(false);
                setEditStaffData(null);

                await logActivity(
                    'STAFF_PROFILE_EDIT',
                    editStaffData.id,
                    'staff',
                    `Modificado perfil de staff: ${editStaffData.nombre}`,
                    { data: editStaffData }
                );
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (err: unknown) {
            const error = err as Error;
            alert(`Error de conexión: ${error.message}`);
        } finally {
            setIsSavingStaff(false);
        }
    };

    const handleSendNewsletter = async (data: { title: string, content: string, scheduled_for?: string }) => {
        setIsSendingNewsletter(true);
        try {
            const res = await fetch(apiUrl('/api/admin/newsletters/create'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                await fetchNewsletters();
                alert('Mensaje enviado/programado correctamente');
            } else {
                const errData = await res.json();
                alert(`Error: ${errData.error}`);
            }
        } catch (err: unknown) {
            const error = err as Error;
            alert(`Error al conectar con el servidor: ${error.message}`);
        } finally {
            setIsSendingNewsletter(false);
        }
    };

    const updateInscriptionStatus = async (insId: string, nextStatus: string) => {
        setUpdatingInscription({ id: insId, nextStatus });
    };

    const handleUpdateLog = async () => {
        if (!editingLog) return;
        setIsSavingLog(true);
        try {
            const res = await fetch(apiUrl('/api/admin/update-log'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    logId: editingLog.id,
                    description: editingLog.description,
                    metadata: editingLog.metadata,
                    target_id: editingLog.target_id,
                    target_type: editingLog.target_type
                })
            });
            if (res.ok) {
                setAuditLogs(prev => prev.map(l => l.id === editingLog.id ? editingLog : l));
                setEditingLog(null);
            } else {
                alert('Error al actualizar log');
            }
        } catch {
            alert('Error de conexión');
        } finally {
            setIsSavingLog(false);
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

<<<<<<< HEAD
=======
        console.log('Confirming Inscription Status Change:', { id, nextStatus, newLog });
>>>>>>> pr-286
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

                // Audit Log
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

    const confirmStatusChange = async () => {
        if (!updatingStatus) return;
        const { id, nextStatus } = updatingStatus;
        const previousRentals = [...rentals];
        const rental = rentals.find(r => r.id === id);
        if (!rental) return;

        const currentLog = Array.isArray(rental.log_seguimiento) ? rental.log_seguimiento : [];
        const newLogEntry = {
            timestamp: new Date().toISOString(),
            status: nextStatus,
            note: statusNote || 'Sin observación adicional',
            staff: userProfile?.nombre || 'Personal Escuela'
        };

        const newLog = [...currentLog, newLogEntry];

        // Optimistic UI Update
        const updatedRental = { ...rental, estado_entrega: nextStatus, log_seguimiento: newLog };
        setRentals(prev => prev.map(r => r.id === id ? updatedRental : r));
        setRecentRentals(prev => prev.map(r => r.id === id ? updatedRental : r));

        // Immediately close modal for responsiveness
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

            // Audit Log
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

        const rental = rentals.find(r => r.id === rentalId);
        if (!rental) return;

        const newLog = (Array.isArray(rental.log_seguimiento) ? rental.log_seguimiento : [])
            .filter(l => l.timestamp !== timestamp);

        // Update local state
        const updatedRental = { ...rental, log_seguimiento: newLog };
        setRentals(prev => prev.map(r => r.id === rentalId ? updatedRental : r));
        setRecentRentals(prev => prev.map(r => r.id === rentalId ? updatedRental : r));

        // Update modal state
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

<<<<<<< HEAD

    // Simplified Stats Logic
=======
    // Debug roles if needed
    useEffect(() => {
        console.log("Session Role:", userProfile?.rol, "isAdmin:", isAdmin, "isInstructor:", isInstructor);
        console.log("Data Stats - Rentals:", rentals.length, "Staff:", staffProfiles.length);
    }, [userProfile, isAdmin, isInstructor, rentals, staffProfiles]);

    // Simplified Stats Logic
    const displayStats = stats || initialStats || {
        todayRevenue: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        studentCount: 0,
        socioCount: 0,
        studentRentersCount: 0,
        nonStudentRentersCount: 0
    };

>>>>>>> pr-286
    return (
        <div className="min-h-screen bg-premium-mesh p-4 lg:p-6 space-y-4 pb-20 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nautical-blue/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-4">
                <header className="animate-premium-in">

                    {/* TABS NAVIGATION */}
                    <nav className="flex gap-6 overflow-x-auto pb-1 custom-scrollbar">
                        {[
                            { id: 'overview', label: t('tabs.overview') },
                            { id: 'rentals', label: t('tabs.rentals') },
                            { id: 'financials', label: 'INGRESOS' },
                            { id: 'courses', label: t('tabs.courses') },
                            { id: 'academia', label: 'ACADEMIA' },

                            { id: 'catalog', label: 'CATÁLOGO' },
                            { id: 'fleet', label: 'FLOTA' },
                            { id: 'sessions', label: 'SESIONES' },
                            { id: 'communication', label: t('tabs.communication') },
                            { id: 'staff_mgmt', label: t('tabs.staff_mgmt') },
                            { id: 'drive', label: 'DRIVE' },
                            ...(isAdmin ? [
                                { id: 'bi', label: 'BUSINESS INTEL' },
                                { id: 'explorer', label: 'DATA X-RAY' }
                            ] : [])
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`text-sm uppercase tracking-[0.15em] font-black transition-all pb-2 border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'text-accent border-accent text-shadow-glow' : 'text-white/20 border-transparent hover:text-white/40'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </header>

                {/* Status Change Modal */}
                {updatingStatus && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-nautical-black/80 backdrop-blur-xl">
                        <header>
                            <span className="text-technical text-accent block mb-3">{t('rentals.status_modal.title')}</span>
                            <h3 className="text-3xl font-display text-white italic">{t('rentals.status_modal.change_to', { status: updatingStatus.nextStatus.toUpperCase() })}</h3>
                        </header>

                        <textarea
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            placeholder={t('rentals.status_modal.note_placeholder')}
                            className="w-full h-32 bg-white/5 border border-white/10 p-4 text-sm text-white/80 outline-none focus:border-accent resize-none rounded-sm"
                        />

                        <div className="flex gap-4">
                            <button onClick={() => setUpdatingStatus(null)} className="flex-1 py-4 border border-white/10 text-3xs uppercase tracking-widest text-white/40">{t('audit_editor.cancel')}</button>
                            <button onClick={confirmStatusChange} className="flex-1 py-4 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-bold">{t('rentals.status_modal.confirm')}</button>
                        </div>
                    </div>
                )}

                {/* Inscription Status Modal */}
                {updatingInscription && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-nautical-black/80 backdrop-blur-xl">
                        <div className="w-full max-w-md glass-panel p-10 rounded-sm space-y-8 animate-premium-in">
                            <header>
                                <span className="text-technical text-accent block mb-3">{t('courses.payment_modal.title')}</span>
                                <h3 className="text-3xl font-display text-white italic">{t('courses.payment_modal.change_to', { status: updatingInscription.nextStatus.toUpperCase() })}</h3>
                            </header>
                            <textarea
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder={t('courses.payment_modal.reason_placeholder')}
                                className="w-full h-32 bg-white/5 border border-white/10 p-4 text-sm text-white/80 outline-none focus:border-accent resize-none rounded-sm font-mono"
                            />
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setUpdatingInscription(null)} className="flex-1 py-4 border border-white/10 text-3xs uppercase tracking-widest text-white/40 hover:text-white transition-colors">{t('audit_editor.cancel')}</button>
                                <button onClick={confirmInscriptionStatusChange} className="flex-1 py-4 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-black shadow-lg shadow-accent/20">{t('courses.update_payment')}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Inscription History Modal */}
                <AccessibleModal
                    isOpen={!!viewingInsHistory}
                    onClose={() => setViewingInsHistory(null)}
                    title={viewingInsHistory?.ediciones_curso?.cursos?.nombre_es || viewingInsHistory?.cursos?.nombre_es || 'Registro Académico'}
                    maxWidth="max-w-3xl"
                >
                    {viewingInsHistory && (
                        <div className="space-y-8">
                            {/* Quick Add Log Entry */}
                            <div className="p-6 bg-white/5 border border-white/10 rounded-sm space-y-4">
                                <h4 className="text-3xs uppercase tracking-[0.3em] text-accent font-bold">Añadir Entrada a Bitácora</h4>
                                <div className="flex gap-4">
                                    <textarea
                                        value={statusNote}
                                        onChange={(e) => setStatusNote(e.target.value)}
                                        placeholder="Escribe una observación en el historial..."
                                        className="flex-1 bg-white/5 border border-white/10 p-4 text-sm text-white/80 outline-none focus:border-accent resize-none rounded-sm min-h-[80px]"
                                    />
                                    <button
                                        onClick={async () => {
                                            if (!statusNote.trim()) return;
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
                                        }}
                                        className="px-8 bg-accent text-nautical-black text-3xs uppercase font-black tracking-widest hover:bg-white transition-all self-end h-[80px]"
                                    >
                                        Añadir
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {(Array.isArray(viewingInsHistory.log_seguimiento) ? viewingInsHistory.log_seguimiento : []).slice().reverse().map((log, idx) => (
                                    <div key={idx} className="p-6 bg-white/5 border border-white/5 rounded-sm relative group/log hover:bg-white/10 transition-all">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className={`text-technical px-3 py-1 border ${log.status === 'pagado' ? 'border-accent text-accent bg-accent/5' : 'border-white/20 text-white/40'}`}>{log.status}</span>
                                            <div className="text-white/40 text-3xs">
                                                <ClientDate date={log.timestamp} format="short" />
                                                <button
                                                    onClick={() => deleteInsLogEntry(viewingInsHistory.id, log.timestamp)}
                                                    className="opacity-0 group-hover/log:opacity-100 text-3xs hover:text-red-500 transition-all ml-4"
                                                >
                                                    BORRAR
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-lg font-display text-white/80 italic leading-relaxed">&quot;{log.note}&quot;</p>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-3xs text-white/20 uppercase font-black tracking-widest">Oficial de Cargo: {log.staff || 'Sistemas'}</span>
                                            <span className="text-3xs text-white/10 font-mono tracking-tighter">#{idx.toString(16).padStart(4, '0')}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!viewingInsHistory.log_seguimiento || viewingInsHistory.log_seguimiento.length === 0) && (
                                    <p className="text-center text-white/20 italic py-12">No hay registros en el historial.</p>
                                )}
                            </div>
                        </div>
                    )}
                </AccessibleModal>

                <AccessibleModal
                    isOpen={!!viewingHistory}
                    onClose={() => setViewingHistory(null)}
                    title={viewingHistory?.servicios_alquiler?.nombre_es || 'Historial de Alquiler'}
                    maxWidth="max-w-2xl"
                >
                    {viewingHistory && (
                        <div className="space-y-4">
                            {(Array.isArray(viewingHistory.log_seguimiento) ? viewingHistory.log_seguimiento : []).slice().reverse().map((log, idx) => (
                                <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-sm relative group/log">
                                    <div className="flex justify-between text-3xs mb-2">
                                        <span className="text-accent font-bold uppercase">{log.status}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-white/20"><ClientDate date={log.timestamp} format="short" /></span>
                                            <button
                                                onClick={() => deleteLogEntry(viewingHistory.id, log.timestamp)}
                                                className="opacity-0 group-hover/log:opacity-100 text-3xs hover:text-red-500 transition-all px-2"
                                                title="Borrar registro"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/60 italic">&quot;{log.note}&quot;</p>
                                    <p className="text-[8px] text-white/20 mt-2 uppercase font-black">Registrado por: {log.staff || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </AccessibleModal>

                {/* TAB CONTENT: OVERVIEW */}
                {activeTab === 'overview' && (
                    <OverviewTab
                        isAdmin={isAdmin}
                        locale={locale}
                        displayStats={stats}
                        rentals={recentRentals}
                        globalLogs={globalLogs}
                        auditLogs={auditLogs}
                        staffProfiles={staffProfiles}
                        staffNote={staffNote}
                        setStaffNote={setStaffNote}
                        setEditingLog={setEditingLog}
                        onViewReports={(mode) => {
                            setFinancialsViewMode(mode);
                            setActiveTab('financials');
                        }}
                        notionMetrics={notionMetrics}
                        isSyncing={isSyncingNotion}
                        onTriggerSync={handleTriggerSync}
                        isUpdatingDashboard={isUpdatingDashboard}
                        onUpdateDashboard={handleUpdateDashboard}
                    />
                )}

                {activeTab === 'financials' && (
                    <div className="animate-premium-in">
                        {isLoadingFinancials ? (
                            <div className="py-20 text-center">
                                <div className="w-12 h-12 border-t-2 border-accent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-technical animate-pulse">Cargando bitácora financiera...</p>
                            </div>
                        ) : (
                            <FinancialReportsClient
                                initialData={financialsData}
                                initialView={financialsViewMode}
                                totalRecords={financialsTotalCount}
                                error={financialsError}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'explorer' && (
                    <DataExplorerTab />
                )}

                {activeTab === 'bi' && (
                    <BITab />
                )}

                {activeTab === 'drive' && (
                    <DriveExplorerTab />
                )}

                {/* TAB CONTENT: RENTALS */}
                {activeTab === 'rentals' && (
                    <RentalsTab
                        // @ts-expect-error - Different local Rental interfaces
                        filteredRentals={paginatedRentals} // Use server-fetched data
                        rentalSearch={rentalSearch}
                        setRentalSearch={(val) => { setRentalSearch(val); setRentalsPage(1); }} // Reset page on search
                        rentalStatusFilter={rentalStatusFilter}
                        setRentalStatusFilter={(val) => { setRentalStatusFilter(val); setRentalsPage(1); }} // Reset page on filter
                        rentalSort={rentalSort}
                        setRentalSort={setRentalSort}
                        // @ts-expect-error - Type mismatch between local interfaces
                        setViewingHistory={setViewingHistory}
                        setUpdatingStatus={setUpdatingStatus}
                        totalPages={rentalsTotalPages}
                        currentPage={rentalsPage}
                        onPageChange={setRentalsPage}
                        loading={isLoadingRentals}
                    />
                )}

                {/* TAB CONTENT: ACADEMIC */}
                {activeTab === 'courses' && (
                    <AcademicTab
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        students={students}
                        selectedStudent={selectedStudent}
                        isEditingStudent={isEditingStudent}
                        editStudentData={editStudentData}
                        isSavingProfile={isSavingProfile}
                        studentInscriptions={studentInscriptions}
                        selectStudent={selectStudent}
                        setIsEditingStudent={setIsEditingStudent}
                        setEditStudentData={setEditStudentData}
                        setSelectedStudent={setSelectedStudent}
                        handleSaveProfile={handleSaveProfile}
                        setViewingInsHistory={setViewingInsHistory}
                        updateInscriptionStatus={updateInscriptionStatus}
                        setStudentInscriptions={setStudentInscriptions}
                    />
                )}

                {/* TAB CONTENT: ACADEMIA ONLINE */}
                {activeTab === 'academia' && (
                    <AcademyStaffTab
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        students={students}
                        selectedStudent={selectedStudent}
                        selectStudent={selectStudent}
                        setSelectedStudent={setSelectedStudent}
                        locale={locale}
                    />
                )}

                {/* TAB CONTENT: CATALOG */}
                {activeTab === 'catalog' && (
                    <CoursesTab />
                )}

                {/* TAB CONTENT: FLEET */}
                {activeTab === 'fleet' && (
                    <BoatsTab userRole={userRole} />
                )}

                {/* TAB CONTENT: SESSIONS */}
                {activeTab === 'sessions' && (
                    <SessionsTab locale={locale} />
                )}

                {/* TAB CONTENT: COMMUNICATION */}
                {activeTab === 'communication' && (
                    <CommunicationTab
                        newsletters={newsletters}
                        onSendMessage={handleSendNewsletter}
                        isSending={isSendingNewsletter}
                    />
                )}

                {/* TAB CONTENT: STAFF MANAGEMENT */}
                {activeTab === 'staff_mgmt' && (
                    <StaffMgmtTab
                        isAdmin={isAdmin}
                        locale={locale}
                        staffList={staffList}
                        staffSearch={staffSearch}
                        setStaffSearch={setStaffSearch}
                        setEditStaffData={setEditStaffData}
                        setIsEditingStaff={setIsEditingStaff}
                    />
                )}

                {/* Staff Edit Modal */}
                {isEditingStaff && editStaffData && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-nautical-black/90 backdrop-blur-2xl">
                        <div className="w-full max-w-lg glass-panel p-12 rounded-sm space-y-10 animate-premium-in border border-white/10 shadow-2xl">
                            <header>
                                <span className="text-accent uppercase tracking-[0.4em] text-3xs font-bold mb-4 block">{t('staff_mgmt.edit_modal.title')}</span>
                                <h3 className="text-4xl font-display text-white italic">{t('staff_mgmt.edit_modal.edit_profile')}</h3>
                                <p className="text-technical text-white/40 mt-2">{t('staff_mgmt.edit_modal.id')}: {editStaffData.id}</p>
                            </header>

                            <div className="grid gap-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('staff_mgmt.edit_modal.name')}</label>
                                        <input
                                            value={editStaffData.nombre || ''}
                                            onChange={(e) => setEditStaffData({ ...editStaffData, nombre: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-5 text-lg font-display italic text-white outline-none focus:border-accent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('staff_mgmt.edit_modal.last_name')}</label>
                                        <input
                                            value={editStaffData.apellidos || ''}
                                            onChange={(e) => setEditStaffData({ ...editStaffData, apellidos: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-5 text-lg font-display italic text-white outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('staff_mgmt.edit_modal.email')}</label>
                                    <input
                                        value={editStaffData.email || ''}
                                        onChange={(e) => setEditStaffData({ ...editStaffData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-5 text-sm font-mono text-white outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('staff_mgmt.edit_modal.phone')}</label>
                                    <input
                                        value={editStaffData.telefono || ''}
                                        onChange={(e) => setEditStaffData({ ...editStaffData, telefono: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-5 text-lg font-display italic text-white outline-none focus:border-accent"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => setIsEditingStaff(false)}
                                    className="flex-1 py-5 border border-white/10 text-3xs uppercase tracking-widest text-white/40 hover:text-white transition-all font-bold"
                                >
                                    {t('staff_mgmt.edit_modal.discard')}
                                </button>
                                <button
                                    onClick={handleUpdateStaff}
                                    disabled={isSavingStaff}
                                    className="flex-1 py-5 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-black hover:bg-white transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
                                >
                                    {isSavingStaff ? t('staff_mgmt.edit_modal.saving') : t('staff_mgmt.edit_modal.apply_changes')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Audit Log Edit Modal */}
                {editingLog && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-nautical-black/95 backdrop-blur-2xl">
                        <div className="w-full max-w-2xl glass-panel p-12 rounded-sm space-y-10 animate-premium-in border border-white/10 shadow-3xl">
                            <header className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <span className="text-accent uppercase tracking-[0.4em] text-3xs font-bold block mb-4">{t('audit_editor.title')}</span>
                                    <h3 className="text-4xl font-display text-white italic">{t('audit_editor.header')}</h3>
                                </div>
                                <button onClick={() => setEditingLog(null)} className="text-white/20 hover:text-white transition-colors text-2xl">×</button>
                            </header>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('audit_editor.description')}</label>
                                    <input
                                        value={editingLog.description || ''}
                                        onChange={(e) => setEditingLog({ ...editingLog, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-5 text-white font-display italic text-xl outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('audit_editor.target_id')}</label>
                                        <input
                                            value={editingLog.target_id || ''}
                                            onChange={(e) => setEditingLog({ ...editingLog, target_id: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-5 text-white font-mono text-2xs outline-none focus:border-accent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('audit_editor.target_type')}</label>
                                        <input
                                            value={editingLog.target_type || ''}
                                            onChange={(e) => setEditingLog({ ...editingLog, target_type: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-5 text-white font-mono text-2xs outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('audit_editor.metadata_json')}</label>
                                    <textarea
                                        rows={8}
                                        value={JSON.stringify(editingLog.metadata, null, 2)}
                                        onChange={(e) => {
                                            try {
                                                const parsed = JSON.parse(e.target.value);
                                                setEditingLog({ ...editingLog, metadata: parsed });
                                            } catch { }
                                        }}
                                        className="w-full bg-white/5 border border-white/10 p-5 text-white font-mono text-2xs outline-none focus:border-accent resize-none custom-scrollbar"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => setEditingLog(null)}
                                    className="flex-1 py-5 border border-white/10 text-3xs uppercase tracking-widest text-white/40 hover:text-white transition-all font-bold"
                                >
                                    {t('audit_editor.cancel')}
                                </button>
                                <button
                                    onClick={handleUpdateLog}
                                    disabled={isSavingLog}
                                    className="flex-1 py-5 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-black hover:bg-white transition-all shadow-xl shadow-accent/20"
                                >
                                    {isSavingLog ? t('audit_editor.saving') : t('audit_editor.update')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Debug Indicator */}
                {isAdmin && (
                    <div className="fixed bottom-4 right-4 text-[8px] text-white/10 z-[1000] pointer-events-none font-mono">
                        TAB: {activeTab} | FIN_DATA: {financialsData.length} | TOTAL_DB: {financialsTotalCount} | LOAD: {isLoadingFinancials ? 'TRUE' : 'FALSE'}
                    </div>
                )}
            </div>
        </div>
    );
}
