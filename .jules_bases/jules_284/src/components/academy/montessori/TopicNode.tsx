import React from 'react';
import { MontessoriNode, UserProgress } from '@/lib/academy/montessori/types';
import { Lock, Check, Star, PlayCircle, Trophy } from 'lucide-react';

interface TopicNodeProps {
    node: MontessoriNode;
    progress: UserProgress;
    isRecommended: boolean;
    onClick: (node: MontessoriNode) => void;
}

export default function TopicNode({ node, progress, isRecommended, onClick }: TopicNodeProps) {
    const status = progress?.status || 'locked';
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';
    const isAvailable = status === 'available' || status === 'in_progress';

    // Base styles
    let bgClass = 'bg-white/5 border-white/10 text-white/40';
    let icon = <Lock className="w-5 h-5 opacity-50" />;

    if (isCompleted) {
        bgClass = 'bg-green-500/20 border-green-500 text-green-400';
        icon = <Check className="w-5 h-5" />;
    } else if (isAvailable) {
        bgClass = 'bg-blue-600/20 border-blue-400 text-blue-300 hover:bg-blue-600/30 cursor-pointer';
        icon = <PlayCircle className="w-5 h-5" />;
    }

    if (isRecommended) {
        bgClass = 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse-slow cursor-pointer';
        icon = <Star className="w-5 h-5 fill-current" />;
    }

    // Hexagon-ish styling via CSS clip-path or just rounded?
    // Let's stick to rounded-xl for now to match UI theme.

    return (
        <button
            onClick={() => !isLocked && onClick(node)}
            disabled={isLocked}
            className={`
                relative w-32 h-32 md:w-40 md:h-40 flex flex-col items-center justify-center p-4
                rounded-2xl border-2 transition-all duration-300 transform
                ${bgClass}
                ${!isLocked && 'hover:scale-105 hover:shadow-xl'}
                ${isRecommended && 'scale-105 ring-4 ring-amber-500/20'}
            `}
            style={{
                // Position based on grid coords (handled by parent or absolute here?)
                // Let's let parent handle layout via grid first.
            }}
        >
            <div className="mb-2 p-2 rounded-full bg-black/20 backdrop-blur-sm">
                {icon}
            </div>

            <h3 className="text-xs md:text-sm font-bold text-center leading-tight">
                {node.title}
            </h3>

            {progress?.score !== undefined && progress.score > 0 && (
                <div className="mt-2 text-3xs font-mono opacity-80 bg-black/30 px-2 py-1 rounded-full">
                    {Math.round(progress.score * 100)}%
                </div>
            )}

            {isRecommended && (
                <div className="absolute -top-3 px-3 py-1 bg-amber-500 text-black text-3xs font-black uppercase tracking-widest rounded-full shadow-lg">
                    Sugerido
                </div>
            )}
        </button>
    );
}
