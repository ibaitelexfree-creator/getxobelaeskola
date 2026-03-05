'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GoogleAuthButton from './GoogleAuthButton';
import { BASE_PATH } from '@/lib/constants';

const registerSchema = z.object({
    nombre: z.string().min(2, 'El nombre es muy corto'),
    apellidos: z.string().min(2, 'Los apellidos son muy cortos'),
    email: z.string().email('Email no válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterValues) => {
        setLoading(true);
        setError(null);

        const isLocal = window.location.hostname === 'localhost';
        const appUrl = isLocal
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || window.location.origin);

        const { error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                emailRedirectTo: `${appUrl}${BASE_PATH}/api/auth/callback?next=/`,
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
            router.push('/auth/login?registered=true');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <GoogleAuthButton />

            <div className="card-divider text-white/20">O CREA UNA CUENTA CON EMAIL</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a843]/80 ml-1">Nombre</label>
                    <input
                        {...register('nombre')}
                        className="input-field"
                        placeholder="Ana"
                    />
                    {errors.nombre && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.nombre.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a843]/80 ml-1">Apellidos</label>
                    <input
                        {...register('apellidos')}
                        className="input-field"
                        placeholder="López"
                    />
                    {errors.apellidos && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.apellidos.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a843]/80 ml-1">Correo Electrónico</label>
                <input
                    {...register('email')}
                    type="email"
                    className="input-field"
                    placeholder="tu@email-de-lujo.com"
                />
                {errors.email && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 relative">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a843]/80 ml-1">Contraseña</label>
                <div className="relative">
                    <input
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

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <p className="text-[10px] text-red-400 text-center font-medium">{error}</p>
                </div>
            )}

            <button
                disabled={loading}
                className="btn-primary w-full mt-4 disabled:opacity-50"
            >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
        </form>
    );
}
