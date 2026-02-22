'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { X, ChevronDown, Anchor, Wind, Sailboat, Users, GraduationCap, Phone, School, Compass, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { apiUrl } from '@/lib/api';

interface NavDropdownItem {
    href: string;
    label: string;
    icon?: React.ReactNode;
}

interface NavItem {
    href: string;
    label: string;
    icon?: React.ReactNode;
    dropdown?: NavDropdownItem[];
}

export default function Navbar({ locale: propLocale }: { locale?: string }) {
    const t = useTranslations('nav');
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

    const locale = propLocale || (params.locale as string) || 'es';

    interface AuthUser {
        id: string;
        email?: string;
        rol?: string;
        status_socio?: string;
        [key: string]: unknown;
    }
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        (async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    const res = await fetch(apiUrl(`/api/profile?user_id=${authUser.id}`));
                    if (res.ok) {
                        const profile = await res.json();
                        setUser({ ...authUser, ...profile });
                    } else {
                        setUser(authUser as AuthUser);
                    }
                }
            } catch {
                // Silently handle auth errors
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        setIsMenuOpen(false);
        router.push(`/${locale}`);
    };

    const handleLanguageSwitch = (langCode: string) => {
        const pathWithoutLocale = pathname.replace(/^\/(es|eu|en|fr)/, '');
        router.push(`/${langCode}${pathWithoutLocale || '/'}`);
        setIsMenuOpen(false);
    };

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }, [isMenuOpen]);

    // Navigation structure
    const navItems: NavItem[] = [
        {
            href: 'courses',
            label: 'courses',
            icon: <GraduationCap className="w-3.5 h-3.5" />,
            dropdown: [
                { href: 'courses?cat=infantiles', label: 'kids', icon: <School className="w-4 h-4" /> },
                { href: 'courses?cat=adultos', label: 'adults', icon: <Users className="w-4 h-4" /> },
                { href: 'courses?cat=windsurf', label: 'windsurf_courses', icon: <Wind className="w-4 h-4" /> },
                { href: 'courses', label: 'all_courses', icon: <GraduationCap className="w-4 h-4" /> },
            ],
        },
        {
            href: 'rental',
            label: 'rental',
            icon: <Sailboat className="w-3.5 h-3.5" />,
            dropdown: [
                { href: 'rental?category=veleros', label: 'sailboats', icon: <Sailboat className="w-4 h-4" /> },
                { href: 'rental?category=windsurf', label: 'windsurf', icon: <Wind className="w-4 h-4" /> },
                { href: 'rental?category=kayak', label: 'kayak_paddle', icon: <Anchor className="w-4 h-4" /> },
                { href: 'rental', label: 'all_rentals', icon: <Sailboat className="w-4 h-4" /> },
            ],
        },
        {
            href: 'experiences',
            label: 'experiences',
            icon: <Compass className="w-3.5 h-3.5" />,
        },
        {
            href: 'academy',
            label: 'academy',
            icon: <GraduationCap className="w-3.5 h-3.5" />,
        },
        {
            href: 'about',
            label: 'about',
            icon: <Anchor className="w-3.5 h-3.5" />,
        },
        {
            href: 'contact',
            label: 'contact',
            icon: <Phone className="w-3.5 h-3.5" />,
        },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-[9999] px-4 md:px-12 py-2 md:py-3 flex justify-between items-center bg-nautical-deep/70 backdrop-blur-2xl border-b border-white/5 transition-all duration-500 hover:bg-nautical-deep/90 min-h-[70px]">
                {/* Logo Section */}
                <Link
                    href={`/${locale}`}
                    prefetch={false}
                    className="flex items-center gap-4 group transition-premium relative z-[110]"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 transition-premium group-hover:scale-110">
                        <Image
                            src="/images/LogoGetxoBelaEskola.webp"
                            alt="Getxo Bela Eskola"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display text-xl md:text-3xl tracking-tight text-white leading-none uppercase">
                            GETXO <span className="italic font-light text-accent">BELA</span>
                        </span>
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-white/40 font-bold mt-1.5 transition-premium group-hover:text-white/70">Escuela Náutica</span>
                    </div>
                </Link>

                {/* Desktop Menu - UI FIXED: CSS-only Hover for Reliability */}
                <div className="hidden xl:flex gap-8 items-center text-[10px] uppercase tracking-[0.4em] font-black h-full">
                    {navItems.map((item) => (
                        <div key={item.label} className="relative group/main h-full flex items-center">
                            <Link
                                href={`/${locale}/${item.href}`}
                                prefetch={false}
                                className="relative py-4 text-white/40 hover:text-white transition-premium group/nav flex items-center gap-1.5"
                            >
                                {item.icon}
                                {t(item.label)}
                                {item.dropdown && (
                                    <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover/main:rotate-180 group-hover/main:text-accent" />
                                )}
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-accent transition-premium group-hover/nav:w-full" />
                            </Link>

                            {/* Dropdown Panel - Always in DOM for reliability, visible on hover */}
                            {item.dropdown && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 pointer-events-none translate-y-2 group-hover/main:opacity-100 group-hover/main:pointer-events-auto group-hover/main:translate-y-0 transition-all duration-300 z-[10000]">
                                    <div className="w-56 py-3 bg-nautical-deep/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
                                        {/* Simple Arrow */}
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-nautical-deep/95 border-l border-t border-white/10 rotate-45" />

                                        {item.dropdown.map((sub) => (
                                            <Link
                                                key={sub.href}
                                                href={`/${locale}/${sub.href}`}
                                                prefetch={false}
                                                className="flex items-center gap-3 px-6 py-4 text-[10px] uppercase tracking-[0.25em] font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 group/sub"
                                            >
                                                <span className="text-accent/60 group-hover/sub:text-accent transition-colors">{sub.icon}</span>
                                                {t(sub.label)}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="flex gap-4 items-center relative z-[110]">
                    <div className="hidden xl:flex bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1.5 transition-premium hover:border-white/20">
                        {['es', 'eu', 'en', 'fr'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => handleLanguageSwitch(lang)}
                                className={`px-4 py-2 rounded-full text-[9px] uppercase tracking-widest font-black transition-premium ${locale === lang ? 'bg-accent text-nautical-black shadow-xl shadow-accent/20 scale-105' : 'text-white/40 hover:text-white'}`}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="hidden xl:block w-32 h-10 bg-white/5 animate-pulse rounded-full" />
                    ) : user ? (
                        <div className="hidden xl:flex gap-8 items-center">
                            {user.status_socio === 'activo' && (
                                <div className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 border border-brass-gold/30 shadow-[0_0_20px_rgba(197,160,89,0.15)] transition-premium hover:border-brass-gold/60 group/member">
                                    <Sparkles className="w-3.5 h-3.5 text-brass-gold transition-premium group-hover:rotate-45" />
                                    <span className="text-brass-gold text-[9px] font-black uppercase tracking-[0.3em]">
                                        MEMBER
                                    </span>
                                </div>
                            )}
                            <Link
                                href={user.rol === 'admin' || user.rol === 'instructor' ? `/${locale}/staff` : `/${locale}/student/dashboard`}
                                prefetch={false}
                                className="text-[10px] uppercase tracking-[0.3em] font-black text-accent border border-accent/20 px-6 py-3 rounded-full hover:bg-accent hover:text-nautical-black shadow-lg shadow-accent/5 transition-premium"
                            >
                                {user.rol === 'admin' || user.rol === 'instructor' ? t('admin_panel') : t('dashboard')}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-[9px] uppercase tracking-[0.4em] font-black text-white/30 hover:text-red-500 transition-premium border-b border-transparent hover:border-red-500/30 pb-1"
                            >
                                {t('logout')}
                            </button>
                        </div>
                    ) : (
                        <Link href={`/${locale}/auth/login`} prefetch={false} className="hidden xl:block text-[10px] uppercase tracking-[0.4em] font-black border border-white/20 px-8 py-3 rounded-full bg-white/5 hover:bg-white hover:text-nautical-black transition-premium">
                            {t('login')}
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                            setMobileExpanded(null);
                        }}
                        className="xl:hidden flex-shrink-0 w-14 h-14 flex items-center justify-center bg-accent text-nautical-black rounded-full shadow-2xl relative z-[10000] transition-premium hover:scale-110 active:scale-95 shadow-accent/30"
                    >
                        {isMenuOpen ? <X size={24} strokeWidth={3} /> : (
                            <div className="flex flex-col gap-1 w-6">
                                <span className="block w-full h-0.5 bg-nautical-black rounded-full" />
                                <span className="block w-3/4 h-0.5 bg-nautical-black rounded-full ml-auto" />
                                <span className="block w-full h-0.5 bg-nautical-black rounded-full" />
                            </div>
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-[90] bg-nautical-deep transition-all duration-700 xl:hidden ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}
            >
                <div className="absolute inset-0 bg-maps opacity-5 pointer-events-none" />
                <div className="flex flex-col h-full pt-32 pb-12 px-8 overflow-y-auto">
                    <div className="flex flex-col gap-4 mb-12">
                        {navItems.map((item, idx) => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between">
                                    <Link
                                        href={`/${locale}/${item.href}`}
                                        prefetch={false}
                                        className="group flex items-center gap-4 flex-1"
                                        style={{ transitionDelay: `${idx * 80}ms` }}
                                        onClick={() => { if (!item.dropdown) setIsMenuOpen(false); }}
                                    >
                                        <span className="text-accent/60">{item.icon}</span>
                                        <span className={`text-3xl font-display italic transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                                            {t(item.label)}
                                        </span>
                                    </Link>

                                    {item.dropdown && (
                                        <button
                                            onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                                            className="p-3 text-white/40 hover:text-accent transition-colors"
                                        >
                                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileExpanded === item.label ? 'rotate-180 text-accent' : ''}`} />
                                        </button>
                                    )}
                                </div>

                                {item.dropdown && mobileExpanded === item.label && (
                                    <div className="ml-10 mt-2 mb-4 flex flex-col gap-1 border-l-2 border-accent/20 pl-6 animate-in slide-in-from-top-2 duration-300">
                                        {item.dropdown.map((sub) => (
                                            <Link
                                                key={sub.href}
                                                href={`/${locale}/${sub.href}`}
                                                prefetch={false}
                                                className="flex items-center gap-3 py-3 text-lg text-white/50 hover:text-white transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <span className="text-accent/50">{sub.icon}</span>
                                                {t(sub.label)}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Mobile Language & Auth */}
                    <div className={`space-y-10 transition-all duration-700 delay-500 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        {user ? (
                            <div className="flex flex-col gap-4">
                                <Link
                                    href={user.rol === 'admin' || user.rol === 'instructor' ? `/${locale}/staff` : `/${locale}/student/dashboard`}
                                    prefetch={false}
                                    className="w-full text-center py-6 bg-accent text-nautical-black font-display italic text-2xl"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {user.rol === 'admin' || user.rol === 'instructor' ? t('admin_panel') : t('dashboard')}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-center py-4 text-white/40 uppercase text-[10px] tracking-[0.4em] font-black"
                                >
                                    {t('logout')}
                                </button>
                            </div>
                        ) : (
                            <Link
                                href={`/${locale}/auth/login`}
                                prefetch={false}
                                className="w-full block text-center py-6 border border-white/20 text-white font-display italic text-2xl bg-white/5"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('login')}
                            </Link>
                        )}

                        <div className="flex flex-col gap-4 pb-12">
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 ml-4">{t('language_selector')}</span>
                            <div className="grid grid-cols-4 gap-3 bg-white/5 border border-white/10 rounded-2xl p-2">
                                {['es', 'eu', 'en', 'fr'].map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => handleLanguageSwitch(lang)}
                                        className={`py-4 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${locale === lang ? 'bg-white text-nautical-black shadow-xl' : 'text-white/40'}`}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
