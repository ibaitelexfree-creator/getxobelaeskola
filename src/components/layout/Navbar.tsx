'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { apiUrl } from '@/lib/api';


export default function Navbar({ locale: propLocale }: { locale?: string }) {
    const t = useTranslations('nav');
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const supabase = createClient();

    useEffect(() => {
        const getUserData = async (authUser: AuthUser | null) => {
            if (!authUser) {
                setUser(null);
                return;
            }
            try {
                const { data: profile } = await supabase.from('profiles').select('rol, status_socio').eq('id', authUser.id).single();
                setUser({ ...authUser, rol: profile?.rol, status_socio: profile?.status_socio });
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setUser(authUser); // Set user even if profile fetch fails
            }
        };

        const init = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error && !error.message.includes('Auth session missing')) {
                    console.error("Auth init error:", error.message);
                }
                await getUserData(user);
            } catch (err) {
                console.error("Critical auth error:", err);
            } finally {
                setLoading(false);
            }
        };
        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
            getUserData(session?.user || null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase.auth]);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await fetch(apiUrl(`/api/auth/logout?locale=${locale}`), { method: 'POST' });
        router.push(`/${locale}/auth/login`);
        router.refresh();
    };

    const handleLanguageSwitch = (targetLocale: string) => {
        // 1. Force Cookie for next-intl middleware
        document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;

        // 2. Build URL
        const segments = pathname.split('/');

        const supportedLocales = ['es', 'eu', 'en'];
        if (supportedLocales.includes(segments[1])) {
            segments[1] = targetLocale;
        } else {
            segments.splice(1, 0, targetLocale);
        }

        const newPath = segments.join('/') || '/';
        const search = window.location.search;

        // 3. NUCLEAR RELOAD
        window.location.assign(newPath + search);
    };

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Prevent scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);


    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-[9999] px-4 md:px-12 py-4 md:py-8 flex justify-between items-center bg-nautical-deep/70 backdrop-blur-2xl border-b border-white/5 transition-all duration-500 hover:bg-nautical-deep/90 min-h-[70px]">
                <Link
                    href={`/${locale}`}
                    prefetch={false}
                    className="flex items-center gap-4 group transition-premium relative z-[110]"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div className="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0 transition-premium group-hover:scale-110">
                        <Image
                            src="/images/LogoGetxoBelaEskola.webp"
                            alt="Getxo Bela Eskola"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display text-lg md:text-2xl tracking-tight text-white leading-none uppercase">
                            GETXO <span className="italic font-light text-accent">BELA</span>
                        </span>
                        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold mt-1.5 transition-premium group-hover:text-white/70">Escuela Náutica</span>
                    </div>
                </Link>

                {/* Desktop Menu - Premium Spacing & Typography */}
                <div className="hidden xl:flex gap-12 items-center text-[10px] uppercase tracking-[0.4em] font-black">
                    {[
                        { href: 'courses', label: 'courses' },
                        { href: 'academy', label: 'academy' },
                        { href: 'rental', label: 'rental' },
                        { href: 'about', label: 'about' },
                        { href: 'contact', label: 'contact' }
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={`/${locale}/${link.href}`}
                            prefetch={false}
                            className={`relative py-2 text-white/40 hover:text-white transition-premium group/nav`}
                        >
                            {t(link.label)}
                            <span className="absolute bottom-0 left-0 w-0 h-px bg-accent transition-premium group-hover/nav:w-full" />
                        </Link>
                    ))}
                </div>


                <div className="flex gap-4 items-center relative z-[110]">
                    {/* Language Selector - Premium Glassmorphism */}
                    <div className="hidden xl:flex bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1.5 transition-premium hover:border-white/20">
                        {[
                            { code: 'es', label: 'ES' },
                            { code: 'eu', label: 'EU' },
                            { code: 'en', label: 'EN' }
                        ].map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageSwitch(lang.code)}
                                className={`px-4 py-2 rounded-full text-[9px] uppercase tracking-widest font-black transition-premium ${locale === lang.code ? 'bg-accent text-nautical-black shadow-xl shadow-accent/20 scale-105' : 'text-white/40 hover:text-white'}`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="hidden xl:block w-32 h-10 bg-white/5 animate-pulse rounded-full" />
                    ) : user ? (
                        <div className="hidden xl:flex gap-8 items-center">
                            {/* Member Badge - More Subtle & Elegant */}
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

                    {/* Hamburger Button - Enhanced for Premium Look */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="xl:hidden flex-shrink-0 w-14 h-14 flex items-center justify-center bg-accent text-nautical-black rounded-full shadow-2xl relative z-[10000] transition-premium hover:scale-110 active:scale-95 shadow-accent/30"
                        aria-pressed={isMenuOpen}
                    >
                        <span className="sr-only">{isMenuOpen ? t('close') : t('menu')}</span>
                        {isMenuOpen ? (
                            <X size={24} strokeWidth={3} />
                        ) : (
                            <div className="flex flex-col gap-1 w-6">
                                <span className="block w-full h-0.5 bg-nautical-black rounded-full" />
                                <span className="block w-3/4 h-0.5 bg-nautical-black rounded-full ml-auto" />
                                <span className="block w-full h-0.5 bg-nautical-black rounded-full" />
                            </div>
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay - Visible up to xl */}
            <div
                className={`fixed inset-0 z-[90] bg-nautical-deep transition-all duration-700 xl:hidden ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}
            >
                <div className="absolute inset-0 bg-maps opacity-5 pointer-events-none" />
                <div className="flex flex-col h-full pt-32 pb-12 px-8 overflow-y-auto">
                    {/* Navigation Links */}
                    <div className="flex flex-col gap-8 mb-12">
                        {[
                            { href: 'courses', label: 'courses' },
                            { href: 'academy', label: 'academy' },
                            { href: 'rental', label: 'rental' },
                            { href: 'about', label: 'about' },
                            { href: 'contact', label: 'contact' }
                        ].map((link, idx) => (
                            <Link
                                key={link.href}
                                href={`/${locale}/${link.href}`}
                                prefetch={false}
                                className="group flex items-center justify-between"
                                style={{ transitionDelay: `${idx * 100}ms` }}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className={`text-4xl font-display italic transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                                    {t(link.label)}
                                </span>
                                <ChevronRight className={`text-accent opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0`} />
                            </Link>
                        ))}
                    </div>

                    {/* Bottom Actions */}
                    <div className={`space-y-10 transition-all duration-700 delay-500 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        {loading ? (
                            <div className="w-full h-16 bg-white/5 animate-pulse rounded" />
                        ) : user ? (
                            <div className="flex flex-col gap-4">
                                {/* Member Badge - Mobile */}
                                {user.status_socio === 'activo' && (
                                    <div className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded bg-white/5 border border-brass-gold/20 mb-2">
                                        <Sparkles className="w-4 h-4 text-brass-gold" />
                                        <span className="text-brass-gold text-xs font-black uppercase tracking-[0.3em]">
                                            Miembro Oficial
                                        </span>
                                    </div>
                                )}
                                <Link
                                    href={user.rol === 'admin' || user.rol === 'instructor' ? `/${locale}/staff` : `/${locale}/student/dashboard`}
                                    prefetch={false}
                                    className="w-full text-center py-6 bg-accent text-nautical-black font-display italic text-2xl shadow-xl shadow-accent/20"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {user.rol === 'admin' || user.rol === 'instructor' ? t('admin_panel') : t('dashboard')}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-center py-4 text-white/40 uppercase text-[10px] tracking-[0.4em] font-black hover:text-red-500 transition-colors"
                                >
                                    {t('logout')}
                                </button>
                            </div>
                        ) : (
                            <Link
                                href={`/${locale}/auth/login`}
                                prefetch={false}
                                className="w-full block text-center py-6 border border-white/20 text-white font-display italic text-2xl bg-white/5 active:bg-white/10 transition-all"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('login')}
                            </Link>
                        )}

                        {/* Language Selector Mobile */}
                        <div className="flex flex-col gap-4 pb-12">
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 ml-4">{t('language_selector')}</span>
                            <div className="grid grid-cols-3 gap-3 bg-white/5 border border-white/10 rounded-2xl p-2">
                                {[
                                    { code: 'es', label: 'Castellano' },
                                    { code: 'eu', label: 'Euskara' },
                                    { code: 'en', label: 'English' }
                                ].map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageSwitch(lang.code)}
                                        className={`py-4 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all duration-300 ${locale === lang.code ? 'bg-white text-nautical-black shadow-xl shadow-white/10' : 'text-white/40'}`}
                                    >
                                        {lang.label.substring(0, 3)}
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
