'use client';

import React from 'react';
import Image from 'next/image';
import LuxuryReveal from '@/components/ui/LuxuryReveal';
import { revealOnScroll } from '@/lib/revealOnScroll';
import { getAssetPath } from '@/lib/constants';

export default function AboutPage() {
    return (
        <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>

            <main style={{ paddingTop: '12rem', paddingBottom: '10rem' }}>
                <div className="container">
                    {/* Header Section */}
                    <div style={{ textAlign: 'center', marginBottom: '10rem' }}>
                        <LuxuryReveal>
                            <span className="section-label" style={{ letterSpacing: '0.6em' }}>OUR HERITAGE</span>
                        </LuxuryReveal>
                        <LuxuryReveal delay={0.2}>
                            <h1 className="section-title" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginBottom: '3rem' }}>
                                Curating <span className="gold-text">Extraordinary</span> Living
                            </h1>
                        </LuxuryReveal>
                        <LuxuryReveal delay={0.4}>
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '1.25rem',
                                maxWidth: '800px',
                                margin: '0 auto',
                                fontWeight: 300,
                                lineHeight: 1.8
                            }}>
                                Luxe Dubai Estates is a boutique real estate advisory firm dedicated to representing
                                the most exclusive properties in the world's most dynamic city. We don't just find
                                properties; we curate legacies.
                            </p>
                        </LuxuryReveal>
                    </div>

                    {/* Content Section */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8rem',
                            alignItems: 'center',
                            marginBottom: '12rem'
                        }}
                        className="responsive-grid"
                    >
                        <div
                            style={{
                                position: 'relative',
                                aspectRatio: '4/5',
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                                border: '1px solid var(--border-subtle)',
                                boxShadow: 'var(--shadow-md)'
                            }}
                            className="luxury-glow"
                        >
                            <img
                                src={getAssetPath("/images/properties/penthouse-pool.png")}
                                alt="Luxe Dubai Estates Vision"
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                className="ken-burns"
                            />
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(5,5,5,0.8), transparent)',
                                pointerEvents: 'none'
                            }} />
                            <div style={{ position: 'absolute', bottom: '3rem', left: '3rem' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#fff' }}>Vision & Legacy</h3>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
                            <div>
                                <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Our Heritage</h2>
                                <div className="divider" />
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', fontWeight: 300, lineHeight: 1.9 }}>
                                    Founded on the principles of absolute discretion and unparalleled architectural appreciation,
                                    Luxe Dubai Estates serves a global clientele of visionaries and connoisseurs. We do not simply
                                    sell properties; we match extraordinary individuals with spaces that reflect their unique legacy.
                                </p>
                            </div>

                            <div>
                                <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>The Standard</h2>
                                <div className="divider" />
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', fontWeight: 300, lineHeight: 1.9 }}>
                                    Every property in our portfolio has been rigorously selected for its design pedigree,
                                    location, and potential for appreciation. Our bespoke advisory approach ensures that
                                    your acquisition process is as elegant as the home you seek.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Expertise Section */}
                    <div style={{ textAlign: 'center', padding: '8rem 4rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-gold)', position: 'relative', overflow: 'hidden' }}>
                        <div className="luxury-sweep" style={{ opacity: 0.05 }} />
                        <h2 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Private Advisory</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 3.5rem', fontWeight: 300 }}>
                            Beyond the acquisition, we provide a full suite of family office services including property management,
                            interior curation, and residency advisory.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <a href="/contact" className="btn-primary" style={{ padding: '1.2rem 3.5rem' }}>Consult an Advisor</a>
                        </div>
                    </div>
                </div>
            </main>


            <style jsx>{`
                @media (max-width: 1024px) {
                    .responsive-grid { grid-template-columns: 1fr !important; gap: 4rem !important; }
                }
            `}</style>
        </div>
    );
}
