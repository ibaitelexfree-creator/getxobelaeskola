'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
    X, ChevronDown, Anchor, Wind, Sailboat, Users, 
    GraduationCap, Phone, School, Compass, Sparkles,
    ShoppingBag, BookOpen, Heart, Briefcase, Clock, MapPin,
    Instagram, Facebook, Youtube, User as UserIcon, Search, ShoppingCart
} from 'lucide-react';
// Supabase dynamically imported below to avoid blocking main bundle
// Supabase dynamically imported below for logout action
import dynamic from 'next/dynamic';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { springPopup } from '@/lib/animations/variants';

const ThemeToggle = dynamic(() => import('@/components/shared/ThemeToggle'), { ssr: false });

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

interface AuthUser extends User {
    rol?: string;
    status_socio?: string;
    [key: string]: unknown;
}

// Localized labels to ensure reliability across locales
const localizedLabels: Record<string, Record<string, string>> = {
    home: { es: 'Inicio', eu: 'Hasiera', en: 'Home', fr: 'Accueil' },
    club: { es: 'Club', eu: 'Kluba', en: 'Club', fr: 'Club' },
    conocenos: { es: 'Conócenos', eu: 'Ezagutu gaitzazu', en: 'About us', fr: 'Qui sommes-nous' },
    club_de_socias: { es: 'Club de socias', eu: 'Bazkideen kluba', en: 'Members club', fr: 'Club des membres' },
    regatas: { es: 'Regatas', eu: 'Estropadak', en: 'Regattas', fr: 'Régates' },
    que_es_la_vela: { es: 'Qué es la vela', eu: 'Zer da bela', en: 'What is sailing', fr: 'Qu\'est-ce que la voile' },
    servicios: { es: 'Servicios', eu: 'Zerbitzuak', en: 'Services', fr: 'Services' },
    cursos: { es: 'Cursos', eu: 'Ikastaroak', en: 'Courses', fr: 'Cours' },
    equipos_de_entrenamiento: { es: 'Equipos de entrenamiento', eu: 'Entrenamendu taldeak', en: 'Training teams', fr: 'Équipes d\'entraînement' },
    udalekuak: { es: 'Udalekuak', eu: 'Udalekuak', en: 'Summer camps', fr: 'Camps d\'été' },
    centros_escolares_y_asociaciones: { es: 'Centros escolares y asociaciones', eu: 'Ikastetxeak eta elkarteak', en: 'Schools & associations', fr: 'Écoles & associations' },
    alquileres: { es: 'Alquileres', eu: 'Alokairuak', en: 'Rentals', fr: 'Locations' },
    team_building: { es: 'Team building', eu: 'Team building', en: 'Team building', fr: 'Team building' },
    celebra_aqui_tu_dia: { es: 'Celebra aquí tu día', eu: 'Ospatu hemen zure eguna', en: 'Celebrate your day here', fr: 'Célébrez votre journée ici' },
    guarda_tu_material_deportivo: { es: 'Guarda tu material deportivo', eu: 'Gorde zure kirol materiala', en: 'Store your sports gear', fr: 'Stockez votre matériel sportif' },
    tienda: { es: 'Tienda', eu: 'Denda', en: 'Shop', fr: 'Boutique' },
    blog: { es: 'Blog', eu: 'Bloga', en: 'Blog', fr: 'Blog' },
    noticias_y_eventos: { es: 'Noticias y eventos', eu: 'Albisteak eta gertaerak', en: 'News & events', fr: 'Actualités & événements' },
    aprendizaje: { es: 'Aprendizaje', eu: 'Ikaskuntza', en: 'Learning', fr: 'Apprentissage' },
    contacto: { es: 'Contacto', eu: 'Kontaktua', en: 'Contact', fr: 'Contact' },
    hazte_voluntaria: { es: 'Hazte voluntaria', eu: 'Egin zaitez boluntario', en: 'Become a volunteer', fr: 'Devenir bénévole' },
    trabaja_con_nosotras: { es: 'Trabaja con nosotras', eu: 'Lan egin gurekin', en: 'Work with us', fr: 'Travaillez avec nous' },
    horario_contacto_localizacion: { es: 'Horario, Contacto y Localización', eu: 'Ordutegia, Kontaktua eta Kokapena', en: 'Hours, Contact & Location', fr: 'Horaires, Contact & Localisation' },
    logout: { es: 'Cerrar Sesión', eu: 'Saioa itxi', en: 'Logout', fr: 'Déconnexion' },
    login: { es: 'Acceso', eu: 'Saioa hasi', en: 'Login', fr: 'Connexion' },
    acceso_socias: { es: 'Acceso Socias', eu: 'Bazkideen Sarbidea', en: 'Members Access', fr: 'Accès Membres' },
    admin_panel: { es: 'Panel de Control', eu: 'Kudeaketa panela', en: 'Admin Panel', fr: 'Panneau de gestion' },
    dashboard: { es: 'Mi Área', eu: 'Nire Eremua', en: 'My Area', fr: 'Mon Espace' },
    language_selector: { es: 'Cambiar Idioma', eu: 'Hizkuntza aldatu', en: 'Change Language', fr: 'Changer de langue' }
};

export default function Navbar({ locale: propLocale, initialUser = null }: { locale?: string, initialUser?: any }) {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    const locale = propLocale || (params.locale as string) || 'es';

    const isAcademy = pathname?.includes('/academy');
    const isAuth = pathname?.includes('/auth/');

    const [user, setUser] = useState<AuthUser | null>(initialUser);
    const [loading, setLoading] = useState(false); // Auth is already resolved from server

    const getLabel = (key: string) => {
        return localizedLabels[key]?.[locale] || key;
    };

    useEffect(() => {
        if (!loading) {
            (window as any).__navbarAuthLoaded = true;
            window.dispatchEvent(new Event('auth-loaded'));
        }
    }, [loading]);

    const handleLogout = async () => {
        try {
            const res = await fetch(`/api/auth/logout?locale=${locale}`, {
                method: 'POST',
            });
            if (res.ok) {
                setUser(null);
                setIsMenuOpen(false);
                router.push(`/${locale}`);
                router.refresh();
            }
        } catch (err) {
            console.error('Logout failed:', err);
        }
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
        if (!isLangDropdownOpen) return;

        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.lang-dropdown-container')) {
                setIsLangDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [isLangDropdownOpen]);

    useEffect(() => {
        if (!activeDropdown) return;

        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.nav-item-container')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [activeDropdown]);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }, [isMenuOpen]);

    const [isAtHero, setIsAtHero] = useState(true);
    const [isIntroActive, setIsIntroActive] = useState(true);

    useEffect(() => {
        const isHome = pathname === `/${locale}` || pathname === `/${locale}/` || pathname === '/';
        if (!isHome) {
            setIsAtHero(false);
            return;
        }

        const handleScroll = () => {
            setIsAtHero(window.scrollY < 200);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname, locale]);

    useEffect(() => {
        if (!loading) {
            const t = setTimeout(() => {
                setIsIntroActive(false);
            }, 800);
            return () => clearTimeout(t);
        }
    }, [loading]);

    if (isAcademy || isAuth) {
        return null;
    }

    const isAdmin = user?.rol === 'admin';

    // Restructured navigation tree according to requirements
    const navItems: NavItem[] = [
        {
            href: '',
            label: 'home',
            icon: <Compass className="w-3.5 h-3.5" />,
        },
        {
            href: 'club/conocenos',
            label: 'club',
            icon: <Anchor className="w-3.5 h-3.5" />,
            dropdown: [
                { href: 'club/conocenos', label: 'conocenos', icon: <Users className="w-4 h-4" /> },
                { href: 'club/socias', label: 'club_de_socias', icon: <Sparkles className="w-4 h-4" /> },
                { href: 'club/regatas', label: 'regatas', icon: <Sailboat className="w-4 h-4" /> },
                { href: 'club/que-es-la-vela', label: 'que_es_la_vela', icon: <Wind className="w-4 h-4" /> },
            ],
        },
        {
            href: 'servicios/cursos',
            label: 'servicios',
            icon: <GraduationCap className="w-3.5 h-3.5" />,
            dropdown: [
                { href: 'servicios/cursos', label: 'cursos', icon: <GraduationCap className="w-4 h-4" /> },
                { href: 'servicios/socias', label: 'club_de_socias', icon: <Sparkles className="w-4 h-4" /> },
                { href: 'servicios/equipos', label: 'equipos_de_entrenamiento', icon: <Users className="w-4 h-4" /> },
                { href: 'servicios/udalekuak', label: 'udalekuak', icon: <School className="w-4 h-4" /> },
                { href: 'servicios/centros-escolares', label: 'centros_escolares_y_asociaciones', icon: <Anchor className="w-4 h-4" /> },
                { href: 'servicios/alquileres', label: 'alquileres', icon: <Sailboat className="w-4 h-4" /> },
                { href: 'servicios/team-building', label: 'team_building', icon: <Compass className="w-4 h-4" /> },
                { href: 'servicios/cumpleanos', label: 'celebra_aqui_tu_dia', icon: <Sparkles className="w-4 h-4" /> },
                { href: 'servicios/material', label: 'guarda_tu_material_deportivo', icon: <Anchor className="w-4 h-4" /> },
                ...(isAdmin ? [{ href: 'servicios/tienda', label: 'tienda', icon: <ShoppingBag className="w-4 h-4" /> }] : []),
            ],
        },
        {
            href: 'blog/noticias',
            label: 'blog',
            icon: <BookOpen className="w-3.5 h-3.5" />,
            dropdown: [
                { href: 'blog/noticias', label: 'noticias_y_eventos', icon: <BookOpen className="w-4 h-4" /> },
                { href: 'blog/aprendizaje', label: 'aprendizaje', icon: <GraduationCap className="w-4 h-4" /> },
            ],
        },
        {
            href: 'contacto/localizacion',
            label: 'contacto',
            icon: <Phone className="w-3.5 h-3.5" />,
            dropdown: [
                { href: 'contacto/voluntaria', label: 'hazte_voluntaria', icon: <Heart className="w-4 h-4" /> },
                { href: 'contacto/trabaja-con-nosotras', label: 'trabaja_con_nosotras', icon: <Briefcase className="w-4 h-4" /> },
                { href: 'contacto/localizacion', label: 'horario_contacto_localizacion', icon: <Clock className="w-4 h-4" /> },
            ],
        },
        ...(isAdmin ? [{
            href: 'tienda',
            label: 'tienda',
            icon: <ShoppingBag className="w-3.5 h-3.5" />,
        }] : []),
    ];

    return (
        <>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1920px] z-[9999] flex flex-col">
                {/* Top Utility Bar */}
                <div className="w-full bg-neutral-950 text-neutral-400 text-[10px] font-semibold h-8 px-[clamp(1rem,4vw,3rem)] flex justify-between items-center border-b border-white/5 relative select-none">
                    {/* Left side: Social Links (in brand colors) */}
                    <div className="flex items-center gap-5">
                        <a href="https://wa.me/34634405624" target="_blank" rel="noopener noreferrer" className="inline-flex md:hidden text-[#25D366] hover:scale-110 active:scale-95 transition-all duration-200 drop-shadow-[0_0_8px_rgba(37,211,102,0.3)]" title="WhatsApp">
                            <Phone className="w-4.5 h-4.5" />
                        </a>
                        <a href="https://www.instagram.com/pakeabelaeskola/" target="_blank" rel="noopener noreferrer" className="text-[#ff5c97] hover:scale-110 active:scale-95 transition-all duration-200 drop-shadow-[0_0_8px_rgba(255,92,151,0.3)]" title="Instagram">
                            <Instagram className="w-4.5 h-4.5" />
                        </a>
                        <a href="https://www.facebook.com/Pakea.bela.eskola/" target="_blank" rel="noopener noreferrer" className="text-[#4895ff] hover:scale-110 active:scale-95 transition-all duration-200 drop-shadow-[0_0_8px_rgba(72,149,255,0.3)]" title="Facebook">
                            <Facebook className="w-4.5 h-4.5" />
                        </a>
                        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#ff3b30] hover:scale-110 active:scale-95 transition-all duration-200 drop-shadow-[0_0_8px_rgba(255,59,48,0.3)]" title="YouTube">
                            <Youtube className="w-4.5 h-4.5" />
                        </a>
                    </div>
 
                    {/* Right side: Language, Cart, Profile, Search (Lupa a la derecha del todo) */}
                    <div className="flex items-center gap-5">
                        {/* Language Selector Dropdown */}
                        <div 
                            className="relative lang-dropdown-container"
                            onMouseEnter={() => setIsLangDropdownOpen(true)}
                            onMouseLeave={() => setIsLangDropdownOpen(false)}
                            onBlur={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                    setIsLangDropdownOpen(false);
                                }
                            }}
                        >
                            <button 
                                type="button"
                                tabIndex={0}
                                className="cursor-pointer flex items-center gap-1.5 hover:text-white transition-colors py-1 text-xs font-bold bg-transparent border-none text-neutral-400 font-inherit outline-none focus:text-white focus:ring-1 focus:ring-accent rounded px-1"
                                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        setIsLangDropdownOpen(false);
                                    }
                                }}
                                aria-expanded={isLangDropdownOpen}
                                aria-haspopup="true"
                            >
                                <span>{locale.toUpperCase()}</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            <AnimatePresence>
                                {isLangDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full right-0 mt-1 bg-neutral-900 border border-white/10 rounded shadow-xl overflow-hidden py-1 w-20 z-[10001]"
                                    >
                                        {['es', 'eu', 'en', 'fr'].map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLanguageSwitch(lang);
                                                    setIsLangDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-[11px] font-black ${locale === lang ? 'text-accent' : 'text-neutral-400 hover:text-white'}`}
                                            >
                                                {lang.toUpperCase()}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
 
                        <span className="w-[1px] h-3 bg-white/10" />
 
                        {/* Shopping Cart */}
                        {isAdmin && (
                            <Link href={`/${locale}/tienda`} className="text-white hover:text-accent hover:scale-110 active:scale-95 transition-all duration-200 flex items-center drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" title="Cart">
                                <ShoppingCart className="w-4.5 h-4.5" />
                            </Link>
                        )}
 
                        {/* Profile / Login */}
                        <Link 
                            href={user ? (user.rol === 'admin' || user.rol === 'instructor' ? `/${locale}/staff` : `/${locale}/student/dashboard`) : `/${locale}/auth/login`} 
                            className="hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center"
                            title="Profile / Dashboard"
                        >
                            <UserIcon className="w-4.5 h-4.5" />
                        </Link>
 
                        {/* Search bar slide-out / Search icon (Far Right) */}
                        <div className="flex items-center relative">
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 140, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        className="overflow-hidden flex items-center mr-2"
                                    >
                                        <input
                                            type="text"
                                            placeholder={locale === 'eu' ? 'Bilatu...' : locale === 'en' ? 'Search...' : locale === 'fr' ? 'Rechercher...' : 'Buscar...'}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery)}`);
                                                }
                                            }}
                                            className="bg-neutral-950 border border-white/10 rounded px-2 py-0.5 text-[9px] text-white focus:outline-none focus:border-accent w-full normal-case"
                                            autoFocus
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <button 
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center"
                                title="Search"
                            >
                                <Search className="w-4.5 h-4.5" />
                            </button>
                        </div>
                    </div>
                </div>
 
                <nav className="w-full px-[clamp(1rem,4vw,3rem)] py-2 md:py-3 flex xl:grid xl:grid-cols-[1fr_auto_1fr] justify-between items-center bg-transparent transition-all duration-500 min-h-[60px]">
                {/* Logo Section */}
                <Link
                    href={`/${locale}`}
                    prefetch={false}
                    className="flex items-center group transition-premium relative z-[110] xl:justify-self-start"
                    onClick={() => setIsMenuOpen(false)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <motion.div
                        animate={{
                            y: isAtHero ? 21 : 6,
                            x: 0,
                            scale: 0.99,
                        }}
                        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                        className="relative w-28 h-10 md:w-36 md:h-12 flex-shrink-0 transition-premium group-hover:scale-105"
                    >
                        {/* Wrapper for subtle vertical floating animation - stopped and positioned 5px higher */}
                        <div
                            className="absolute inset-0 w-full h-full"
                            style={{ transform: 'translateY(-7px)' }}
                        >
                            <Image
                                src={isAtHero && isHovered ? "/images/Logo_Bela_horizontal_white_text.png" : "/images/Logo Bela horizontal SIN FONDO.png"}
                                alt="Getxo Bela Eskola"
                                fill
                                sizes="(max-width: 768px) 112px, 144px"
                                className="object-contain object-left relative z-10"
                                priority
                             />
                        </div>
                    </motion.div>
                </Link>
 
                {/* Desktop Menu - Custom Framer Motion dropdowns */}
                <div className="hidden xl:flex gap-8 items-center text-xs uppercase tracking-[0.25em] font-black h-full xl:justify-self-center">
                    {navItems.map((item) => (
                        <div 
                            key={item.label} 
                            className="relative h-full flex items-center nav-item-container"
                            onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                            onMouseLeave={() => setActiveDropdown(null)}
                            onBlur={(e) => {
                                if (item.dropdown && !e.currentTarget.contains(e.relatedTarget as Node)) {
                                    setActiveDropdown(null);
                                }
                            }}
                        >
                            {item.dropdown ? (
                                <button
                                    type="button"
                                    className={`relative py-2 transition-premium group/nav flex items-center gap-1.5 font-black text-black hover:text-accent border-none bg-transparent outline-none focus:ring-1 focus:ring-accent rounded px-1`}
                                    style={{ textShadow: '0.5px 0 0 currentColor, -0.5px 0 0 currentColor' }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveDropdown(activeDropdown === item.label ? null : item.label);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            setActiveDropdown(null);
                                        }
                                    }}
                                >
                                    {item.icon}
                                    {getLabel(item.label)}
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180 text-accent' : ''}`} />
                                    <span className="absolute bottom-0 left-0 w-0 h-px bg-accent transition-premium group-hover/nav:w-full" />
                                </button>
                            ) : (
                                <Link
                                    href={`/${locale}/${item.href}`}
                                    prefetch={false}
                                    className={`relative py-2 transition-premium group/nav flex items-center gap-1.5 font-black text-black hover:text-accent outline-none focus:ring-1 focus:ring-accent rounded px-1`}
                                    style={{ textShadow: '0.5px 0 0 currentColor, -0.5px 0 0 currentColor' }}
                                >
                                    {item.icon}
                                    {getLabel(item.label)}
                                    <span className="absolute bottom-0 left-0 w-0 h-px bg-accent transition-premium group-hover/nav:w-full" />
                                </Link>
                            )}
 
                            {/* Dropdown Panel with AnimatePresence */}
                            <AnimatePresence>
                                {item.dropdown && activeDropdown === item.label && (
                                    <motion.div 
                                        variants={springPopup}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        style={{ x: '-50%' }}
                                        className="absolute top-full left-1/2 pt-4 z-[10000]"
                                    >
                                        <div className="w-64 py-3 bg-white border border-sea-foam/10 rounded-xl shadow-2xl shadow-black/10 overflow-hidden">
                                            {/* Simple Arrow */}
                                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-sea-foam/10 rotate-45" />
 
                                            {item.dropdown.map((sub) => (
                                                <Link
                                                    key={sub.href}
                                                    href={`/${locale}/${sub.href}`}
                                                    prefetch={false}
                                                    className="flex items-center gap-3 px-6 py-4 text-[10px] uppercase tracking-[0.25em] font-bold text-sea-foam/75 hover:text-sea-foam hover:bg-sea-foam/5 transition-all duration-200 group/sub"
                                                >
                                                    <span className="text-sea-foam/75 group-hover/sub:text-sea-foam transition-colors">{sub.icon}</span>
                                                    {getLabel(sub.label)}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
 
                {/* Right Side Actions */}
                <div className="flex gap-4 items-center relative z-[110] xl:justify-self-end">


                    {loading ? (
                        <motion.div
                            layoutId="acceso-button-wrapper"
                            transition={{ type: 'spring', stiffness: 40, damping: 18 }}
                            className="hidden xl:block"
                            style={{ rotate: 0 }}
                        >
                            <Link 
                                href={`/${locale}/auth/login`} 
                                prefetch={false} 
                                className="bg-white hover:bg-neutral-200 text-black px-6 py-2 rounded-xl transition-premium flex items-center justify-center border border-white"
                            >
                                <div className="flex flex-col items-center justify-center leading-[0.85] text-[12px] font-black tracking-[0.08em] text-center uppercase">
                                    {(() => {
                                        const label = getLabel('acceso_socias');
                                        const parts = label.split(' ');
                                        if (parts.length >= 2) {
                                            return (
                                                <>
                                                    <span>{parts[0]}</span>
                                                    <span>{parts.slice(1).join(' ')}</span>
                                                </>
                                            );
                                        }
                                        return <span>{label}</span>;
                                    })()}
                                </div>
                            </Link>
                        </motion.div>
                    ) : user ? (
                        <div className="hidden xl:flex gap-8 items-center">
                            {user.status_socio === 'activo' && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sea-foam/5 border border-brass-gold/30 shadow-[0_0_10px_rgba(197,160,89,0.1)] transition-premium hover:border-brass-gold/60 group/member">
                                    <Sparkles className="w-3 h-3 text-brass-gold transition-premium group-hover:rotate-45" />
                                    <span className="text-brass-gold text-[8px] font-black uppercase tracking-[0.2em]">
                                        MEMBER
                                    </span>
                                </div>
                            )}
                            <Link
                                href={user.rol === 'admin' || user.rol === 'instructor' ? `/${locale}/staff` : `/${locale}/student/dashboard`}
                                prefetch={false}
                                className="text-[10px] uppercase tracking-[0.3em] font-black text-accent border border-accent/20 px-6 py-3 rounded-full hover:bg-accent hover:text-white shadow-lg shadow-accent/5 transition-premium"
                                style={{ textShadow: '0.5px 0 0 currentColor, -0.5px 0 0 currentColor' }}
                            >
                                {user.rol === 'admin' || user.rol === 'instructor' ? getLabel('admin_panel') : getLabel('dashboard')}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className={`text-xs uppercase tracking-[0.25em] font-black hover:text-red-500 transition-premium border-b border-transparent hover:border-red-500/30 pb-1 text-black`}
                                style={{ textShadow: '0.5px 0 0 currentColor, -0.5px 0 0 currentColor' }}
                            >
                                {getLabel('logout')}
                            </button>
                        </div>
                    ) : (
                        <motion.div
                            layoutId="acceso-button-wrapper"
                            transition={{ type: 'spring', stiffness: 40, damping: 18 }}
                            className="hidden xl:block"
                            style={{ rotate: 0 }}
                        >
                            <Link 
                                href={`/${locale}/auth/login`} 
                                prefetch={false} 
                                className="bg-white hover:bg-neutral-200 text-black px-6 py-2 rounded-xl transition-premium flex items-center justify-center border border-white"
                            >
                                <div className="flex flex-col items-center justify-center leading-[0.85] text-[12px] font-black tracking-[0.08em] text-center uppercase">
                                    {(() => {
                                        const label = getLabel('acceso_socias');
                                        const parts = label.split(' ');
                                        if (parts.length >= 2) {
                                            return (
                                                <>
                                                    <span>{parts[0]}</span>
                                                    <span>{parts.slice(1).join(' ')}</span>
                                                </>
                                            );
                                        }
                                        return <span>{label}</span>;
                                    })()}
                                </div>
                            </Link>
                        </motion.div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                            setMobileExpanded(null);
                        }}
                        className="xl:hidden flex-shrink-0 w-14 h-14 flex items-center justify-center bg-accent text-white rounded-full shadow-2xl relative z-[10000] transition-premium hover:scale-110 active:scale-95 shadow-accent/30"
                        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                    >
                        {isMenuOpen ? <X size={24} strokeWidth={3} /> : (
                            <div className="flex flex-col gap-1 w-6">
                                <span className="block w-full h-0.5 bg-white rounded-full" />
                                <span className="block w-3/4 h-0.5 bg-white rounded-full ml-auto" />
                                <span className="block w-full h-0.5 bg-white rounded-full" />
                            </div>
                        )}
                    </button>
                </div>
            </nav>
        </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-[90] bg-nautical-deep transition-all duration-700 xl:hidden ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}
            >
                <div className="absolute inset-0 bg-maps opacity-5 pointer-events-none" />
                <div className="flex flex-col h-full pt-24 sm:pt-32 pb-12 px-4 sm:px-8 max-w-lg mx-auto w-full overflow-y-auto">
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
                                        <span className="text-sea-foam">{item.icon}</span>
                                        <span className={`text-3xl font-display italic text-sea-foam transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                                            {getLabel(item.label)}
                                        </span>
                                    </Link>

                                    {item.dropdown && (
                                        <button
                                            onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                                            className="p-3 text-sea-foam/40 hover:text-accent transition-colors"
                                            aria-label={mobileExpanded === item.label ? `Contraer submenú de ${getLabel(item.label)}` : `Expandir submenú de ${getLabel(item.label)}`}
                                        >
                                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileExpanded === item.label ? 'rotate-180 text-accent' : ''}`} />
                                        </button>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {item.dropdown && mobileExpanded === item.label && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                                            className="ml-10 mt-2 mb-4 flex flex-col gap-1 border-l-2 border-accent/20 pl-6 overflow-hidden"
                                        >
                                            {item.dropdown.map((sub) => (
                                                <Link
                                                    key={sub.href}
                                                    href={`/${locale}/${sub.href}`}
                                                    prefetch={false}
                                                    className="flex items-center gap-3 py-3 text-lg text-sea-foam/50 hover:text-sea-foam transition-colors"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <span className="text-sea-foam/50">{sub.icon}</span>
                                                    {getLabel(sub.label)}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                                    className="w-full text-center py-6 bg-accent text-white font-display italic text-2xl"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {user.rol === 'admin' || user.rol === 'instructor' ? getLabel('admin_panel') : getLabel('dashboard')}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-center py-4 text-sea-foam/40 uppercase text-[10px] tracking-[0.4em] font-black"
                                >
                                    {getLabel('logout')}
                                </button>
                            </div>
                        ) : (
                            <Link
                                href={`/${locale}/auth/login`}
                                prefetch={false}
                                className="w-full block text-center py-6 border border-sea-foam/20 text-sea-foam font-display italic text-2xl bg-sea-foam/5"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {getLabel('login')}
                            </Link>
                        )}

                        <div className="flex flex-col gap-4 pb-12">
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-sea-foam/30 ml-4">{getLabel('language_selector')}</span>
                            <div className="grid grid-cols-4 gap-3 bg-sea-foam/5 border border-sea-foam/10 rounded-2xl p-2">
                                {['es', 'eu', 'en', 'fr'].map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => handleLanguageSwitch(lang)}
                                        className={`py-4 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${locale === lang ? 'bg-sea-foam text-nautical-black shadow-xl' : 'text-sea-foam/40'}`}
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


