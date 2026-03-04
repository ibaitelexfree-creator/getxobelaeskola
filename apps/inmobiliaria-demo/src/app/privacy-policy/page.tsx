'use client';

import React, { useEffect, useState } from 'react';
import LuxuryReveal from '@/components/ui/LuxuryReveal';
import { PRIVACY_POLICY_TRANSLATIONS } from '@/lib/translations';

const PrivacyPolicy = () => {
    const [locale, setLocale] = useState<'en' | 'es' | 'ar' | 'ru'>('en');

    useEffect(() => {
        // Simple cookie reading logic to detect language from googtrans
        const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
        if (match) {
            const gLang = match[2].split('/')[2];
            if (gLang === 'en' || gLang === 'es' || gLang === 'ar' || gLang === 'ru') {
                setLocale(gLang as 'en' | 'es' | 'ar' | 'ru');
            }
        }
    }, []);

    const t = PRIVACY_POLICY_TRANSLATIONS[locale] || PRIVACY_POLICY_TRANSLATIONS.en;

    return (
        <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
            
            <main style={{ paddingTop: '12rem', paddingBottom: '10rem' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <LuxuryReveal>
                        <span className="section-label" style={{ letterSpacing: '0.4em' }}>{t.subtitle}</span>
                    </LuxuryReveal>
                    <LuxuryReveal delay={0.2}>
                        <h1 className="section-title" style={{ fontSize: '3.5rem', marginBottom: '3rem' }}>
                            {t.title.split(' ')[0]} <span className="gold-text">{t.title.split(' ').slice(1).join(' ')}</span>
                        </h1>
                    </LuxuryReveal>

                    <div className="glass-card" style={{ padding: '3rem', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1rem', fontWeight: 300 }}>
                        {t.sections.map((section, idx) => (
                            <section key={idx} style={{ marginBottom: idx === t.sections.length - 1 ? 0 : '2.5rem' }}>
                                <h2 style={{ color: 'var(--gold-400)', fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.25rem' }}>
                                    {section.title}
                                </h2>
                                <p>
                                    {section.content}
                                </p>
                            </section>
                        ))}
                    </div>

                    <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Last updated: March 2024 | Luxe Dubai Estates | Dubai Marina, Tower 2
                        </p>
                    </div>
                </div>
            </main>
            
        </div>
    );
};

export default PrivacyPolicy;
