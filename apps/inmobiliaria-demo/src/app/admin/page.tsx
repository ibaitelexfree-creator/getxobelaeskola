'use client';

import React from 'react';
import {
    TrendingUp,
    Home,
    Video,
    Users,
    Plus,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    Calendar,
    Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const stats = [
    { label: 'Valor de Cartera', value: '$45.8M', change: '+12%', icon: TrendingUp, color: '#d4a843' },
    { label: 'Inmuebles Activos', value: '24', change: '+2', icon: Home, color: '#2563eb' },
    { label: 'Videos Realizados', value: '18', change: '+5', icon: Video, color: '#10b981' },
    { label: 'Clientes Registrados', value: '142', change: '+18', icon: Users, color: '#f43f5e' },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Bienvenido, Comandante</h1>
                    <p className="text-zinc-400">Resumen del imperio inmobiliario • <span className="text-[#d4a843]">Dubai Elite Real Estate</span></p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
                        <Calendar size={18} />
                        <span className="font-semibold text-sm">Reporte Semanal</span>
                    </button>
                    <Link href="/admin/inventory/new">
                        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4a843] to-[#b8922e] text-[#0a0a0f] rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(212,168,67,0.4)] transition-all">
                            <Plus size={20} />
                            <span>Nuevo Inmueble</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm group hover:border-[#d4a843]/30 transition-all cursor-default"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-[#d4a843]/10 transition-colors">
                                <stat.icon size={24} style={{ color: stat.color }} />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full font-bold">
                                <ArrowUpRight size={10} />
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Items / Pending Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Clock className="text-[#d4a843]" size={20} />
                            Actividad Reciente
                        </h3>
                        <button className="text-[#d4a843] text-sm font-semibold hover:underline">Ver todo</button>
                    </div>

                    <div className="space-y-3">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold shrink-0">
                                    {i === 0 ? <Video size={20} /> : <Home size={20} />}
                                </div>
                                <div className="flex-grow">
                                    <h4 className="text-sm font-bold text-zinc-200">
                                        {i === 0 ? 'Video Generado con éxito' : 'Propiedad "Palm Jumeirah Villa" actualizada'}
                                    </h4>
                                    <p className="text-xs text-zinc-500 font-medium">Hace {i + 2} horas • Por Sistema AI</p>
                                </div>
                                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                            </div>
                        ))}
                    </div>

                    {/* Quick Access Grid */}
                    <div className="mt-12">
                        <h3 className="text-xl font-bold mb-6">Acciones Estratégicas</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer group">
                                <Share2 className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                <h4 className="font-bold text-lg">Nueva Campaña</h4>
                                <p className="text-sm text-zinc-500">Lanza promos en redes sociales con un click</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-600/20 to-transparent border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer group">
                                <TrendingUp className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                <h4 className="font-bold text-lg">Reporte de IA</h4>
                                <p className="text-sm text-zinc-500">Analiza tendencias de mercado en Dubai</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Pipeline Status */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="p-8 rounded-[40px] bg-gradient-to-b from-zinc-900 to-[#0a0a0f] border border-white/5 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-6">Power Pipeline</h3>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                        <span className="text-zinc-400">Video Engine</span>
                                        <span className="text-emerald-400">92% Health</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[92%] bg-gradient-to-r from-blue-500 to-emerald-500" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                        <span className="text-zinc-400">Depth Mapping</span>
                                        <span className="text-blue-400">Operational</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[100%] bg-blue-500" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                        <span className="text-zinc-400">Supabase DB</span>
                                        <span className="text-emerald-400">Online</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[100%] bg-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-10 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold text-zinc-300">
                                Diagnóstico Avanzado
                            </button>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#d4a843]/10 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
