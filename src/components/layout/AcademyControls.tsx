'use client';

// usePathname import removed from here, integrated below
import { useState, useEffect } from 'react';
import { Maximize, Minimize, Globe, MoreHorizontal, Compass, LayoutDashboard, Book } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useAcademyMode } from '@/lib/store/useAcademyMode';

export default function AcademyControls() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentLocale = params.locale as string;

    const isExploration = pathname.includes('/exploration');

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleLanguageSwitch = (targetLocale: string) => {
        if (targetLocale === currentLocale) return;

        // Force cookie for middleware
        document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;

        // Build new path
        let path = window.location.pathname;
        if (path.startsWith(`/${currentLocale}`)) {
            path = path.replace(`/${currentLocale}`, `/${targetLocale}`);
        } else {
            path = `/${targetLocale}${path}`;
        }

        // Reload to apply
        window.location.assign(path);
    };

    return (
        <div className="fixed top-24 left-6 z-[100] flex flex-col items-start gap-4 pointer-events-none">
            {/* Menu Trigger */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 pointer-events-auto
                    ${menuOpen
                        ? 'bg-accent text-nautical-black rotate-90'
                        : 'bg-nautical-black/80 backdrop-blur border border-white/10 text-white hover:bg-white/10'
                    }
                `}
            >
                <MoreHorizontal className="w-6 h-6" />
            </button>

            {/* Main Toggle Button Content */}
            <div className={`flex flex-col gap-3 transition-all duration-300 origin-top pointer-events-auto ${menuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-90 pointer-events-none'}`}>
                {/* Language Switch */}
                <div className="bg-nautical-black/90 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex flex-col gap-1 shadow-2xl">
                    <button
                        onClick={() => handleLanguageSwitch('es')}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[8px] font-black transition-colors ${currentLocale === 'es' ? 'bg-accent text-nautical-black' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                    >
                        ES
                    </button>
                    <button
                        onClick={() => handleLanguageSwitch('eu')}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[8px] font-black transition-colors ${currentLocale === 'eu' ? 'bg-accent text-nautical-black' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                    >
                        EU
                    </button>
                </div>

                {/* Exploration / Dashboard Toggle */}
                <button
                    onClick={() => {
                        const newMode = isExploration ? 'structured' : 'exploration';
                        useAcademyMode.getState().setMode(newMode);
                        router.push(isExploration ? `/${currentLocale}/academy/dashboard` : `/${currentLocale}/academy/exploration`);
                    }}
                    className="w-12 h-12 bg-nautical-black/90 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-accent hover:border-accent/50 transition-all shadow-2xl group"
                    title={isExploration ? 'Volver al Panel' : 'Mapa de Constelaciones (Exploración)'}
                >
                    {isExploration ? <LayoutDashboard className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
                </button>

                {/* Go to Academy Principal Page */}
                <button
                    onClick={() => router.push(`/${currentLocale}/academy`)}
                    className="w-12 h-12 bg-nautical-black/90 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-accent hover:border-accent/50 transition-all shadow-2xl group"
                    title="Ir a la Academia Principal"
                >
                    <Globe className="w-5 h-5" />
                </button>

                {/* Logbook Toggle */}
                <button
                    onClick={() => router.push(`/${currentLocale}/academy/logbook`)}
                    className="w-12 h-12 bg-nautical-black/90 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-accent hover:border-accent/50 transition-all shadow-2xl group"
                    title="Cuaderno de Bitácora"
                >
                    < Book className="w-5 h-5" />
                </button>

                {/* Fullscreen Toggle */}
                <button
                    onClick={toggleFullscreen}
                    className="w-12 h-12 bg-nautical-black/90 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-accent hover:border-accent/50 transition-all shadow-2xl group"
                    title={isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}
                >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>

                {/* Exit to Main Website */}
                <button
                    onClick={() => router.push(`/${currentLocale}`)}
                    className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-accent hover:border-accent/50 transition-all shadow-2xl group"
                    title="Salir al Menú"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
