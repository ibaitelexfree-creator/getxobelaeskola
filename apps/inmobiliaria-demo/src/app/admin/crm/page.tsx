'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Mail,
    Phone,
    Calendar,
    MessageSquare,
    Search,
    Loader2,
    CheckCircle2,
    Clock,
    UserPlus,
    X,
    Send,
    Sparkles,
    TrendingUp,
    Target,
    ShieldCheck,
    Zap,
    MapPin,
    ArrowUpRight,
    Activity,
    Fingerprint,
    Cpu,
    Globe,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Lead {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    service_type: string;
    property_title: string;
    status: string;
    created_at: string;
}

interface Note {
    id: number;
    lead_id: number;
    author: string;
    content: string;
    note_type: string;
    created_at: string;
}

export default function CRMPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [sendingNote, setSendingNote] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        if (selectedLead) {
            fetchNotes(selectedLead.id);
        }
    }, [selectedLead]);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/realstate/api/leads');
            const data = await res.json();
            setLeads(data.leads || []);
        } catch (err) {
            console.error('Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    };

    const fetchNotes = async (leadId: number) => {
        setLoadingNotes(true);
        try {
            const res = await fetch(`/realstate/api/admin/crm/notes?lead_id=${leadId}`);
            const data = await res.json();
            setNotes(data.data || []);
        } catch (err) {
            console.error('Failed to fetch notes');
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleAddNote = async (type: string = 'general') => {
        if (!selectedLead || !newNote.trim()) return;
        setSendingNote(true);
        try {
            const res = await fetch('/realstate/api/admin/crm/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: selectedLead.id,
                    content: newNote,
                    note_type: type,
                    author: 'Admin'
                })
            });
            if (res.ok) {
                setNewNote('');
                fetchNotes(selectedLead.id);
            }
        } catch (err) {
            console.error('Failed to add note');
        } finally {
            setSendingNote(false);
        }
    };

    const generateAIInsight = () => {
        if (!selectedLead) return;
        const insights = [
            `Prospecto con alto interés en ${selectedLead.property_title || 'propiedades de lujo'}. Se recomienda seguimiento telefónico inmediato.`,
            "Patrón de navegación indica interés por zonas exclusivas. Probabilidad de cierre: 85%.",
            "Cliente recurrente en el portal. Busca maximizar ROI en propiedades de inversión.",
            "Perfil directivo. Prioriza privacidad y amenidades de alta gama."
        ];
        const randomInsight = insights[Math.floor(Math.random() * insights.length)];
        setNewNote(`[AI INSIGHT] ${randomInsight}`);
    };

    const filteredLeads = leads.filter(l =>
        l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative min-h-screen bg-[#0a0a0f] text-white p-6 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4a843]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#d4a843]/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 space-y-8">
                {/* Mission Control Header */}
                <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-[#d4a843]/10 pb-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d4a843]/5 to-transparent pointer-events-none" />

                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-[#d4a843]/20 blur-sm rounded-lg animate-pulse" />
                                <div className="relative p-3 rounded-lg bg-[#0a0a0f] border border-[#d4a843]/30 shadow-[0_0_20px_rgba(212,168,67,0.1)]">
                                    <Target className="text-[#d4a843]" size={28} />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-8 h-[1px] bg-[#d4a843]/40" />
                                    <span className="text-[10px] uppercase tracking-[0.5em] font-black text-[#d4a843]">Strategic Ops</span>
                                </div>
                                <h1 className="text-5xl font-black tracking-tighter text-white">MISSION <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">CRM</span></h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 pl-1">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                <span className="text-[10px] uppercase font-bold text-emerald-500/80 tracking-[0.2em] font-mono">NEURAL_NET_ACTIVE</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                <Activity className="text-[#d4a843]" size={12} />
                                <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">{leads.length} LIVE_TARGETS</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-5 h-5 rounded-full border border-[#0a0a0f] bg-zinc-800 flex items-center justify-center text-[8px] font-black">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Active Agents</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center relative z-10">
                        <div className="relative group overflow-hidden rounded-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#d4a843]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#d4a843] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="IDENTIFY TARGET..."
                                className="pl-14 pr-8 py-5 bg-[#14141c]/80 border border-white/10 rounded-2xl focus:border-[#d4a843]/50 outline-none transition-all w-80 text-xs font-black tracking-[0.2em] text-white backdrop-blur-2xl placeholder:text-zinc-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {/* HUD Corners */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#d4a843]/40" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#d4a843]/40" />
                        </div>
                        <button className="flex items-center gap-4 px-10 py-5 bg-[#d4a843] text-[#0a0a0f] rounded-2xl font-black uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(212,168,67,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs group relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                            <UserPlus size={18} className="relative z-10 group-hover:rotate-12 transition-transform" />
                            <span className="relative z-10">Deploy Agent</span>
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 border-2 border-[#d4a843]/10 rounded-full animate-ping absolute inset-0" />
                            <div className="w-20 h-20 border-t-2 border-[#d4a843] rounded-full animate-spin relative" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black uppercase tracking-[1em] text-[#d4a843] animate-pulse">Syncing Intel</span>
                            <span className="text-[8px] font-mono text-zinc-600">ENCRYPTED_STREAM_ESTABLISHED_...</span>
                        </div>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="bg-[#14141c]/50 border border-dashed border-white/10 rounded-[3rem] p-32 text-center relative overflow-hidden group backdrop-blur-sm">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,168,67,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <Fingerprint className="mx-auto text-zinc-800 mb-8 group-hover:text-[#d4a843]/20 group-hover:scale-110 transition-all duration-700" size={100} />
                        <h2 className="text-3xl font-black text-zinc-400 mb-2 tracking-tighter uppercase">No Signal Detected</h2>
                        <p className="text-zinc-600 font-bold tracking-[0.3em] text-[10px] uppercase">Please initiate new acquisition protocol</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredLeads.map((lead, i) => (
                            <motion.div
                                key={lead.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05, duration: 0.4 }}
                                onClick={() => setSelectedLead(lead)}
                                className={`group relative p-10 rounded-[2.5rem] bg-gradient-to-br from-[#1c1c28]/80 to-[#14141c]/90 border backdrop-blur-3xl transition-all cursor-pointer overflow-hidden ${selectedLead?.id === lead.id ? 'border-[#d4a843] shadow-[0_0_50px_rgba(212,168,67,0.2)] ring-1 ring-[#d4a843]/30' : 'border-white/5 hover:border-[#d4a843]/40'
                                    }`}
                            >
                                {/* Tactical Accents */}
                                <div className="absolute top-0 left-0 w-8 h-[1px] bg-[#d4a843]/30" />
                                <div className="absolute top-0 left-0 w-[1px] h-8 bg-[#d4a843]/30" />
                                <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-[#d4a843]/30" />
                                <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-[#d4a843]/30" />

                                <div className="absolute top-6 right-8 flex gap-2">
                                    <div className="w-[2px] h-3 bg-[#d4a843]/10" />
                                    <div className="w-[2px] h-3 bg-[#d4a843]/20" />
                                    <div className="w-[2px] h-3 bg-[#d4a843]/30" />
                                </div>

                                <div className="flex items-start gap-6 mb-10">
                                    <div className="relative shrink-0">
                                        <div className="absolute -inset-2 bg-gradient-to-br from-[#d4a843]/30 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="w-16 h-16 rounded-[1.25rem] bg-[#0a0a0f] border border-white/10 flex items-center justify-center text-3xl font-black text-white uppercase group-hover:border-[#d4a843]/50 transition-all shadow-xl relative z-10">
                                            {lead.full_name?.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl bg-[#d4a843] flex items-center justify-center border-4 border-[#1c1c28] z-20 shadow-lg">
                                            <ShieldCheck size={14} className="text-[#0a0a0f]" />
                                        </div>
                                    </div>
                                    <div className="pt-1 overflow-hidden">
                                        <h3 className="text-2xl font-black text-white group-hover:text-[#d4a843] transition-colors tracking-tighter leading-none mb-2 truncate">
                                            {lead.full_name}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                                <div className={`w-1.5 h-1.5 rounded-full ${lead.status === 'new' ? 'bg-blue-400' : 'bg-emerald-400'} animate-pulse`} />
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap">{lead.status} protocol</span>
                                            </div>
                                            <span className="text-[8px] font-mono text-zinc-700">LVL_{Math.floor(Math.random() * 99) + 1}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0a0a0f]/50 border border-white/5 group-hover:border-[#d4a843]/20 transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-[#d4a843]/5 flex items-center justify-center border border-[#d4a843]/10">
                                            <Mail size={16} className="text-[#d4a843]" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest mb-0.5">Communication Relay</span>
                                            <span className="text-xs font-bold text-zinc-300 truncate">{lead.email}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0a0a0f]/50 border border-white/5 group-hover:border-[#d4a843]/20 transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-[#d4a843]/5 flex items-center justify-center border border-[#d4a843]/10">
                                            <MessageSquare size={16} className="text-[#d4a843]" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest mb-0.5">Objective Class</span>
                                            <span className="text-xs font-black tracking-tighter text-white uppercase group-hover:text-[#d4a843] transition-colors">
                                                {lead.service_type || 'General Intel Extraction'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {lead.property_title && (
                                    <div className="mb-10 p-5 rounded-3xl bg-gradient-to-br from-black/60 to-transparent border border-white/5 group-hover:border-[#d4a843]/10 transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Target size={14} className="text-[#d4a843]" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Target Objective</span>
                                            </div>
                                            <div className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="w-1/2 h-full bg-[#d4a843]" />
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-white leading-tight block group-hover:translate-x-1 transition-transform">
                                            {lead.property_title}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5">
                                            <Clock size={14} className="text-zinc-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Entry Date</span>
                                            <span className="text-[10px] font-mono font-bold text-zinc-400">
                                                {new Date(lead.created_at).toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d4a843]/5 border border-[#d4a843]/20 group-hover:bg-[#d4a843] group-hover:text-[#0a0a0f] transition-all group-active:scale-95">
                                        <Zap size={14} className="text-[#d4a843] group-hover:text-[#0a0a0f]" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Engage Target</span>
                                    </button>
                                </div>

                                {/* Scanline FX */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4a843]/[0.02] to-transparent h-[300%] w-full animate-scanline pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Intelligence Side Panel (Tactical Display) */}
            <AnimatePresence>
                {selectedLead && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedLead(null)}
                            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
                        />

                        <motion.div
                            initial={{ x: '100%', skewX: 5 }}
                            animate={{ x: 0, skewX: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 35, stiffness: 250 }}
                            className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-[#0a0a0f] border-l border-[#d4a843]/20 z-[70] flex flex-col shadow-[-20px_0_100px_rgba(0,0,0,0.9)]"
                        >
                            {/* Panel Header */}
                            <div className="p-12 border-b border-[#d4a843]/10 relative bg-[#0d0d14] overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4a843] to-transparent shadow-[0_0_15px_#d4a843]" />

                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-8">
                                        <div className="relative group">
                                            <div className="absolute -inset-2 bg-[#d4a843] blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                                            <div className="w-24 h-24 rounded-[2.5rem] bg-[#d4a843] flex items-center justify-center text-4xl font-black text-[#0a0a0f] shadow-[0_0_50px_rgba(212,168,67,0.4)] relative z-10">
                                                {selectedLead.full_name.charAt(0)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="px-2 py-0.5 rounded bg-[#d4a843]/10 border border-[#d4a843]/20">
                                                    <span className="text-[8px] font-black tracking-[0.3em] text-[#d4a843] uppercase">Priority Alpha</span>
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            </div>
                                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">{selectedLead.full_name}</h2>
                                            <div className="flex items-center gap-4">
                                                <p className="text-[#d4a843] text-[9px] font-black uppercase tracking-[0.5em] flex items-center gap-2">
                                                    <Cpu size={14} className="animate-spin-slow" />
                                                    NEURO_ENTITY_IDENTIFIED
                                                </p>
                                                <span className="text-zinc-700 font-mono text-[9px]">ID: {selectedLead.id}-${Math.random().toString(36).substring(7).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedLead(null)}
                                        className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-red-500/10 rounded-2xl transition-all text-zinc-600 hover:text-red-500 border border-white/5 hover:border-red-500/30 group"
                                    >
                                        <X size={28} className="group-hover:rotate-90 transition-transform duration-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Panel Content */}
                            <div className="flex-grow overflow-y-auto p-12 space-y-12 custom-scrollbar bg-[#0a0a0f]">
                                {/* Tactical Information Grid */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="p-8 rounded-[2rem] bg-[#14141c] border border-white/5 group hover:border-[#d4a843]/30 transition-all relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2">
                                            <Fingerprint size={12} className="text-zinc-800" />
                                        </div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 rounded-xl bg-[#d4a843]/10 border border-[#d4a843]/20 shadow-inner">
                                                <Mail size={18} className="text-[#d4a843]" />
                                            </div>
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Neural Relay</span>
                                        </div>
                                        <p className="text-base font-bold text-white truncate selection:bg-[#d4a843] selection:text-[#0a0a0f]">{selectedLead.email}</p>
                                    </div>

                                    <div className="p-8 rounded-[2rem] bg-[#14141c] border border-white/5 group hover:border-[#d4a843]/30 transition-all relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 text-emerald-500/20">
                                            <Globe size={12} />
                                        </div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 rounded-xl bg-[#d4a843]/10 border border-[#d4a843]/20 shadow-inner">
                                                <Phone size={18} className="text-[#d4a843]" />
                                            </div>
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Signal Direct</span>
                                        </div>
                                        <p className="text-base font-bold text-white selection:bg-[#d4a843] selection:text-[#0a0a0f]">{selectedLead.phone || 'DATA_NULL'}</p>
                                    </div>

                                    <div className="col-span-2 p-10 rounded-[2.5rem] bg-gradient-to-br from-[#d4a843]/10 via-transparent to-[#d4a843]/5 border border-[#d4a843]/20 flex items-center justify-between group relative overflow-hidden">
                                        <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(212,168,67,0.1),transparent)] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-8 relative z-10">
                                            <div className="w-16 h-16 rounded-2xl bg-[#d4a843] flex items-center justify-center shadow-[0_0_30px_rgba(212,168,67,0.5)] group-hover:scale-110 transition-transform">
                                                <Target className="text-[#0a0a0f]" size={28} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] text-[#d4a843] uppercase font-black tracking-[0.4em]">Primary Objective</span>
                                                    <div className="w-1 h-1 rounded-full bg-[#d4a843] animate-ping" />
                                                </div>
                                                <p className="text-2xl font-black text-white tracking-tighter leading-tight uppercase">{selectedLead.property_title || 'General Asset Consultation'}</p>
                                            </div>
                                        </div>
                                        <div className="relative z-10 px-6 py-3 rounded-2xl bg-[#0a0a0f] border border-[#d4a843]/40 flex items-center gap-3">
                                            <ShieldCheck className="text-emerald-500" size={20} />
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono">SECURE</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Artificial Intelligence Core */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <h3 className="text-2xl font-black text-white flex items-center gap-4 tracking-tighter">
                                                <div className="relative">
                                                    <Sparkles className="text-[#d4a843]" size={28} />
                                                    <div className="absolute inset-0 blur-sm text-[#d4a843] opacity-50 animate-pulse"><Sparkles size={28} /></div>
                                                </div>
                                                NEURAL CORE INSIGHTS
                                            </h3>
                                            <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.5em] mt-1 ml-11">Processing psychological profile...</p>
                                        </div>
                                        <button
                                            onClick={generateAIInsight}
                                            className="px-8 py-4 bg-white/5 border border-[#d4a843]/30 rounded-2xl text-[10px] font-black text-[#d4a843] uppercase tracking-[0.3em] hover:bg-[#d4a843] hover:text-[#0a0a0f] transition-all hover:shadow-[0_0_30px_rgba(212,168,67,0.3)] active:scale-95"
                                        >
                                            Force Recalculation
                                        </button>
                                    </div>

                                    {/* Intelligence Input Console */}
                                    <div className="relative group">
                                        <div className="absolute top-0 left-0 w-full h-full bg-[#d4a843]/5 rounded-[3rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="INJECT OPERATIONAL DATA..."
                                            className="w-full h-48 p-10 bg-[#14141c] border border-white/10 rounded-[3rem] text-white text-base font-medium outline-none focus:border-[#d4a843]/50 transition-all resize-none backdrop-blur-3xl custom-scrollbar relative z-10 placeholder:text-zinc-800"
                                        />
                                        <div className="absolute bottom-8 right-8 z-20">
                                            <button
                                                onClick={() => handleAddNote('agent')}
                                                disabled={sendingNote || !newNote.trim()}
                                                className="w-16 h-16 bg-[#d4a843] text-[#0a0a0f] rounded-[1.5rem] flex items-center justify-center hover:shadow-[0_0_40px_rgba(212,168,67,0.6)] transition-all hover:scale-110 active:scale-90 disabled:opacity-50 shadow-2xl"
                                            >
                                                {sendingNote ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                                            </button>
                                        </div>
                                        {/* Corner Accents */}
                                        <div className="absolute top-0 left-10 w-20 h-px bg-gradient-to-r from-transparent via-[#d4a843]/50 to-transparent z-20" />
                                        <div className="absolute bottom-0 right-10 w-20 h-px bg-gradient-to-r from-transparent via-[#d4a843]/50 to-transparent z-20" />
                                    </div>

                                    {/* Operation Log */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-zinc-900 px-4 py-1.5 rounded-lg">
                                                <h4 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.5em]">Mission Log Chain</h4>
                                            </div>
                                            <div className="flex-grow h-px bg-white/5" />
                                        </div>

                                        {loadingNotes ? (
                                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                <div className="w-12 h-12 border-t-2 border-b-2 border-[#d4a843] rounded-full animate-spin" />
                                                <span className="text-[10px] font-black text-[#d4a843] uppercase tracking-widest">Accessing records...</span>
                                            </div>
                                        ) : notes.length === 0 ? (
                                            <div className="p-20 text-center bg-[#14141c]/40 border border-dashed border-white/10 rounded-[4rem] flex flex-col items-center gap-6">
                                                <Globe className="text-zinc-900" size={60} />
                                                <p className="text-zinc-700 font-black uppercase tracking-[0.4em] text-[10px]">Ghost Target: No data traces available</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-8 relative pl-10 border-l border-white/5 pb-10">
                                                {notes.map((note, idx) => (
                                                    <motion.div
                                                        key={note.id}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className={`p-10 rounded-[3rem] border relative group/note shadow-2xl ${note.content.includes('[AI INSIGHT]')
                                                            ? 'bg-blue-600/5 border-blue-500/30'
                                                            : 'bg-[#14141c]/80 border-white/5'
                                                            }`}
                                                    >
                                                        {/* Connector Node */}
                                                        <div className="absolute top-12 -left-[45px] w-10 h-px bg-white/10" />
                                                        <div className={`absolute top-11 -left-[54px] w-[18px] h-[18px] rounded-full border-4 border-[#0a0a0f] shadow-lg ${note.content.includes('[AI INSIGHT]') ? 'bg-blue-500 animate-pulse' : 'bg-[#d4a843]'}`} />

                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className="flex items-center gap-4">
                                                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] font-mono ${note.content.includes('[AI INSIGHT]') ? 'text-blue-400' : 'text-[#d4a843]'}`}>
                                                                    {note.content.includes('[AI INSIGHT]') ? 'NEURAL_UNIT' : 'FIELD_AGENT'}_{note.author.toUpperCase()}
                                                                </span>
                                                                <div className="w-1 h-3 bg-white/10" />
                                                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">LOG_CHAIN: {note.id}</span>
                                                            </div>
                                                            <span className="text-[9px] font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded">
                                                                {new Date(note.created_at).toLocaleDateString()}@{new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                            </span>
                                                        </div>
                                                        <p className={`text-base leading-relaxed font-bold tracking-tight ${note.content.includes('[AI INSIGHT]') ? 'text-blue-100 italic' : 'text-zinc-300'}`}>
                                                            {note.content.replace('[AI INSIGHT] ', '').split('\n').map((line, i) => (
                                                                <span key={i} className="block mb-1">{line}</span>
                                                            ))}
                                                        </p>

                                                        {note.content.includes('[AI INSIGHT]') && (
                                                            <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1 bg-blue-600 rounded-full">
                                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Cognitive Overlay</span>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tactical Actions Terminal */}
                            <div className="p-12 border-t border-[#d4a843]/10 flex gap-6 bg-[#0d0d14] relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#d4a843]/10" />
                                <button className="flex-grow py-6 bg-gradient-to-r from-emerald-600 to-emerald-400 text-[#0a0a0f] rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group">
                                    <Target size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                                    INITIALIZE CLOSING_SEQUENCE
                                </button>
                                <div className="flex gap-4">
                                    <button className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-blue-500/10 hover:border-blue-500/40 transition-all text-[#d4a843] group">
                                        <Mail size={32} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all text-[#d4a843] group">
                                        <Phone size={32} className="group-hover:rotate-12 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(212, 168, 67, 0.2);
                    border-radius: 2px;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
