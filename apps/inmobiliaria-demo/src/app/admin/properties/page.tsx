
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Clock, Eye, Edit3, Trash2, Loader2, Download, ExternalLink, Video, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Property {
    id: number;
    title: string;
    location: string;
    price: string;
    status: string;
    property_type: string;
    user_id: string;
    created_at: string;
}

export default function AdminProperties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchProperties();
    }, [statusFilter]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const url = new URL('/realstate/api/properties', window.location.origin);
            if (statusFilter !== 'all') url.searchParams.append('status', statusFilter);
            if (searchTerm) url.searchParams.append('search', searchTerm);

            const res = await fetch(url.toString());
            const data = await res.json();
            if (data.success) {
                setProperties(data.properties || []);
            }
        } catch (err) {
            console.error('Error fetching admin properties:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProperties();
    };

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const res = await fetch(`/realstate/api/properties/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setProperties(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="container max-w-[1600px] mx-auto px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
                >
                    <div>
                        <span className="section-label" style={{ opacity: 0.8 }}>Administrative Access</span>
                        <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-display)', color: '#fff', margin: '0.5rem 0 0 0', lineHeight: 1.1 }}>
                            Control Panel <span style={{ color: 'var(--gold-400)' }}>Admin</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                            Gestión global de inventario y publicaciones.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="btn-secondary luxury-glow flex items-center gap-2" style={{ padding: '0.75rem 1.5rem', letterSpacing: '0.1rem', fontSize: '0.8rem' }}>
                            <Download size={18} />
                            EXPORTAR CSV
                        </button>
                    </div>
                </motion.div>

                {/* Filters Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-wrap items-center gap-4 mb-8 glass-card"
                    style={{ padding: '1rem 1.5rem', borderRadius: '1.5rem' }}
                >
                    <form onSubmit={handleSearch} className="flex-grow relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por título, ID o ubicación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-rose-500/50 transition-all text-sm"
                        />
                    </form>

                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl p-1">
                        {['all', 'pending', 'published', 'rejected', 'sold'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === status
                                    ? 'bg-white text-black'
                                    : 'text-gray-500 hover:text-white'
                                    }`}
                            >
                                {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendientes' : status === 'published' ? 'Activos' : status === 'rejected' ? 'Rechazados' : 'Vendido'}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Table */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                    <th className="px-8 py-6">Propiedad</th>
                                    <th className="px-8 py-6">Tipo</th>
                                    <th className="px-8 py-6">Usuario ID</th>
                                    <th className="px-8 py-6">Estado</th>
                                    <th className="px-8 py-6">Fecha</th>
                                    <th className="px-8 py-6">Precio</th>
                                    <th className="px-8 py-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-24 text-center">
                                            <Loader2 className="animate-spin mx-auto text-rose-500" size={32} />
                                        </td>
                                    </tr>
                                ) : properties.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-24 text-center text-gray-500 italic">
                                            No se encontraron propiedades.
                                        </td>
                                    </tr>
                                ) : (
                                    properties.map((prop) => (
                                        <motion.tr
                                            key={prop.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group hover:bg-white/[0.03] transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                                        <div className="w-full h-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                                                            <Home size={18} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white/90 group-hover:text-white transition-colors">{prop.title}</p>
                                                        <p className="text-[10px] text-gray-500 font-medium font-mono">ID: {prop.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400">
                                                    {prop.property_type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs text-gray-500 font-mono italic">
                                                    {prop.user_id?.substring(0, 8)}...
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${prop.status === 'published' ? 'bg-emerald-500 animate-pulse' :
                                                        prop.status === 'pending' ? 'bg-amber-500' :
                                                            prop.status === 'rejected' ? 'bg-rose-500' : 'bg-gray-500'
                                                        }`} />
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${prop.status === 'published' ? 'text-emerald-400' :
                                                        prop.status === 'pending' ? 'text-amber-400' :
                                                            prop.status === 'rejected' ? 'text-rose-400' : 'text-gray-400'
                                                        }`}>
                                                        {prop.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                                                {new Date(prop.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="font-mono font-bold text-sm text-white/80">{prop.price}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    {prop.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateStatus(prop.id, 'published')}
                                                            title="Aprobar y Publicar"
                                                            className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    {prop.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateStatus(prop.id, 'rejected')}
                                                            title="Rechazar (notificará al usuario)"
                                                            className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-all border border-rose-500/20"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    )}

                                                    <Link
                                                        href={`/admin/properties/${prop.id}/edit`}
                                                        className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-all border border-white/10"
                                                        title="Editar Propiedad"
                                                    >
                                                        <Edit3 size={18} />
                                                    </Link>

                                                    <button
                                                        className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-all border border-white/10"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={18} />
                                                    </button>

                                                    <Link
                                                        href={`/admin/marketing?propertyId=${prop.id}`}
                                                        className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                                                        title="Generar Marketing"
                                                    >
                                                        <Video size={18} />
                                                    </Link>
                                                    <button
                                                        className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/20 transition-all border border-white/10"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );
}
