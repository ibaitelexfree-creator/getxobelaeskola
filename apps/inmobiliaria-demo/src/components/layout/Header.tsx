"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard, Shield, Search, Menu, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from '../ui/LanguageSelector';
import CurrencySelector from '../ui/CurrencySelector';

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
            router.push('/auth/login');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/realstate/auth/login';
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const res = await fetch('/realstate/api/user/role');
                const data = await res.json();
                setUser({ ...user, role: data.role });
            } else {
                setUser(null);
            }
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, [supabase]);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'
                }`}
        >
            {/* HUD Background Line */}
            <div className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />

            <div className={`absolute inset-0 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-2xl' : 'bg-transparent'
                }`} />

            <div className="max-w-[1600px] mx-auto px-6 relative flex items-center justify-between">
                {/* Brand / Logo */}
                <Link href="/" className="group relative z-10 flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a843] to-[#8a6d29] flex items-center justify-center text-[#0a0a0f] shadow-[0_0_20px_rgba(212,168,67,0.3)] group-hover:scale-110 transition-transform duration-500">
                            <Shield size={20} className="fill-current" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-white leading-none">
                            LUXE <span className="text-[#d4a843]">DUBAI</span>
                        </span>
                        <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-zinc-500 group-hover:text-[#d4a843] transition-colors">
                            Mission Control
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-10 bg-white/5 border border-white/5 rounded-full px-8 py-2.5 backdrop-blur-xl">
                    {[
                        { label: 'Properties', href: '/properties' },
                        { label: 'Neighborhoods', href: '/neighborhoods' },
                        { label: 'About', href: '/about' },
                        { label: 'Contact', href: '/contact' },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-[#d4a843] ${pathname === link.href ? 'text-[#d4a843]' : 'text-zinc-400'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Tactical Actions */}
                <div className="flex items-center gap-6 z-10">
                    <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-white/5 border border-white/5 rounded-full">
                        <LanguageSelector />
                        <div className="w-[1px] h-3 bg-white/10" />
                        <CurrencySelector />
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-3">
                                {user.role === 'admin' ? (
                                    <Link
                                        href="/admin"
                                        className="group flex items-center gap-2 px-5 py-2.5 bg-[#d4a843] text-[#0a0a0f] rounded-full font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_25px_rgba(212,168,67,0.4)] transition-all"
                                    >
                                        <Activity size={14} className="group-hover:animate-pulse" />
                                        <span>Command Center</span>
                                    </Link>
                                ) : (
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-3 pl-2 pr-6 py-1.5 bg-white/5 border border-white/10 rounded-full hover:border-[#d4a843]/30 transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#d4a843] flex items-center justify-center text-[#0a0a0f] text-xs font-black">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-[#d4a843] transition-colors">
                                            Operational HUD
                                        </span>
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 pl-4 pr-6 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                    title="Protocol Terminate"
                                >
                                    <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Terminate</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                href={`/auth/login?returnTo=${pathname}`}
                                className="group flex items-center gap-3 px-8 py-3 bg-white text-[#0a0a0f] rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#d4a843] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                            >
                                <span>Initiate Login</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#d4a843] group-hover:bg-white animate-pulse" />
                            </Link>
                        )}

                        <button
                            className="lg:hidden p-3 rounded-2xl bg-white/5 border border-white/10 text-white"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 z-[999] bg-[#0a0a0f] flex flex-col p-10 pt-32"
                    >
                        {/* Mobile Grid Pattern */}
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d4a843 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                        <nav className="flex flex-col gap-8 relative">
                            {[
                                { label: 'Explore Assets', href: '/properties' },
                                { label: 'Elite Areas', href: '/neighborhoods' },
                                { label: 'Intelligence', href: '/about' },
                                { label: 'Direct Link', href: '/contact' },
                            ].map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="text-4xl font-black uppercase tracking-tighter text-white hover:text-[#d4a843] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        <div className="mt-auto border-t border-white/5 pt-10 flex flex-col gap-6">
                            <div className="flex gap-4">
                                <LanguageSelector />
                                <CurrencySelector />
                            </div>
                            {user && (
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 text-red-500 font-black uppercase tracking-[0.3em] text-[10px]"
                                >
                                    <LogOut size={16} /> Protocol Terminate
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
