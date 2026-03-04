'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyMapSection } from '@/components/properties/PropertyMapSection';
import { BookingModal } from '@/components/ui/BookingModal';
import { DepthParallax3D } from '@/components/ui/DepthParallax3D';
import { PropertyVideo } from '@/components/properties/PropertyVideo';
import { formatSqft } from '@/lib/utils';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { getAssetPath } from '@/lib/constants';
import { Property } from '@/data/properties';
import { Magnetic } from '@/components/ui/Magnetic';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { createClient } from '@/lib/supabase/client';
import {
    Target,
    Activity,
    Shield,
    Zap,
    Compass,
    Crosshair,
    Terminal,
    ArrowRight,
    Lock,
    RefreshCcw,
    Layers,
    ChevronRight,
    Play,
    Info,
    Smartphone,
    Cpu,
    Briefcase,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = '3d' | 'video' | 'static';

interface PropertyDetailClientProps {
    property: Property;
    similarProperties: Property[];
    formattedPrice: string;
}

export const PropertyDetailClient: React.FC<PropertyDetailClientProps> = ({
    property: initialProperty,
    similarProperties,
    formattedPrice
}) => {
    const { formatPrice } = useCurrency();
    const [property, setProperty] = useState(initialProperty);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Fetch dynamic data from database (depth maps, videos, status)
    useEffect(() => {
        const fetchDynamicData = async () => {
            try {
                // Find dynamic property by reference code or ID
                const { data, error } = await createClient()
                    .from('properties')
                    .select('depth_maps, depth_map_status, video_url, video_status')
                    .eq('id', (initialProperty as any).id)
                    .single();

                if (data && !error) {
                    setProperty(prev => ({
                        ...prev,
                        depth_maps: data.depth_maps,
                        depth_map_status: data.depth_map_status,
                        video_url: data.video_url,
                        video_status: data.video_status
                    }));
                }
            } catch (err) {
                console.error('Error fetching dynamic property data:', err);
            }
        };

        fetchDynamicData();
        // Polling if processing
        const interval = setInterval(() => {
            const prop = property as any;
            if (prop.depth_map_status === 'processing' || prop.video_status === 'processing') {
                fetchDynamicData();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [initialProperty]);

    // Immersive image mode
    const hasDepthMap = !!(property as any).depth_maps?.length;
    const hasVideo = !!(property as any).video_url;
    const defaultMode: ViewMode = hasDepthMap ? '3d' : hasVideo ? 'video' : 'static';
    const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Record view if user is logged in
        const recordView = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('view_history').insert([{
                    user_id: user.id,
                    property_slug: property.slug
                }]);
            }
        };
        recordView();

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [property.slug]);

    return (
        <main className="pt-[140px] pb-32 bg-[#050505] min-h-screen relative overflow-hidden">
            {/* Background HUD Accents */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] bg-[#d4a843]/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Layout Scaffolding */}
            <div className="max-w-[1700px] mx-auto px-6 relative">
                {/* Header Metadata Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                    <div className="space-y-4 max-w-4xl">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
                                <Terminal size={10} className="text-[#d4a843]" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">System Trace /</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#d4a843]">{property.slug}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Objective Locked</span>
                            </div>
                        </div>

                        <h1 className="text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter text-white uppercase leading-[0.8] mix-blend-difference">
                            {property.title}
                        </h1>

                        <div className="flex items-center gap-6">
                            <span className="text-xl font-light text-zinc-500 uppercase tracking-[0.2em]">{property.neighborhood}, Dubai</span>
                            <div className="h-[1px] w-20 bg-[#d4a843]/40" />
                            <Badge variant="gold" className="px-5 py-1.5 bg-[#d4a843]/10 border border-[#d4a843]/40 text-[#d4a843] text-[10px] uppercase font-black tracking-widest rounded-none">
                                Tier-00{property.id} Asset
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Market Valuation</span>
                        <div className="text-5xl md:text-6xl font-black italic text-white tracking-tighter">
                            {formatPrice(property.price)}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-12">
                        {/* Immersive Gallery HUD */}
                        <div className="relative aspect-[16/9] rounded-sm overflow-hidden border border-white/10 group shadow-[0_0_50px_rgba(0,0,0,1)] bg-black">
                            {/* HUD Corner Accents */}
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#d4a843]/40 z-20 rounded-tl-sm pointer-events-none" />
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#d4a843]/40 z-20 rounded-tr-sm pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#d4a843]/40 z-20 rounded-bl-sm pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#d4a843]/40 z-20 rounded-br-sm pointer-events-none" />

                            {/* View Mode Switcher HUD */}
                            <div className="absolute top-8 right-8 z-30 flex flex-col gap-3">
                                {[
                                    { id: '3d', label: 'Neural 3D', icon: <Layers size={14} />, enabled: hasDepthMap },
                                    { id: 'video', label: 'Tactical Film', icon: <Play size={14} />, enabled: hasVideo },
                                    { id: 'static', label: 'Static Cap', icon: <Smartphone size={14} />, enabled: true },
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => mode.enabled && setViewMode(mode.id as ViewMode)}
                                        disabled={!mode.enabled}
                                        className={`flex items-center justify-between gap-6 px-5 py-3 border border-white/10 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 backdrop-blur-xl ${viewMode === mode.id
                                                ? 'bg-[#d4a843] text-black border-[#d4a843] shadow-[0_0_30px_rgba(212,168,67,0.4)]'
                                                : mode.enabled
                                                    ? 'bg-black/40 text-white/50 hover:bg-white/10 hover:text-white'
                                                    : 'opacity-10 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            {mode.icon}
                                            {mode.label}
                                        </span>
                                        {viewMode === mode.id && <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />}
                                    </button>
                                ))}
                            </div>

                            {/* Main Visuals Overlay */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={viewMode}
                                    initial={{ opacity: 0, filter: 'blur(20px) contrast(1.2)' }}
                                    animate={{ opacity: 1, filter: 'blur(0px) contrast(1)' }}
                                    exit={{ opacity: 0, filter: 'blur(20px)' }}
                                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="w-full h-full"
                                >
                                    {viewMode === '3d' && hasDepthMap ? (
                                        <DepthParallax3D
                                            imageUrl={getAssetPath(property.coverImage)}
                                            depthMapUrl={(property as any).depth_maps[0]}
                                            intensity={0.06}
                                            style={{ width: '100%', height: '100%' }}
                                            alt={property.title}
                                        />
                                    ) : viewMode === 'video' && hasVideo ? (
                                        <PropertyVideo
                                            videoUrl={(property as any).video_url}
                                            posterImage={getAssetPath(property.coverImage)}
                                            showControls
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    ) : (
                                        <div className="w-full h-full relative overflow-hidden">
                                            <img
                                                src={getAssetPath(property.coverImage)}
                                                alt={property.title}
                                                className="w-full h-full object-cover animate-ken-burns"
                                            />
                                            {/* Tactical HUD Overlay Lines */}
                                            <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none" />
                                            <div className="absolute inset-[40px] border border-white/5 pointer-events-none" />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Scanline / Grid Effect */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none mix-blend-overlay" />
                            <div className="absolute inset-x-0 h-[2px] bg-white/10 animate-scanline pointer-events-none opacity-20" />

                            {/* Bottom Labeling */}
                            <div className="absolute bottom-8 left-8 z-20 flex gap-4">
                                <div className="px-4 py-1.5 bg-black/60 border border-emerald-500/40 rounded-sm flex items-center gap-3 backdrop-blur-md">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Telemetry: Stable</span>
                                </div>
                                <div className="px-4 py-1.5 bg-black/60 border border-white/10 rounded-sm flex items-center gap-3 backdrop-blur-md">
                                    <Layers size={10} className="text-zinc-500" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Asset: LUX-00{property.id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tactical Briefing & Specs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/30">Mission Summary</h2>
                                    <div className="h-[1px] flex-grow bg-white/5" />
                                </div>
                                <p className="text-2xl text-zinc-400 font-light leading-relaxed tracking-wide italic">
                                    {property.description}
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/30">Technical Parameters</h2>
                                    <div className="h-[1px] flex-grow bg-white/5" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Spatial Volume', value: property.sizeSqft.toLocaleString(), unit: 'SQ FT', icon: <Compass size={14} /> },
                                        { label: 'Operational Level', value: property.bedrooms, unit: 'UNITS', icon: <Layers size={14} /> },
                                        { label: 'Sanitation Nodes', value: property.bathrooms, unit: 'NODES', icon: <Crosshair size={14} /> },
                                        { label: 'Build Protocol', value: property.yearBuilt, unit: 'PROTO', icon: <Cpu size={14} /> },
                                    ].map((spec, i) => (
                                        <div key={i} className="bg-white/5 border border-white/5 p-5 relative group hover:border-[#d4a843]/30 transition-all">
                                            <div className="mb-4 text-[#d4a843]/40 group-hover:text-[#d4a843] transition-colors">{spec.icon}</div>
                                            <div className="text-[9px] uppercase font-black tracking-widest text-zinc-600 mb-2">{spec.label}</div>
                                            <div className="flex items-end gap-2">
                                                <span className="text-3xl font-black italic tracking-tighter text-white">{spec.value}</span>
                                                <span className="text-[8px] font-bold text-zinc-700 uppercase mb-1">{spec.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Feature Infrastructure */}
                        <div className="space-y-10 py-12">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/30">Infrastructure & Amenities</h2>
                                <div className="h-[1px] flex-grow bg-white/5" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {property.amenities.map((item, idx) => (
                                    <div key={idx} className="group flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-all shadow-[0_0_10px_rgba(16,185,129,0)] group-hover:shadow-[0_0_15px_#10b981]" />
                                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Geospatial Component */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/30">Geospatial Intelligence</h2>
                                <div className="h-[1px] flex-grow bg-white/5" />
                            </div>
                            <div className="aspect-video bg-black/40 border border-white/10 rounded-sm overflow-hidden relative shadow-inner">
                                <PropertyMapSection neighborhood={property.neighborhood} name={property.title} />
                                <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black to-transparent pointer-events-none z-20" />
                                <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Mission Authorization Cabinet */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Transaction Core */}
                        <div className="sticky top-[140px] space-y-8 h-fit">
                            <div className="bg-[#0a0a0f] border border-white/10 rounded-sm p-10 relative overflow-hidden group shadow-2xl">
                                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4a843] to-transparent shadow-[0_0_20px_#d4a843]" />

                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-2">
                                        <Shield className="text-[#d4a843]" size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#d4a843]">Elite Vault Ready</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-700 italic">SIG-0293X</span>
                                </div>

                                <div className="space-y-4 mb-10 border-y border-white/5 py-8">
                                    {[
                                        { label: 'Asset Status', val: 'DEPLOYED', color: 'text-emerald-400' },
                                        { label: 'Risk Profile', val: 'AAA MINIMAL', color: 'text-zinc-400' },
                                        { label: 'Access Tier', val: 'ULTRA-LUXE', color: 'text-[#d4a843]' },
                                    ].map((stat, i) => (
                                        <div key={i} className="flex justify-between items-center group/item">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 transition-colors group-hover/item:text-white">{stat.label}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${stat.color}`}>{stat.val}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => setIsBookingOpen(true)}
                                        className="w-full py-6 bg-white text-black text-[12px] font-black uppercase tracking-[0.4em] overflow-hidden relative group/deploy-btn transition-all hover:bg-[#d4a843] hover:shadow-[0_0_50px_rgba(212,168,67,0.4)]"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-4">
                                            Initialize Protocol
                                            <ArrowRight size={18} />
                                        </span>
                                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/deploy-btn:translate-x-full transition-transform duration-1000" />
                                    </button>

                                    <button className="w-full py-6 bg-transparent border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white/5 hover:border-white/30 transition-all flex items-center justify-center gap-4">
                                        <Lock size={16} />
                                        Secure Archive Access
                                    </button>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-zinc-700">
                                    <span className="text-[8px] font-black uppercase tracking-widest">Encryption Level / 1024-BIT</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest italic animate-pulse">Scanning Bio-Log...</span>
                                </div>
                            </div>

                            {/* Neuro-Advisor Component */}
                            <div className="p-10 border border-white/5 bg-black/40 backdrop-blur-3xl relative group overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#d4a843]/5 blur-[60px] rounded-full pointer-events-none" />

                                <div className="flex items-center gap-5 mb-8">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full border-2 border-[#d4a843]/30 p-1 group-hover:border-[#d4a843] transition-all duration-700">
                                            <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center text-xl font-black italic text-[#d4a843]">
                                                AH
                                            </div>
                                        </div>
                                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#050505] animate-pulse shadow-[0_0_15px_#10b981]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">Aisha Al-Hashimi</h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mt-1">AI-Neuro Advisor</span>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-sm italic text-[13px] text-zinc-400 leading-relaxed mb-8 relative">
                                    <div className="absolute -top-3 left-6 px-2 bg-black text-[9px] font-black uppercase tracking-widest text-[#d4a843]">Intelligence Report</div>
                                    "This asset represents a unique 12.5% market inefficiency in {property.neighborhood}. My internal models predict a 24-month appreciation curve exceeding the 95th percentile."
                                </div>

                                <button
                                    onClick={() => {
                                        const chatBtn = document.querySelector('.chat-toggle') as HTMLButtonElement;
                                        if (chatBtn) chatBtn.click();
                                    }}
                                    className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-4 group"
                                >
                                    <Zap size={14} className="group-hover:animate-pulse" />
                                    Initiate Direct Uplink
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparative Analysis Section */}
                {similarProperties.length > 0 && (
                    <section className="mt-32 pt-24 border-t border-white/5">
                        <div className="flex flex-col items-center text-center gap-6 mb-20">
                            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                                Comparative <span className="text-[#d4a843]">Objectives</span>
                            </h2>
                            <p className="text-zinc-500 text-[11px] font-black tracking-[0.6em] uppercase flex items-center gap-4">
                                <Search size={12} className="text-zinc-700" />
                                Cross-Reference Data Protocols
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {similarProperties.map((p, i) => (
                                <PropertyCard key={p.id} property={p} index={i} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                propertyName={property.title}
            />

            <style jsx global>{`
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                .animate-scanline {
                    animation: scanline 12s linear infinite;
                }
                @keyframes ken-burns {
                    0% { transform: scale(1); filter: grayscale(0.2); }
                    100% { transform: scale(1.15); filter: grayscale(0); }
                }
                .animate-ken-burns {
                    animation: ken-burns 30s ease-in-out infinite alternate;
                }
                .mix-blend-difference {
                    mix-blend-mode: difference;
                }
            `}</style>
        </main>
    );
};

// Internal icon proxy for simplified dev loop
function MessageSquare({ size = 16, className = "" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}
