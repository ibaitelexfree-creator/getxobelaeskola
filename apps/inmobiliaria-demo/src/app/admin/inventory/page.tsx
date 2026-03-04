'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    MoreHorizontal,
    Trash2,
    Edit3,
    ExternalLink,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Property {
    id: string;
    title: string;
    location: string;
    price: number | string;
    status: string;
    property_type: string;
    images: string[];
    created_at: string;
}

export default function InventoryPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await fetch('/api/properties');
            const data = await res.json();
            setProperties(data.properties || []);
        } catch (err) {
            console.error('Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.')) return;

        try {
            const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProperties(properties.filter(p => p.id !== id));
                setNotification({ type: 'success', message: 'Propiedad eliminada correctamente' });
            } else {
                setNotification({ type: 'error', message: 'Error al eliminar la propiedad' });
            }
        } catch (err) {
            setNotification({ type: 'error', message: 'Error de conexión' });
        }
        setTimeout(() => setNotification(null), 3000);
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/properties/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setProperties(properties.map(p => p.id === id ? { ...p, status: newStatus } : p));
                setNotification({ type: 'success', message: `Estado actualizado a ${newStatus}` });
            }
        } catch (err) {
            setNotification({ type: 'error', message: 'Error al actualizar estado' });
        }
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredProperties = properties.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestión de Inventario</h1>
                    <p className="text-zinc-500 text-sm">Administra y supervisa todas las propiedades activas</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar propiedad..."
                            className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-[#d4a843] outline-none transition-all w-64 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                        <Filter size={20} className="text-zinc-400" />
                    </button>
                </div>
            </header>

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-xl border flex items-center gap-3 ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                    >
                        {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm font-semibold">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table Area */}
            <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Inmueble</th>
                                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Ubicación</th>
                                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Precio</th>
                                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Estado</th>
                                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-[#d4a843]" size={32} />
                                    </td>
                                </tr>
                            ) : filteredProperties.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-zinc-500 italic">
                                        No se encontraron propiedades
                                    </td>
                                </tr>
                            ) : (
                                filteredProperties.map((prop) => (
                                    <tr key={prop.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden border border-white/10 shrink-0">
                                                    {prop.images?.[0] ? <img src={prop.images[0]} alt="" className="w-full h-full object-cover" /> : null}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-zinc-200 line-clamp-1">{prop.title}</p>
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{prop.property_type || 'Residencial'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-400 font-medium">
                                            {prop.location}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[#d4a843] font-bold">
                                                {typeof prop.price === 'number' ? `$${prop.price.toLocaleString('en-US')}` : prop.price}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={prop.status}
                                                onChange={(e) => handleUpdateStatus(prop.id, e.target.value)}
                                                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border bg-transparent outline-none cursor-pointer transition-all ${prop.status === 'published' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                                                    prop.status === 'sold' ? 'border-red-500/30 text-red-400 bg-red-500/5' :
                                                        'border-amber-500/30 text-amber-400 bg-amber-500/5'
                                                    }`}
                                            >
                                                <option value="pending" className="bg-[#0a0a0f]">Pendiente</option>
                                                <option value="published" className="bg-[#0a0a0f]">Publicado</option>
                                                <option value="sold" className="bg-[#0a0a0f]">Vendido</option>
                                                <option value="archived" className="bg-[#0a0a0f]">Archivado</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all border border-transparent hover:border-white/10">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-blue-400 transition-all border border-transparent hover:border-blue-500/20">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(prop.id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
