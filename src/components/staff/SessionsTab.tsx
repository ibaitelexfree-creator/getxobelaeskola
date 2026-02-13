'use client';

import React, { useState, useEffect, useRef } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import SessionDetailModal from './SessionDetailModal';
import CalendarView from './CalendarView';
import SessionsSkeleton from './SessionsSkeleton';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import AccessibleModal from '@/components/shared/AccessibleModal';

interface SessionEdit {
    id: string;
    session_id: string;
    staff_id: string;
    field_name: string;
    old_value: string;
    new_value: string;
    created_at: string;
}

export interface Session {
    id: string;
    curso_id: string;
    instructor_id: string;
    embarcacion_id?: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    observaciones: string;
    curso?: { id: string; nombre_es: string; nombre_eu: string };
    instructor?: { id: string; nombre: string; apellidos: string };
    embarcacion?: { id: string; nombre: string };
    edits?: SessionEdit[];
    google_event_id?: string;
    isExternal?: boolean;
}

interface SessionsTabProps {
    locale: string;
}

export default function SessionsTab({ locale }: SessionsTabProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [courses, setCourses] = useState<{ id: string; nombre_es: string; nombre_eu: string; precio?: number }[]>([]);
    const [instructors, setInstructors] = useState<{ id: string; nombre: string; apellidos: string; rol?: string }[]>([]);
    const [boats, setBoats] = useState<{ id: string; nombre: string; modelo?: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [managingSession, setManagingSession] = useState<Session | null>(null);
    const [viewingHistory, setViewingHistory] = useState<Session | null>(null);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    const { addNotification } = useNotificationStore();

    // Search Loading States
    const [searchingInstructors, setSearchingInstructors] = useState(false);
    const [searchingCourses, setSearchingCourses] = useState(false);
    const [searchingBoats, setSearchingBoats] = useState(false);

    // Debounce refs
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const availabilityTimeout = useRef<NodeJS.Timeout | null>(null);

    const [availability, setAvailability] = useState<Record<string, any>>({});

    // Form State
    const [formData, setFormData] = useState<Partial<Session>>({
        curso_id: '',
        instructor_id: '',
        embarcacion_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'programada',
        observaciones: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sessRes, courseRes, instRes, boatRes, calRes] = await Promise.all([
                fetch('/api/admin/sessions/list'),
                fetch('/api/admin/courses/list'),
                fetch('/api/admin/list-staff'),
                fetch('/api/admin/boats/list'),
                fetch('/api/admin/calendar/list')
            ]);

            const [sessData, courseData, instData, boatData, calData] = await Promise.all([
                sessRes.json(),
                courseRes.json(),
                instRes.json(),
                boatRes.json(),
                calRes.json()
            ]);

            let allSessions: Session[] = [];
            if (sessRes.ok) allSessions = sessData.sessions || [];
            if (courseRes.ok) setCourses(courseData.courses || []);
            if (instRes.ok) setInstructors(instData.staff || []);
            if (boatRes.ok) setBoats(boatData.boats || []);

            // Process Google Calendar Events
            if (calRes.ok && calData.events) {
                const existingGoogleIds = new Set(allSessions.map(s => s.google_event_id).filter(Boolean));

                const externalSessions: Session[] = calData.events
                    .filter((ev: any) => !existingGoogleIds.has(ev.id))
                    .map((ev: any) => ({
                        id: `ext_${ev.id}`,
                        curso_id: 'external',
                        instructor_id: 'external',
                        embarcacion_id: null,
                        fecha_inicio: ev.start?.dateTime || ev.start?.date,
                        fecha_fin: ev.end?.dateTime || ev.end?.date,
                        estado: 'externo',
                        observaciones: ev.description || '',
                        curso: { id: 'ext', nombre_es: ev.summary || 'Evento Externo', nombre_eu: ev.summary || 'Kanpoko Ekitaldia' },
                        instructor: { id: 'ext', nombre: 'Google', apellidos: 'Calendar' },
                        isExternal: true,
                        google_event_id: ev.id
                    }));

                setSessions([...allSessions, ...externalSessions]);
            } else {
                setSessions(allSessions);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            addNotification({
                type: 'error',
                title: 'Error de carga',
                message: 'No se pudieron recuperar los datos de sesiones.',
                icon: '⚠️'
            });
        } finally {
            setLoading(false);
        }
    };

    const searchInstructors = (q: string) => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            setSearchingInstructors(true);
            try {
                const res = await fetch(`/api/admin/list-staff?q=${encodeURIComponent(q)}`);
                const data = await res.json();
                if (res.ok) setInstructors(data.staff || []);
            } catch (err: unknown) {
                console.error(err);
            } finally {
                setSearchingInstructors(false);
            }
        }, 300);
    };

    const searchCourses = (q: string) => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            setSearchingCourses(true);
            try {
                const res = await fetch(`/api/admin/courses/list?q=${encodeURIComponent(q)}`);
                const data = await res.json();
                if (res.ok) setCourses(data.courses || []);
            } catch (err: unknown) {
                console.error(err);
            } finally {
                setSearchingCourses(false);
            }
        }, 300);
    };

    const searchBoats = (q: string) => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            setSearchingBoats(true);
            try {
                const res = await fetch(`/api/admin/boats/list?q=${encodeURIComponent(q)}`);
                const data = await res.json();
                if (res.ok) setBoats(data.boats || []);
            } catch (err: unknown) {
                console.error(err);
            } finally {
                setSearchingBoats(false);
            }
        }, 300);
    };

    const checkAvailability = async (start: string, end: string, excludeId?: string) => {
        if (!start || !end) return;
        try {
            const url = `/api/admin/boats/availability?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}${excludeId ? `&excludeSessionId=${excludeId}` : ''}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setAvailability(data.availability || {});
            }
        } catch (error) {
            console.error('Error checking boat availability:', error);
        }
    };

    useEffect(() => {
        if (isModalOpen && formData.fecha_inicio && formData.fecha_fin) {
            if (availabilityTimeout.current) clearTimeout(availabilityTimeout.current);
            availabilityTimeout.current = setTimeout(() => {
                checkAvailability(formData.fecha_inicio!, formData.fecha_fin!, editingSession?.id);
            }, 500);
        }
    }, [isModalOpen, formData.fecha_inicio, formData.fecha_fin, editingSession?.id]);

    useEffect(() => {
        fetchData();
    }, []);

    const getStaffName = (staffId: string) => {
        const staff = instructors.find(i => i.id === staffId);
        return staff ? `${staff.nombre} ${staff.apellidos}` : 'Usuario del Systema';
    };

    // Helper to get local ISO string for datetime-local inputs
    const getLocalISOString = (date: Date = new Date()) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().slice(0, 16);
    };

    const handleCreate = () => {
        setEditingSession(null);
        setFormData({
            curso_id: courses[0]?.id || '',
            instructor_id: instructors[0]?.id || '', // Start with first or empty
            embarcacion_id: '',
            fecha_inicio: getLocalISOString(),
            fecha_fin: getLocalISOString(new Date(Date.now() + 3600000)),
            estado: 'programada',
            observaciones: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (session: Session) => {
        setEditingSession(session);

        // Robust date formatting to local time
        let startStr = '';
        let endStr = '';
        try {
            if (session.fecha_inicio) {
                const d = new Date(session.fecha_inicio);
                if (!isNaN(d.getTime())) startStr = getLocalISOString(d);
            }
            if (session.fecha_fin) {
                const d = new Date(session.fecha_fin);
                if (!isNaN(d.getTime())) endStr = getLocalISOString(d);
            }
        } catch (e) {
            console.error('Date parsing error in handleEdit:', e);
        }

        setFormData({
            ...session,
            fecha_inicio: startStr,
            fecha_fin: endStr,
            embarcacion_id: session.embarcacion_id || ''
        });
        setIsModalOpen(true);
    };

    const validateForm = (): boolean => {
        if (!formData.curso_id || !formData.instructor_id || !formData.fecha_inicio || !formData.fecha_fin) {
            addNotification({
                type: 'warning',
                title: 'Faltan datos',
                message: 'Por favor, completa los campos requeridos.',
                icon: '📝'
            });
            return false;
        }

        const inicio = new Date(formData.fecha_inicio);
        const fin = new Date(formData.fecha_fin);

        if (inicio >= fin) {
            addNotification({
                type: 'warning',
                title: 'Conflict de fechas',
                message: 'La hora de fin debe ser posterior a la de inicio.',
                icon: '⏰'
            });
            return false;
        }

        const duracionMs = fin.getTime() - inicio.getTime();
        const duracionHoras = duracionMs / (1000 * 60 * 60);

        if (duracionMs < 1000 * 60 * 30) {
            addNotification({
                type: 'warning',
                title: 'Duración insuficiente',
                message: 'La sesión debe durar al menos 30 minutos.',
                icon: '⏱️'
            });
            return false;
        }

        if (duracionHoras > 12) {
            addNotification({
                type: 'warning',
                title: 'Duración excesiva',
                message: 'La sesión no puede durar más de 12 horas.',
                icon: '⏱️'
            });
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setSaving(true);
        try {
            const endpoint = editingSession
                ? '/api/admin/sessions/update'
                : '/api/admin/sessions/create';

            const payload = editingSession
                ? { ...formData, id: editingSession.id }
                : formData;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                addNotification({
                    type: 'success',
                    title: editingSession ? 'Sesión actualizada' : 'Sesión creada',
                    message: editingSession ? 'Los cambios se guardaron con éxito.' : 'Nueva sesión programada.',
                    icon: '✅'
                });
                setIsModalOpen(false);
                fetchData();
            } else {
                addNotification({
                    type: 'error',
                    title: 'Error al procesar',
                    message: data.error || 'No se pudo guardar la sesión.',
                    icon: '❌'
                });
            }
        } catch (error) {
            console.error('Error saving:', error);
            addNotification({
                type: 'error',
                title: 'Error de servidor',
                message: 'Hubo un problema de conexión. Reintenta.',
                icon: '🔌'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <SessionsSkeleton />;

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div>
                    <h2 className="text-3xl font-display text-white italic">Gestión de Sesiones</h2>
                    <p className="text-white/40 text-sm">Organiza clases, instructores y barcos</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-sm w-full md:w-auto">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex-1 md:flex-none px-4 py-2 text-2xs uppercase tracking-widest font-black transition-all ${viewMode === 'list' ? 'bg-accent text-nautical-black' : 'text-white/40 hover:text-white'}`}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex-1 md:flex-none px-4 py-2 text-2xs uppercase tracking-widest font-black transition-all ${viewMode === 'calendar' ? 'bg-accent text-nautical-black' : 'text-white/40 hover:text-white'}`}
                        >
                            Calendario
                        </button>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="w-full md:w-auto bg-accent text-nautical-black px-6 py-3 text-2xs uppercase tracking-widest font-black hover:bg-white transition-all shadow-lg shadow-accent/20"
                    >
                        + Nueva Sesión
                    </button>
                </div>
            </header>

            {viewMode === 'calendar' ? (
                <CalendarView
                    sessions={sessions}
                    onSessionClick={(s: Session) => setManagingSession(s)}
                    locale={locale}
                />
            ) : (
                <div className="overflow-x-auto border border-white/5 rounded-sm scrollbar-thin scrollbar-thumb-white/10">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="sticky left-0 z-20 bg-[#020617] py-4 px-4 text-3xs uppercase tracking-[0.2em] text-accent font-bold shadow-[2px_0_10px_rgba(0,0,0,0.5)]">Fecha / Hora</th>
                                <th className="py-4 px-4 text-3xs uppercase tracking-[0.2em] text-accent font-bold">Curso</th>
                                <th className="py-4 px-4 text-3xs uppercase tracking-[0.2em] text-accent font-bold">Instructor</th>
                                <th className="hidden lg:table-cell py-4 px-4 text-3xs uppercase tracking-[0.2em] text-accent font-bold">Barco</th>
                                <th className="py-4 px-4 text-3xs uppercase tracking-[0.2em] text-accent font-bold">Estado</th>
                                <th className="py-4 px-4 text-3xs uppercase tracking-[0.2em] text-accent font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sessions.map((session: Session) => (
                                <tr key={session.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="sticky left-0 z-10 bg-[#020617] group-hover:bg-[#0f172a] transition-colors py-4 px-4 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
                                        <div className="text-white text-2xs font-bold">
                                            {new Date(session.fecha_inicio).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}
                                        </div>
                                        <div className="text-white/40 text-3xs whitespace-nowrap">
                                            {new Date(session.fecha_inicio).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(session.fecha_fin).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="text-white text-sm font-display italic leading-tight">
                                            {locale === 'eu' ? (session.curso?.nombre_eu || session.curso?.nombre_es) : session.curso?.nombre_es}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="text-white/60 text-2xs">
                                            {session.isExternal
                                                ? (session.instructor?.nombre || 'Google Calendar')
                                                : (session.instructor?.id ? `${session.instructor.nombre} ${session.instructor.apellidos}` : 'No asignado')}
                                        </div>
                                    </td>
                                    <td className="hidden lg:table-cell py-4 px-4 text-white/40 text-2xs">
                                        {session.embarcacion?.nombre || '—'}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-0.5 text-3xs uppercase tracking-widest font-black border ${session.estado === 'programada' ? 'border-blue-500/50 text-blue-400' :
                                            session.estado === 'realizada' ? 'border-green-500/50 text-green-400' :
                                                'border-red-500/50 text-red-400'
                                            } bg-white/5 rounded-[2px]`}>
                                            {session.estado}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            {session.edits && session.edits.length > 0 && (
                                                <button
                                                    onClick={() => setViewingHistory(session)}
                                                    className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent hover:bg-accent hover:text-nautical-black transition-all group/history"
                                                    title={`${session.edits.length} cambios registrados`}
                                                >
                                                    <span className="text-3xs font-bold group-hover/history:scale-110 transition-transform">H</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setManagingSession(session)}
                                                className="text-2xs uppercase tracking-widest text-accent hover:text-white transition-all border border-accent/20 px-3 py-1.5 hover:bg-accent hover:text-nautical-black font-black whitespace-nowrap rounded-[2px]"
                                            >
                                                Gestionar
                                            </button>
                                            <button
                                                onClick={() => handleEdit(session)}
                                                className="text-2xs uppercase tracking-widest text-white/30 hover:text-white transition-all font-bold px-1 flex items-center gap-1"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                                Editar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {sessions.length === 0 && (
                        <div className="py-12 text-center text-white/20 italic">No hay sesiones programadas</div>
                    )}
                </div>
            )}

            <AccessibleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSession ? 'Editar Sesión' : 'Nueva Sesión'}
                maxWidth="max-w-2xl"
            >
                <div className="space-y-6 pb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <SearchableSelect
                            label="Curso"
                            placeholder="Seleccionar curso..."
                            value={formData.curso_id || ''}
                            onChange={(val: string) => setFormData({ ...formData, curso_id: val })}
                            options={courses.map(c => ({
                                id: c.id,
                                label: locale === 'eu' ? (c.nombre_eu || c.nombre_es) : c.nombre_es,
                                subLabel: `Precio: ${c.precio}€`
                            }))}
                            onSearch={searchCourses}
                            loading={searchingCourses}
                        />
                        <SearchableSelect
                            label="Instructor"
                            placeholder="Seleccionar instructor..."
                            value={formData.instructor_id || ''}
                            onChange={(val: string) => setFormData({ ...formData, instructor_id: val })}
                            options={instructors.map(i => ({
                                id: i.id,
                                label: `${i.nombre} ${i.apellidos}`,
                                subLabel: i.rol
                            }))}
                            onSearch={searchInstructors}
                            loading={searchingInstructors}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Inicio</label>
                            <input
                                type="datetime-local"
                                className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent rounded-sm"
                                value={formData.fecha_inicio}
                                onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Fin</label>
                            <input
                                type="datetime-local"
                                className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent rounded-sm"
                                value={formData.fecha_fin}
                                onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <SearchableSelect
                            label="Embarcación (Opcional)"
                            placeholder="Sin barco asignado"
                            value={formData.embarcacion_id || ''}
                            onChange={(val: string) => setFormData({ ...formData, embarcacion_id: val || null })}
                            options={boats.map(b => {
                                const isOccupied = availability[b.id];
                                return {
                                    id: b.id,
                                    label: b.nombre,
                                    subLabel: isOccupied
                                        ? `Ocupado: ${isOccupied.occupiedBy} (${isOccupied.instructor})`
                                        : b.modelo || 'Disponible',
                                    status: (isOccupied ? 'occupied' : 'free') as 'occupied' | 'free',
                                    statusLabel: isOccupied ? 'Ocupado' : 'Libre'
                                };
                            }).sort((a, b) => {
                                // Sort occupied boats to the end
                                if (a.status === 'occupied' && b.status === 'free') return 1;
                                if (a.status === 'free' && b.status === 'occupied') return -1;
                                return a.label.localeCompare(b.label);
                            })}
                            onSearch={searchBoats}
                            loading={searchingBoats}
                        />
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Estado</label>
                            <select
                                className="w-full bg-nautical-black border border-white/10 p-3 text-white outline-none focus:border-accent rounded-sm"
                                value={formData.estado}
                                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                            >
                                <option value="programada" className="bg-nautical-black">Programada</option>
                                <option value="en_curso" className="bg-nautical-black">En Curso</option>
                                <option value="realizada" className="bg-nautical-black">Realizada</option>
                                <option value="cancelada" className="bg-nautical-black">Cancelada</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Observaciones / Feedback</label>
                        <textarea
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent resize-none text-sm rounded-sm"
                            value={formData.observaciones}
                            onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                            onFocus={(e) => e.target.select()}
                            placeholder="Detalles sobre la meteorología, incidencias o material..."
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-4 border-t border-white/5">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-3 border border-white/10 text-white/40 hover:text-white uppercase tracking-[0.2em] text-3xs font-bold rounded-sm transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-accent text-nautical-black hover:bg-white uppercase tracking-[0.2em] text-3xs font-black rounded-sm shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Guardando...' : (editingSession ? 'Actualizar Sesión' : 'Crear Sesión')}
                    </button>
                </div>
            </AccessibleModal>

            {/* Session Detail / Management Modal */}
            {managingSession && (
                <SessionDetailModal
                    session={managingSession}
                    onClose={() => setManagingSession(null)}
                    allInstructors={instructors}
                    allBoats={boats}
                    allCourses={courses}
                    onUpdate={async (updatedData) => {
                        try {
                            const isExternal = updatedData.isExternal || (updatedData.id && String(updatedData.id).startsWith('ext_'));
                            const endpoint = isExternal
                                ? '/api/admin/sessions/create'
                                : '/api/admin/sessions/update';

                            let payload: any = updatedData;

                            if (isExternal) {
                                payload = {
                                    ...updatedData,
                                    id: undefined, // Let DB generate new ID
                                    google_event_id: updatedData.google_event_id
                                };
                            } else {
                                // Clean joined objects that shouldn't be in the update payload
                                const { curso, instructor, embarcacion, edits, ...cleanData } = updatedData as any;
                                payload = cleanData;
                            }

                            const res = await fetch(endpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            });

                            if (res.ok) {
                                addNotification({
                                    type: 'success',
                                    title: isExternal ? 'Sesión vinculada' : 'Sesión actualizada',
                                    message: isExternal ? 'El evento de Google Calendar se ha guardado en la base de datos.' : 'Se han guardado los cambios con éxito.',
                                    icon: '✅'
                                });
                                setManagingSession(null);
                                fetchData();
                            } else {
                                let errorMsg = 'No se pudo guardar la información.';
                                try {
                                    const data = await res.json();
                                    errorMsg = data.error || errorMsg;
                                } catch (e) {
                                    // Handle non-JSON response
                                    console.error('Failed to parse error JSON', e);
                                }

                                addNotification({
                                    type: 'error',
                                    title: 'Error de servidor',
                                    message: errorMsg,
                                    icon: '❌'
                                });
                            }
                        } catch (e) {
                            console.error('onUpdate error:', e);
                            addNotification({
                                type: 'error',
                                title: 'Error de conexión',
                                message: 'Hubo un fallo en la comunicación con el servidor. Reintenta.',
                                icon: '🔌'
                            });
                        }
                    }}
                />
            )}

            {/* HISTORY MODAL */}
            {viewingHistory && (
                <AccessibleModal
                    isOpen={!!viewingHistory}
                    onClose={() => setViewingHistory(null)}
                    title="Historial de Cambios"
                    maxWidth="max-w-4xl"
                >
                    <div className="space-y-6">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                            <h4 className="text-3xs uppercase tracking-widest text-white/40 mb-2 font-bold">Sesión</h4>
                            <p className="text-white font-display italic text-lg mb-1">
                                {viewingHistory.curso?.nombre_es || 'Sin Curso'}
                            </p>
                            <div className="flex gap-4 text-2xs text-white/40 font-mono">
                                <span>ID: {viewingHistory.id.slice(0, 8)}</span>
                                <span>{new Date(viewingHistory.fecha_inicio).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {viewingHistory.edits && viewingHistory.edits.length > 0 ? (
                            <div className="overflow-hidden border border-white/10 rounded-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/[0.03] border-b border-white/10">
                                            <th className="py-3 px-4 text-3xs uppercase tracking-widest text-accent font-bold">Fecha/Hora</th>
                                            <th className="py-3 px-4 text-3xs uppercase tracking-widest text-accent font-bold">Campo</th>
                                            <th className="py-3 px-4 text-3xs uppercase tracking-widest text-accent font-bold">Antes</th>
                                            <th className="py-3 px-4 text-3xs uppercase tracking-widest text-accent font-bold">Después</th>
                                            <th className="py-3 px-4 text-3xs uppercase tracking-widest text-accent font-bold">Por quién</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 bg-nautical-black">
                                        {viewingHistory.edits.map((edit) => (
                                            <tr key={edit.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 text-white/60 text-2xs whitespace-nowrap align-top">
                                                    {new Date(edit.created_at).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-white text-2xs font-mono align-top text-white/80">
                                                    {edit.field_name}
                                                </td>
                                                <td className="py-3 px-4 text-red-400/60 text-2xs italic line-through align-top break-all max-w-[150px]">
                                                    {edit.old_value}
                                                </td>
                                                <td className="py-3 px-4 text-sea-foam text-2xs font-bold align-top break-all max-w-[150px]">
                                                    {edit.new_value}
                                                </td>
                                                <td className="py-3 px-4 text-accent/80 text-3xs uppercase tracking-wide align-top">
                                                    {getStaffName(edit.staff_id)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/10 rounded-sm text-white/20 italic">
                                No se encontraron registros de cambios.
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setViewingHistory(null)}
                                className="px-6 py-3 border border-white/10 text-3xs uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all rounded-sm"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </AccessibleModal>
            )}
        </div>
    );
}
