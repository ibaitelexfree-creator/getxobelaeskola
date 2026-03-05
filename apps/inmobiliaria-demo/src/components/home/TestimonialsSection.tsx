'use client';

import React from 'react';
import { TESTIMONIALS } from '@/data/testimonials';
import LuxuryReveal from '@/components/ui/LuxuryReveal';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import { motion } from 'framer-motion';

export const TestimonialsSection: React.FC = () => {
    // We'll show the first 3 for the home page as per plan
    const displayTestimonials = TESTIMONIALS.slice(0, 3);

    return (
        <section id="testimonials" className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="section-label">Wall of Excellence</span>
                        <LuxuryReveal delay={0.2}>
                            <h2 className="section-title">What Our <span className="gold-text">Distinguished</span> Clients Say</h2>
                        </LuxuryReveal>
                        <div className="divider" style={{ margin: '1.5rem auto' }}></div>
                    </motion.div>
                </div>

                <StaggerContainer delay={0.4}>
                    <div className="grid-3">
                        {displayTestimonials.map((testimonial, index) => (
                            <StaggerItem key={testimonial.id}>
                                <div
                                    className="glass-card luxury-glow"
                                    style={{
                                        padding: '2.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1.5rem',
                                        border: '1px solid var(--border-subtle)',
                                        position: 'relative',
                                        height: '100%'
                                    }}
                                >
                                    {/* Quote Icon */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '1.5rem',
                                        right: '2rem',
                                        fontSize: '3rem',
                                        opacity: 0.1,
                                        color: 'var(--gold-400)',
                                        fontFamily: 'var(--font-display)',
                                        lineHeight: 1
                                    }}>
                                        &ldquo;
                                    </div>

                                    <p style={{
                                        fontStyle: 'italic',
                                        color: 'var(--text-secondary)',
                                        fontSize: '1.05rem',
                                        lineHeight: 1.8,
                                        position: 'relative',
                                        zIndex: 1
                                    }}>
                                        &quot;{testimonial.text}&quot;
                                    </p>

                                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: '2px solid var(--border-gold)',
                                            background: 'var(--bg-elevated)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold-400)' }}>
                                                {testimonial.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{testimonial.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--gold-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {testimonial.title}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {testimonial.nationality} &bull; {testimonial.propertyPurchased}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </div>
                </StaggerContainer>
            </div>
        </section>
    );
};
