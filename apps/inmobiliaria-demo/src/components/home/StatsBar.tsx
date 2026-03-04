'use client';

import React from 'react';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { useScrollReveal } from '../../lib/useScrollReveal';

export const StatsBar = () => {
    const { elementRef, isVisible } = useScrollReveal({ threshold: 0.2 });

    const stats = [
        { label: 'Properties', target: 500, suffix: '+' },
        { label: 'AED Portfolio', target: 12, suffix: 'B+' },
        { label: 'Market Experience', target: 15, suffix: '+ Years' },
        { label: 'Satisfaction Rate', target: 98, suffix: '%' },
    ];

    return (
        <section
            ref={elementRef as any}
            style={{
                marginTop: '-4rem',
                padding: '0 2rem',
                position: 'relative',
                zIndex: 50,
            }}
        >
            <div className="container">
                <div
                    className={`glass-card stats-grid float luxury-glow`}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        gap: '3rem',
                        boxShadow: 'var(--shadow-gold)',
                        border: '1px solid var(--border-gold)'
                    }}
                >
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'scale(1)' : 'scale(0.8)',
                                transition: `all 0.6s var(--ease-out) ${index * 0.15 + 0.2}s`
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--gold-400)' }}>
                                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.2rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsBar;
