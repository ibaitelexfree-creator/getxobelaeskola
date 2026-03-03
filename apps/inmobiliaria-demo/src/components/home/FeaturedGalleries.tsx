'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PROPERTIES } from '@/data/properties';
import { useParallax } from '@/lib/useParallax';
import { Magnetic } from '@/components/ui/Magnetic';
import { Reveal, MaskReveal } from '@/components/ui/Reveal';
import LuxuryReveal from '@/components/ui/LuxuryReveal';

export const FeaturedGalleries = () => {
    const { getStyle: getTextStyle } = useParallax({ speed: -0.1, limit: 100 });
    const featured = PROPERTIES.filter(p => p.featured).slice(0, 3);

    return (
        <section
            className="section"
            style={{
                backgroundColor: '#050505',
                overflow: 'hidden',
                padding: '12rem 0',
                position: 'relative'
            }}
        >
            {/* Background elements for depth */}
            <div style={{
                position: 'absolute',
                top: '20%',
                right: '-10%',
                width: '40vw',
                height: '40vw',
                background: 'radial-gradient(circle, rgba(212,175,55,0.02) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '10rem' }}>
                    <LuxuryReveal>
                        <span className="section-label" style={{ letterSpacing: '0.6em' }}>THE CURATED SELECTION</span>
                    </LuxuryReveal>
                    <LuxuryReveal delay={0.2}>
                        <h2 className="section-title" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>Architectural Icons</h2>
                    </LuxuryReveal>
                    <Reveal delay={0.5} width="100%">
                        <div style={{
                            width: '80px',
                            height: '1px',
                            background: 'var(--gold-500)',
                            margin: '3rem auto 0'
                        }} />
                    </Reveal>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20rem'
                    }}
                >
                    {featured.map((p, index) => (
                        <div
                            key={p.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: index % 2 === 0 ? '1fr 1.3fr' : '1.3fr 1fr',
                                gap: '10rem',
                                alignItems: 'center',
                                perspective: '2000px'
                            }}
                        >
                            {/* Text Content */}
                            <div style={{
                                order: index % 2 === 0 ? 1 : 2,
                                ...getTextStyle(),
                                transition: 'transform 0.1s linear'
                            }}>
                                <LuxuryReveal delay={index * 0.1}>
                                    <span style={{ color: 'var(--gold-400)', fontSize: '0.8rem', letterSpacing: '0.4em', fontWeight: 700 }}>
                                        {p.neighborhood.toUpperCase()}
                                    </span>
                                </LuxuryReveal>
                                <Reveal delay={0.2 + index * 0.1}>
                                    <h3 className="shimmer-text" style={{
                                        fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                                        fontFamily: 'var(--font-display)',
                                        color: '#fff',
                                        marginBottom: '2.5rem',
                                        lineHeight: 1.1,
                                        fontWeight: 600
                                    }}>
                                        {p.name}
                                    </h3>
                                </Reveal>
                                <Reveal delay={0.3 + index * 0.1}>
                                    <div style={{
                                        height: '2px',
                                        width: '40px',
                                        background: 'var(--gold-500)',
                                        marginBottom: '2.5rem'
                                    }} />
                                </Reveal>
                                <Reveal delay={0.4 + index * 0.1}>
                                    <p style={{
                                        fontSize: '1.1rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '4rem',
                                        lineHeight: 1.8,
                                        maxWidth: '450px',
                                        fontWeight: 300
                                    }}>
                                        {p.description}
                                    </p>
                                </Reveal>
                                <Reveal delay={0.5 + index * 0.1}>
                                    <Magnetic strength={0.3}>
                                        <Link href={`/properties/${p.slug}`} className="btn-secondary luxury-sweep" style={{ display: 'inline-flex' }}>
                                            Explore Masterpiece
                                        </Link>
                                    </Magnetic>
                                </Reveal>
                            </div>

                            {/* Image Container with Reveal Mask */}
                            <div
                                style={{
                                    position: 'relative',
                                    aspectRatio: '16/11',
                                    overflow: 'hidden',
                                    borderRadius: '2px',
                                    order: index % 2 === 0 ? 2 : 1,
                                    boxShadow: '0 50px 100px rgba(0,0,0,0.6)'
                                }}
                                className="luxury-glow"
                            >
                                <LuxuryReveal delay={0.3 + index * 0.2}>
                                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                        <Image
                                            src={p.mainImage}
                                            alt={p.name}
                                            fill
                                            className="ken-burns"
                                            style={{
                                                objectFit: 'cover'
                                            }}
                                        />

                                        {/* Overlay detailing */}
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)',
                                            zIndex: 2
                                        }}></div>

                                        <div style={{
                                            position: 'absolute',
                                            bottom: '2.5rem',
                                            left: index % 2 === 0 ? 'auto' : '2.5rem',
                                            right: index % 2 === 0 ? '2.5rem' : 'auto',
                                            zIndex: 10
                                        }}>
                                            <div style={{
                                                padding: '1rem 1.5rem',
                                                background: 'rgba(5,5,5,0.7)',
                                                backdropFilter: 'blur(15px)',
                                                border: '1px solid var(--border-gold)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.25rem'
                                            }}>
                                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.2em' }}>INVESTMENT FROM</span>
                                                <span className="gold-text" style={{
                                                    fontSize: '1.25rem',
                                                    fontWeight: 700,
                                                    fontFamily: 'var(--font-display)'
                                                }}>
                                                    AED {p.price.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </LuxuryReveal>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
               @media (max-width: 1024px) {
                   div[style*="grid-template-columns"] { 
                       grid-template-columns: 1fr !important; 
                       gap: 6rem !important; 
                   }
                   div[style*="order: 2"] { order: 1 !important; }
                   div[style*="order: 1"] { order: 2 !important; }
               }
            `}</style>
        </section>
    );
};

