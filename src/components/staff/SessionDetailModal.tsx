'use client';
import React, { useState, useEffect } from 'react';
import AccessibleModal from '@/components/shared/AccessibleModal';
import SearchableSelect from '@/components/ui/SearchableSelect';

interface Session {
    id: string;
    curso_id: string;
    instructor_id: string;
    embarcacion_id?: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    observaciones: string;
    curso?: { nombre_es: string; nombre_eu: string };
    instructor?: { nombre: string; apellidos: string };
    embarcacion?: { nombre: string };
    edits?: any[];
    google_event_id?: string;
    isExternal?: boolean;
}

interface Student {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
}

interface AttendanceRecord {
    status: string;
    notes: string;
}

interface SessionDetailModalProps {
    session: Session;
    onClose: () => void;
    onUpdate: (session: Session) => Promise<void>;
    allInstructors: { id: string; nombre: string; apellidos: string, rol?: string }[];
    allBoats: { id: string; nombre: string, modelo?: string }[];
    allCourses: { id: string; nombre_es: string; nombre_eu: string }[];
}

export default function SessionDetailModal({ session, onClose, onUpdate, allInstructors, allBoats, allCourses }: SessionDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'report'>('info');
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
    const [availability, setAvailability] = useState<Record<string, any>>({});

    // Robust initialization with defaults
    const [formData, setFormData] = useState<Session>({
        ...session,
        curso_id: session.curso_id === 'external' ? '' : session.curso_id,
        instructor_id: session.instructor_id === 'external' ? '' : session.instructor_id,
        embarcacion_id: session.embarcacion_id || '',
        estado: session.estado || 'programada',
        observaciones: session.observaciones || '',
        fecha_inicio: session.fecha_inicio || new Date().toISOString(),
        fecha_fin: session.fecha_fin || new Date().toISOString()
    });

    const [isSaving, setIsSaving] = useState(false);

    // Fetch students enrolled in the course and existing attendance
    useEffect(() => {
        if (!session?.curso_id || session.curso_id === 'external') return;

        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Students enrolled in this course (using dedicated API)
                const studentsRes = await fetch(`/api/admin/course-students?courseId=${session.curso_id}`);
                if (studentsRes.ok) {
                    const studentsData = await studentsRes.json();
                    setStudents(studentsData.students || []);
                } else {
                    setStudents([]);
                }

                // 2. Fetch existing attendance for this session
                const attendanceRes = await fetch(`/api/admin/sessions/attendance?sessionId=${session.id}`);
                if (attendanceRes.ok) {
                    const attendanceData = await attendanceRes.json();
                    if (attendanceData.attendance) {
                        const attMap: Record<string, AttendanceRecord> = {};
                        attendanceData.attendance.forEach((rec: { usuario_id: string, asistencia: string, notas: string }) => {
                            attMap[rec.usuario_id] = { status: rec.asistencia, notes: rec.notas || '' };
                        });
                        setAttendance(attMap);
                    }
                }
            } catch (error) {
                console.error('Error loading session data:', error);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'attendance') {
            loadData();
        }
    }, [session?.id, session?.curso_id, activeTab]);

    // Check boat availability when dates change
    useEffect(() => {
        if (!formData.fecha_inicio || !formData.fecha_fin) return;

        const checkAvailability = async () => {
            try {
                const res = await fetch(`/api/admin/boats/availability?start=${encodeURIComponent(formData.fecha_inicio)}&end=${encodeURIComponent(formData.fecha_fin)}&excludeSessionId=${encodeURIComponent(session.id)}`);
                const data = await res.json();
                if (data.success) {
                    setAvailability(data.availability || {});
                }
            } catch (error) {
                console.error('Error checking boat availability:', error);
            }
        };

        const timer = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timer);
    }, [formData.fecha_inicio, formData.fecha_fin, session.id]);

    const handleAttendanceChange = async (studentId: string, status: string) => {
        // Optimistic update
        setAttendance((prev: Record<string, AttendanceRecord>) => ({
            ...prev,
            [studentId]: { ...prev[studentId], status, notes: prev[studentId]?.notes || '' }
        }));

        // Persist
        try {
            await fetch('/api/admin/sessions/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: session.id,
                    studentId,
                    asistencia: status
                })
            });
        } catch (error) {
            console.error('Error saving attendance:', error);
        }
    };

    const handleSaveInfo = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await onUpdate(formData);
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to get local ISO string for datetime-local inputs
    const getLocalISOString = (dateStr: string) => {
        try {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            return localDate.toISOString().slice(0, 16);
        } catch {
            return '';
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            if (!dateStr) return '--/--/----';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '--/--/----';
            return d.toLocaleDateString();
        } catch {
            return '--/--/----';
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            if (!dateStr) return '--:--';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '--:--';
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '--:--';
        }
    };

    if (!session) return null;

    return (
        <AccessibleModal
            isOpen={true}
            onClose={onClose}
            title="Gestión de Sesión"
            maxWidth="max-w-5xl"
        >
            <div className="-mx-8 -mt-8 mb-8">
                {/* Rich Header Recreated */}
                <div className="p-8 border-b border-white/10 bg-white/5">
                    <span className="text-accent uppercase tracking-[0.4em] text-3xs font-bold block mb-2">
                        {session.curso?.nombre_es || 'Sesión sin curso'}
                    </span>
                    <p className="text-white/40 text-sm mt-1 font-light">
                        {formatDate(session.fecha_inicio)} • {formatTime(session.fecha_inicio)} - {formatTime(session.fecha_fin)}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 px-8 bg-card">
                    {['info', 'attendance', 'report'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as 'info' | 'attendance' | 'report')}
                            className={`px-8 py-5 text-3xs uppercase tracking-widest font-black transition-all border-b-2 ${activeTab === tab ? 'border-accent text-accent bg-accent/5' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab === 'info' ? 'Detalles Operativos' : tab === 'attendance' ? 'Control Asistencia' : 'Reporte Instructor'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {activeTab === 'info' && (
                    <div className="space-y-8 max-w-3xl mx-auto py-4">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-3xs uppercase tracking-widest text-accent font-bold">Estado Actual</label>
                                <select
                                    className="w-full bg-nautical-black border border-white/10 p-4 text-white text-sm outline-none focus:border-accent transition-colors rounded-sm appearance-none"
                                    value={formData.estado || 'programada'}
                                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                >
                                    <option value="programada">Programada</option>
                                    <option value="en_curso">En Curso</option>
                                    <option value="realizada">Realizada</option>
                                    <option value="cancelada">Cancelada</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <SearchableSelect
                                    label="Instructor Asignado"
                                    placeholder="Seleccionar instructor..."
                                    value={formData.instructor_id}
                                    onChange={(val) => setFormData({ ...formData, instructor_id: val })}
                                    options={allInstructors.map(i => ({
                                        id: i.id,
                                        label: `${i.nombre} ${i.apellidos}`,
                                        subLabel: i.rol
                                    }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <SearchableSelect
                                    label="Embarcación"
                                    placeholder="Sin barco asignado"
                                    value={formData.embarcacion_id || ''}
                                    onChange={(val) => setFormData({ ...formData, embarcacion_id: val || null })}
                                    options={allBoats.map(b => {
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
                                />
                            </div>
                            <div className="space-y-3">
                                <SearchableSelect
                                    label="Curso / Actividad"
                                    placeholder="Seleccionar curso..."
                                    value={formData.curso_id}
                                    onChange={(val) => setFormData({ ...formData, curso_id: val })}
                                    options={[
                                        { id: '00000000-0000-0000-0000-000000000000', label: 'Otros / Eventos Especiales', subLabel: 'Actividades varias' },
                                        ...allCourses.map(c => ({
                                            id: c.id,
                                            label: c.nombre_es,
                                            subLabel: c.nombre_eu
                                        }))
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-3xs uppercase tracking-widest text-accent font-bold">Horario Programado</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[8px] uppercase tracking-widest text-white/30 block">Inicio</span>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm outline-none focus:border-accent rounded-sm functionality-input"
                                        value={getLocalISOString(formData.fecha_inicio)}
                                        onChange={e => {
                                            const d = new Date(e.target.value);
                                            if (!isNaN(d.getTime())) {
                                                setFormData({ ...formData, fecha_inicio: d.toISOString() });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[8px] uppercase tracking-widest text-white/30 block">Fin</span>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm outline-none focus:border-accent rounded-sm functionality-input"
                                        value={getLocalISOString(formData.fecha_fin)}
                                        onChange={e => {
                                            const d = new Date(e.target.value);
                                            if (!isNaN(d.getTime())) {
                                                setFormData({ ...formData, fecha_fin: d.toISOString() });
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <button
                                onClick={handleSaveInfo}
                                disabled={isSaving}
                                className={`w-full py-4 text-nautical-black text-2xs uppercase font-black tracking-[0.2em] transition-all rounded-sm shadow-lg shadow-accent/10 ${isSaving ? 'bg-white/50 cursor-not-allowed' : 'bg-accent hover:bg-white'}`}
                            >
                                {isSaving ? 'Guardando...' : 'Confirmar Cambios'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-2xs text-white/40 uppercase tracking-widest">
                                {students.length} Alumnos matriculados
                            </p>
                            <div className="text-3xs text-white/30 italic">
                                La asistencia se guarda automáticamente al pulsar los botones.
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                <span className="text-white/40 text-2xs uppercase tracking-widest">Cargando lista...</span>
                            </div>
                        ) : students.length > 0 ? (
                            <div className="grid gap-3">
                                {students.map((student: Student) => {
                                    const status = attendance[student.id]?.status || 'pendiente';
                                    return (
                                        <div key={student.id} className="p-5 bg-white/5 border border-white/5 rounded-sm flex flex-col md:flex-row justify-between items-center gap-4 group hover:bg-white/[0.07] transition-all">
                                            <div className="flex items-center gap-5 w-full md:w-auto">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-nautical-black text-lg transition-colors duration-300 ${status === 'presente' ? 'bg-sea-foam text-nautical-black shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]' :
                                                    status === 'ausente' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                                        status === 'retraso' ? 'bg-amber-400 text-nautical-black' :
                                                            'bg-white/10 text-white/40'
                                                    }`}>
                                                    {student.nombre?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-lg text-white font-display italic group-hover:text-accent transition-colors">{student.nombre || 'Desconocido'} {student.apellidos || ''}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className="text-2xs text-white/40 font-light tracking-wide">{student.email || 'Sin email'}</p>
                                                        <button className="text-3xs uppercase tracking-wider text-white/20 hover:text-white transition-colors border-b border-white/10 hover:border-white">
                                                            Ver Perfil
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 w-full md:w-auto">
                                                {[
                                                    { id: 'presente', label: 'Presente', activeClass: 'bg-sea-foam border-sea-foam text-nautical-black font-bold' },
                                                    { id: 'retraso', label: 'Retraso', activeClass: 'bg-amber-400 border-amber-400 text-nautical-black font-bold' },
                                                    { id: 'ausente', label: 'Ausente', activeClass: 'bg-red-500 border-red-500 text-white font-bold' }
                                                ].map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => handleAttendanceChange(student.id, option.id)}
                                                        className={`flex-1 md:flex-none px-5 py-2.5 text-3xs uppercase tracking-widest transition-all border rounded-sm ${status === option.id
                                                            ? option.activeClass
                                                            : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white hover:bg-white/5'
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-sm text-white/20 bg-white/[0.02]">
                                <span className="text-4xl mb-4 opacity-50">👥</span>
                                <p className="text-sm font-light">No hay alumnos inscritos en este curso.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'report' && (
                    <div className="space-y-6 h-full flex flex-col max-w-4xl mx-auto">
                        <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-sm mb-4">
                            <h4 className="text-amber-500 text-3xs uppercase tracking-widest font-bold mb-2">Instrucciones</h4>
                            <p className="text-amber-200/60 text-2xs font-light leading-relaxed">
                                Utiliza este espacio para registrar cualquier incidencia, cambios en las condiciones meteorológicas, daños en el material o notas sobre el progreso del grupo. Esta información será visible por la administración.
                            </p>
                        </div>

                        <textarea
                            value={formData.observaciones || ''}
                            onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                            onFocus={(e) => e.target.select()}
                            className="flex-1 bg-white/5 border border-white/10 p-6 text-white text-base outline-none focus:border-accent resize-none rounded-sm min-h-[300px] font-light leading-relaxed placeholder:text-white/20"
                            placeholder="Escribe el reporte detallado de la sesión aquí... Ejemplo: Viento fuerza 4, mar picada. El alumno X ha mejorado notablemente en la maniobra de virada."
                        />
                        <button
                            onClick={handleSaveInfo}
                            disabled={isSaving}
                            className={`w-full py-4 border text-2xs uppercase font-black tracking-[0.2em] transition-all rounded-sm ${isSaving ? 'border-white/10 text-white/20' : 'border-accent text-accent hover:bg-accent hover:text-nautical-black'}`}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Reporte de Sesión'}
                        </button>
                    </div>
                )}
            </div>
        </AccessibleModal>
    );
}
