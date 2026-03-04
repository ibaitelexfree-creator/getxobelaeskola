import React from 'react';
import Link from 'next/link';
import { Shield, ChevronRight, Globe, Lock, Info } from 'lucide-react';

export function Footer() {
    return (
        <footer className="relative bg-[#050505] border-t border-white/5 pt-24 pb-12 overflow-hidden">
            {/* Tactical Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(212,168,67,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="max-w-[1600px] mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
                    {/* Brand Intelligence */}
                    <div className="lg:col-span-5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-[#d4a843]/20 flex items-center justify-center text-[#d4a843]">
                                <Shield size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black tracking-tighter text-white">LUXE <span className="text-[#d4a843]">DUBAI</span></span>
                                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[#d4a843]/60">Elite Asset Management</span>
                            </div>
                        </div>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-sm mb-10 font-medium">
                            The definitive collection of ultra-luxury real estate in Dubai. Penthouses, villas, and exclusive investments curated for the global elite.
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase font-bold text-emerald-500/80 tracking-widest">Global Node Active: DB-1</span>
                        </div>
                    </div>

                    {/* Navigation Clusters */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-12">
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-white/40 mb-8 block">Refinement</span>
                            <ul className="space-y-4">
                                {['Properties', 'Neighborhoods', 'Investment', 'About'].map(link => (
                                    <li key={link}>
                                        <Link href={`/${link.toLowerCase()}`} className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
                                            <ChevronRight size={14} className="text-[#d4a843] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            <span className="text-xs font-bold uppercase tracking-widest leading-none">{link}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-white/40 mb-8 block">Protocol</span>
                            <ul className="space-y-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                <li className="flex items-center gap-3"><Globe size={14} className="text-[#d4a843]" /> Global Relay</li>
                                <li className="flex items-center gap-3"><Lock size={14} className="text-[#d4a843]" /> Secure Link</li>
                                <li className="flex items-center gap-3"><Info size={14} className="text-[#d4a843]" /> Information</li>
                            </ul>
                        </div>

                        <div>
                            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-white/40 mb-8 block">HQ Location</span>
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-white uppercase tracking-widest leading-relaxed">
                                    Boulevard Plaza Tower 1<br />
                                    Downtown Dubai, UAE
                                </p>
                                <div className="pt-4 flex flex-col gap-2">
                                    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Support Line</span>
                                    <span className="text-xs font-bold text-[#d4a843] tracking-widest">+971 4 123 4567</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} LUXE DUBAI ESTATES. ALL RIGHTS RESERVED.
                        </span>
                        <div className="flex items-center gap-6">
                            <Link href="#" className="text-[10px] font-black text-zinc-500 hover:text-[#d4a843] transition-colors uppercase tracking-widest">Privacy Policy</Link>
                            <Link href="#" className="text-[10px] font-black text-zinc-500 hover:text-[#d4a843] transition-colors uppercase tracking-widest">Terms of Service</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-4 py-2 bg-white/5 border border-white/5 rounded-full">
                        <span className="text-[8px] font-black text-[#d4a843] uppercase tracking-widest">Encrypted Session</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-1 h-3 bg-[#d4a843]/40 rounded-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
