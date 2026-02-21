import { Book, Anchor, Award, Globe } from 'lucide-react';

interface PublicStatsGridProps {
    stats: {
        modulesCompleted: number;
        coursesCompleted: number;
        totalHours: number;
        totalMiles: string;
    };
}

export default function PublicStatsGrid({ stats }: PublicStatsGridProps) {
    const statItems = [
        { label: 'Módulos', value: stats.modulesCompleted, icon: <Book size={20} />, color: 'text-blue-400' },
        { label: 'Cursos', value: stats.coursesCompleted, icon: <Award size={20} />, color: 'text-purple-400' },
        { label: 'Horas Navegadas', value: stats.totalHours.toFixed(0), icon: <Anchor size={20} />, color: 'text-amber-400' },
        { label: 'Millas (aprox)', value: stats.totalMiles, icon: <Globe size={20} />, color: 'text-emerald-400' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {statItems.map((item, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                    <div className={`mb-3 ${item.color} bg-white/5 p-3 rounded-full`}>
                        {item.icon}
                    </div>
                    <div className="text-3xl font-bold text-white mb-1 font-display">{item.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40">{item.label}</div>
                </div>
            ))}
        </div>
    );
}
