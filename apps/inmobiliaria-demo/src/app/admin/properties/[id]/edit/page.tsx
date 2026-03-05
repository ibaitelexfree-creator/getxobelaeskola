'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Save,
    ArrowLeft,
    Loader2,
    Terminal,
    Cpu,
    ShieldAlert,
    FileEdit,
    Activity,
    Database,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { CustomSelect } from '@/components/ui/CustomSelect';

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
                if (!res.ok) throw new Error('Cortex Access Denied: Data fetch failed');
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

            if (!res.ok) throw new Error('Encryption Error: Failed to update property core');

            router.push('/admin/properties');
        } catch (error) {
            console.error('Error updating property:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="relative">
                    <Loader2 className="animate-spin text-[#d4a843] w-12 h-12" />
                    <div className="absolute inset-0 bg-[#d4a843]/10 blur-xl animate-pulse" />
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">ACCESSING NEURAL REPOSITORY...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20 px-4">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-8 relative">
                <div className="absolute top-0 right-0 w-24 h-px bg-gradient-to-l from-[#d4a843]/40 to-transparent" />

                <div className="flex items-center gap-6">
                    <Link href="/admin/properties">
                        <button className="group p-4 bg-[#0a0a0f] border border-white/10 rounded-2xl hover:border-[#d4a843]/50 transition-all text-zinc-500 hover:text-[#d4a843] backdrop-blur-xl relative">
                            <ArrowLeft size={24} />
                            <div className="absolute -inset-1 rounded-2xl bg-[#d4a843]/5 opacity-0 group-hover:opacity-100 transition-opacity blur" />
                        </button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Terminal size={18} className="text-[#d4a843]" />
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">ASSET <span className="text-[#d4a843]">MODIFICATION</span></h1>
                            <div className="px-2 py-0.5 rounded border border-rose-500/20 bg-rose-500/10">
                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">ID: {propertyId}</span>
                            </div>
                        </div>
                        <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] opacity-60 flex items-center gap-2">
                            <Activity size={12} className="text-[#d4a843] animate-pulse" />
                            REWRITING ASSET PARAMETERS IN GRID CORE
                        </p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">DATA INTEGRITY</p>
                        <div className="flex items-center gap-2 justify-end">
                            <span className="text-[11px] font-black text-[#d4a843] uppercase tracking-wider">VERIFIED_ACCESS</span>
                            <ShieldAlert size={14} className="text-[#d4a843]" />
                        </div>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Primary Parameters Card */}
                    <div className="p-10 rounded-[40px] bg-[#0a0a0f]/60 border border-white/5 backdrop-blur-xl relative group">
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#d4a843]/10 group-hover:border-[#d4a843]/30 transition-all" />

                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-3 bg-[#d4a843]/10 rounded-2xl border border-[#d4a843]/20">
                                <FileEdit size={20} className="text-[#d4a843]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter">PRIMARY <span className="text-[#d4a843]">PARAMETERS</span></h3>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">CORE DATA MODIFICATION</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">OBJECT TITLE_</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-6 py-4 focus:border-[#d4a843] focus:ring-1 focus:ring-[#d4a843]/20 outline-none transition-all text-white font-black uppercase tracking-widest"
                                    placeholder="INPUT ASSET NAME..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">VALUATION (AED)_</label>
                                    <div className="relative">
                                        <Database className="absolute left-5 top-1/2 -translate-y-1/2 text-[#d4a843]" size={18} />
                                        <input
                                            type="text"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:border-[#d4a843] outline-none transition-all text-white font-black uppercase tracking-widest"
                                            placeholder="0,000,000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">SECTOR_</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-6 py-4 focus:border-[#d4a843] outline-none transition-all text-white font-black uppercase tracking-widest"
                                        placeholder="LOCATION COORDINATES..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">DETAILED ANALYSIS_</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-[32px] px-8 py-6 focus:border-[#d4a843] outline-none transition-all text-zinc-300 font-medium leading-relaxed resize-none"
                                    placeholder="ENCODE ARCHITECTURAL INTEL..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Classification Card */}
                    <div className="p-8 rounded-[40px] bg-[#0a0a0f]/60 border border-white/5 backdrop-blur-xl relative group">
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#d4a843]/10" />

                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-[#d4a843]/10 rounded-2xl border border-[#d4a843]/20">
                                <Zap size={20} className="text-[#d4a843]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">GRID <span className="text-[#d4a843]">STATUS</span></h3>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">RUNTIME CONFIGURATION</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">CATEGORY_</label>
                                <CustomSelect
                                    value={formData.property_type}
                                    options={['Villa', 'Apartment', 'Penthouse', 'Townhouse', 'Mansion']}
                                    labels={['Villa', 'Apartamento', 'Penthouse', 'Townhouse', 'Mansión']}
                                    onChange={(val) => setFormData({ ...formData, property_type: val })}
                                    placeholder="SELECT TYPE..."
                                    triggerStyle={{ height: '60px', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0f' }}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">OPERATIONAL STATE_</label>
                                <CustomSelect
                                    value={formData.status}
                                    options={['pending', 'published', 'rejected', 'sold', 'archived']}
                                    labels={['PENDING', 'PUBLISHED', 'REJECTED', 'SOLD', 'ARCHIVED']}
                                    onChange={(val) => setFormData({ ...formData, status: val })}
                                    placeholder="SELECT STATUS..."
                                    triggerStyle={{ height: '60px', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0f' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="p-4 rounded-[40px] bg-[#0a0a0f]/60 border border-white/5 backdrop-blur-xl space-y-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all relative overflow-hidden group shadow-2xl ${saving
                                    ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                                    : 'bg-[#d4a843] text-black hover:bg-white'
                                }`}
                        >
                            {saving ? (
                                <><Loader2 className="animate-spin" size={18} /> UPDATING GRID...</>
                            ) : (
                                <><Save size={18} /> COMMIT MODIFICATIONS</>
                            )}
                        </button>

                        <div className="px-6 py-2 border-t border-white/5 mt-2">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center">LAST SYSTEM SYNC: {new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
