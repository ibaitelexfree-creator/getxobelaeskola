"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import LanguageSelector from '../ui/LanguageSelector';
import CurrencySelector from '../ui/CurrencySelector';

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const res = await fetch('/realstate/api/user/role');
                const data = await res.json();
                setUser({ ...user, role: data.role });
            } else {
                setUser(null);
            }
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, [supabase]);

    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
            background: scrolled ? 'var(--glass-bg)' : 'transparent',
            backdropFilter: scrolled ? 'blur(12px)' : 'none',
            borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
            transition: 'all var(--duration) var(--ease-out)'
        }}>
            <div className="container" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: scrolled ? '70px' : '90px', transition: 'height var(--duration)'
            }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        LUXE <span className="gold-text">DUBAI</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav style={{ display: 'none' }} className="desktop-nav">
                    <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', alignItems: 'center' }}>
                        <li><Link href="/properties" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Properties</Link></li>
                        <li><Link href="/neighborhoods" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Neighborhoods</Link></li>
                        <li><Link href="/about" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>About</Link></li>
                        <li><Link href="/contact" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Contact</Link></li>

                        <li style={{ marginLeft: '1rem', height: '30px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></li>

                        <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginLeft: '0.5rem' }}>
                            <LanguageSelector />
                            <CurrencySelector />
                        </li>

                        <li>
                            <Link href="/list-property" className="btn-secondary" style={{
                                padding: '0.6rem 1.2rem',
                                fontSize: '0.75rem',
                                letterSpacing: '0.1rem'
                            }}>
                                LIST ASSET
                            </Link>
                        </li>

                        <li>
                            {user ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    {user.role === 'admin' && (
                                        <Link href="/admin/properties" style={{
                                            color: 'var(--rose-400)',
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            letterSpacing: '0.05rem'
                                        }}>
                                            ADMIN
                                        </Link>
                                    )}
                                    <Link href="/dashboard" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        color: 'var(--gold-400)',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.85rem'
                                    }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'var(--gold-500)',
                                            color: '#000',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem'
                                        }}>
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        MY DASHBOARD
                                    </Link>
                                </div>
                            ) : (
                                <Link href={`/auth/login?returnTo=${pathname}`} className="btn-primary" style={{
                                    padding: '0.6rem 1.5rem',
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.1rem'
                                }}>
                                    ENTRAR / ÚNETE
                                </Link>
                            )}
                        </li>
                    </ul>
                </nav>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="mobile-toggle"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer', display: 'none' }}
                >
                    ☰
                </button>

                {/* Mobile Nav */}
                {menuOpen && (
                    <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)',
                        borderBottom: '1px solid var(--border-subtle)', padding: '1rem 2rem'
                    }}>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none' }}>
                            <li><Link href="/properties" onClick={() => setMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Properties</Link></li>
                            <li><Link href="/neighborhoods" onClick={() => setMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Neighborhoods</Link></li>
                            <li><Link href="/about" onClick={() => setMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>About</Link></li>
                            <li><Link href="/contact" onClick={() => setMenuOpen(false)} style={{ color: 'var(--gold-400)', textDecoration: 'none' }}>Contact</Link></li>
                        </ul>
                    </div>
                )}

                <style dangerouslySetInnerHTML={{
                    __html: `
          @media (min-width: 768px) {
            .desktop-nav { display: block !important; }
          }
          @media (max-width: 767px) {
            .mobile-toggle { display: block !important; }
          }
        `}} />
            </div>
        </header>
    );
}
