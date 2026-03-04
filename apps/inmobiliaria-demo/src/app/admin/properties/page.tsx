'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Edit3,
    Trash2,
    Loader2,
    Download,
    ExternalLink,
    Video,
    Home,
    Terminal,
    Cpu,
    Activity,
    ShieldCheck,
    Box
} from 'lucide-react';
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
            const url = new URL('/api/properties', window.location.origin);
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
            const res = await fetch(`/api/properties/${id}`, {
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
        <div className="min-h-screen pb-20 bg-[#0a0a0f]" style={{ paddingTop: '40px' }}>
            <div className="container max-w-[1600px] mx-auto px-8">
                {/* Header Section */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 relative">
                    <div className="absolute top-0 right-0 w-32 h-px bg-[#d4a843]/30" />

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Terminal size={18} className="text-[#d4a843]" />
                            <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter italic">CENTRAL <span className="text-[#d4a843]">ASSET MONITOR</span></h1>
                            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#d4a843]/10 border border-[#d4a843]/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">LIVE_DB_STREAM</span>
                            </div>
                        </div>
                        <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] flex items-center gap-2 opacity-70">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            Global Inventory Control Protocol • User Submission Queue
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-3 px-6 py-3 bg-[#0a0a0f] border border-white/10 rounded-2xl text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:border-[#d4a843]/50 hover:text-white transition-all">
                            <Download size={16} />
                            EXTRACT_DATA.CSV
                        </button>
                    </div>
                </header>

                {/* Tactical HUD Filters */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                    <div className="lg:col-span-3 flex items-center gap-4 p-2 bg-[#0a0a0f]/60 border border-white/5 rounded-3xl backdrop-blur-xl">
                        <form onSubmit={handleSearch} className="flex-grow relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#d4a843] transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="ENTER ASSET IDENTIFIER, SECTOR OR UID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none rounded-2xl py-5 pl-16 pr-8 focus:ring-0 text-xs font-black uppercase tracking-widest text-white placeholder:text-zinc-800"
                            />
                        </form>

                        <div className="hidden lg:flex items-center gap-2 pr-2">
                            {['all', 'pending', 'published', 'rejected', 'sold'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                        : 'text-zinc-500 hover:text-[#d4a843] hover:bg-white/5'
                                        }`}
                                >
                                    {status === 'all' ? 'All_Units' : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-[#0a0a0f]/60 border border-white/5 rounded-3xl backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <Activity size={18} className="text-emerald-500" />
                            <div>
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">ACTIVE UNITS</p>
                                <p className="text-xl font-black text-white italic">{properties.length}</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/5 mx-2" />
                        <Box size={24} className="text-zinc-800" />
                    </div>
                </div>

                {/* Data Grid Area */}
                <div className="relative group overflow-hidden rounded-[40px] border border-white/5 bg-[#0a0a0f]/40 backdrop-blur-3xl">
                    {/* HUD Corner Accents */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#d4a843]/10" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#d4a843]/10" />

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Asset_Cluster</th>
                                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Spec</th>
                                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Origin_UID</th>
                                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Operational_Status</th>
                                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Uplinked</th>
                                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Valuation</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 text-right">Command_Exec</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-32 text-center relative">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="animate-spin text-[#d4a843]" size={40} />
                                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] animate-pulse">FETCHING_GRID_DATA...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : properties.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-32 text-center text-zinc-500 font-black uppercase tracking-widest text-xs italic opacity-30">
                                            NO ASSETS DETECTED IN CURRENT SECTOR
                                        </td>
                                    </tr>
                                ) : (
                                    properties.map((prop, idx) => (
                                        <motion.tr
                                            key={prop.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-[#d4a843]/5 transition-all duration-300"
                                        >
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-black border border-white/5 overflow-hidden flex-shrink-0 relative group-hover:border-[#d4a843]/40 transition-all">
                                                        <div className="w-full h-full bg-[#d4a843]/5 flex items-center justify-center text-[#d4a843] opacity-40 group-hover:opacity-100 transition-opacity">
                                                            <Home size={22} />
                                                        </div>
                                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#d4a843]/60" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white uppercase tracking-tighter group-hover:text-[#d4a843] transition-colors">{prop.title}</p>
                                                        <p className="text-[9px] text-[#d4a843]/50 font-black font-mono tracking-widest uppercase mt-1">DXB-{prop.id}-GRID</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-zinc-500 group-hover:text-white transition-colors">
                                                    {prop.property_type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] text-zinc-700 font-black italic tracking-widest uppercase">
                                                    {prop.user_id?.substring(0, 8)}_SRVR
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${prop.status === 'published' ? 'bg-emerald-500 animate-pulse' :
                                                        prop.status === 'pending' ? 'bg-amber-500' :
                                                            prop.status === 'rejected' ? 'bg-rose-500' : 'bg-zinc-700'
                                                        }`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${prop.status === 'published' ? 'text-emerald-400' :
                                                        prop.status === 'pending' ? 'text-amber-400' :
                                                            prop.status === 'rejected' ? 'text-rose-400' : 'text-zinc-600'
                                                        }`}>
                                                        {prop.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                                                {new Date(prop.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="font-black text-white italic tracking-tighter text-base">${parseFloat(prop.price).toLocaleString()}</span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center justify-end gap-3">
                                                    {prop.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateStatus(prop.id, 'published')}
                                                            title="Authorize Deployment"
                                                            className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-black transition-all border border-emerald-500/20"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}

                                                    <Link
                                                        href={`/admin/properties/${prop.id}/edit`}
                                                        className="p-3 bg-white/5 text-zinc-600 rounded-xl hover:bg-[#d4a843] hover:text-[#0a0a0f] transition-all border border-white/5"
                                                        title="Modify Parameters"
                                                    >
                                                        <Edit3 size={18} />
                                                    </Link>

                                                    <Link
                                                        href={`/admin/marketing?propertyId=${prop.id}`}
                                                        className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20"
                                                        title="Initialize Marketing Protocol"
                                                    >
                                                        <Video size={18} />
                                                    </Link>

                                                    <button
                                                        className="p-3 bg-white/5 text-zinc-800 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-white/5"
                                                        title="Decommission Asset"
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

            {/* Scanline FX Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-multiply" />
        </div >
    );
}
