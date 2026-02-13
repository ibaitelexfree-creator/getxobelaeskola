export type Rank = {
    id: string;
    name: string;
    minXP: number;
    icon: string;
    description: string;
    color: string;
};

export const RANKS: Rank[] = [
    {
        id: 'grumete',
        name: 'Grumete',
        minXP: 0,
        icon: '/images/rank-badge-grumete.png', // Or emoji if image missing
        description: 'Recién llegado a la cubierta. Tu viaje apenas comienza.',
        color: 'text-stone-400'
    },
    {
        id: 'marinero',
        name: 'Marinero',
        minXP: 200,
        icon: '⛵',
        description: 'Ya conoces los cabos y el viento. Eres parte de la tripulación.',
        color: 'text-green-400'
    },
    {
        id: 'timonel',
        name: 'Timonel',
        minXP: 800,
        icon: '舵',
        description: 'Al mando del timón. Sabes mantener el rumbo.',
        color: 'text-blue-400'
    },
    {
        id: 'patron',
        name: 'Patrón',
        minXP: 2000,
        icon: '⚓',
        description: 'Responsable de la embarcación y la seguridad.',
        color: 'text-purple-400'
    },
    {
        id: 'capitan',
        name: 'Capitán',
        minXP: 5000,
        icon: '⭐',
        description: 'Maestro de los siete mares. La excelencia es tu brújula.',
        color: 'text-yellow-400'
    }
];

export function getRank(xp: number): Rank {
    // Find the highest rank with minXP <= xp
    return [...RANKS].reverse().find(r => r.minXP <= xp) || RANKS[0];
}

export function getNextRank(currentRankId: string): Rank | null {
    const currentIndex = RANKS.findIndex(r => r.id === currentRankId);
    if (currentIndex === -1 || currentIndex === RANKS.length - 1) return null;
    return RANKS[currentIndex + 1];
}

export function calculateEstimatedXP(progress: any[], achievements: any[]): number {
    let xp = 0;

    // XP from progress
    if (progress) {
        progress.forEach(p => {
            if (p.estado === 'completado') {
                switch (p.tipo_entidad) {
                    case 'unidad': xp += 10; break;
                    case 'modulo': xp += 50; break;
                    case 'curso': xp += 200; break;
                    case 'nivel': xp += 500; break;
                }
            }
        });
    }

    // XP from achievements (assuming fixed 50 if points not available)
    if (achievements) {
        achievements.forEach(a => {
            // If achievement object has points, use it, otherwise default
            const points = a.logro?.puntos || 50;
            xp += points;
        });
    }

    return xp;
}
