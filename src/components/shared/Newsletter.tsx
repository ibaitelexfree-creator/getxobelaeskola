'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiUrl } from '@/lib/api';


export default function Newsletter({ locale }: { locale: string }) {
    const t = useTranslations('newsletter');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        try {
            const response = await fetch(apiUrl('/api/newsletter/subscribe'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, locale })
            });

            if (response.ok) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            setStatus('error');
        }
    };

    return (
        <section className="py-24 relative overflow-hidden bg-nautical-deep selection:bg-accent selection:text-nautical-black">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[100px] rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brass-gold/5 blur-[80px] rounded-full translate-y-12 -translate-x-12 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto glass-panel p-12 md:p-20 text-center border-white/5 bg-white/[0.02]">
                    <header className="mb-12">
                        <span className="text-accent uppercase tracking-[0.4em] text-sm font-bold mb-6 block">
                            Newsletter
                        </span>
                        <h2 className="text-4xl md:text-6xl font-display text-white mb-6">
                            {t('title')}
                        </h2>
                        <p className="text-white/80 font-medium text-xl max-w-2xl mx-auto leading-relaxed">
                            {t('subtitle')}
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('email_placeholder')}
                                required
                                aria-label={t('email_aria_label')}
                                className="flex-grow bg-white/5 border border-white/10 px-6 py-4 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-accent/40 transition-all rounded-sm font-sans"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="bg-accent px-8 py-4 text-nautical-black text-sm uppercase tracking-[0.2em] font-black hover:bg-white hover:text-nautical-black transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-accent/10 rounded-sm"
                            >
                                {status === 'loading' ? '...' : t('button')}
                            </button>
                        </div>

                        {/* Status Messages */}
                        <div className="mt-6 h-6">
                            {status === 'success' && (
                                <p className="text-accent text-2xs uppercase tracking-widest font-bold animate-fade-in">
                                    {t('success')}
                                </p>
                            )}
                            {status === 'error' && (
                                <p className="text-red-400 text-2xs uppercase tracking-widest font-bold animate-fade-in">
                                    {t('error')}
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
