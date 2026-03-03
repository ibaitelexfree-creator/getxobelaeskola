'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { apiUrl } from '@/lib/api';


interface Log {
    id: string;
    description: string;
    action_type: string;
    created_at: string;
    target_id: string;
    target_type: string;
    staff_id: string;
    metadata: Record<string, unknown>;
}

interface Profile {
    id: string;
    nombre: string;
    apellidos?: string;
    [key: string]: unknown;
}

export default function ActivityListClient({
    initialLogs,
    isAdmin,
    allProfiles = []
}: {
    initialLogs: Log[],
    isAdmin: boolean,
    allProfiles?: Profile[]
}) {
    const t = useTranslations('staff_panel.activity_page');
    const [logs, setLogs] = useState(initialLogs);
    const [editingLog, setEditingLog] = useState<Log | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filtering & Sorting State
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'type-az' | 'type-za'>('date-desc');
    const [filterAction, setFilterAction] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // State for applied filters (triggered by button)
    const [appliedFilters, setAppliedFilters] = useState<{
        searchTerm: string;
        filterAction: string;
        startDate: string;
        endDate: string;
        statusFilter: string;
        sortOrder: 'date-desc' | 'date-asc' | 'type-az' | 'type-za';
    }>({
        searchTerm: '',
        filterAction: 'all',
        startDate: '',
        endDate: '',
        statusFilter: 'all',
        sortOrder: 'date-desc'
    });

    // Helper to find profile name
    const getProfileName = (id: string) => {
        const p = allProfiles.find(p => p.id === id);
        return p ? `${p.nombre} ${p.apellidos || ''}` : id;
    };

    // Get unique action types for filter dropdown
    const actionTypes = useMemo(() => {
        const types = new Set(logs.map(l => l.action_type));
        return Array.from(types).sort();
    }, [logs]);

    const filteredLogs = useMemo(() => {
        let result = [...logs];

        // 1. Filter by search
        if (appliedFilters.searchTerm) {
            const lowSearch = appliedFilters.searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            result = result.filter(l => {
                const desc = (l.description || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const type = (l.action_type || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const targetName = getProfileName(l.target_id).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const metaStr = JSON.stringify(l.metadata || {}).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                return desc.includes(lowSearch) ||
                    type.includes(lowSearch) ||
                    targetName.includes(lowSearch) ||
                    metaStr.includes(lowSearch);
            });
        }

        // 2. Filter by action type
        if (appliedFilters.filterAction !== 'all') {
            result = result.filter(l => l.action_type === appliedFilters.filterAction);
        }

        // 3. Filter by date range
        if (appliedFilters.startDate) {
            const start = new Date(appliedFilters.startDate).getTime();
            result = result.filter(l => new Date(l.created_at).getTime() >= start);
        }
        if (appliedFilters.endDate) {
            const end = new Date(appliedFilters.endDate).getTime();
            // End of day for end date
            const endOfDay = end + (24 * 60 * 60 * 1000) - 1;
            result = result.filter(l => new Date(l.created_at).getTime() <= endOfDay);
        }

        // 4. Filter by status (from metadata)
        if (appliedFilters.statusFilter !== 'all') {
            result = result.filter(l => {
                const currentStatus = l.metadata?.nextStatus || l.metadata?.status;
                return currentStatus === appliedFilters.statusFilter;
            });
        }

        // 5. Sort
        result.sort((a, b) => {
            if (appliedFilters.sortOrder === 'date-desc') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (appliedFilters.sortOrder === 'date-asc') {
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
            if (appliedFilters.sortOrder === 'type-az') {
                return (a.action_type || '').localeCompare(b.action_type || '');
            }
            if (appliedFilters.sortOrder === 'type-za') {
                return (b.action_type || '').localeCompare(a.action_type || '');
            }
            return 0;
        });

        return result;
    }, [logs, appliedFilters]);

    const handleUpdate = async () => {
        if (!editingLog) return;
        setIsSaving(true);
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
                setLogs(prev => prev.map(l => l.id === editingLog.id ? editingLog : l));
                setEditingLog(null);
            } else {
                alert(t('update_error'));
            }
        } catch {
            alert(t('connection_error'));
        } finally {
            setIsSaving(false);
        }
    };

    const applySearch = () => {
        setAppliedFilters({
            searchTerm,
            filterAction,
            startDate,
            endDate,
            statusFilter,
            sortOrder
        });
    };

    return (
        <div className="space-y-8">
            {/* SEARCH & FILTER CONTROLS */}
            <div className="glass-panel p-8 border border-white/5 space-y-6 animate-premium-in">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('search_label')}</label>
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm outline-none focus:border-accent italic font-display"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('from')}</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-3 text-white text-2xs outline-none focus:border-accent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('to')}</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-3 text-white text-2xs outline-none focus:border-accent"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('action_type')}</label>
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="w-full bg-nautical-black border border-white/10 p-3 text-white text-2xs outline-none focus:border-accent uppercase font-black"
                        >
                            <option value="all">{t('status.all')}</option>
                            {actionTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('status_rental')}</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-nautical-black border border-white/10 p-3 text-white text-2xs outline-none focus:border-accent uppercase font-black"
                        >
                            <option value="all">{t('status.all_statuses')}</option>
                            <option value="pendiente">{t('status.pending')}</option>
                            <option value="entregado">{t('status.delivered')}</option>
                            <option value="devuelto">{t('status.returned')}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold ml-1">{t('sort_by')}</label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                            className="w-full bg-nautical-black border border-white/10 p-3 text-white text-2xs outline-none focus:border-accent uppercase font-black"
                        >
                            <option value="date-desc">{t('sort.newest')}</option>
                            <option value="date-asc">{t('sort.oldest')}</option>
                            <option value="type-az">{t('sort.type_az')}</option>
                            <option value="type-za">{t('sort.type_za')}</option>
                        </select>
                    </div>

                    <button
                        onClick={applySearch}
                        className="w-full py-3.5 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-black hover:bg-white transition-all shadow-xl shadow-accent/20"
                    >
                        {t('apply_btn')}
                    </button>
                </div>

                <div className="pt-4 border-t border-white/5 text-3xs text-white/20 uppercase font-black flex justify-between">
                    <span>{filteredLogs.length} {t('results_found')}</span>
                    {appliedFilters.searchTerm && <span>{t('filter_active', { term: appliedFilters.searchTerm })}</span>}
                </div>
            </div>

            {/* LOG LIST */}
            <div className="space-y-6">
                {filteredLogs && filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                        <div key={log.id} className="p-8 glass-panel border border-white/5 rounded-sm hover:border-white/10 transition-all group relative animate-premium-in">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xs uppercase tracking-widest bg-white/5 px-2 py-1 rounded-full text-accent font-black">
                                            {log.action_type}
                                        </span>
                                        <span className="text-[8px] text-white/20 font-mono">
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-display text-white mt-1 group-hover:text-accent transition-colors italic">
                                        {log.description}
                                    </h3>
                                </div>

                                {isAdmin && (
                                    <button
                                        onClick={() => setEditingLog({ ...log })}
                                        className="text-3xs uppercase tracking-widest text-accent hover:underline font-black bg-accent/5 px-4 py-2 border border-accent/20 rounded-sm ml-4"
                                    >
                                        [ EDITAR REGISTRO ]
                                    </button>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 pl-6 border-l border-white/10 py-2">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-white/20 mb-1">{t('responsible')}</p>
                                        <p className="text-sm text-white/80 font-display italic">
                                            {getProfileName(log.staff_id)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-white/20 mb-1">{t('subject')}</p>
                                        <p className="text-sm text-accent font-display italic">
                                            {log.target_type === 'student' || log.target_type === 'profiles'
                                                ? getProfileName(log.target_id)
                                                : String(log.metadata?.userName || 'N/A')}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-white/20 mb-1">{t('tech_ref')}</p>
                                        <p className="text-3xs text-white/40 font-mono italic">
                                            ID: {log.target_id} ({log.target_type})
                                        </p>
                                    </div>
                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                        <div className="bg-black/20 p-4 rounded-sm">
                                            <p className="text-[8px] uppercase tracking-widest text-white/20 mb-2">{t('process_metadata')}</p>
                                            <pre className="text-3xs font-mono text-white/40 overflow-x-auto whitespace-pre-wrap max-h-32 custom-scrollbar">
                                                {JSON.stringify(log.metadata, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-24 border border-dashed border-white/5 text-center flex flex-col items-center justify-center">
                        <p className="text-white/40 italic font-display text-lg">{t('no_results')}</p>
                        <button onClick={() => {
                            setSearchTerm('');
                            setFilterAction('all');
                            setStartDate('');
                            setEndDate('');
                            setStatusFilter('all');
                            setAppliedFilters({ searchTerm: '', filterAction: 'all', startDate: '', endDate: '', statusFilter: 'all', sortOrder: 'date-desc' });
                        }} className="mt-4 text-3xs uppercase tracking-widest text-accent hover:underline">{t('clear_filters')}</button>
                    </div>
                )}
            </div>

            {/* Edit Modal (unchanged but integrated) */}
            {editingLog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-nautical-black/95 backdrop-blur-2xl">
                    <div className="w-full max-w-2xl glass-panel p-12 rounded-sm space-y-10 animate-premium-in border border-white/10 shadow-3xl">
                        <header>
                            <span className="text-accent uppercase tracking-[0.4em] text-3xs font-bold mb-4 block">Modificar Historial</span>
                            <h3 className="text-4xl font-display text-white italic text-shadow-glow">Editor de Auditoría</h3>
                        </header>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Descripción del Evento</label>
                                <input
                                    value={editingLog.description || ''}
                                    onChange={(e) => setEditingLog({ ...editingLog, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 p-5 text-white font-display italic text-xl outline-none focus:border-accent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">ID Objetivo</label>
                                    <input
                                        value={editingLog.target_id || ''}
                                        onChange={(e) => setEditingLog({ ...editingLog, target_id: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-5 text-white font-mono text-2xs outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Tipo Objetivo</label>
                                    <input
                                        value={editingLog.target_type || ''}
                                        onChange={(e) => setEditingLog({ ...editingLog, target_type: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-5 text-white font-mono text-2xs outline-none focus:border-accent"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Metadata (JSON)</label>
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
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={isSaving}
                                className="flex-1 py-5 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-black hover:bg-white transition-all shadow-xl shadow-accent/20"
                            >
                                {isSaving ? 'Guardando...' : 'Actualizar Registro ⚓'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
