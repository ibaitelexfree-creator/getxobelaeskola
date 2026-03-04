'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Upload,
    Home,
    DollarSign,
    MapPin,
    Layers,
    Bed,
    Bath,
    FileText,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { NEIGHBORHOODS } from '@/data/neighborhoods';

export default function NewPropertyPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        location: NEIGHBORHOODS[0].name,
        bedrooms: '',
        bathrooms: '',
        property_type: 'Villa',
        description: '',
        images: [] as File[]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...Array.from(e.target.files!)]
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('price', formData.price.toString());
            submitData.append('location', formData.location);
            submitData.append('property_type', formData.property_type);
            submitData.append('bedrooms', formData.bedrooms.toString());
            submitData.append('bathrooms', formData.bathrooms.toString());
            submitData.append('description', formData.description);

            formData.images.forEach(file => {
                submitData.append('images', file);
            });

            const response = await fetch('/api/properties', {
                method: 'POST',
                body: submitData
            });

            const resData = await response.json();
            if (!response.ok) throw new Error(resData.error || 'Fallo al añadir inmueble');

            setIsSuccess(true);
            setTimeout(() => router.push('/admin/inventory'), 2000);
        } catch (err: any) {
            setError(err.message || 'Error de conexión');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex items-center gap-4">
                <Link href="/admin/inventory">
                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-zinc-400">
                        <ChevronLeft size={20} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Nuevo Inmueble</h1>
                    <p className="text-zinc-500 text-sm">Añade una nueva joya a tu catálogo de lujo</p>
                </div>
            </header>

            {isSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] p-12 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">¡Propiedad Registrada!</h2>
                    <p className="text-emerald-400/70 mb-8">Redirigiendo al inventario...</p>
                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-emerald-500 animate-[progress_2s_ease-in-out_infinite]" />
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Basic Info Card */}
                    <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 backdrop-blur-sm space-y-6">
                        <div className="flex items-center gap-2 text-[#d4a843] mb-4">
                            <Home size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-widest">Información Básica</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Título de la Propiedad</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Mansion in Palm Jumeirah"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-[#d4a843] outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Precio (AED)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="Min: 1,000,000"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 focus:border-[#d4a843] outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Ubicación / Barrio</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 focus:border-[#d4a843] outline-none transition-all appearance-none"
                                    >
                                        {NEIGHBORHOODS.map(n => <option key={n.id} value={n.name} className="bg-[#0a0a0f]">{n.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Tipo de Propiedad</label>
                                <div className="relative">
                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                    <select
                                        name="property_type"
                                        value={formData.property_type}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 focus:border-[#d4a843] outline-none transition-all appearance-none"
                                    >
                                        <option value="Villa" className="bg-[#0a0a0f]">Villa</option>
                                        <option value="Penthouse" className="bg-[#0a0a0f]">Penthouse</option>
                                        <option value="Apartment" className="bg-[#0a0a0f]">Apartamento</option>
                                        <option value="Mansion" className="bg-[#0a0a0f]">Mansión</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 backdrop-blur-sm space-y-6">
                        <div className="flex items-center gap-2 text-[#d4a843] mb-4">
                            <FileText size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-widest">Detalles y Especificaciones</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Habitaciones</label>
                                <div className="relative">
                                    <Bed className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        value={formData.bedrooms}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 5"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 focus:border-[#d4a843] outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Baños</label>
                                <div className="relative">
                                    <Bath className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        value={formData.bathrooms}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 6"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 focus:border-[#d4a843] outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Descripción Ejecutiva</label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe el estilo de vida, amenidades y exclusividad..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-[#d4a843] outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Images Card */}
                    <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 backdrop-blur-sm space-y-6">
                        <div className="flex items-center gap-2 text-[#d4a843] mb-4">
                            <Upload size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-widest">Activos Visuales</h3>
                        </div>

                        <div className="relative border-2 border-dashed border-white/10 rounded-3xl p-10 text-center hover:bg-white/[0.02] hover:border-[#d4a843]/30 transition-all group">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-500 group-hover:scale-110 transition-transform">
                                <Upload size={30} />
                            </div>
                            <p className="text-lg font-bold text-zinc-300">Sube las imágenes de alta resolución</p>
                            <p className="text-sm text-zinc-500">Arrastra archivos o haz click para explorar</p>
                        </div>

                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                {formData.images.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-zinc-800">
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-[10px] text-white font-bold">{img.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all ${isSubmitting ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#d4a843] to-[#b8922e] text-[#0a0a0f] hover:shadow-[0_0_30px_rgba(212,168,67,0.4)]'
                                }`}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="animate-spin" /> Publicando Propiedad...</>
                            ) : (
                                'Registrar Propiedad'
                            )}
                        </button>
                    </div>
                </form>
            )}

            <style jsx global>{`
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
