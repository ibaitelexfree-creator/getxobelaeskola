'use client';

import { useState, useTransition } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { togglePublicProfile } from '@/actions/profile';
import { useRouter } from 'next/navigation';

interface ProfileVisibilityToggleProps {
    userId: string;
    initialIsPublic: boolean;
}

export default function ProfileVisibilityToggle({ userId, initialIsPublic }: ProfileVisibilityToggleProps) {
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggle = () => {
        const newState = !isPublic;
        setIsPublic(newState); // Optimistic update

        startTransition(async () => {
            try {
                await togglePublicProfile(userId, newState);
                router.refresh();
            } catch (error) {
                console.error('Failed to toggle visibility', error);
                setIsPublic(!newState); // Revert on error
                alert('No se pudo actualizar la visibilidad del perfil.');
            }
        });
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-black hidden md:inline-block">
                Visibilidad:
            </span>
            <button
                onClick={handleToggle}
                disabled={isPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all
                    ${isPublic
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
            >
                {isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : isPublic ? (
                    <Eye size={14} />
                ) : (
                    <EyeOff size={14} />
                )}
                {isPublic ? 'Público' : 'Privado'}
            </button>
        </div>
    );
}
