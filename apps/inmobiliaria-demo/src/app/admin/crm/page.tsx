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
    UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function CRMPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLeads();
    }, []);

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

    const filteredLeads = leads.filter(l =>
        l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="text-[#d4a843]" />
                        Mission CRM
                    </h1>
                    <p className="text-zinc-500 text-sm">Gestiona tus prospectos VIP y sus solicitudes de visualización</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-[#d4a843] outline-none transition-all w-64 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#d4a843] text-[#0a0a0f] rounded-xl font-bold hover:shadow-[0_0_15px_rgba(212,168,67,0.3)] transition-all text-sm">
                        <UserPlus size={18} />
                        <span>Añadir Lead</span>
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-[#d4a843]" size={40} />
                </div>
            ) : filteredLeads.length === 0 ? (
                <div className="bg-white/5 border border-white/5 rounded-[32px] p-20 text-center">
                    <Users className="mx-auto text-zinc-700 mb-4" size={48} />
                    <p className="text-zinc-500 italic">No hay leads registrados aún</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeads.map((lead, i) => (
                        <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 rounded-[32px] bg-white/5 border border-white/5 backdrop-blur-sm hover:border-[#d4a843]/30 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-xl font-bold text-white uppercase">
                                    {lead.full_name?.charAt(0)}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${lead.status === 'new' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    }`}>
                                    {lead.status}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1">{lead.full_name}</h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                    <Mail size={14} className="text-[#d4a843]" />
                                    {lead.email}
                                </div>
                                {lead.phone && (
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                        <Phone size={14} className="text-[#d4a843]" />
                                        {lead.phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                    <MessageSquare size={14} className="text-[#d4a843]" />
                                    <span className="font-semibold text-zinc-300">{lead.service_type || 'General Consultation'}</span>
                                </div>
                                {lead.property_title && (
                                    <div className="mt-4 p-3 rounded-2xl bg-black/40 border border-white/5 text-[11px]">
                                        <span className="text-zinc-500 uppercase font-bold tracking-tighter block mb-1">Interés en:</span>
                                        <span className="text-zinc-200 font-bold">{lead.property_title}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-medium uppercase tracking-wider">
                                    <Calendar size={12} />
                                    {new Date(lead.created_at).toLocaleDateString()}
                                </div>
                                <button className="text-[#d4a843] text-xs font-bold hover:underline">Gestionar Contacto</button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
