'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { apiUrl } from '@/lib/api';

export default function VisibilityToggle({ isPublic, onToggle }: { isPublic: boolean, onToggle: (val: boolean) => void }) {
    const t = useTranslations('profile');
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotificationStore();

    const handleToggle = async () => {
        setLoading(true);
        const newState = !isPublic;
        try {
            const res = await fetch(apiUrl('/api/user/settings/visibility'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_public: newState })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to update');

            onToggle(newState);
            addNotification({
                type: 'success',
                title: t('public_toggle'),
                message: newState ? 'Tu perfil ahora es público' : 'Tu perfil ahora es privado',
                duration: 3000
            });

            if (data.warning) {
                 addNotification({
                    type: 'info',
                    title: 'Aviso',
                    message: data.warning,
                    duration: 5000
                });
            }

        } catch (error) {
            console.error('Error toggling visibility:', error);
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'No se pudo actualizar la visibilidad',
                duration: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                isPublic
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
            }`}
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : (isPublic ? <Eye size={16} /> : <EyeOff size={16} />)}
            <span>{isPublic ? 'Público' : 'Privado'}</span>
        </button>
    );
}
