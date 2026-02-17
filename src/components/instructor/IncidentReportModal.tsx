'use client';
import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';


interface Boat {
    id: string;
    nombre: string;
    tipo: string;
    estado: string;
}

interface IncidentReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function IncidentReportModal({ isOpen, onClose }: IncidentReportModalProps) {
    const [boats, setBoats] = useState<Boat[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        embarcacion_id: '',
        tipo: 'averia', // averia, accidente, mantenimiento, otro
        descripcion: '',
        prioridad: 'media' // baja, media, alta, critica
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            // Fetch boats for the dropdown
            fetch(apiUrl('/api/admin/boats/list'))
                .then(res => res.json())
                .then(data => {
                    if (data.boats) {
                        setBoats(data.boats);
                    }
                })
                .catch(err => console.error('Error fetching boats:', err))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.embarcacion_id) {
            alert('Por favor selecciona una embarcación');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(apiUrl('/api/admin/boats/maintenance'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    coste: 0, // Default to 0, admin will fill later
                    estado: 'pendiente'
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Incidencia registrada correctamente');
                onClose();
                // Reset form
                setFormData({
                    embarcacion_id: '',
                    tipo: 'averia',
                    descripcion: '',
                    prioridad: 'media'
                });
            } else {
                alert(data.error || 'Error al registrar incidencia');
            }
        } catch (error) {
            console.error('Error submitting incident:', error);
            alert('Error de conexión');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-nautical-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-nautical-black border border-red-500/30 p-0 shadow-2xl flex flex-col rounded-sm">

                {/* Header - Red for urgency */}
                <div className="p-8 border-b border-red-500/20 bg-red-500/5 flex justify-between items-start">
                    <div>
                        <span className="text-red-500/80 uppercase tracking-[0.4em] text-3xs font-bold block mb-2">Sistema de Alertas</span>
                        <h3 className="text-2xl font-display text-white italic">Reportar Incidencia</h3>
                    </div>
                    <button onClick={onClose} className="text-white/20 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center">✕</button>
                </div>

                <div className="p-8 bg-card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Embarcación Afectada</label>
                            {loading ? (
                                <div className="p-4 bg-white/5 border border-white/10 text-2xs text-white/40 italic">Cargando flota...</div>
                            ) : (
                                <select
                                    className="w-full bg-nautical-black border border-white/10 p-4 text-white text-sm outline-none focus:border-red-500/50 transition-colors rounded-sm"
                                    value={formData.embarcacion_id}
                                    onChange={e => setFormData({ ...formData, embarcacion_id: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar barco...</option>
                                    {boats.map(boat => (
                                        <option key={boat.id} value={boat.id}>{boat.nombre} ({boat.tipo})</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Tipo de Incidencia</label>
                                <select
                                    className="w-full bg-nautical-black border border-white/10 p-4 text-white text-sm outline-none focus:border-red-500/50 transition-colors rounded-sm"
                                    value={formData.tipo}
                                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                >
                                    <option value="averia">Avería Mecánica</option>
                                    <option value="accidente">Accidente / Golpe</option>
                                    <option value="material">Material Dañado</option>
                                    <option value="limpieza">Limpieza Urgente</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Prioridad</label>
                                <select
                                    className="w-full bg-nautical-black border border-white/10 p-4 text-white text-sm outline-none focus:border-red-500/50 transition-colors rounded-sm"
                                    value={formData.prioridad}
                                    onChange={e => setFormData({ ...formData, prioridad: e.target.value })}
                                >
                                    <option value="baja">Baja (Puede esperar)</option>
                                    <option value="media">Media (Atender pronto)</option>
                                    <option value="alta">Alta (Impide navegar)</option>
                                    <option value="critica">CRÍTICA (Peligro)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Descripción del Problema</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm outline-none focus:border-red-500/50 transition-colors rounded-sm min-h-[120px] resize-none"
                                placeholder="Describe qué ha pasado, dónde está el daño, etc..."
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-red-500/80 hover:bg-red-500 text-white text-3xs uppercase font-black tracking-[0.2em] transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                            >
                                {submitting ? 'Registrando...' : 'Registrar Incidencia'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
