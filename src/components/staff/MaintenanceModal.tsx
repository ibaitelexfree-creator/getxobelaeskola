
'use client';
import React, { useState, useEffect } from 'react';
import AccessibleModal from '../shared/AccessibleModal';

interface Boat {
    id: string;
    nombre: string;
}

interface MaintenanceModalProps {
    boat: Boat;
    onClose: () => void;
}

interface MaintenanceLog {
    id: string;
    tipo: string;
    descripcion: string;
    coste: number;
    estado: string;
    notas: string;
    created_at: string;
    embarcacion_id: string;
    staff?: {
        nombre: string;
        apellidos: string;
    }
}

export default function MaintenanceModal({ boat, onClose }: MaintenanceModalProps) {
    const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<MaintenanceLog[]>([]);
    const [formData, setFormData] = useState({
        tipo: 'correctivo',
        descripcion: '',
        coste: 0,
        estado: 'pendiente',
        notas: ''
    });

    const fetchLogs = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/boats/maintenance?boatId=${boat.id}`);
            const data = await res.json();
            if (res.ok) setLogs(data.logs || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [boat.id]);

    useEffect(() => {
        if (activeTab === 'history') fetchLogs();
    }, [activeTab, fetchLogs]);

    const [error, setError] = useState<string | null>(null);

    const handleCreateLog = async () => {
        setError(null);
        try {
            const res = await fetch('/api/admin/boats/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    embarcacion_id: boat.id
                })
            });
            const data = await res.json();

            if (res.ok) {
                alert('Mantenimiento registrado');
                setFormData({ tipo: 'correctivo', descripcion: '', coste: 0, estado: 'pendiente', notas: '' });
                setActiveTab('history');
            } else {
                console.error('Error creating log:', data);
                setError(data.error || 'Error desconocido al registrar el mantenimiento');
            }
        } catch (err) {
            console.error('Connection error:', err);
            setError('Error de conexión al servidor');
        }
    };

    const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);
    const [updateFormData, setUpdateFormData] = useState({
        descripcion: '',
        status: '',
        coste: 0
    });

    const handleUpdateStatus = (log: MaintenanceLog, newStatus: string) => {
        if (log.estado === newStatus) return;
        setEditingLog(log);
        setUpdateFormData({
            descripcion: log.descripcion,
            status: newStatus,
            coste: log.coste
        });
    };

    const handleSaveUpdate = async () => {
        if (!editingLog) return;
        try {
            // Instead of update, we create a NEW record as requested
            const res = await fetch('/api/admin/boats/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embarcacion_id: boat.id,
                    tipo: editingLog.tipo, // Keep the same type
                    estado: updateFormData.status,
                    descripcion: updateFormData.descripcion,
                    coste: updateFormData.coste
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Refresh list to get everything correctly from DB
                fetchLogs();
                setEditingLog(null);
                setUpdateFormData({ descripcion: '', status: '', coste: 0 });
            } else {
                alert('Error al generar el nuevo registro de estado');
            }
        } catch (e) {
            console.error(e);
            alert('Error de conexión');
        }
    };

    if (editingLog) {
        return (
            <AccessibleModal
                isOpen={true}
                onClose={() => setEditingLog(null)}
                title="Actualizar Estado de Incidencia"
                maxWidth="max-w-xl"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-sm mb-6">
                        <span className="text-3xs uppercase tracking-widest text-white/40 block mb-1">Incidencia Original</span>
                        <p className="text-white italic text-sm">{editingLog.descripcion}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Nuevo Estado</label>
                            <div className="flex gap-2">
                                {['pendiente', 'en_proceso', 'completado'].map(st => (
                                    <button
                                        key={st}
                                        onClick={() => setUpdateFormData({ ...updateFormData, status: st })}
                                        className={`flex-1 py-3 text-3xs uppercase tracking-widest font-bold border transition-all ${updateFormData.status === st ?
                                            (st === 'completado' ? 'bg-green-500 text-nautical-black border-green-500' :
                                                st === 'en_proceso' ? 'bg-blue-500 text-white border-blue-500' :
                                                    'bg-white text-nautical-black border-white')
                                            : 'border-white/10 text-white/30 hover:bg-white/5'
                                            }`}
                                    >
                                        {st.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Descripción / Notas de Actualización</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent resize-none min-h-[100px]"
                                value={updateFormData.descripcion}
                                onChange={e => setUpdateFormData({ ...updateFormData, descripcion: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Coste Actualizado (€)</label>
                            <input
                                type="number"
                                className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent"
                                value={updateFormData.coste}
                                onChange={e => setUpdateFormData({ ...updateFormData, coste: parseFloat(e.target.value) || 0 })}
                                onFocus={(e) => e.target.select()}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => setEditingLog(null)}
                            className="flex-1 py-4 border border-white/10 text-3xs uppercase tracking-widest text-white/40 hover:text-white transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveUpdate}
                            className="flex-1 py-4 bg-accent text-nautical-black text-3xs uppercase font-black tracking-widest hover:bg-white transition-all"
                        >
                            Confirmar Actualización
                        </button>
                    </div>
                </div>
            </AccessibleModal>
        );
    }

    return (
        <AccessibleModal
            isOpen={true}
            onClose={onClose}
            title={`${boat.nombre} - Mantenimiento`}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-6">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-4 py-2 text-3xs uppercase tracking-widest font-black transition-all border-b-2 ${activeTab === 'create' ? 'border-accent text-accent' : 'border-transparent text-white/40 hover:text-white'}`}
                    >
                        Nueva Incidencia
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-3xs uppercase tracking-widest font-black transition-all border-b-2 ${activeTab === 'history' ? 'border-accent text-accent' : 'border-transparent text-white/40 hover:text-white'}`}
                    >
                        Historial
                    </button>
                </div>

                {activeTab === 'create' ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Tipo</label>
                                <select
                                    className="w-full bg-nautical-black border border-white/10 p-3 text-white outline-none focus:border-accent"
                                    value={formData.tipo}
                                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                >
                                    <option value="correctivo">Correctivo (Avería)</option>
                                    <option value="preventivo">Preventivo (Revisión)</option>
                                    <option value="mejora">Mejora / Upgrade</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Estado Inicial</label>
                                <select
                                    className="w-full bg-nautical-black border border-white/10 p-3 text-white outline-none focus:border-accent"
                                    value={formData.estado}
                                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="en_proceso">En Proceso</option>
                                    <option value="completado">Completado</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Descripción de la incidencia</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent resize-none min-h-[100px]"
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                placeholder="Describe el problema o trabajo necesario..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Coste Estimado (€)</label>
                            <input
                                type="number"
                                className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent"
                                value={formData.coste}
                                onChange={e => setFormData({ ...formData, coste: parseFloat(e.target.value) || 0 })}
                                onFocus={(e) => e.target.select()}
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-2xs rounded-lg animate-pulse">
                                <strong>Error:</strong> {error}
                                {error.includes('relation') && (
                                    <div className="mt-2 text-3xs opacity-80">
                                        Parece que falta la tabla de mantenimiento. Ejecuta la migración <code>20240210_create_maintenance_logs.sql</code>.
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleCreateLog}
                            className="w-full py-4 bg-accent text-nautical-black text-3xs uppercase font-black tracking-widest hover:bg-white transition-all mt-4"
                        >
                            Registrar Mantenimiento
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-10 opacity-50 animate-pulse text-white">Cargando historial...</div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-white/10 text-white/30 italic">No hay registros de mantenimiento.</div>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="p-4 bg-white/5 border border-white/5 rounded-sm group hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="space-y-1">
                                            <span className={`px-2 py-1 text-[8px] uppercase tracking-widest font-bold border ${log.tipo === 'correctivo' ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500'}`}>
                                                {log.tipo}
                                            </span>
                                            {log.staff && (
                                                <span className="block text-3xs text-accent/60 uppercase tracking-tighter">
                                                    Registrado por: {log.staff.nombre} {log.staff.apellidos}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-3xs text-white/40">{new Date(log.created_at).toLocaleDateString()}</span>
                                            <span className="block text-3xs text-white/20 font-mono">
                                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-white italic mb-3">{log.descripcion}</p>
                                    <div className="flex flex-wrap justify-between items-center border-t border-white/5 pt-3 gap-2">
                                        <div className="flex gap-2">
                                            {['pendiente', 'en_proceso', 'completado'].map(st => (
                                                <button
                                                    key={st}
                                                    onClick={() => handleUpdateStatus(log, st)}
                                                    className={`px-2 py-1 text-[8px] uppercase tracking-widest border transition-all ${log.estado === st ? 'bg-white text-nautical-black border-white' : 'border-white/10 text-white/20 hover:text-white'}`}
                                                >
                                                    {st.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-3xs text-white/30 font-mono">Coste: {log.coste}€</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </AccessibleModal>
    );
}
