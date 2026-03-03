'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParallax } from '@/lib/useParallax';
import { useScrollReveal } from '@/lib/useScrollReveal';

const GoldParticles = ({ count = 20 }: { count?: number }) => {
    const particles = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            size: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 10,
            tx: (Math.random() - 0.5) * 200,
            ty: -(Math.random() * 300 + 100),
        }));
    }, [count]);

    return (
        <>
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="gold-particle"
                    style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        left: p.left,
                        top: p.top,
                        '--tw-translate-x': `${p.tx}px`,
                        '--tw-translate-y': `${p.ty}px`,
                        animation: `goldDust ${p.duration}s ease-out ${p.delay}s infinite`,
                        opacity: 0,
                        backgroundColor: 'var(--gold-400)',
                        boxShadow: '0 0 10px var(--gold-300)'
                    } as any}
                />
            ))}
        </>
    );
};

export const HeroSection = () => {
    const { elementRef, isVisible } = useScrollReveal();
    const { getStyle: getHeroStyle } = useParallax({ speed: 0.15, limit: 12000 });
    const { getStyle: getOverlayStyle } = useParallax({ speed: -0.1, limit: 12000 });

    return (
        <section
            ref={elementRef as any}
            className="hero-section"
            style={{
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#000',
            }}
        >
            {/* Layer 1: Cinematic Background */}
            <div style={{
                ...getHeroStyle(),
                position: 'absolute',
                inset: '-10%',
                backgroundImage: 'url("/images/hero/hero-dubai-skyline.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 1,
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8))',
                }} />
            </div>

            {/* Layer 2: Atmospheric Glow */}
            <div style={{
                ...getOverlayStyle(),
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 70%)',
                zIndex: 2,
                pointerEvents: 'none'
            }} />

            {/* Layer 3: Particle System */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
                <GoldParticles count={40} />
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                <div
                    className="perspective-1000"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                        transition: 'all 1s var(--ease-out)'
                    }}
                >
                    <span
                        className="gold-text reveal-mask"
                        style={{
                            display: 'block',
                            fontSize: '0.85rem',
                            letterSpacing: '0.5em',
                            fontWeight: 700,
                            marginBottom: '1.5rem',
                            textTransform: 'uppercase'
                        }}
                    >
                        DUBAI'S PREMIER LUXURY AGENCY
                    </span>
                    <h1
                        className="section-title reveal-mask"
                        style={{
                            fontSize: 'clamp(3.5rem, 9vw, 6.5rem)',
                            color: '#fff',
                            lineHeight: 1.05,
                            marginBottom: '2.5rem',
                            animationDelay: '0.4s',
                            fontWeight: 600
                        }}
                    >
                        Where Dreams<br />
                        <span className="gold-text shimmer-text" style={{ fontWeight: 700 }}>Meet Skylines</span>
                    </h1>

                    <div
                        className="reveal-mask"
                        style={{
                            display: 'flex',
                            gap: '2rem',
                            justifyContent: 'center',
                            animationDelay: '1s'
                        }}
                    >
                        <Link href="/properties" className="btn-primary luxury-glow" style={{ padding: '1.25rem 3.5rem' }}>
                            Explore Portfolio
                            <div className="shimmer-text" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }} />
                        </Link>
                        <Link href="/contact" className="btn-secondary" style={{ padding: '1.25rem 3.5rem' }}>
                            Private Advisory
                        </Link>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '3rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    opacity: isVisible ? 0.6 : 0,
                    transition: 'opacity 1s ease 2s'
                }}
            >
                <div style={{
                    width: '1px',
                    height: '80px',
                    background: 'linear-gradient(to bottom, var(--gold-400), transparent)',
                    animation: 'float 2s infinite'
                }} />
            </div>
        </section>
    );
};
