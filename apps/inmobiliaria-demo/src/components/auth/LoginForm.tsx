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
            <GoogleAuthButton returnTo={returnTo} />

            <div className="card-divider text-white/20">O INICIA SESIÓN CON EMAIL</div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a843]/80 ml-1">
                        Email
                    </label>
                    <input
                        id="email"
                        {...register('email')}
                        type="email"
                        className="input-field"
                        placeholder="tu@email.com"
                    />
                    {errors.email && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2 relative">
                    <div className="flex justify-between items-center px-1">
                        <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a843]/80">
                            Contraseña
                        </label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-[10px] font-medium text-white/40 hover:text-[#d4a843] transition-colors"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            className="input-field px-5 pr-12"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-[#d4a843]/50 hover:text-[#d4a843] transition-colors"
                        >
                            {showPassword ? 'Ocultar' : 'Ver'}
                        </button>
                    </div>
                    {errors.password && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.password.message}</p>}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <p className="text-xs text-red-400 text-center font-medium">{error}</p>
                </div>
            )}

            <button
                disabled={loading}
                className="btn-primary w-full mt-2 disabled:opacity-50"
            >
                {loading ? 'Autenticando...' : 'Iniciar Sesión'}
            </button>
        </form>
    );
}
