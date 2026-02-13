'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const registerSchema = z.object({
    nombre: z.string().min(2, 'Nombre demasiado corto'),
    apellidos: z.string().min(2, 'Apellidos demasiado corto'),
    email: z.string().email('Email no válido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    subscribeNewsletter: z.boolean(),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
    const t = useTranslations('auth_form');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            subscribeNewsletter: true
        }
    });

    const onSubmit = async (data: RegisterValues) => {
        setLoading(true);
        setError(null);

        const { error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    nombre: data.nombre,
                    apellidos: data.apellidos,
                }
            }
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            // Background newsletter subscription if checked
            if (data.subscribeNewsletter) {
                try {
                    const locale = window.location.pathname.split('/')[1] || 'es';
                    await fetch('/api/newsletter/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: data.email, locale })
                    });
                } catch (err) {
                    console.error('Background newsletter sub error:', err);
                }
            }

            const locale = window.location.pathname.split('/')[1] || 'es';
            router.push(`/${locale}/auth/login?registered=true`);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-3xs uppercase tracking-[0.2em] text-accent font-bold ml-1">{t('name')}</label>
                    <input
                        {...register('nombre')}
                        className="w-full bg-transparent border-b border-white/10 p-4 outline-none focus:border-accent transition-colors font-light text-sea-foam"
                        placeholder="Ana"
                    />
                    {errors.nombre && <p className="text-3xs text-red-500 uppercase mt-1">{errors.nombre.message}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-3xs uppercase tracking-[0.2em] text-accent font-bold ml-1">{t('apellidos') || 'Apellidos'}</label>
                    <input
                        {...register('apellidos')}
                        className="w-full bg-transparent border-b border-white/10 p-4 outline-none focus:border-accent transition-colors font-light text-sea-foam"
                        placeholder="López"
                    />
                    {errors.apellidos && <p className="text-3xs text-red-500 uppercase mt-1">{errors.apellidos.message}</p>}
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-3xs uppercase tracking-[0.2em] text-accent font-bold ml-1">{t('email')}</label>
                <input
                    {...register('email')}
                    type="email"
                    className="w-full bg-transparent border-b border-white/10 p-4 outline-none focus:border-accent transition-colors font-light text-sea-foam"
                    placeholder="tu@email.com"
                />
                {errors.email && <p className="text-3xs text-red-500 uppercase mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
                <label className="text-3xs uppercase tracking-[0.2em] text-accent font-bold ml-1">{t('password')}</label>
                <input
                    {...register('password')}
                    type="password"
                    className="w-full bg-transparent border-b border-white/10 p-4 outline-none focus:border-accent transition-colors font-light text-sea-foam"
                    placeholder="••••••••"
                />
                {errors.password && <p className="text-3xs text-red-500 uppercase mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-3 pt-2">
                <input
                    {...register('subscribeNewsletter')}
                    type="checkbox"
                    id="subscribeNewsletter"
                    className="w-4 h-4 accent-accent border-white/10 rounded-sm cursor-pointer"
                />
                <label htmlFor="subscribeNewsletter" className="text-3xs uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-pointer select-none">
                    {t('newsletter_checkbox')}
                </label>
            </div>

            {error && <p className="text-2xs text-red-500 text-center">{error}</p>}

            <button
                disabled={loading}
                className="w-full btn mt-8 disabled:opacity-50"
            >
                {loading ? t('registering') : t('register_btn')}
            </button>
        </form>
    );
}
