'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [propertyId, setPropertyId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        location: '',
        property_type: '',
        status: '',
        description: '',
    });

    useEffect(() => {
        const fetchProperty = async () => {
            const { id } = await params;
            setPropertyId(id);
            try {
                const res = await fetch(`/realstate/api/properties/${id}`);
                if (!res.ok) throw new Error('Data fetch failed');
                const data = await res.json();
                setFormData({
                    title: data.title || '',
                    price: data.price || '',
                    location: data.location || '',
                    property_type: data.property_type || '',
                    status: data.status || 'pending',
                    description: data.description || '',
                });
            } catch (err) {
                console.error('Error fetching property:', err);
                alert('No se pudo cargar la propiedad.');
                router.push('/admin/properties');
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [params, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/realstate/api/properties/${propertyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to update property');

            alert('Propiedad actualizada con éxito.');
            router.push('/admin/properties');
        } catch (error) {
            console.error('Error updating property:', error);
            alert('Error al actualizar la propiedad.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-gold w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-light text-white mb-2">
                        Editar Propiedad <span className="text-gold font-medium">#{propertyId}</span>
                    </h1>
                    <p className="text-gray-400">Modifica los detalles de la propiedad en la base de datos.</p>
                </div>
                <Link
                    href="/admin/properties"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span>Volver</span>
                </Link>
            </div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Columna Izquierda */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Título de la Propiedad</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold transition-colors"
                                placeholder="Ej: Villa de Lujo en Palm Jumeirah"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Precio</label>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold transition-colors"
                                placeholder="Ej: $4,500,000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Ubicación</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold transition-colors"
                                placeholder="Ej: Downtown Dubai"
                            />
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Propiedad</label>
                            <select
                                name="property_type"
                                value={formData.property_type}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors appearance-none"
                            >
                                <option value="" disabled>Seleccionar tipo</option>
                                <option value="Villa">Villa</option>
                                <option value="Apartment">Apartamento</option>
                                <option value="Penthouse">Penthouse</option>
                                <option value="Townhouse">Townhouse</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors appearance-none"
                            >
                                <option value="pending">Pendiente</option>
                                <option value="published">Publicado</option>
                                <option value="rejected">Rechazado</option>
                                <option value="sold">Vendido</option>
                            </select>
                        </div>
                    </div>

                    {/* Fila Completa */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold transition-colors resize-none"
                            placeholder="Describe las características exclusivas de la propiedad..."
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-gold text-black px-8 py-3 rounded-xl font-bold hover:bg-white transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
