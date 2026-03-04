'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PROPERTIES } from '@/data/properties';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Magnetic } from '@/components/ui/Magnetic';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, RotateCcw, ShieldCheck, Database, LayoutGrid, Cpu, Activity, Target } from 'lucide-react';

function PropertiesContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get values from URL or defaults
    const query = searchParams.get('q') || '';
    const filterType = searchParams.get('type') || 'All';
    const filterNeighborhood = searchParams.get('neighborhood') || 'All';
    const filterBeds = searchParams.get('beds') || 'All';
    const sortBy = searchParams.get('sort') || 'Featured';

    const [searchInput, setSearchInput] = useState(query);

    // Sync search input with URL query param
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== query) {
                updateUrl({ q: searchInput });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput, query]);

    const updateUrl = (newParams: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === 'All' || value === '' || (key === 'beds' && value === 'All')) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const filteredProperties = useMemo(() => {
        let result = [...PROPERTIES];

        if (query) {
            const q = query.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.neighborhood.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.propertyType.toLowerCase().includes(q)
            );
        }

        if (filterType !== 'All') {
            result = result.filter(p => p.propertyType.toLowerCase() === filterType.toLowerCase());
        }

        if (filterNeighborhood !== 'All') {
            result = result.filter(p =>
                p.neighborhood === filterNeighborhood ||
                p.neighborhood.toLowerCase().replace(/\s+/g, '-') === filterNeighborhood.toLowerCase()
            );
        }

        if (filterBeds !== 'All') {
            const bedsNum = parseInt(filterBeds);
            result = result.filter(p => p.bedrooms === 0 ? bedsNum === 0 : p.bedrooms >= bedsNum);
        }

        if (sortBy === 'Price↑') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'Price↓') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'Newest') {
            result.sort((a, b) => b.yearBuilt - a.yearBuilt);
        }

        return result;
    }, [query, filterType, filterNeighborhood, filterBeds, sortBy]);

    const clearFilters = () => {
        setSearchInput('');
        router.replace(pathname, { scroll: false });
    };

    return (
        <div className="container" style={{ paddingTop: '10rem', paddingBottom: '10rem' }}>
            <div className="flex flex-col lg:grid lg:grid-cols-[360px_1fr] gap-12 lg:gap-20">
                {/* Tactical Refinement Module (Sidebar) */}
                <aside className="lg:sticky lg:top-[120px] h-fit">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative p-8 rounded-[2.5rem] bg-[#0a0a0f] border border-[#d4a843]/10 overflow-hidden group"
                    >
                        {/* HUD Corners */}
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#d4a843]/20 rounded-tl-[2.5rem]" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#d4a843]/20" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#d4a843]/20" />
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#d4a843]/20 rounded-br-[2.5rem]" />

                        {/* Top Metadata */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-emerald-500/80">Active Scan</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="w-1 h-3 bg-[#d4a843]/40 rounded-full" />
                                <span className="w-1 h-2 bg-[#d4a843]/20 rounded-full" />
                            </div>
                        </div>

                        <div className="mb-10">
                            <span className="text-[11px] font-black tracking-[0.3em] text-[#d4a843] uppercase mb-2 block opacity-60">Module: Filter</span>
                            <h3 className="text-3xl font-black tracking-tighter text-white">Target Criteria</h3>
                        </div>

                        <div className="space-y-8">
                            {/* Search Input HUD Style */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    <Search size={12} className="text-[#d4a843]" />
                                    Designation Query
                                </label>
                                <div className="relative group/input">
                                    <input
                                        type="text"
                                        placeholder="Target property name..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="w-full bg-black/40 border border-[#d4a843]/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#d4a843]/40 transition-all placeholder:text-zinc-600"
                                    />
                                    {searchInput && (
                                        <button
                                            onClick={() => setSearchInput('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4a843] hover:scale-110 transition-transform"
                                        >
                                            <RotateCcw size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Custom Selects with HUD Labels */}
                            {[
                                {
                                    label: 'Structural Type',
                                    icon: <LayoutGrid size={12} />,
                                    value: filterType,
                                    options: ['All', 'Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Duplex', 'Mansion', 'Sky Villa', 'Waterfront Mansion'],
                                    onChange: (v: string) => updateUrl({ type: v })
                                },
                                {
                                    label: 'Asset Location',
                                    icon: <ShieldCheck size={12} />,
                                    value: filterNeighborhood,
                                    options: ['All', ...NEIGHBORHOODS.map(n => n.name)],
                                    onChange: (v: string) => updateUrl({ neighborhood: v })
                                },
                                {
                                    label: 'Spatial Capacity',
                                    icon: <Cpu size={12} />,
                                    value: filterBeds,
                                    options: ['All', '0', '1', '2', '3', '4', '5'],
                                    labels: ['Any', 'Studio', '1+ Beds', '2+ Beds', '3+ Beds', '4+ Beds', '5+ Beds'],
                                    onChange: (v: string) => updateUrl({ beds: v })
                                },
                                {
                                    label: 'Valuation Stream',
                                    icon: <Activity size={12} />,
                                    value: sortBy,
                                    options: ['Featured', 'Price↑', 'Price↓', 'Newest'],
                                    labels: ['Priority Assets', 'Valuation: Lo-Hi', 'Valuation: Hi-Lo', 'Recent Decryption'],
                                    onChange: (v: string) => updateUrl({ sort: v })
                                }
                            ].map((filter, i) => (
                                <div key={i} className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        <span className="text-[#d4a843]">{filter.icon}</span>
                                        {filter.label}
                                    </label>
                                    <CustomSelect
                                        value={filter.value}
                                        options={filter.options}
                                        labels={filter.labels}
                                        onChange={filter.onChange}
                                        placeholder={`Target ${filter.label.toLowerCase()}...`}
                                    />
                                </div>
                            ))}

                            <div className="pt-6 border-t border-[#d4a843]/5">
                                <Magnetic>
                                    <button
                                        onClick={clearFilters}
                                        className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#d4a843] hover:text-white transition-colors flex items-center justify-center gap-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-[#d4a843]/10"
                                    >
                                        <RotateCcw size={12} />
                                        Protocol Reset
                                    </button>
                                </Magnetic>
                            </div>
                        </div>

                        {/* Background Data Stream Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4a843]/0 to-[#d4a843]/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,168,67,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
                    </motion.div>
                </aside>

                {/* Main Intel Stream (Grid) */}
                <main className="space-y-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-[#d4a843]/10"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-[1px] bg-[#d4a843]/40" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#d4a843]">Available Assets</span>
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white">Target Inventory</h1>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500">
                                <Database size={14} />
                                Decrypted: {filteredProperties.length} Records
                            </div>
                        </div>
                    </motion.div>

                    <AnimatePresence mode="popLayout">
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
                        >
                            {filteredProperties.length > 0 ? (
                                filteredProperties.map((p, i) => (
                                    <PropertyCard key={p.id} property={p} index={i} />
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full py-40 flex flex-col items-center gap-8 text-center"
                                >
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#d4a843]/30 flex items-center justify-center animate-spin-slow">
                                            <Target className="text-[#d4a843] opacity-30" size={40} />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ShieldCheck className="text-[#d4a843]" size={32} />
                                        </div>
                                    </div>
                                    <div className="space-y-4 max-w-lg">
                                        <h3 className="text-3xl font-black tracking-tighter text-white uppercase">No Sector Match</h3>
                                        <p className="text-zinc-500 text-sm leading-relaxed tracking-wide">
                                            The current refinement parameters exceed our ultra-prime encrypted database.
                                            Adjust your search query or reset protocols for full access.
                                        </p>
                                    </div>
                                    <Magnetic>
                                        <button
                                            onClick={clearFilters}
                                            className="px-12 py-5 bg-[#d4a843] text-[#0a0a0f] text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white transition-all shadow-[0_10px_30px_rgba(212,168,67,0.2)]"
                                        >
                                            Reset Full Scan
                                        </button>
                                    </Magnetic>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <div style={{ backgroundColor: '#050505', minHeight: '100vh' }}>
            <Suspense fallback={
                <div className="min-h-screen flex flex-col items-center justify-center gap-8">
                    <div className="w-16 h-16 border-t-2 border-[#d4a843] rounded-full animate-spin" />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#d4a843] animate-pulse">Initializing Data Stream...</span>
                </div>
            }>
                <PropertiesContent />
            </Suspense>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                .container {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 0 4rem;
                }
                @media (max-width: 1024px) {
                    .container {
                        padding: 0 2rem;
                    }
                }
            `}</style>
        </div>
    );
}
