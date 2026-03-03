'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSafeRedirectUrl } from '@/lib/utils/url';
import Link from 'next/link';
import GoogleAuthButton from './GoogleAuthButton';

const loginSchema = z.object({
    email: z.string().email('Email no válido'),
    password: z.string().min(6, 'Debes introducir al menos 6 caracteres'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const supabase = createClient();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginValues) => {
        setLoading(true);
        setError(null);

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (authError) {
            console.error("Auth error:", authError);
            const msg = authError.message.toLowerCase();
            if (msg.includes('email not confirmed')) {
                setError('Por favor, confirma tu email antes de entrar.');
            } else if (msg.includes('invalid login credentials')) {
                setError('Credenciales incorrectas. Revisa tu email y contraseña.');
            } else {
                setError('Error al iniciar sesión: ' + authError.message);
            }
            setLoading(false);
        } else {
            const nextUrl = getSafeRedirectUrl(returnTo, '/');
            router.push(nextUrl);
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-gold-400">Email</label>
                <input
                    id="email"
                    {...register('email')}
                    type="email"
                    className="input-field"
                    placeholder="ejemplo@email.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 relative">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-gold-400">Contraseña</label>
                <input
                    id="password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-10 text-text-muted hover:text-gold-400 transition-colors"
                >
                    {showPassword ? 'Ocultar' : 'Ver'}
                </button>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
                <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-gold-400 hover:text-white transition-colors underline"
                >
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-md">
                    <p className="text-sm text-red-500 text-center">{error}</p>
                </div>
            )}

            <button
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
            >
                {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-subtle"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="bg-bg-primary px-4 text-text-muted">O continúa con</span>
                </div>
            </div>

            <GoogleAuthButton />
        </form>
    );
}
