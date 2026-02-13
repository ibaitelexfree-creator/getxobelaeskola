'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const loginSchema = z.object({
    email: z.string().email('Email no válido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm({ locale = 'es' }: { locale?: string }) {
    const t = useTranslations('auth_form');
    const [loading, setLoading] = useState(false);
    const [isCredsError, setIsCredsError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginValues) => {
        setLoading(true);
        setError(null);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (authError) {
            const msg = authError.message.toLowerCase();
            if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('incorrect')) {
                setError(t('invalid_creds'));
                setIsCredsError(true);
            } else {
                setError(authError.message);
                setIsCredsError(false);
            }
            setLoading(false);
        } else {
            setIsCredsError(false);
            // Get current locale from URL or default to 'es'
            const locale = window.location.pathname.split('/')[1] || 'es';

            // Check for returnTo parameter in search params
            const searchParams = new URLSearchParams(window.location.search);
            const returnTo = searchParams.get('returnTo');

            if (returnTo) {
                router.push(returnTo);
            } else {
                // Default redirect to dashboard
                router.push(`/${locale}/student/dashboard`);
            }
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
            <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold ml-1">{t('email')}</label>
                <input
                    {...register('email')}
                    type="email"
                    className="w-full bg-transparent border-b border-white/10 p-4 outline-none focus:border-accent transition-colors font-light text-sea-foam"
                    placeholder="tu@email.com"
                />
                {errors.email && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold ml-1">{t('password')}</label>
                <input
                    {...register('password')}
                    type="password"
                    className="w-full bg-transparent border-b border-white/10 p-4 outline-none focus:border-accent transition-colors font-light text-sea-foam"
                    placeholder="••••••••"
                />
                {errors.password && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
                <Link
                    href={`/${locale}/auth/forgot-password`}
                    className="text-[10px] uppercase tracking-widest text-accent hover:text-sea-foam transition-colors font-bold underline underline-offset-4"
                >
                    {t('forgot_password')}
                </Link>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-sm animate-fade-in space-y-4">
                    <p className="text-xs text-red-500 text-center font-medium">{error}</p>

                    {isCredsError && (
                        <div className="pt-2 border-t border-red-500/10 flex justify-center">
                            <Link
                                href={`/${locale}/auth/forgot-password`}
                                className="text-[10px] uppercase tracking-widest bg-red-500 text-white px-4 py-2 font-black hover:bg-white hover:text-red-500 transition-all rounded-sm shadow-lg"
                            >
                                {t('try_reset')}
                            </Link>
                        </div>
                    )}
                </div>
            )}

            <button
                disabled={loading}
                className="w-full btn mt-4 disabled:opacity-50"
            >
                {loading ? t('logging_in') : t('login_btn')}
            </button>
        </form>
    );
}
