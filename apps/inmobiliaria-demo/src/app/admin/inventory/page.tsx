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
    Eye,
    LayoutGrid,
    List,
    MapPin,
    Tag,
    Home,
    Plus,
    Rocket,
    Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomSelect } from '@/components/ui/CustomSelect';
import Link from 'next/link';

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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await fetch('/realstate/api/properties');
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
            const res = await fetch(`/realstate/api/properties/${id}`, { method: 'DELETE' });
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
            const res = await fetch(`/realstate/api/properties/${id}`, {
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
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Home size={20} className="text-[#d4a843]" />
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                            ASSET <span className="text-[#d4a843]">REPOSITORY</span>
                        </h1>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">ACTIVE_GRID</span>
                        </div>
                    </div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Strategic Inventory Monitoring • Global Asset Management Node</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#d4a843] text-[#0a0a0f]' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#d4a843] text-[#0a0a0f]' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#d4a843] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH ENCODING..."
                            className="pl-10 pr-4 py-2.5 bg-zinc-900 border border-white/5 rounded-xl focus:border-[#d4a843]/50 outline-none transition-all w-64 text-[10px] font-black tracking-widest text-white backdrop-blur-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Link href="/admin/inventory/new">
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#d4a843] text-[#0a0a0f] rounded-xl font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(212,168,67,0.4)] transition-all text-[10px] relative overflow-hidden group">
                            <Plus size={16} className="relative z-10" />
                            <span className="relative z-10">INITIALIZE ACQUISITION</span>
                        </button>
                    </Link>
                </div>
            </header>

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-xl border flex items-center gap-3 shadow-xl backdrop-blur-md sticky top-4 z-50 ${notification.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                    >
                        {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm font-semibold">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-[#d4a843]" size={40} />
                    <p className="text-zinc-500 animate-pulse">Cargando inventario de lujo...</p>
                </div>
            ) : filteredProperties.length === 0 ? (
                <div className="bg-white/5 border border-white/5 rounded-[32px] p-20 text-center">
                    <Home className="mx-auto text-zinc-700 mb-4" size={48} />
                    <p className="text-zinc-500 italic">No se encontraron propiedades que coincidan con tu búsqueda</p>
                </div>
            ) : viewMode === 'list' ? (
                /* Table / List View */
                <div className="bg-[#0a0a0f]/80 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#d4a843]/20" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#d4a843]/20" />

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">ASSET_IDENTIFIER</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">GEOLOCATION</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">VALUATION</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">STATUS_PROTOCOL</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">DIRECTIVES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredProperties.map((prop) => (
                                    <tr key={prop.id} className="hover:bg-white/[0.03] transition-colors group relative">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-zinc-800 overflow-hidden border border-white/10 shrink-0 shadow-lg group-hover:border-[#d4a843]/30 transition-all">
                                                    {prop.images?.[0] ? <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><Home className="text-zinc-600" size={20} /></div>}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white italic tracking-tighter line-clamp-1 group-hover:text-[#d4a843] transition-colors">{prop.title}</p>
                                                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mt-0.5 opacity-60">ID: {prop.id.split('-')[0].toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest whitespace-nowrap">
                                                <MapPin size={12} className="text-[#d4a843]" />
                                                {prop.location}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-1.5 font-mono font-bold text-[#d4a843] text-lg">
                                                <Tag size={14} />
                                                {typeof prop.price === 'number' ? `$${prop.price.toLocaleString('en-US')}` : prop.price}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="w-[140px]">
                                                <CustomSelect
                                                    value={prop.status}
                                                    options={['pending', 'published', 'sold', 'archived']}
                                                    labels={['Pendiente', 'Publicado', 'Vendido', 'Archivado']}
                                                    onChange={(val) => handleUpdateStatus(prop.id, val)}
                                                    triggerStyle={{
                                                        padding: '0.5rem 1rem',
                                                        fontSize: '10px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.15em',
                                                        fontWeight: 900,
                                                        borderRadius: '12px',
                                                        borderWidth: '2px',
                                                        borderColor: prop.status === 'published' ? 'rgba(16, 185, 129, 0.2)' :
                                                            prop.status === 'sold' ? 'rgba(239, 68, 68, 0.2)' :
                                                                'rgba(245, 158, 11, 0.2)',
                                                        color: prop.status === 'published' ? '#10b981' :
                                                            prop.status === 'sold' ? '#ef4444' :
                                                                '#f59e0b',
                                                        background: 'transparent'
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <Link href={`/admin/marketing?propertyId=${prop.id}`}>
                                                    <button className="p-2.5 bg-white/5 hover:bg-[#d4a843]/10 rounded-xl text-zinc-400 hover:text-[#d4a843] transition-all border border-white/5 hover:border-[#d4a843]/20" title="Generar IA Video">
                                                        <Rocket size={18} />
                                                    </button>
                                                </Link>
                                                <Link href={`/properties/${prop.id}`} target="_blank">
                                                    <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all border border-white/5 hover:border-white/20">
                                                        <Eye size={18} />
                                                    </button>
                                                </Link>
                                                <Link href={`/admin/properties/${prop.id}/edit`}>
                                                    <button className="p-2.5 bg-white/5 hover:bg-blue-500/10 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-white/5 hover:border-blue-500/20">
                                                        <Edit3 size={18} />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(prop.id)}
                                                    className="p-2.5 bg-white/5 hover:bg-red-500/10 rounded-xl text-zinc-400 hover:text-red-500 transition-all border border-white/5 hover:border-red-500/20"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                    {filteredProperties.map((prop, i) => (
                        <motion.div
                            key={prop.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden group hover:border-[#d4a843]/30 transition-all shadow-2xl backdrop-blur-md"
                        >
                            <div className="aspect-[4/3] relative overflow-hidden">
                                {prop.images?.[0] ? (
                                    <img
                                        src={prop.images[0]}
                                        alt={prop.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                        <Home size={40} className="text-zinc-600" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl border ${prop.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                        prop.status === 'sold' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                            'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                        }`}>
                                        {prop.status}
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <div className="flex gap-2 w-full">
                                        <Link href={`/admin/properties/${prop.id}/edit`} className="flex-grow">
                                            <button className="w-full py-3 bg-[#d4a843] text-[#0a0a0f] rounded-2xl font-bold text-xs flex items-center justify-center gap-2">
                                                <Edit3 size={14} /> Editar
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(prop.id)}
                                            className="p-3 bg-red-500/20 text-red-500 rounded-2xl backdrop-blur-md hover:bg-red-500 transition-all hover:text-white"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-white group-hover:text-[#d4a843] transition-colors line-clamp-1">{prop.title}</h3>
                                    <span className="font-mono font-bold text-[#d4a843] whitespace-nowrap">
                                        {typeof prop.price === 'number' ? `$${(prop.price / 1000).toFixed(0)}k` : prop.price}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium mb-6">
                                    <MapPin size={12} className="text-[#d4a843]" />
                                    {prop.location}
                                </div>
                                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{prop.property_type || 'Luxury Asset'}</span>
                                    <Link href={`/properties/${prop.id}`} target="_blank">
                                        <Eye size={16} className="text-zinc-400 hover:text-white transition-colors" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
