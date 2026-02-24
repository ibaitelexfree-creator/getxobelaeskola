import React from 'react';
import { Badge } from '@/hooks/useGamification';

interface BadgeCardProps {
    badge: Badge;
    locale: string;
}

export default function BadgeCard({ badge, locale }: BadgeCardProps) {
    const isUnlocked = badge.obtained;
    const name = locale === 'eu' ? badge.nombre_eu : badge.nombre_es;
    const description = locale === 'eu' ? badge.descripcion_eu : badge.descripcion_es;

    const rarityColors = {
        legendario: 'border-yellow-500 text-yellow-500 shadow-yellow-500/20',
        epico: 'border-purple-500 text-purple-500 shadow-purple-500/20',
        raro: 'border-blue-500 text-blue-500 shadow-blue-500/20',
        comun: 'border-white/20 text-white/40 shadow-white/5'
    };

    const borderColor = isUnlocked
        ? rarityColors[badge.rareza] || rarityColors.comun
        : 'border-white/10 text-white/20';

    return (
        <div
            className={`
                relative group
                flex flex-col items-center justify-center
                p-6 rounded-2xl border-2
                transition-all duration-300
                ${borderColor}
                ${isUnlocked ? 'bg-white/5 hover:bg-white/10' : 'bg-black/20 grayscale opacity-60'}
            `}
        >
            {/* Icon */}
            <div className={`
                w-20 h-20 rounded-full
                flex items-center justify-center
                text-4xl mb-4
                transition-transform duration-500 group-hover:scale-110
                ${isUnlocked ? 'bg-gradient-to-br from-white/10 to-transparent' : 'bg-white/5'}
            `}>
                {isUnlocked ? badge.icono : '🔒'}
            </div>

            {/* Content */}
            <div className="text-center space-y-2">
                <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-white/40'}`}>
                    {name}
                </h3>
                <p className="text-xs leading-relaxed text-white/50 line-clamp-2">
                    {description}
                </p>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/5 w-full flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                <span className={`px-2 py-1 rounded-full border ${isUnlocked ? borderColor.split(' ')[0] : 'border-white/10'}`}>
                    {badge.rareza}
                </span>
                <span className="text-accent/80">
                    {badge.puntos} PTS
                </span>
            </div>

            {/* Glow Effect on Hover (if unlocked) */}
            {isUnlocked && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}
        </div>
    );
}
