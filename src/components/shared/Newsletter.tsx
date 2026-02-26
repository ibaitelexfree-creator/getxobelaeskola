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
        <section className="py-32 relative overflow-hidden bg-nautical-deep selection:bg-accent selection:text-nautical-black">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brass-gold/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-5xl mx-auto glass-card p-12 md:p-24 text-center border-white/5 bg-white/[0.01] rounded-[2rem] overflow-hidden relative">
                    <header className="mb-16 relative z-10">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="w-8 h-[1px] bg-accent/30" />
                            <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black">
                                Join the fleet
                            </span>
                            <div className="w-8 h-[1px] bg-accent/30" />
                        </div>

                        <h2 className="text-4xl md:text-7xl font-display text-white mb-8 tracking-tight">
                            {t('title')}
                        </h2>
                        <p className="text-white/60 font-light text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed italic">
                            {t('subtitle')}
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="max-w-xl mx-auto relative z-10">
                        <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/5 border border-white/10 rounded-2xl focus-within:border-accent/40 transition-premium backdrop-blur-md">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('email_placeholder')}
                                required
                                aria-label={t('email_aria_label')}
                                className="flex-grow bg-transparent px-6 py-4 text-white text-lg placeholder:text-gray-200 focus:outline-none font-sans"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="bg-accent px-10 py-4 text-nautical-black text-[11px] uppercase tracking-[0.3em] font-black hover:bg-white transition-premium disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-accent/20 rounded-xl"
                            >
                                {status === 'loading' ? '...' : t('button')}
                            </button>
                        </div>

                        {/* Status Messages - Refined */}
                        <div className="mt-8 h-6 flex justify-center">
                            {status === 'success' && (
                                <div className="flex items-center gap-3 animate-fade-in">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                    <p className="text-accent text-[10px] uppercase tracking-[0.4em] font-black">
                                        {t('success')}
                                    </p>
                                </div>
                            )}
                            {status === 'error' && (
                                <p className="text-red-500 text-[10px] uppercase tracking-[0.4em] font-black animate-fade-in shadow-red-500/20">
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
