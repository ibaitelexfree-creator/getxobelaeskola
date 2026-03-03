'use client';

import React from 'react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import { motion } from 'framer-motion';

export const StatsBar = () => {
    const stats = [
        { label: 'Properties', target: 500, suffix: '+' },
        { label: 'AED Portfolio', target: 12, suffix: 'B+' },
        { label: 'Market Experience', target: 15, suffix: '+ Years' },
        { label: 'Satisfaction Rate', target: 98, suffix: '%' },
    ];

    return (
        <section
            style={{
                marginTop: '-4rem',
                padding: '0 2rem',
                position: 'relative',
                zIndex: 50,
            }}
        >
            <div className="container">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-card stats-grid float luxury-glow"
                    style={{
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-gold)',
                        border: '1px solid var(--border-gold)'
                    }}
                >
                    <StaggerContainer delay={0.3}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', width: '100%' }}>
                            {stats.map((stat) => (
                                <StaggerItem key={stat.label}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--gold-400)' }}>
                                            <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                                        </div>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.2rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                            {stat.label}
                                        </span>
                                    </div>
                                </StaggerItem>
                            ))}
                        </div>
                    </StaggerContainer>
                </motion.div>
            </div>
        </section>
    );
};

export default StatsBar;
