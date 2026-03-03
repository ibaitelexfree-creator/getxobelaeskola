'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Properties', path: '/properties' },
        { name: 'Neighborhoods', path: '#neighborhoods' },
        { name: 'About', path: '#about' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <>
            <header
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 1000,
                    transition: 'all 0.4s var(--ease-out)',
                    padding: scrolled ? '1rem 0' : '2rem 0',
                    backgroundColor: scrolled ? 'var(--bg-secondary)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(12px)' : 'none',
                    borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none',
                }}
            >
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span
                                className="gold-text"
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: scrolled ? '1.5rem' : '2rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.1em',
                                    transition: 'all 0.4s var(--ease-out)'
                                }}
                            >
                                LUXE
                            </span>
                            <span
                                style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.6rem',
                                    letterSpacing: '0.3em',
                                    marginTop: '-0.2rem',
                                    fontWeight: 500
                                }}
                            >
                                DUBAI ESTATES
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2.5rem',
                        }}
                        className="desktop-nav"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.path}
                                style={{
                                    color: pathname === link.path ? 'var(--gold-400)' : 'var(--text-primary)',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    transition: 'color 0.3s ease',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link href="/contact" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>
                            List Property
                        </Link>
                    </nav>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }}
                        id="mobile-menu-toggle"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100vh',
                    backgroundColor: 'var(--bg-primary)',
                    zIndex: 999,
                    display: isMobileMenuOpen ? 'flex' : 'none',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2rem',
                    padding: '2rem'
                }}
            >
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                            color: pathname === link.path ? 'var(--gold-400)' : 'var(--text-primary)',
                            textDecoration: 'none',
                            fontSize: '1.5rem',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 500
                        }}
                    >
                        {link.name}
                    </Link>
                ))}
                <Link
                    href="/contact"
                    className="btn-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ width: '100%', maxWidth: '250px' }}
                >
                    List Property
                </Link>
            </div>
        </>
    );
};
