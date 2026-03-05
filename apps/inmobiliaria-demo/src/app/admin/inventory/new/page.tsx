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
    Loader2,
    Terminal,
    Cpu,
    Dna,
    ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { CustomSelect } from '@/components/ui/CustomSelect';

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
            if (!response.ok) throw new Error(resData.error || 'Protocol Failure: Asset Registration Failed');

            setIsSuccess(true);
            setTimeout(() => router.push('/admin/inventory'), 2000);
        } catch (err: any) {
            setError(err.message || 'Transmission Error: Uplink Interrupted');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20 px-4">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-8 relative">
                {/* HUD Accent Top */}
                <div className="absolute top-0 right-0 w-24 h-px bg-gradient-to-l from-[#d4a843]/40 to-transparent" />

                <div className="flex items-center gap-6">
                    <Link href="/admin/inventory">
                        <button className="group p-4 bg-[#0a0a0f] border border-white/10 rounded-2xl hover:border-[#d4a843]/50 transition-all text-zinc-500 hover:text-[#d4a843] backdrop-blur-xl relative">
                            <ChevronLeft size={24} />
                            <div className="absolute -inset-1 rounded-2xl bg-[#d4a843]/5 opacity-0 group-hover:opacity-100 transition-opacity blur" />
                        </button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Terminal size={18} className="text-[#d4a843]" />
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">ASSET <span className="text-[#d4a843]">INITIALIZATION</span></h1>
                            <div className="px-2 py-0.5 rounded border border-[#d4a843]/20 bg-[#d4a843]/10">
                                <span className="text-[10px] font-black text-[#d4a843] uppercase tracking-[0.2em]">PROTOCOL 7-A</span>
                            </div>
                        </div>
                        <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] opacity-60 flex items-center gap-2">
                            <Cpu size={12} className="text-emerald-500 animate-pulse" />
                            DEPLOYING NEW LUXURY OBJECT TO NEURAL CORE
                        </p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">SYSTEM STATUS</p>
                        <div className="flex items-center gap-2 justify-end">
                            <span className="text-[11px] font-black text-emerald-400 uppercase">READY_TO_UPLINK</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                    </div>
                </div>
            </header>

            {isSuccess ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0a0a0f]/80 backdrop-blur-2xl border border-emerald-500/20 rounded-[40px] p-20 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-emerald-500/20" />
                    <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-emerald-500/20" />

                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-3 uppercase tracking-tighter italic">REGISTRATION <span className="text-emerald-400">COMPLETE</span></h2>
                    <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.2em] mb-12">ASSET IDENTIFIER GENERATED • REDIRECTING TO REPOSITORY</p>

                    <div className="max-w-xs mx-auto space-y-4">
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2 }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                        <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest animate-pulse">CLEANING TEMP BUFFERS...</p>
                    </div>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3"
                            >
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                CRITICAL ERROR: {error}
                            </motion.div>
                        )}

                        {/* Core Definition Card */}
                        <div className="p-10 rounded-[40px] bg-[#0a0a0f]/60 border border-white/5 backdrop-blur-xl relative group">
                            <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#d4a843]/10 group-hover:border-[#d4a843]/30 transition-all" />

                            <div className="flex items-center gap-3 mb-10">
                                <div className="p-3 bg-[#d4a843]/10 rounded-2xl border border-[#d4a843]/20">
                                    <Dna size={20} className="text-[#d4a843]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">CORE <span className="text-[#d4a843]">SPECIFICATIONS</span></h3>
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">DEFINING ASSET DNA</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">OBJECT TITLE_</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="INPUT ASSET NAME..."
                                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-6 py-4 focus:border-[#d4a843] focus:ring-1 focus:ring-[#d4a843]/20 outline-none transition-all text-white font-black uppercase tracking-widest placeholder:text-zinc-800"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">VALUATION (AED)_</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-[#d4a843]" size={18} />
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="0,000,000"
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:border-[#d4a843] focus:ring-1 focus:ring-[#d4a843]/20 outline-none transition-all text-white font-black uppercase tracking-widest placeholder:text-zinc-800"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">SECTOR_</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 z-10" size={18} />
                                        <CustomSelect
                                            value={formData.location}
                                            options={NEIGHBORHOODS.map(n => n.name)}
                                            onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                                            placeholder="LINK TO LOCATION..."
                                            triggerStyle={{ paddingLeft: '3.5rem', height: '60px', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0f' }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">CLASSIFICATION_</label>
                                    <div className="relative">
                                        <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 z-10" size={18} />
                                        <CustomSelect
                                            value={formData.property_type}
                                            options={['Villa', 'Penthouse', 'Apartment', 'Mansion']}
                                            labels={['Villa', 'Penthouse', 'Apartamento', 'Mansión']}
                                            onChange={(val) => setFormData(prev => ({ ...prev, property_type: val }))}
                                            placeholder="IDENTIFY CATEGORY..."
                                            triggerStyle={{ paddingLeft: '3.5rem', height: '60px', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0f' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tactical Metadata Card */}
                        <div className="p-10 rounded-[40px] bg-[#0a0a0f]/60 border border-white/5 backdrop-blur-xl relative group">
                            <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#d4a843]/10 group-hover:border-[#d4a843]/30 transition-all" />

                            <div className="flex items-center gap-3 mb-10">
                                <div className="p-3 bg-[#d4a843]/10 rounded-2xl border border-[#d4a843]/20">
                                    <ShieldCheck size={20} className="text-[#d4a843]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">TACTICAL <span className="text-[#d4a843]">METADATA</span></h3>
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">INTERNAL STRUCTURAL DATA</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">NODE COUNT (BR)_</label>
                                    <div className="relative">
                                        <Bed className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                        <input
                                            type="number"
                                            name="bedrooms"
                                            value={formData.bedrooms}
                                            onChange={handleInputChange}
                                            placeholder="00"
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:border-[#d4a843] focus:ring-1 focus:ring-[#d4a843]/20 outline-none transition-all text-white font-black uppercase tracking-widest placeholder:text-zinc-800"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">NODE COUNT (BA)_</label>
                                    <div className="relative">
                                        <Bath className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                        <input
                                            type="number"
                                            name="bathrooms"
                                            value={formData.bathrooms}
                                            onChange={handleInputChange}
                                            placeholder="00"
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:border-[#d4a843] focus:ring-1 focus:ring-[#d4a843]/20 outline-none transition-all text-white font-black uppercase tracking-widest placeholder:text-zinc-800"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">MISSION DESCRIPTION_</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={5}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="ENCODE DETAILED ARCHITECTURAL DATA..."
                                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-[32px] px-8 py-6 focus:border-[#d4a843] focus:ring-1 focus:ring-[#d4a843]/20 outline-none transition-all text-zinc-300 font-medium leading-relaxed resize-none placeholder:text-zinc-800"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Visual Assets Side Card */}
                        <div className="p-8 rounded-[40px] bg-[#0a0a0f]/60 border border-white/5 backdrop-blur-xl relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[#d4a843]/0 via-[#d4a843]/20 to-[#d4a843]/0" />

                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-[#d4a843]/10 rounded-2xl border border-[#d4a843]/20">
                                    <Upload size={20} className="text-[#d4a843]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">VISUAL <span className="text-[#d4a843]">ASSETS</span></h3>
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">UPLINK HIGH-RES INTEL</p>
                                </div>
                            </div>

                            <div className="relative border-2 border-dashed border-white/5 rounded-[32px] p-8 text-center hover:bg-white/[0.02] hover:border-[#d4a843]/30 transition-all group cursor-pointer">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                />
                                <div className="w-16 h-16 bg-[#0a0a0f] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-700 group-hover:text-[#d4a843] group-hover:scale-110 transition-all duration-500">
                                    <Upload size={28} />
                                </div>
                                <p className="text-sm font-black text-white uppercase tracking-widest mb-1 italic">Initialize Upload</p>
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Drag Assets or Click to Scan</p>
                            </div>

                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    {formData.images.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-[20px] overflow-hidden border border-white/5 bg-[#0a0a0f]">
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt={img.name}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity">
                                                <p className="text-[8px] text-white font-black truncate">{img.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Control */}
                        <div className="p-4 rounded-[40px] bg-gradient-to-b from-[#d4a843]/10 to-transparent border border-[#d4a843]/5 backdrop-blur-xl">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all relative overflow-hidden group shadow-2xl ${isSubmitting
                                    ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5'
                                    : 'bg-white text-[#0a0a0f] hover:bg-[#d4a843] hover:text-white'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />

                                {isSubmitting ? (
                                    <><Loader2 className="animate-spin" size={18} /> INITIALIZING DEPLOYMENT...</>
                                ) : (
                                    <>EXECUTE ASSET INITIALIZATION</>
                                )}
                            </button>
                        </div>

                        <div className="px-6 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#d4a843]" />
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">ENCRYPTION: AES-256 ACTIVE</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#d4a843]" />
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">NODE: DXB-CENTRAL-01</span>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            <style jsx global>{`
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
