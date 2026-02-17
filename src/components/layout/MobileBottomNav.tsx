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
        <nav className="fixed bottom-0 left-0 right-0 z-[200] bg-nautical-black/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={`/${locale}${item.path}`}
                            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-all duration-200 ${active
                                    ? 'text-accent'
                                    : 'text-white/40 active:text-white/70'
                                }`}
                        >
                            <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                                {item.icon}
                            </div>
                            <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-accent' : 'text-white/40'
                                }`}>
                                {locale === 'eu' ? item.labelEu : item.label}
                            </span>
                            {active && (
                                <div className="absolute bottom-0 w-8 h-0.5 bg-accent rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
