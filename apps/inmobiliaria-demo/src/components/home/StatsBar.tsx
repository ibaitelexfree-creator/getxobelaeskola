'use client';

import React from 'react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import { motion } from 'framer-motion';
import { useCurrency } from '@/components/providers/CurrencyProvider';

export const StatsBar = () => {
    const { currentCurrency, convert } = useCurrency();

    // Convert 12B AED to current currency
    const portfolioValue = convert(12); // Using 12 as the base for Billions
    const currencySuffix = currentCurrency.code === 'AED' ? 'B+' : ` ${currentCurrency.symbol}${portfolioValue.toFixed(1)}B+`;
    const label = currentCurrency.code === 'AED' ? 'AED Portfolio' : `${currentCurrency.code} Portfolio`;

    const stats = [
        { label: 'Properties', target: 500, suffix: '+' },
        { label: label, target: currentCurrency.code === 'AED' ? 12 : parseFloat(portfolioValue.toFixed(2)), suffix: currentCurrency.code === 'AED' ? 'B+' : 'B+' },
        { label: 'Market Experience', target: 15, suffix: '+ Years' },
        { label: 'Satisfaction Rate', target: 98, suffix: '%' },
    ];

    return (
        <section
            style={{
                marginTop: '-5rem',
                padding: '0 2rem',
                position: 'relative',
                zIndex: 100,
            }}
        >
            <div className="container">
                <motion.div
                    initial={{ y: 60, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                >
                    {/* Futuristic Glow Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4a843]/10 to-transparent blur-3xl opacity-50" />

                    <div
                        className="glass-card relative overflow-hidden backdrop-blur-3xl"
                        style={{
                            padding: '4rem 3rem',
                            textAlign: 'center',
                            borderRadius: '4rem',
                            border: '1px solid rgba(212, 168, 67, 0.15)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 168, 67, 0.05)',
                            background: 'linear-gradient(135deg, rgba(22, 22, 31, 0.7) 0%, rgba(10, 10, 15, 0.9) 100%)',
                        }}
                    >
                        {/* Decorative HUD-style corners */}
                        <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-[#d4a843]/30 rounded-tl-2xl" />
                        <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-[#d4a843]/30 rounded-tr-2xl" />
                        <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-[#d4a843]/30 rounded-bl-2xl" />
                        <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-[#d4a843]/30 rounded-br-2xl" />

                        <StaggerContainer delay={0.3}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-4 relative z-10">
                                {stats.map((stat, idx) => (
                                    <StaggerItem key={stat.label}>
                                        <div
                                            className="group px-6 py-2 border-r last:border-r-0 border-white/5 md:border-none lg:border-r"
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.75rem',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div
                                                className="shimmer-text"
                                                style={{
                                                    fontSize: '3.2rem',
                                                    fontWeight: 800,
                                                    fontFamily: 'var(--font-display)',
                                                    color: '#fff',
                                                    lineHeight: 1,
                                                    letterSpacing: '-0.02em'
                                                }}
                                            >
                                                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span
                                                    className="text-[10px] uppercase tracking-[0.4em] font-black text-[#d4a843]"
                                                    style={{ opacity: 0.8 }}
                                                >
                                                    {stat.label}
                                                </span>
                                                <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#d4a843]/40 to-transparent mt-3 group-hover:w-20 transition-all duration-700" />
                                            </div>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </div>
                        </StaggerContainer>

                        {/* Scanline Sweep Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent h-[200%] w-full animate-scanline pointer-events-none" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default StatsBar;
