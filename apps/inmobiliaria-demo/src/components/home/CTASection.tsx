'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookingModal } from '@/components/ui/BookingModal';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { useParallax } from '@/lib/useParallax';

export const CTASection = () => {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const { elementRef, isVisible } = useScrollReveal({ threshold: 0.3 });
    const { getStyle: getParallaxStyle } = useParallax({ speed: 0.1, limit: 12000 });

    return (
        <section
            ref={elementRef as any}
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
                    ...getParallaxStyle(),
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
            <div
                className="rotate-float"
                style={{
                    position: 'absolute', top: '15%', right: '10%', width: '100px', height: '100px',
                    border: '1px solid var(--border-gold)', borderRadius: '24px', opacity: 0.1, zIndex: 2
                }}
            />

            <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <div
                    style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                        transition: 'all 0.8s var(--ease-out)'
                    }}
                >
                    <span className="section-label reveal-mask">READY TO BEGIN</span>
                    <h2
                        className="section-title reveal-mask"
                        style={{
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                            marginBottom: '2rem',
                            color: '#fff',
                            lineHeight: 1.1,
                            animationDelay: '0.2s'
                        }}
                    >
                        Find Your <span className="gold-text shimmer-text">Dream Home</span> in Dubai
                    </h2>
                    <p
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.25rem',
                            marginBottom: '3.5rem',
                            lineHeight: 1.6,
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'all 0.8s var(--ease-out) 0.4s'
                        }}
                    >
                        Experience the pinnacle of luxury living with personalized guidance from our experts.
                    </p>

                    <div
                        style={{
                            display: 'flex',
                            gap: '1.5rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'all 0.8s var(--ease-out) 0.6s'
                        }}
                    >
                        <button
                            onClick={() => setIsBookingOpen(true)}
                            className="btn-primary luxury-glow"
                            style={{ padding: '1.25rem 3.5rem', position: 'relative' }}
                        >
                            Book Consultation
                            <div className="shimmer-text" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }} />
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
                </div>
            </div>
            <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        </section>
    );
};
