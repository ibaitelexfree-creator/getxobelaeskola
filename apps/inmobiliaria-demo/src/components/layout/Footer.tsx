import React from 'react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', padding: '4rem 0 2rem' }}>
            <div className="container grid-3" style={{ marginBottom: '3rem' }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        LUXE <span className="gold-text">DUBAI</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        The definitive collection of ultra-luxury real estate in Dubai. Penthouses, villas, and exclusive investments.
                    </p>
                </div>

                <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 600 }}>Quick Links</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><Link href="/properties" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>All Properties</Link></li>
                        <li><Link href="/neighborhoods" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>Neighborhoods</Link></li>
                        <li><Link href="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>About Us</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 600 }}>Contact</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <li>Boulevard Plaza Tower 1</li>
                        <li>Downtown Dubai, UAE</li>
                        <li>+971 4 123 4567</li>
                        <li>info@luxedubai.com</li>
                    </ul>
                </div>
            </div>

            <div className="container" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <p>&copy; {new Date().getFullYear()} Luxe Dubai Estates. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
                    <Link href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
