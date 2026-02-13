'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Profile {
    id: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    rol: string;
}

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile;
    onProfileUpdate: (updatedProfile: Profile) => void;
}

export default function EditProfileModal({ isOpen, onClose, profile, onProfileUpdate }: EditProfileModalProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        telefono: ''
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Sync form data whenever profile changes or modal opens
    useEffect(() => {
        if (isOpen && profile) {
            setFormData({
                nombre: profile.nombre || '',
                apellidos: profile.apellidos || '',
                telefono: profile.telefono || ''
            });
        }
    }, [isOpen, profile]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/student/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                onProfileUpdate(data.profile);
                router.refresh(); // Refresh server data
                onClose();
            } else {
                alert(data.error || 'Error al actualizar perfil');
            }
        } catch (error: unknown) {
            const err = error as Error;
            alert(`Error de conexión: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nautical-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-white/10 p-8 rounded-sm w-full max-w-md shadow-2xl space-y-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <header>
                    <h3 className="text-2xl font-display text-white italic">Editar Perfil</h3>
                    <p className="text-2xs text-white/40 mt-1">Actualiza tus datos personales</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-accent font-bold">Nombre</label>
                            <input
                                type="text"
                                required
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm outline-none focus:border-accent functionality-input transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-accent font-bold">Apellidos</label>
                            <input
                                type="text"
                                value={formData.apellidos}
                                onChange={e => setFormData({ ...formData, apellidos: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm outline-none focus:border-accent functionality-input transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-widest text-accent font-bold">Teléfono</label>
                            <input
                                type="tel"
                                value={formData.telefono}
                                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm outline-none focus:border-accent functionality-input transition-all"
                                placeholder="+34 600 000 000"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-white/10 text-3xs uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-bold hover:bg-white transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
