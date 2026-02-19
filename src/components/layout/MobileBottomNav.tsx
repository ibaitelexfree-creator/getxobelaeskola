'use client';

import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { Home, BookOpen, Sailboat, GraduationCap, User } from 'lucide-react';

interface NavItem {
    label: string;
    labelEu: string;
    icon: React.ReactNode;
    path: string;
}

const navItems: NavItem[] = [
    { label: 'Inicio', labelEu: 'Hasiera', icon: <Home className="w-5 h-5" />, path: '/student/dashboard' },
    { label: 'Cursos', labelEu: 'Ikastaroak', icon: <BookOpen className="w-5 h-5" />, path: '/student/courses' },
    { label: 'Alquiler', labelEu: 'Alokairua', icon: <Sailboat className="w-5 h-5" />, path: '/student/rentals' },
    { label: 'Academia', labelEu: 'Akademia', icon: <GraduationCap className="w-5 h-5" />, path: '/academy' },
    { label: 'Perfil', labelEu: 'Profila', icon: <User className="w-5 h-5" />, path: '/student/profile' },
];

export default function MobileBottomNav() {
    const pathname = usePathname();
    const params = useParams();
    const locale = (params.locale as string) || 'es';

    const isActive = (itemPath: string) => {
        const fullPath = `/${locale}${itemPath}`;
        if (itemPath === '/student/dashboard') {
            return pathname === fullPath || pathname === `/${locale}`;
        }
        return pathname.startsWith(fullPath);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[200] bg-nautical-deep/80 backdrop-blur-2xl border-t border-white/5 safe-area-bottom pb-safe transition-all duration-500 hover:bg-nautical-deep/90">
            <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-4 relative">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={`/${locale}${item.path}`}
                            prefetch={false}
                            className={`flex flex-col items-center justify-center gap-1.5 flex-1 relative transition-premium ${active
                                ? 'text-accent'
                                : 'text-white/30 active:scale-90'
                                }`}
                        >
                            <div className={`transition-premium ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,77,0,0.3)]' : 'group-hover:text-white/60'}`}>
                                {item.icon}
                            </div>
                            <span className={`text-[9px] uppercase tracking-[0.2em] font-black transition-premium ${active ? 'text-accent' : 'text-white/20'
                                }`}>
                                {locale === 'eu' ? item.labelEu : item.label}
                            </span>

                            {/* Active Indicator Glow */}
                            {active && (
                                <div className="absolute -bottom-4 w-12 h-1 bg-accent rounded-full shadow-[0_-4px_12px_rgba(255,77,0,0.5)] animate-fade-in" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
