'use client';

import React, { useState, useEffect } from 'react';
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
    Share2,
    Loader2,
    Activity,
    Shield,
    Database,
    Cpu,
    Target,
    Terminal,
    Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SalesProjections from './components/analytics/SalesProjections';

interface KPI {
    portfolio_value: number | string;
    active_listings: number;
    videos_generated: number;
    registered_users: number;
}

interface ActivityItem {
    id: string;
    type: 'viewing' | 'property' | 'video' | 'system';
    title: string;
    subtitle: string;
    time: string;
    status: 'success' | 'pending' | 'warning';
    image?: string | string[];
}

export default function AdminDashboard() {
    const [kpis, setKpis] = useState<KPI>({
        portfolio_value: 0,
        active_listings: 0,
        videos_generated: 0,
        registered_users: 0
    });
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analyticsData, setAnalyticsData] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch Unified Analytics (KPIs, Projections, Regions, Activities)
            const kpiRes = await fetch('/realstate/api/admin/analytics');
            const kpiData = await kpiRes.json();

            if (kpiData.data) {
                if (kpiData.data.kpis) setKpis(kpiData.data.kpis);

                setAnalyticsData({
                    projections: kpiData.data.projections,
                    regions: kpiData.data.regions
                });

                // Use the pre-joined activities from the analytics API if available
                if (kpiData.data.recentActivities && kpiData.data.recentActivities.length > 0) {
                    const mappedActivities: ActivityItem[] = kpiData.data.recentActivities.map((v: any) => ({
                        id: v.id,
                        type: 'viewing',
                        title: v.title,
                        subtitle: v.subtitle,
                        time: v.time,
                        status: v.status,
                        image: v.image
                    }));
                    setActivities(mappedActivities);
                } else {
                    // Fallback to legacy viewings call or system events
                    const activitiesRes = await fetch('/realstate/api/admin/viewings');
                    const activitiesData = await activitiesRes.json();

                    if (activitiesData.data && activitiesData.data.length > 0) {
                        const mappedActivities: ActivityItem[] = activitiesData.data.slice(0, 5).map((v: any) => ({
                            id: v.id,
                            type: 'viewing',
                            title: `Visita: ${v.property_title}`,
                            subtitle: `Cliente: ${v.user_name}`,
                            time: new Date(v.requested_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            status: v.status === 'confirmed' ? 'success' : 'pending',
                            image: v.property_images
                        }));
                        setActivities(mappedActivities);
                    } else {
                        setActivities([
                            {
                                id: 'sys-1',
                                type: 'system',
                                title: 'Sistema de IA sincronizado',
                                subtitle: 'Motor de video listo para producción',
                                time: 'En línea',
                                status: 'success'
                            },
                            {
                                id: 'sys-2',
                                type: 'system',
                                title: 'Database Cluster',
                                subtitle: 'Neon + Supabase Auth activa',
                                time: 'Estable',
                                status: 'success'
                            }
                        ]);
                    }
                }
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Error al cargar datos del panel');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: 'ESTIMATED PORTFOLIO',
            value: typeof kpis.portfolio_value === 'number' ? `$${(kpis.portfolio_value / 1000000).toFixed(1)}M` : '$0M',
            change: '+12.4%',
            icon: TrendingUp,
            color: '#d4a843',
            link: '/admin/inventory',
            id: 'PTF-01'
        },
        {
            label: 'ACTIVE ASSETS',
            value: kpis.active_listings.toString(),
            change: '+2',
            icon: Home,
            color: '#3b82f6',
            link: '/admin/inventory',
            id: 'AST-02'
        },
        {
            label: 'NEURAL VIDEOS',
            value: kpis.videos_generated.toString(),
            change: '+5',
            icon: Video,
            color: '#10b981',
            link: '/admin/marketing',
            id: 'VEO-03'
        },
        {
            label: 'VIP TARGETS',
            value: kpis.registered_users.toString(),
            change: '+18',
            icon: Users,
            color: '#f43f5e',
            link: '/admin/crm',
            id: 'CRM-04'
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-[#d4a843] animate-spin" />
                <p className="text-zinc-500 font-medium animate-pulse">Iniciando Mission Control...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20" style={{ paddingTop: '60px' }}>
            {/* Header */}
            <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 backdrop-blur-xl overflow-hidden group">
                {/* HUD Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#d4a843]/30 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#d4a843]/30 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#d4a843]/30 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#d4a843]/30 rounded-br-xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-[#d4a843]/10 border border-[#d4a843]/20">
                            <Target size={20} className="text-[#d4a843] animate-pulse" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4a843]/60">Operational Status: Global</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                        MISSION <span className="text-[#d4a843]">CONTROL</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-zinc-400 text-sm font-medium flex items-center gap-2">
                            <Activity size={14} className="text-emerald-500" />
                            System Pulse: <span className="text-emerald-500">Normal</span>
                        </p>
                        <div className="h-4 w-px bg-white/10" />
                        <p className="text-zinc-400 text-sm font-medium flex items-center gap-2">
                            <Shield size={14} className="text-blue-400" />
                            Encryption: <span className="text-blue-400">Quantum-Safe</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 relative z-10">
                    <button
                        onClick={() => fetchDashboardData()}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <Activity size={18} className="group-hover:text-[#d4a843] transition-colors" />
                        <span className="font-bold text-xs uppercase tracking-widest text-zinc-300">Rescan System</span>
                    </button>
                    <Link href="/admin/inventory/new">
                        <button className="flex items-center gap-2 px-8 py-3 bg-[#d4a843] text-[#0a0a0f] rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(212,168,67,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all border border-[#f5cc6d]">
                            <Plus size={18} />
                            <span>Deploy Asset</span>
                        </button>
                    </Link>
                </div>

                {/* Ambient Glow */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#d4a843]/5 rounded-full blur-[100px]" />
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Link href={stat.link} key={stat.label}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative group cursor-pointer"
                        >
                            {/* Card Container */}
                            <div className="p-6 rounded-2xl bg-[#0a0a0f]/80 border border-white/5 backdrop-blur-xl group-hover:border-[#d4a843]/40 transition-all overflow-hidden">
                                {/* HUD Accents */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#d4a843]/20 group-hover:border-[#d4a843]/50 transition-colors" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#d4a843]/20 group-hover:border-[#d4a843]/50 transition-colors" />

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-[#d4a843]/60 tracking-[0.2em] mb-1">{stat.id}</span>
                                        <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-[#d4a843]/10 transition-colors w-fit border border-white/5">
                                            <stat.icon size={20} style={{ color: stat.color }} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-black">
                                            <ArrowUpRight size={10} />
                                            {stat.change}
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 animate-emerald-pulse" />
                                    </div>
                                </div>

                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 group-hover:text-zinc-300 transition-colors">{stat.label}</p>
                                <h3 className="text-3xl font-black text-white tracking-tighter italic">
                                    {stat.value}
                                    <span className="text-[#d4a843] ml-1 opacity-0 group-hover:opacity-100 transition-opacity">_</span>
                                </h3>

                                {/* Base Scanline */}
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4a843]/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Advanced Analytics Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
            >
                <SalesProjections externalData={analyticsData} />
            </motion.section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Items / Pending Actions */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-[#d4a843] rounded-full" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter">
                                Target <span className="text-[#d4a843]">Activity</span>
                            </h3>
                        </div>
                        <Link href="/admin/crm" className="text-[10px] font-black uppercase tracking-widest text-[#d4a843] hover:text-white transition-colors border-b border-[#d4a843]/30">VIEW ALL INTEL</Link>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {activities.map((item, i) => (
                                <Link
                                    href={item.type === 'viewing' ? '/admin/crm' : item.type === 'video' ? '/admin/marketing' : '#'}
                                    key={item.id}
                                    className="block group"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="relative flex items-center gap-5 p-5 rounded-2xl bg-zinc-900/40 border border-white/5 group-hover:border-[#d4a843]/30 transition-all overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#d4a843]/0 via-[#d4a843]/5 to-[#d4a843]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:border-[#d4a843]/50 transition-colors bg-zinc-800">
                                            {item.image ? (
                                                <img src={Array.isArray(item.image) ? item.image[0] : item.image} alt={item.title || "Activity asset"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#d4a843]/40 group-hover:text-[#d4a843] transition-colors">
                                                    {item.type === 'viewing' ? <Users size={24} /> :
                                                        item.type === 'video' ? <Video size={24} /> :
                                                            <Activity size={24} />}
                                                </div>
                                            )}
                                            {/* Corner HUD for image */}
                                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#d4a843]/50" />
                                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#d4a843]/50" />
                                        </div>

                                        <div className="flex-grow relative z-10">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.type === 'viewing' ? 'bg-blue-500/10 text-blue-400' :
                                                    item.type === 'video' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        'bg-zinc-800 text-zinc-400'
                                                    }`}>
                                                    {item.type}
                                                </span>
                                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{item.time}</span>
                                            </div>
                                            <h4 className="text-base font-bold text-zinc-200 group-hover:text-white transition-colors leading-tight">
                                                {item.title}
                                            </h4>
                                            <p className="text-xs text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors">{item.subtitle}</p>
                                        </div>

                                        <div className={`relative z-10 shrink-0 p-2 rounded-lg ${item.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            <CheckCircle2 size={20} />
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="mt-12">
                        <div className="flex items-center gap-3 mb-8 px-2">
                            <Terminal size={20} className="text-[#d4a843]" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Strategic <span className="text-[#d4a843]">Directives</span></h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Link href="/admin/marketing">
                                <div className="h-full p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer group relative overflow-hidden backdrop-blur-xl">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 bg-blue-500 transform translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl group-hover:opacity-30 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all">
                                            <Share2 className="text-blue-400" size={32} />
                                        </div>
                                        <h4 className="font-black text-2xl text-white mb-2 tracking-tighter uppercase italic">Viral Engine</h4>
                                        <p className="text-sm text-zinc-500 max-w-[220px] leading-relaxed font-medium">Auto-deploy neural marketing campaigns across global social grids.</p>
                                        <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 group-hover:text-white transition-colors">
                                            <span>INITIALIZE SCAN</span>
                                            <ArrowUpRight size={14} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                </div>
                            </Link>

                            <Link href="/admin/crm">
                                <div className="h-full p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-[#d4a843]/40 transition-all cursor-pointer group relative overflow-hidden backdrop-blur-xl">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 bg-[#d4a843] transform translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl group-hover:opacity-30 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-[#d4a843]/10 flex items-center justify-center mb-6 border border-[#d4a843]/20 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(212,168,67,0.3)] transition-all">
                                            <TrendingUp className="text-[#d4a843]" size={32} />
                                        </div>
                                        <h4 className="font-black text-2xl text-white mb-2 tracking-tighter uppercase italic">Prime CRM</h4>
                                        <p className="text-sm text-zinc-500 max-w-[220px] leading-relaxed font-medium">Manage High-Net-Worth leads through Dubai Elite Intelligence.</p>
                                        <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#d4a843] group-hover:text-white transition-colors">
                                            <span>ACCESS CORE</span>
                                            <ArrowUpRight size={14} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4a843]/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Pipeline Status */}
                <div className="lg:col-span-1 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 relative overflow-hidden shadow-2xl backdrop-blur-xl group"
                    >
                        {/* HUD Corner Accents */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#d4a843]/30" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#d4a843]/30" />

                        <div className="relative z-10">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-tighter">
                                <Activity className="text-[#d4a843]" size={18} />
                                Infrastructure <span className="text-[#d4a843]">Flux</span>
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span className="text-zinc-500 flex items-center gap-2">
                                            <Video size={12} className="text-blue-400" />
                                            Veo Engine
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-emerald-pulse" />
                                            <span className="text-emerald-400 font-black">92%</span>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '92%' }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span className="text-zinc-500 flex items-center gap-2">
                                            <Cpu size={12} className="text-[#d4a843]" />
                                            Gemini 2.0 Flash
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                                            <span className="text-blue-400 font-black">Active</span>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                            className="h-full bg-[#d4a843] shadow-[0_0_10px_rgba(212,168,67,0.3)]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span className="text-zinc-500 flex items-center gap-2">
                                            <Database size={12} className="text-emerald-400" />
                                            Postgres Core
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-emerald-400 font-black">Stable</span>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                                            className="h-full bg-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-10 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#d4a843]/50 transition-all text-[10px] font-black text-zinc-400 hover:text-[#d4a843] uppercase tracking-[0.3em]">
                                VIEW SYSTEM LOGS
                            </button>
                        </div>

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-[200%] w-full animate-scanline pointer-events-none" />
                    </motion.div>

                    {/* Security Protocol Card */}
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 backdrop-blur-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <Shield size={20} className="animate-pulse" />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm text-white uppercase tracking-tighter">Security Protocol</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-emerald-pulse" />
                                        <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">ENCRYPTED</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                Neural bypass enabled. TLS 1.3 / AES-256 handshake established with Supabase Auth node.
                            </p>

                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Uptime: 99.998%</span>
                                <Radio size={12} className="text-emerald-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
