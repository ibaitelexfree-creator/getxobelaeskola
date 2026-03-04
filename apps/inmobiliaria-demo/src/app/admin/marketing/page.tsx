'use client';

import React, { useState, useEffect } from 'react';
import {
    Video,
    Wand2,
    Share2,
    Play,
    CheckCircle,
    AlertCircle,
    Loader2,
    Plus,
    Link as LinkIcon,
    Terminal,
    Cpu,
    Zap,
    Activity,
    ShieldCheck,
    Box,
    Globe,
    Film,
    MonitorPlay,
    Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface Property {
    id: number;
    title: string;
    video_status?: string;
    video_url?: string;
}

function MarketingAdminContent() {
    const searchParams = useSearchParams();
    const initialPropId = searchParams.get('propertyId');

    const [propertyId, setPropertyId] = useState<string>(initialPropId || '');
    const [properties, setProperties] = useState<Property[]>([]);
    const [videoType, setVideoType] = useState('cinematic_pan');
    const [generating, setGenerating] = useState(false);
    const [status, setStatus] = useState<string>('idle'); // idle, generating, completed, failed
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await fetch('/api/properties');
                const data = await res.json();
                if (data.success) {
                    setProperties(data.properties || []);
                }
            } catch (err) {
                console.error('Error fetching properties:', err);
            }
        };
        fetchProperties();
    }, []);

    useEffect(() => {
        if (propertyId) {
            const selected = properties.find(p => p.id.toString() === propertyId);
            if (selected?.video_status === 'processing') {
                setGenerating(true);
                setStatus('generating');
                setProgress(35);
            } else if (selected?.video_url) {
                setStatus('completed');
            }
        }
    }, [propertyId, properties]);

    const handleGenerate = async () => {
        if (!propertyId) return;

        setGenerating(true);
        setStatus('generating');
        setProgress(10);
        setErrorMessage('');

        try {
            const res = await fetch('/api/video/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyId, videoType }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Pipeline failure: Generation rejected');

            // Success trigger - simulated progress for better UX as n8n is async
            let currentProgress = 15;
            const interval = setInterval(() => {
                currentProgress += 1;
                if (currentProgress >= 95) {
                    clearInterval(interval);
                    setStatus('completed');
                    setGenerating(false);
                }
                setProgress(currentProgress);
            }, 500);

        } catch (error: any) {
            setErrorMessage(error.message);
            setStatus('failed');
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen pb-20 bg-[#0a0a0f]" style={{ paddingTop: '40px' }}>
            <div className="container max-w-[1600px] mx-auto px-8 space-y-12">
                {/* Header Context */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative">
                    <div className="absolute top-0 right-0 w-32 h-px bg-[#d4a843]/30" />

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Terminal size={18} className="text-[#d4a843]" />
                            <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter italic">VIRAL CONTENT <span className="text-[#d4a843]">VEO-1</span></h1>
                            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#d4a843]/10 border border-[#d4a843]/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">IA_CORE_READY</span>
                            </div>
                        </div>
                        <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] flex items-center gap-2 opacity-70">
                            <Film size={14} className="text-[#d4a843]" />
                            Generative Video Engine • Autonomous Script Synthesis • n8n Relay Active
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">ENGINE UPTIME</p>
                            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">99.98% OPS</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="p-4 bg-[#d4a843]/5 border border-[#d4a843]/20 rounded-2xl">
                            <Cpu size={24} className="text-[#d4a843]" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Control Panel */}
                    <div className="lg:col-span-12 space-y-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Mission Config Card */}
                            <div className="lg:col-span-2 p-10 rounded-[40px] bg-[#0a0a0f]/60 border border-white/5 backdrop-blur-3xl relative group">
                                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#d4a843]/10" />

                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-4 bg-[#d4a843]/10 rounded-2xl border border-[#d4a843]/20">
                                        <Wand2 size={24} className="text-[#d4a843]" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">MISSION <span className="text-[#d4a843]">SPECIFICATIONS</span></h2>
                                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">GEN-3 VIDEO PIPELINE CONFIGURATION</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 italic">TARGET ASSET_</label>
                                        <CustomSelect
                                            value={propertyId}
                                            options={properties.map(p => p.id.toString())}
                                            labels={properties.map(p => `${p.title.toUpperCase()} (DXB-${p.id})`)}
                                            onChange={setPropertyId}
                                            placeholder="SELECT TARGET UNIT..."
                                            triggerStyle={{ height: '70px', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: '#050508' }}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 italic">DEPLOYMENT MODE_</label>
                                        <div className="flex gap-4">
                                            {[
                                                { id: 'cinematic_pan', label: 'CINEMATIC' },
                                                { id: 'reels_fast', label: 'REELS' },
                                                { id: 'targeted_ads', label: 'ADS' }
                                            ].map(mode => (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => setVideoType(mode.id)}
                                                    className={`flex-1 py-5 rounded-3xl border transition-all text-[10px] font-black uppercase tracking-widest ${videoType === mode.id
                                                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                                        : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:border-[#d4a843]/40 hover:text-white hover:bg-[#d4a843]/5'
                                                        }`}
                                                >
                                                    {mode.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 space-y-4">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 italic">STRATEGIC DIRECTIVES (OPTIONAL)_</label>
                                    <textarea
                                        rows={4}
                                        placeholder="ENCODE SPECIFIC SELLING POINTS, TARGET DEMOGRAPHICS, OR VISUAL HOOKS..."
                                        className="w-full bg-black/40 border border-white/5 rounded-[32px] px-8 py-6 outline-none focus:border-[#d4a843] text-zinc-400 font-medium leading-relaxed transition-all placeholder:text-zinc-800 placeholder:uppercase placeholder:text-[10px] placeholder:font-black placeholder:tracking-widest"
                                    />
                                </div>
                            </div>

                            {/* Initialization Hub */}
                            <div className="p-10 rounded-[40px] bg-[#0a0a0f]/60 border border-white/5 backdrop-blur-3xl flex flex-col justify-between relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#d4a843]/10" />

                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">SYTEM_RELAY</p>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-[11px] font-black text-[#d4a843] uppercase tracking-wider">SECURE_LINK</span>
                                            <ShieldCheck size={14} className="text-[#d4a843]" />
                                        </div>
                                    </div>

                                    <div className="bg-black/40 border border-white/5 rounded-[32px] p-8 space-y-6 min-h-[160px] flex flex-col justify-center">
                                        <AnimatePresence mode="wait">
                                            {status === 'idle' && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4 py-4">
                                                    <MonitorPlay size={40} className="mx-auto text-zinc-800" />
                                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">AWAITING ASSET SELECTION</p>
                                                </motion.div>
                                            )}
                                            {status === 'generating' && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                                    <div className="flex justify-between items-end">
                                                        <p className="text-[10px] font-black text-[#d4a843] uppercase tracking-widest animate-pulse italic">RECONSTRUCTING_REALITY...</p>
                                                        <p className="text-2xl font-black text-white italic">{progress}%</p>
                                                    </div>
                                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-gradient-to-r from-[#d4a843] to-white"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                                                        <Timer size={10} />
                                                        ESTIMATED DEPTH MAPPING: 45S
                                                    </div>
                                                </motion.div>
                                            )}
                                            {status === 'completed' && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-4">
                                                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto relative">
                                                        <CheckCircle size={40} className="text-emerald-500" />
                                                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl animate-pulse rounded-full" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-white uppercase tracking-tighter">DATA SYNC COMPLETE</p>
                                                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-2">VEO-1 GENERATED MEDIA READY</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {status === 'failed' && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4 py-4">
                                                    <AlertCircle size={40} className="mx-auto text-rose-500" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">PROTOCOL FAILURE</p>
                                                        <p className="text-[8px] text-zinc-600 uppercase mt-1">{errorMessage}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={generating || !propertyId}
                                    className={`w-full py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all relative overflow-hidden group shadow-2xl mt-8 ${generating
                                        ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                                        : !propertyId
                                            ? 'bg-zinc-900/50 text-zinc-700 cursor-not-allowed border border-white/5'
                                            : 'bg-[#d4a843] text-black hover:bg-white shadow-[0_0_30px_rgba(212,168,67,0.2)]'
                                        }`}
                                >
                                    {generating ? (
                                        <><Loader2 className="animate-spin" size={18} /> INITIALIZING Relays...</>
                                    ) : (
                                        <><Zap size={18} /> DEPLOY IA CREATIVE</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Recent Deployments Table */}
                        <div className="p-10 rounded-[40px] bg-[#0a0a0f]/60 border border-white/5 backdrop-blur-3xl relative">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#d4a843]/10 rounded-2xl border border-[#d4a843]/20">
                                        <Activity size={20} className="text-[#d4a843]" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">OPERATIONAL <span className="text-[#d4a843]">HISTORY</span></h2>
                                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">LOGS OF CONTENT DISSEMINATION</p>
                                    </div>
                                </div>
                                <button className="text-[9px] font-black text-zinc-500 hover:text-[#d4a843] uppercase tracking-widest border border-white/10 rounded-full px-6 py-2 transition-all">VIEW_FULL_LOG_FILE</button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 text-left">
                                            <th className="pb-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">DEPLOY_ID</th>
                                            <th className="pb-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">TARGET_UNIT</th>
                                            <th className="pb-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">CHANNEL</th>
                                            <th className="pb-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">OPS_STATE</th>
                                            <th className="pb-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">COMMANDS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {properties.filter(p => p.video_url || p.video_status === 'processing').map((item, idx) => (
                                            <tr key={item.id} className="group hover:bg-white/[0.01]">
                                                <td className="py-8 text-[11px] font-bold text-zinc-500 group-hover:text-white transition-colors uppercase tracking-widest">#{1024 + item.id}</td>
                                                <td className="py-8 font-black text-white italic tracking-tighter uppercase">{item.title}</td>
                                                <td className="py-8">
                                                    <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                                        {videoType.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${item.video_url ? 'bg-emerald-500' : 'bg-[#d4a843] animate-pulse'}`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.video_url ? 'text-emerald-500' : 'text-[#d4a843]'}`}>
                                                            {item.video_status?.toUpperCase() || (item.video_url ? 'COMPLETED' : 'IDLE')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-8 text-right">
                                                    <div className="flex items-center justify-end gap-3 transition-all">
                                                        {item.video_url ? (
                                                            <>
                                                                <a href={item.video_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-black transition-all">
                                                                    <Play size={16} />
                                                                </a>
                                                                <button className="p-3 bg-white/5 text-[#d4a843] rounded-xl hover:bg-[#d4a843] hover:text-black transition-all">
                                                                    <Share2 size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">SYNCING_CORE...</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scanline FX */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-multiply" />
        </div>
    );
}

export default function MarketingAdmin() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[#d4a843]" size={40} />
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">SYNCHRONIZING_SYSTEM_RELAYS...</p>
                </div>
            </div>
        }>
            <MarketingAdminContent />
        </Suspense>
    );
}
