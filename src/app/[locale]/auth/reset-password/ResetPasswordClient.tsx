'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordClient({ locale }: { locale: string }) {
    const tAuth = useTranslations('auth');
    const tForm = useTranslations('auth_form');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema)
    });

    const onSubmit = async (data: ResetPasswordValues) => {
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase.auth.updateUser({
            password: data.password
        });

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            setTimeout(() => {
                router.push(`/${locale}/auth/login`);
            }, 3000);
        }
    };

    return (
        <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Decorative Column */}
            <div className="hidden lg:block relative overflow-hidden bg-nautical-black">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-sailing-boat-on-the-sea-during-sunset-34538-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-r from-nautical-black via-transparent to-transparent" />

                <div className="absolute bottom-20 left-20 z-10">
                    <h2 className="text-6xl font-display mb-4 italic">{tAuth('hero_text')}</h2>
                    <p className="text-accent uppercase tracking-widest text-[10px] font-bold">Getxo Bela Eskola · Est. 1992</p>
                </div>
            </div>

            {/* Form Column */}
            <div className="flex items-center justify-center p-8 pt-48 md:p-24 md:pt-56 lg:pt-24 relative">
                <div className="bg-mesh opacity-50 absolute inset-0 -z-10" />

                <div className="w-full max-w-md">
                    <header className="mb-12">
                        <h1 className="text-5xl font-display mb-2">{tAuth('reset_password_title')}</h1>
                        <p className="text-foreground/40 font-light">{tAuth('reset_password_desc')}</p>
                    </header>

                    {success ? (
                        <div className="bg-accent/10 border border-accent/20 p-6 rounded-sm animate-fade-in">
                            <p className="text-accent font-medium">{tForm('password_updated')}</p>
                            <p className="text-xs text-foreground/60 mt-2">{tAuth('login_here')}...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold ml-1">{tForm('password')}</label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    className="w-full bg-transparent border-b border-white/10 p-4 outline-none focus:border-accent transition-colors font-light text-sea-foam"
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{errors.password.message}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold ml-1">{tForm('confirm_password')}</label>
                                <input
                                    {...register('confirmPassword')}
                                    type="password"
                                    className="w-full bg-transparent border-b border-white/10 p-4 outline-none focus:border-accent transition-colors font-light text-sea-foam"
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{errors.confirmPassword.message}</p>}
                            </div>

                            {error && <p className="text-2xs text-red-500 text-center">{error}</p>}

                            <button
                                disabled={loading}
                                className="w-full btn mt-8 disabled:opacity-50"
                            >
                                {loading ? tForm('updating_password') : tForm('update_password')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
