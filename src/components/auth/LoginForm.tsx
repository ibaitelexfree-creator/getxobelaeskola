'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Link from 'next/link';
import GoogleAuthButton from './GoogleAuthButton';

const loginSchema = z.object({
    email: z.string().email('Email no válido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm({ locale = 'es' }: { locale?: string }) {
    const t = useTranslations('auth_form');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isCredsError, setIsCredsError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
    const [currentEmail, setCurrentEmail] = useState('');
    const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const router = useRouter();
    const supabase = createClient();

    const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema)
    });

    const emailValue = watch('email');

    const handleResendEmail = async () => {
        if (!emailValue) return;
        setResendStatus('loading');
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: emailValue,
        });
        if (error) {
            setResendStatus('error');
        } else {
            setResendStatus('success');
        }
    };

    const onSubmit = async (data: LoginValues) => {
        setLoading(true);
        setError(null);
        setIsEmailNotConfirmed(false);
        setResendStatus('idle');
        setCurrentEmail(data.email);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (authError) {
            const msg = authError.message.toLowerCase();
            if (msg.includes('email not confirmed') || (msg.includes('invalid') && msg.includes('address'))) {
                setError(t('email_not_confirmed'));
                setIsEmailNotConfirmed(true);
                setIsCredsError(false);
            } else if (msg.includes('rate limit')) {
                setError(t('rate_limit'));
                setIsEmailNotConfirmed(false);
                setIsCredsError(false);
            } else if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('incorrect')) {
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in">
            <div className="space-y-1.5">
                <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold ml-1">{t('email')}</label>
                <input
                    id="email"
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 outline-none focus:border-accent focus:bg-white/[0.08] transition-all font-light text-white placeholder:text-white/40"
                    placeholder="tu@email.com"
                />
                {errors.email && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold ml-1">{t('password')}</label>
                <input
                    id="password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
<<<<<<< HEAD
                    autoComplete="new-password"
=======
                    autoComplete="current-password"
>>>>>>> pr-286
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 outline-none focus:border-accent focus:bg-white/[0.08] transition-all font-light text-white placeholder:text-white/40"
                    placeholder="••••••••"
                />
                {errors.password && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{errors.password.message}</p>}

                <div className="flex items-center space-x-2 mt-2 ml-1">
                    <input
                        type="checkbox"
                        id="show-password"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                        className="w-3 h-3 rounded border-white/10 bg-transparent text-accent focus:ring-accent accent-accent cursor-pointer"
                    />
                    <label
                        htmlFor="show-password"
                        className="text-[9px] uppercase tracking-widest text-foreground/70 cursor-pointer hover:text-accent transition-colors"
                    >
                        {t('show_password')}
                    </label>
                </div>
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
                    <p className="text-xs text-red-500 text-center font-medium leading-relaxed">
                        {error}
                        {isEmailNotConfirmed && (
                            <button
                                type="button"
                                onClick={handleResendEmail}
                                disabled={resendStatus === 'loading'}
                                className="ml-2 text-blue-500 underline hover:text-blue-400 transition-colors font-bold inline-block"
                            >
                                {resendStatus === 'loading' ? '...' : t('resend_email')}
                            </button>
                        )}
                    </p>

                    {resendStatus === 'success' && (
                        <p className="text-[10px] text-green-500 text-center uppercase tracking-widest animate-fade-in">
                            {t('resend_success')}
                        </p>
                    )}

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
                className="w-full h-12 rounded-xl bg-gradient-to-r from-accent to-accent/80 text-nautical-black font-black uppercase tracking-widest text-xs mt-4 disabled:opacity-50 hover:shadow-[0_0_30px_rgba(184,134,11,0.3)] transition-all active:scale-[0.98]"
            >
                {loading ? t('logging_in') : t('login_btn')}
            </button>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                    <span className="bg-nautical-black px-4 text-white/50 font-bold italic">O BIEN</span>
                </div>
            </div>

            <GoogleAuthButton />
        </form>
    );
}
