'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Power, Edit3, Loader2 } from 'lucide-react';
import AccessibleModal from '../../shared/AccessibleModal';

interface Course {
    id: string;
    nombre_es: string;
}

interface Campaign {
    id: string;
    nombre: string;
    descripcion: string;
    curso_trigger_id: string;
    dias_espera: number;
    curso_objetivo_id: string;
    cupon_codigo: string;
    stripe_coupon_id: string;
    descuento_porcentaje: number;
    activo: boolean;
    trigger_course?: { nombre_es: string };
    target_course?: { nombre_es: string };
}

export default function CampaignManager() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<Campaign>>({
        nombre: '',
        descripcion: '',
        curso_trigger_id: '',
        dias_espera: 90,
        curso_objetivo_id: '',
        cupon_codigo: '',
        stripe_coupon_id: '',
        descuento_porcentaje: 10,
        activo: true
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [campRes, courseRes] = await Promise.all([
                fetch('/api/admin/marketing/campaigns'),
                fetch('/api/admin/courses/list')
            ]);
            const campData = await campRes.json();
            const courseData = await courseRes.json();

            if (campData.campaigns) setCampaigns(campData.campaigns);
            if (courseData.courses) setCourses(courseData.courses);
        } catch (error) {
            console.error('Error fetching marketing data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/marketing/campaigns/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activo: !currentStatus })
            });
            if (res.ok) {
                setCampaigns(prev => prev.map(c => c.id === id ? { ...c, activo: !currentStatus } : c));
            }
        } catch (error) {
            console.error('Error toggling campaign status:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta campaña?')) return;
        try {
            const res = await fetch(`/api/admin/marketing/campaigns/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCampaigns(prev => prev.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error('Error deleting campaign:', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = editingCampaign
                ? `/api/admin/marketing/campaigns/${editingCampaign.id}`
                : '/api/admin/marketing/campaigns';
            const method = editingCampaign ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchInitialData();
                setIsModalOpen(false);
                setEditingCampaign(null);
            }
        } catch (error) {
            console.error('Error saving campaign:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const openCreateModal = () => {
        setEditingCampaign(null);
        setFormData({
            nombre: '',
            descripcion: '',
            curso_trigger_id: '',
            dias_espera: 90,
            curso_objetivo_id: '',
            cupon_codigo: '',
            stripe_coupon_id: '',
            descuento_porcentaje: 10,
            activo: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setFormData({
            nombre: campaign.nombre,
            descripcion: campaign.descripcion,
            curso_trigger_id: campaign.curso_trigger_id,
            dias_espera: campaign.dias_espera,
            curso_objetivo_id: campaign.curso_objetivo_id,
            cupon_codigo: campaign.cupon_codigo,
            stripe_coupon_id: campaign.stripe_coupon_id || '',
            descuento_porcentaje: campaign.descuento_porcentaje,
            activo: campaign.activo
        });
        setIsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <span className="ml-4 text-white/40 tracking-widest text-2xs uppercase font-bold">Cargando Estrategias...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <div>
                    <h3 className="text-2xl font-display text-white italic">Gestión de Campañas</h3>
                    <p className="text-xs text-white/30 tracking-tight font-mono mt-1">Configura disparadores automáticos para el retorno de alumnos</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] uppercase tracking-[0.2em] font-black hover:bg-accent hover:text-nautical-black transition-all"
                >
                    <Plus className="w-3 h-3" />
                    Nueva Campaña
                </button>
            </div>

            <div className="grid gap-4">
                {campaigns.length === 0 ? (
                    <div className="p-12 border border-dashed border-white/5 text-center text-white/10 font-display italic text-lg">
                        No hay campañas configuradas. Empieza creando la primera arriba.
                    </div>
                ) : (
                    campaigns.map(campaign => (
                        <div key={campaign.id} className={`p-6 border ${campaign.activo ? 'border-white/10' : 'border-white/5 opacity-50'} bg-white/[0.02] hover:bg-white/[0.05] transition-all group relative overflow-hidden`}>
                            {campaign.activo && <div className="absolute top-0 left-0 w-1 h-full bg-accent" />}

                            <div className="flex justify-between items-start gap-6">
                                <div className="space-y-2 flex-grow">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-display text-white italic">{campaign.nombre}</h4>
                                        <span className={`px-2 py-0.5 text-[8px] font-black tracking-widest uppercase rounded-full ${campaign.activo ? 'bg-accent/20 text-accent' : 'bg-white/5 text-white/20'}`}>
                                            {campaign.activo ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/40 max-w-2xl font-mono">{campaign.descripcion}</p>

                                    <div className="flex gap-8 mt-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Disparador</span>
                                            <div className="text-xs text-white/80 font-display italic">{campaign.trigger_course?.nombre_es}</div>
                                            <div className="text-[10px] text-accent/60">+ {campaign.dias_espera} días de espera</div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Objetivo</span>
                                            <div className="text-xs text-white/80 font-display italic">{campaign.target_course?.nombre_es}</div>
                                            <div className="text-[10px] text-accent/60">Cupón: {campaign.cupon_codigo} (-{campaign.descuento_porcentaje}%)</div>
                                            {campaign.stripe_coupon_id && (
                                                <div className="text-[10px] text-yellow-400 font-mono mt-1 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                                    Stripe: {campaign.stripe_coupon_id}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => handleToggleStatus(campaign.id, campaign.activo)}
                                        title={campaign.activo ? 'Desactivar' : 'Activar'}
                                        className={`p-3 border ${campaign.activo ? 'border-accent/30 text-accent hover:bg-accent hover:text-nautical-black' : 'border-white/10 text-white/40 hover:text-white hover:border-white/30'} transition-all`}
                                    >
                                        <Power className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openEditModal(campaign)}
                                        className="p-3 border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(campaign.id)}
                                        className="p-3 border border-white/10 text-white/20 hover:text-red-500 hover:border-red-500/30 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Creation/Edit Modal */}
            <AccessibleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCampaign ? 'Editar Campaña' : 'Nueva Campaña Automática'}
            >
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid gap-4">
                        <div className="space-y-1">
                            <label className="text-2xs uppercase tracking-widest text-white/40 font-bold">Nombre de la Campaña</label>
                            <input
                                required
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 p-4 text-white font-display italic outline-none focus:border-accent"
                                placeholder="Ej: Retorno a Perfeccionamiento"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-2xs uppercase tracking-widest text-white/40 font-bold">Descripción</label>
                            <textarea
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono italic outline-none focus:border-accent resize-none h-20"
                                placeholder="Breve nota sobre el objetivo de la campaña"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-2xs uppercase tracking-widest text-white/40 font-bold">Curso Disparador (Trigger)</label>
                                <select
                                    required
                                    value={formData.curso_trigger_id}
                                    onChange={e => setFormData({ ...formData, curso_trigger_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/20 p-4 text-white outline-none focus:border-accent appearance-none custom-select"
                                >
                                    <option value="" disabled className="bg-nautical-black">Seleccionar curso...</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id} className="bg-nautical-black text-white">{course.nombre_es}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-2xs uppercase tracking-widest text-white/40 font-bold">Días de Espera</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.dias_espera}
                                    onChange={e => setFormData({ ...formData, dias_espera: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-2xs uppercase tracking-widest text-white/40 font-bold">Curso Objetivo (Target)</label>
                                <select
                                    required
                                    value={formData.curso_objetivo_id}
                                    onChange={e => setFormData({ ...formData, curso_objetivo_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/20 p-4 text-white outline-none focus:border-accent appearance-none custom-select"
                                >
                                    <option value="" disabled className="bg-nautical-black">Seleccionar curso...</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id} className="bg-nautical-black text-white">{course.nombre_es}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-2xs uppercase tracking-widest text-white/40 font-bold">Acción: Descuento (%)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="100"
                                    value={formData.descuento_porcentaje}
                                    onChange={e => setFormData({ ...formData, descuento_porcentaje: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-2xs uppercase tracking-widest text-white/40 font-bold">Código Estático (Fallback)</label>
                                <input
                                    required
                                    value={formData.cupon_codigo}
                                    onChange={e => setFormData({ ...formData, cupon_codigo: e.target.value.toUpperCase() })}
                                    className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono font-bold uppercase tracking-widest outline-none focus:border-accent"
                                    placeholder="EJ: VUELVE15"
                                />
                                <p className="text-[9px] text-white/20 italic">Se usará si falla Stripe</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-2xs uppercase tracking-widest text-white/40 font-bold text-yellow-400/60">ID Cupón Stripe (Dinámico)</label>
                                <input
                                    value={formData.stripe_coupon_id}
                                    onChange={e => setFormData({ ...formData, stripe_coupon_id: e.target.value })}
                                    className="w-full bg-yellow-400/5 border border-yellow-400/10 p-4 text-white font-mono outline-none focus:border-yellow-400"
                                    placeholder="Ej: 20_OFF_PROMO"
                                />
                                <p className="text-[9px] text-yellow-400/40 italic">Genera códigos únicos de un solo uso</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-4 border border-white/10 text-white/40 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-white/5 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-4 bg-accent text-nautical-black text-[10px] uppercase tracking-[0.3em] font-black hover:bg-white transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando...' : (editingCampaign ? 'Sincronizar Cambios' : 'Crear Campaña')}
                        </button>
                    </div>
                </form>
            </AccessibleModal>

            <style jsx>{`
                .custom-select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.3)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    background-size: 1rem;
                }
            `}</style>
        </div>
    );
}
