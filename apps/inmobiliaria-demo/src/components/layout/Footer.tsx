'use client';

import React from 'react';
import Link from 'next/link';
import { UI_TRANSLATIONS, PRIVACY_POLICY_TRANSLATIONS } from '@/lib/translations';

const Footer = ({ locale }: { locale: string }) => {
    const currentYear = new Date().getFullYear();
    const t = (UI_TRANSLATIONS as any)[locale]?.footer || UI_TRANSLATIONS.en.footer;
    const navT = (UI_TRANSLATIONS as any)[locale]?.nav || UI_TRANSLATIONS.en.nav;

    return (
        <footer
            style={{
                backgroundColor: 'var(--bg-secondary)',
                paddingTop: '6rem',
                paddingBottom: '2.5rem',
                borderTop: '1px solid var(--border-gold)',
                marginTop: '6rem'
            }}
        >
            <div className="container">
                <div
                    className="grid-4"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '4rem',
                        marginBottom: '4rem'
                    }}
                >
                    {/* Logo & Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="gold-text" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, letterSpacing: '0.1em' }}>LUXE</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', letterSpacing: '0.3em', marginTop: '-0.2rem' }}>DUBAI ESTATES</span>
                            </div>
                        </Link>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                            {t.description}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <h4 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }}>{t.links}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>{navT.home}</Link>
                            <Link href="/properties" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>{navT.properties}</Link>
                            <Link href="/#neighborhoods" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>{navT.neighborhoods}</Link>
                            <Link href="/contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>{navT.contact}</Link>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <h4 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }}>{t.contact}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--gold-400)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em' }}>{t.address}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dubai Marina, Tower 2, Level 18</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--gold-400)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em' }}>{t.phone}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+971 4 000 0000</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: '4rem',
                        paddingTop: '2.5rem',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem'
                    }}
                >
                    <span>© {currentYear} Luxe Dubai Estates.</span>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <Link href="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>{PRIVACY_POLICY_TRANSLATIONS[locale as 'en' | 'es' | 'ar' | 'ru']?.title || 'Privacy Policy'}</Link>
                        <span style={{ color: 'var(--gold-500)' }}>{t.licensed}</span>
                    </div>
                </div>
            </div>
            <style jsx>{`
        @media (max-width: 1024px) {
          .grid-4 { grid-template-columns: repeat(2, 1fr) !important; gap: 3rem !important; }
        }
        @media (max-width: 640px) {
          .grid-4 { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
      `}</style>
        </footer>
    );
};
export default Footer;
