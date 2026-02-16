'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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
                getUserData(user);
            } catch (err) {
                console.error("Critical auth error:", err);
            }
        };
        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user: AuthUser | null } | null) => {
            getUserData(session?.user || null);
        });

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase.auth]);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await fetch(`/api/auth/logout?locale=${locale}`, { method: 'POST' });
        router.push(`/${locale}/auth/login`);
        router.refresh();
    };

    const handleLanguageSwitch = (targetLocale: string) => {
        // 1. Force Cookie for next-intl middleware
        document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;

        // 2. Build URL
        const segments = pathname.split('/');

        if (segments[1] === 'es' || segments[1] === 'eu') {
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
            <nav className="fixed top-0 left-0 w-full z-[9999] px-3 sm:px-4 md:px-6 py-3 md:py-6 xl:py-8 flex justify-between items-center bg-[#010409] backdrop-blur-md border-b border-white/5 min-h-[70px] md:min-h-[auto]">
                <Link
                    href={`/${locale}`}
                    className="flex items-center gap-2 md:gap-4 group transition-transform hover:scale-105 relative z-[110] max-w-[75%] sm:max-w-none"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div className="relative w-10 h-10 sm:w-16 sm:h-16 md:w-14 md:h-14 flex-shrink-0">
                        <Image
                            src="/images/LogoGetxoBelaEskola.png"
                            alt="Getxo Bela Eskola"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-display text-base sm:text-xl tracking-tight text-white leading-none truncate">
                            GETXO <span className="italic font-light text-accent">BELA</span>
                        </span>
                        <span className="text-[7px] sm:text-[10px] md:text-2xs uppercase tracking-[0.2em] sm:tracking-[0.4em] text-white/40 font-bold mt-1 truncate">Escuela Náutica</span>
                    </div>
                </Link>

                {/* Desktop Menu - Now visible from xl (1280px) */}
                <div className="hidden xl:flex gap-6 xxl:gap-12 text-sm uppercase tracking-[0.2em] font-semibold">
                    <Link href={`/${locale}/courses`} className="hover:text-accent transition-colors">{t('courses')}</Link>
                    <Link href={`/${locale}/academy`} className="hover:text-accent transition-colors">{t('academy')}</Link>
                    <Link href={`/${locale}/rental`} className="hover:text-accent transition-colors">{t('rental')}</Link>
                    <Link href={`/${locale}/about`} className="hover:text-accent transition-colors">{t('about')}</Link>
                    <Link href={`/${locale}/contact`} className="hover:text-accent transition-colors">{t('contact')}</Link>
                </div>


                <div className="flex gap-2 sm:gap-4 items-center relative z-[110] flex-shrink-0 ml-auto sm:ml-0">
                    {/* Language Selector - Desktop only from xl */}
                    <div className="hidden xl:flex bg-white/5 border border-white/10 rounded-full p-1 group/lang relative">
                        <button
                            onClick={() => handleLanguageSwitch('es')}
                            className={`px-3 py-1.5 rounded-full text-2xs uppercase tracking-widest font-black transition-all ${locale === 'es' ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white'}`}
                        >
                            ES
                        </button>
                        <button
                            onClick={() => handleLanguageSwitch('eu')}
                            className={`px-3 py-1.5 rounded-full text-2xs uppercase tracking-widest font-black transition-all ${locale === 'eu' ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white'}`}
                        >
                            EU
                        </button>

                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/lang:opacity-100 transition-all pointer-events-none">
                            <span className="text-2xs text-accent tracking-[0.3em] font-bold uppercase whitespace-nowrap">{t('language_selector')}</span>
                        </div>
                    </div>

                    {user ? (
                        <div className="hidden xl:flex gap-6 items-center">
                            {/* Member Badge - Desktop */}
                            {user.status_socio === 'activo' && (
                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-500 border border-yellow-200 shadow-[0_0_20px_rgba(252,211,77,0.6)] animate-pulse">
                                    <Sparkles className="w-3 h-3 text-yellow-800" />
                                    <span className="text-yellow-900 text-[10px] font-black uppercase tracking-[0.2em]">
                                        Miembro
                                    </span>
                                </div>
                            )}
                            <Link
                                href={user.rol === 'admin' || user.rol === 'instructor' ? `/${locale}/staff` : `/${locale}/student/dashboard`}
                                className="text-2xs uppercase tracking-[0.2em] font-black text-accent bg-accent/5 px-4 py-2 rounded-sm border border-accent/20 hover:bg-accent hover:text-nautical-black transition-all"
                            >
                                {user.rol === 'admin' || user.rol === 'instructor' ? t('admin_panel') : t('dashboard')}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-2xs uppercase tracking-[0.2em] font-black border-b border-white/20 pb-1 hover:text-red-500 hover:border-red-500 transition-all opacity-60 hover:opacity-100"
                            >
                                {t('logout')}
                            </button>
                        </div>
                    ) : (
                        <Link href={`/${locale}/auth/login`} className="hidden xl:block text-2xs uppercase tracking-[0.15em] font-black border border-white/10 px-6 py-2 rounded-sm hover:bg-white/5 transition-all">
                            {t('login')}
                        </Link>
                    )}

                    {/* Hamburger Button - Robustified */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="xl:hidden flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center gap-1.5 bg-accent border border-accent/20 rounded-sm text-nautical-black active:scale-90 shadow-2xl relative z-[10000] pointer-events-auto"
                        aria-label={isMenuOpen ? t('close') : t('menu')}
                    >
                        {isMenuOpen ? (
                            <X size={28} strokeWidth={3} />
                        ) : (
                            <div className="flex flex-col gap-1.5 w-7">
                                <span className="sr-only">{t('menu')}</span>
                                <span className="block w-full h-1 bg-nautical-black rounded-full" />
                                <span className="block w-full h-1 bg-nautical-black rounded-full" />
                                <span className="block w-full h-1 bg-nautical-black rounded-full" />
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
                <div className="flex flex-col h-full pt-32 pb-12 px-8">
                    {/* Navigation Links */}
                    <div className="flex flex-col gap-8 mb-auto">
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
                        {/* Auth Button Mobile */}
                        {user ? (
                            <div className="flex flex-col gap-4">
                                {/* Member Badge - Mobile */}
                                {user.status_socio === 'activo' && (
                                    <div className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-500 border border-yellow-200 shadow-[0_0_20px_rgba(252,211,77,0.4)] mb-2 animate-pulse">
                                        <Sparkles className="w-4 h-4 text-yellow-900" />
                                        <span className="text-yellow-900 text-xs font-black uppercase tracking-[0.3em]">
                                            Miembro Oficial
                                        </span>
                                    </div>
                                )}
                                <Link
                                    href={user.rol === 'admin' || user.rol === 'instructor' ? `/${locale}/staff` : `/${locale}/student/dashboard`}
                                    className="w-full text-center py-5 bg-accent text-nautical-black font-display italic text-xl shadow-xl shadow-accent/20"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {user.rol === 'admin' || user.rol === 'instructor' ? t('admin_panel') : t('dashboard')}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-center py-4 text-white/40 uppercase text-2xs tracking-[0.4em] font-black hover:text-red-500 transition-colors"
                                >
                                    {t('logout')}
                                </button>
                            </div>
                        ) : (
                            <Link
                                href={`/${locale}/auth/login`}
                                className="w-full block text-center py-5 border border-white/20 text-white font-display italic text-xl bg-white/5 active:bg-white/10 transition-all"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('login')}
                            </Link>
                        )}

                        {/* Language Selector Mobile */}
                        <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-full p-2">
                            <button
                                onClick={() => handleLanguageSwitch('es')}
                                className={`flex-1 py-3 rounded-full text-2xs uppercase tracking-[0.3em] font-black transition-all ${locale === 'es' ? 'bg-white text-nautical-black shadow-lg shadow-white/20' : 'text-white/40'}`}
                            >
                                Castellano
                            </button>
                            <button
                                onClick={() => handleLanguageSwitch('eu')}
                                className={`flex-1 py-3 rounded-full text-2xs uppercase tracking-[0.3em] font-black transition-all ${locale === 'eu' ? 'bg-white text-nautical-black shadow-lg shadow-white/20' : 'text-white/40'}`}
                            >
                                Euskara
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
