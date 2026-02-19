'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { apiUrl } from '@/lib/api';


export default function ContactForm() {
    const t = useTranslations('contact_form');
    const tv = useTranslations('validation');

    const contactSchema = z.object({
        nombre: z.string().min(2, tv('name_short')),
        email: z.string().email(tv('email_invalid')),
        telefono: z.string().optional(),
        asunto: z.string().min(5, tv('subject_short')),
        mensaje: z.string().min(10, tv('message_short')),
    });

    type ContactFormValues = z.infer<typeof contactSchema>;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data: ContactFormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(apiUrl('/api/contact'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('error'));
            }

            setSuccess(true);
            reset();
        } catch (err: any) {
            console.error('Contact Form Error:', err);
            setError(err.message || t('error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-card border border-accent/20 p-12 text-center animate-fade-in">
                <h3 className="font-display text-4xl mb-4 text-accent">{t('success_title')}</h3>
                <p className="text-foreground/60 font-light mb-8">
                    {t('success_desc')}
                </p>
                <button
                    onClick={() => setSuccess(false)}
                    className="btn"
                >
                    {t('send_another')}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label htmlFor="nombre" className="text-xs uppercase tracking-widest text-accent font-semibold ml-1">{t('name')}</label>
                    <input
                        id="nombre"
                        {...register('nombre')}
                        className={`w-full bg-nautical-deep border-b ${errors.nombre ? 'border-red-500' : 'border-white/10'} focus:border-accent outline-none p-4 text-sea-foam font-light transition-colors`}
                        placeholder={t('name_placeholder')}
                    />
                    {errors.nombre && <p className="text-xs text-red-500 uppercase tracking-tighter">{errors.nombre.message}</p>}
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-xs uppercase tracking-widest text-accent font-semibold ml-1">{t('email')}</label>
                    <input
                        id="email"
                        {...register('email')}
                        className={`w-full bg-nautical-deep border-b ${errors.email ? 'border-red-500' : 'border-white/10'} focus:border-accent outline-none p-4 text-sea-foam font-light transition-colors`}
                        placeholder={t('email_placeholder')}
                    />
                    {errors.email && <p className="text-xs text-red-500 uppercase tracking-tighter">{errors.email.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label htmlFor="telefono" className="text-xs uppercase tracking-widest text-accent font-semibold ml-1">{t('phone')}</label>
                    <input
                        id="telefono"
                        {...register('telefono')}
                        className="w-full bg-nautical-deep border-b border-white/10 focus:border-accent outline-none p-4 text-sea-foam font-light transition-colors"
                        placeholder={t('phone_placeholder')}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="asunto" className="text-xs uppercase tracking-widest text-accent font-semibold ml-1">{t('subject')}</label>
                    <input
                        id="asunto"
                        {...register('asunto')}
                        className={`w-full bg-nautical-deep border-b ${errors.asunto ? 'border-red-500' : 'border-white/10'} focus:border-accent outline-none p-4 text-sea-foam font-light transition-colors`}
                        placeholder={t('subject_placeholder')}
                    />
                    {errors.asunto && <p className="text-xs text-red-500 uppercase tracking-tighter">{errors.asunto.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="mensaje" className="text-xs uppercase tracking-widest text-accent font-semibold ml-1">{t('message')}</label>
                <textarea
                    id="mensaje"
                    {...register('mensaje')}
                    rows={5}
                    className={`w-full bg-nautical-deep border-b ${errors.mensaje ? 'border-red-500' : 'border-white/10'} focus:border-accent outline-none p-4 text-sea-foam font-light transition-colors resize-none`}
                    placeholder={t('message_placeholder')}
                />
                {errors.mensaje && <p className="text-xs text-red-500 uppercase tracking-tighter">{errors.mensaje.message}</p>}
            </div>

            {error && <p className="text-2xs text-red-500">{error}</p>}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn flex justify-center items-center gap-4 disabled:opacity-50"
            >
                {isSubmitting ? t('sending') : t('send')}
            </button>
        </form>
    );
}
