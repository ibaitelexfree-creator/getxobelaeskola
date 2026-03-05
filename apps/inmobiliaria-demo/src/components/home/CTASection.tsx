'use client';

import React, { useState } from 'react';
import { BookingModal } from '@/components/ui/BookingModal';
import LuxuryReveal from '@/components/ui/LuxuryReveal';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import { motion } from 'framer-motion';
import { useParallax } from '@/lib/useParallax';

export const CTASection = () => {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const { getStyle: getParallaxStyle } = useParallax({ speed: 0.1, limit: 12000 });

    return (
        <section
            className="section"
            style={{
                padding: '10rem 0',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#07070a'
            }}
        >
            {/* Parallax Layer */}
            <div
                style={{
                    ...getParallaxStyle() as any,
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '120%',
                    height: '120%',
                    background: 'radial-gradient(circle at 70% 30%, rgba(212,168,67,0.06) 0%, transparent 60%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}
            ></div>

            {/* Decorative Floating Icon */}
            <motion.div
                initial={{ rotate: 0, opacity: 0 }}
                whileInView={{ rotate: 360, opacity: 0.1 }}
                viewport={{ once: true }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute', top: '15%', right: '10%', width: '100px', height: '100px',
                    border: '1px solid var(--border-gold)', borderRadius: '24px', zIndex: 2
                }}
            />

            <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <div
                    style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                    }}
                >
                    <LuxuryReveal delay={0.1}>
                        <span className="section-label" style={{ display: 'block', marginBottom: '1rem' }}>READY TO BEGIN</span>
                    </LuxuryReveal>

                    <LuxuryReveal delay={0.3}>
                        <h2
                            className="section-title"
                            style={{
                                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                                marginBottom: '2rem',
                                color: '#fff',
                                lineHeight: 1.1,
                                margin: '0 0 2rem 0'
                            }}
                        >
                            Find Your <span className="gold-text">Dream Home</span> in Dubai
                        </h2>
                    </LuxuryReveal>

                    <StaggerContainer delay={0.6}>
                        <StaggerItem>
                            <p
                                style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '1.25rem',
                                    marginBottom: '3.5rem',
                                    lineHeight: 1.6,
                                }}
                            >
                                Experience the pinnacle of luxury living with personalized guidance from our experts.
                            </p>
                        </StaggerItem>

                        <StaggerItem>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '1.5rem',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <button
                                    onClick={() => setIsBookingOpen(true)}
                                    className="btn-primary luxury-glow"
                                    style={{ padding: '1.25rem 3.5rem', position: 'relative', overflow: 'hidden' }}
                                >
                                    Book Consultation
                                    <div className="shimmer-text" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
                                </button>
                                <button
                                    onClick={() => {
                                        const chatBtn = document.querySelector('.chat-toggle') as HTMLButtonElement;
                                        if (chatBtn) chatBtn.click();
                                    }}
                                    className="btn-secondary"
                                    style={{ padding: '1.25rem 3.5rem' }}
                                >
                                    Talk to Aisha
                                </button>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </div>
            <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        </section>
    );
};
