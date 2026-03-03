'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

import { apiUrl } from '@/lib/api';
import { StaffProfile, Rental, AuditLog, StaffStats, Newsletter, Inscription } from './StaffShared';

// Hooks
import { useNotionManagement } from './hooks/useNotionManagement';
import { useRentalManagement } from './hooks/useRentalManagement';
import { useStaffManagement } from './hooks/useStaffManagement';
import { useInscriptionManagement } from './hooks/useInscriptionManagement';

// Modals
import RentalStatusModal from './modals/RentalStatusModal';
import InscriptionStatusModal from './modals/InscriptionStatusModal';
import InscriptionHistoryModal from './modals/InscriptionHistoryModal';
import RentalHistoryModal from './modals/RentalHistoryModal';
import StaffEditModal from './modals/StaffEditModal';
import AuditLogEditModal from './modals/AuditLogEditModal';

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

    const isAdmin = userProfile?.rol?.toLowerCase() === 'admin';
    const userRole = (userProfile?.rol || '').toLowerCase();
    const supabase = createClient();

    // Log Activity Utility
    const logActivity = useCallback(async (action: string, targetId: string, targetType: string, description: string, metadata: Record<string, unknown> = {}) => {
        try {
            await fetch(apiUrl('/api/admin/log-activity'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action_type: action, target_id: targetId, target_type: targetType, description, metadata })
            });
        } catch (err: unknown) { console.error('Silent log failure', err); }
    }, []);

    // Hooks
    const notion = useNotionManagement(isAdmin);
    const rentalMgmt = useRentalManagement(initialRentals, allRentals, activeTab, userProfile, logActivity);
    const staffMgmt = useStaffManagement(initialStaff, initialAuditLogs, activeTab, logActivity);
    const inscriptionMgmt = useInscriptionManagement(userProfile, logActivity);

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

    const [stats] = useState<StaffStats>(initialStats || {
        todayRevenue: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        studentCount: 0,
        socioCount: 0,
        studentRentersCount: 0,
        nonStudentRentersCount: 0
    });

    const [staffNote, setStaffNote] = useState('INFO ESCUELA: Condiciones para navegación seguras. Revisar avisos de Euskalmet si el viento supera los 20 nudos.');

    // Financials logic (minimal stay here as it is relatively small)
    const [financialsData, setFinancialsData] = useState<any[]>([]);
    const [financialsTotalCount, setFinancialsTotalCount] = useState(0);
    const [financialsError, setFinancialsError] = useState<string | null>(null);
    const [isLoadingFinancials, setIsLoadingFinancials] = useState(false);

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

    // Communication State
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);

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

    const globalLogs = useMemo(() => {
        const logs: GlobalLog[] = [];
        (rentalMgmt.recentRentals || []).forEach(r => {
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

        (staffMgmt.auditLogs || []).forEach(l => {
            const operator = staffMgmt.staffProfiles.find(p => p.id === l.staff_id);
            const target = staffMgmt.staffProfiles.find(p => p.id === l.target_id);
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
    }, [rentalMgmt.recentRentals, staffMgmt.auditLogs, staffMgmt.staffProfiles]);

    const staffList = useMemo(() => {
        let list = staffMgmt.staffProfiles.filter(p => ['instructor', 'admin'].includes(p.rol));

        if (staffMgmt.staffSearch) {
            const low = staffMgmt.staffSearch.toLowerCase();
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
    }, [staffMgmt.staffProfiles, staffMgmt.staffSearch]);

    const selectStudent = async (student: StaffProfile) => {
        if (!student) return;
        staffMgmt.setSelectedStudent(student);
        staffMgmt.setIsEditingStudent(false);
        staffMgmt.setEditStudentData({ ...student });
        staffMgmt.setSearchTerm(`${student.nombre || ''} ${student.apellidos || ''}`);
        staffMgmt.setStudents([]);
        await inscriptionMgmt.fetchInscriptions(student.id);
    };

    return (
        <div className="min-h-screen bg-premium-mesh p-4 lg:p-6 space-y-4 pb-20 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nautical-blue/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-4">
                <header className="animate-premium-in">
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

                {/* Modals */}
                <RentalStatusModal
                    updatingStatus={rentalMgmt.updatingStatus}
                    statusNote={rentalMgmt.statusNote}
                    setStatusNote={rentalMgmt.setStatusNote}
                    onClose={() => rentalMgmt.setUpdatingStatus(null)}
                    onConfirm={rentalMgmt.confirmStatusChange}
                />

                <InscriptionStatusModal
                    updatingInscription={inscriptionMgmt.updatingInscription}
                    statusNote={inscriptionMgmt.statusNote}
                    setStatusNote={inscriptionMgmt.setStatusNote}
                    onClose={() => inscriptionMgmt.setUpdatingInscription(null)}
                    onConfirm={inscriptionMgmt.confirmInscriptionStatusChange}
                />

                <InscriptionHistoryModal
                    viewingInsHistory={inscriptionMgmt.viewingInsHistory}
                    onClose={() => inscriptionMgmt.setViewingInsHistory(null)}
                    statusNote={inscriptionMgmt.statusNote}
                    setStatusNote={inscriptionMgmt.setStatusNote}
                    onAddLogEntry={inscriptionMgmt.handleAddLogEntry}
                    onDeleteLogEntry={inscriptionMgmt.deleteInsLogEntry}
                />

                <RentalHistoryModal
                    viewingHistory={rentalMgmt.viewingHistory}
                    onClose={() => rentalMgmt.setViewingHistory(null)}
                    onDeleteLogEntry={rentalMgmt.deleteLogEntry}
                />

                <StaffEditModal
                    isEditingStaff={staffMgmt.isEditingStaff}
                    editStaffData={staffMgmt.editStaffData}
                    setEditStaffData={staffMgmt.setEditStaffData}
                    onClose={() => staffMgmt.setIsEditingStaff(false)}
                    onSave={staffMgmt.handleUpdateStaff}
                    isSavingStaff={staffMgmt.isSavingStaff}
                />

                <AuditLogEditModal
                    editingLog={staffMgmt.editingLog}
                    setEditingLog={staffMgmt.setEditingLog}
                    onSave={staffMgmt.handleUpdateLog}
                    isSavingLog={staffMgmt.isSavingLog}
                />

                {/* TAB CONTENT: OVERVIEW */}
                {activeTab === 'overview' && (
                    <OverviewTab
                        isAdmin={isAdmin}
                        locale={locale}
                        displayStats={stats}
                        rentals={rentalMgmt.recentRentals}
                        globalLogs={globalLogs}
                        auditLogs={staffMgmt.auditLogs}
                        staffProfiles={staffMgmt.staffProfiles}
                        staffNote={staffNote}
                        setStaffNote={setStaffNote}
                        setEditingLog={staffMgmt.setEditingLog}
                        onViewReports={(mode) => {
                            setFinancialsViewMode(mode);
                            setActiveTab('financials');
                        }}
                        notionMetrics={notion.notionMetrics}
                        isSyncing={notion.isSyncingNotion}
                        onTriggerSync={notion.handleTriggerSync}
                        isUpdatingDashboard={notion.isUpdatingDashboard}
                        onUpdateDashboard={notion.handleUpdateDashboard}
                        chartData={chartData}
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

                {activeTab === 'explorer' && <DataExplorerTab />}
                {activeTab === 'bi' && <BITab />}
                {activeTab === 'drive' && <DriveExplorerTab />}

                {/* TAB CONTENT: RENTALS */}
                {activeTab === 'rentals' && (
                    <RentalsTab
                        filteredRentals={rentalMgmt.paginatedRentals}
                        rentalSearch={rentalMgmt.rentalSearch}
                        setRentalSearch={rentalMgmt.setRentalSearch}
                        rentalStatusFilter={rentalMgmt.rentalStatusFilter}
                        setRentalStatusFilter={rentalMgmt.setRentalStatusFilter}
                        rentalSort={rentalMgmt.rentalSort}
                        setRentalSort={rentalMgmt.setRentalSort}
                        setViewingHistory={rentalMgmt.setViewingHistory}
                        setUpdatingStatus={rentalMgmt.setUpdatingStatus}
                        totalPages={rentalMgmt.rentalsTotalPages}
                        currentPage={rentalMgmt.rentalsPage}
                        onPageChange={rentalMgmt.setRentalsPage}
                        loading={rentalMgmt.isLoadingRentals}
                    />
                )}

                {/* TAB CONTENT: ACADEMIC */}
                {activeTab === 'courses' && (
                    <AcademicTab
                        searchTerm={staffMgmt.searchTerm}
                        setSearchTerm={staffMgmt.setSearchTerm}
                        students={staffMgmt.students}
                        selectedStudent={staffMgmt.selectedStudent}
                        isEditingStudent={staffMgmt.isEditingStudent}
                        editStudentData={staffMgmt.editStudentData}
                        isSavingProfile={staffMgmt.isSavingProfile}
                        studentInscriptions={inscriptionMgmt.studentInscriptions}
                        selectStudent={selectStudent}
                        setIsEditingStudent={staffMgmt.setIsEditingStudent}
                        setEditStudentData={staffMgmt.setEditStudentData}
                        setSelectedStudent={staffMgmt.setSelectedStudent}
                        handleSaveProfile={staffMgmt.handleSaveProfile}
                        setViewingInsHistory={inscriptionMgmt.setViewingInsHistory}
                    updateInscriptionStatus={(id, next) => inscriptionMgmt.setUpdatingInscription({ id, nextStatus: next })}
                        setStudentInscriptions={inscriptionMgmt.setStudentInscriptions}
                    />
                )}

                {/* TAB CONTENT: ACADEMIA ONLINE */}
                {activeTab === 'academia' && (
                    <AcademyStaffTab
                        searchTerm={staffMgmt.searchTerm}
                        setSearchTerm={staffMgmt.setSearchTerm}
                        students={staffMgmt.students}
                        selectedStudent={staffMgmt.selectedStudent}
                        selectStudent={selectStudent}
                        setSelectedStudent={staffMgmt.setSelectedStudent}
                        locale={locale}
                    />
                )}

                {activeTab === 'catalog' && <CoursesTab />}
                {activeTab === 'fleet' && <BoatsTab userRole={userRole} />}
                {activeTab === 'sessions' && <SessionsTab locale={locale} />}

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
                        staffSearch={staffMgmt.staffSearch}
                        setStaffSearch={staffMgmt.setStaffSearch}
                        setEditStaffData={staffMgmt.setEditStaffData}
                        setIsEditingStaff={staffMgmt.setIsEditingStaff}
                    />
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
