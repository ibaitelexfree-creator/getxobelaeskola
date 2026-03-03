'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LuxuryReveal from '@/components/ui/LuxuryReveal';
import { motion, AnimatePresence } from 'framer-motion';
import { useParallax } from '@/lib/useParallax';

const DISTRICTS = [
    { id: 'palm', name: 'Palm Jumeirah', x: 420, y: 390 },
    { id: 'downtown', name: 'Downtown Dubai', x: 620, y: 270 },
    { id: 'marina', name: 'Dubai Marina', x: 380, y: 432 },
    { id: 'hills', name: 'Dubai Hills', x: 580, y: 360 },
    { id: 'creek', name: 'Dubai Creek', x: 750, y: 180 },
];

export const DubaiInteractiveMap = () => {
    const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
    const { getStyle: getDriftStyle } = useParallax({ speed: 0.1, limit: 1500 });

    return (
        <section className="section" style={{ backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <LuxuryReveal delay={0.1}>
                        <span className="section-label">LUXURY GEOGRAPHY</span>
                    </LuxuryReveal>
                    <LuxuryReveal delay={0.3}>
                        <h2 className="section-title">Explore Dubai's Elite Districts</h2>
                    </LuxuryReveal>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '1rem auto 0' }}
                    >
                        Interactive cartography of the most sought-after investment destinations in the Middle East.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                    className="glass-card luxury-glow"
                    style={{
                        height: '600px',
                        position: 'relative',
                        background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 100%)',
                        overflow: 'hidden',
                        border: '1px solid var(--border-gold)',
                        boxShadow: 'var(--shadow-gold)',
                    }}
                >
                    {/* Artistic Sea Background with Parallax Drift */}
                    <div
                        style={{
                            ...getDriftStyle() as any,
                            position: 'absolute',
                            top: '-10%',
                            left: '-10%',
                            width: '120%',
                            height: '120%',
                            background: 'radial-gradient(circle at 30% 70%, rgba(212,168,67,0.08) 0%, transparent 70%)',
                            zIndex: 1,
                            pointerEvents: 'none'
                        }}
                    ></div>

                    {/* Floating SVG Map Wrapper */}
                    <svg
                        viewBox="0 0 1000 600"
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            zIndex: 2,
                            filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))'
                        }}
                    >
                        {/* Coastline Path */}
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 0.3 }}
                            viewport={{ once: true }}
                            transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                            d="M 0 550 Q 200 500 400 520 T 700 450 T 1000 400"
                            fill="none"
                            stroke="var(--gold-900)"
                            strokeWidth="2"
                        />

                        {/* District Markers */}
                        {DISTRICTS.map((district, index) => (
                            <g
                                key={district.id}
                                className="marker-group"
                                onMouseEnter={() => setActiveDistrict(district.id)}
                                onMouseLeave={() => setActiveDistrict(null)}
                                style={{ cursor: 'pointer' }}
                            >
                                <motion.circle
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 1.5 + index * 0.1, duration: 0.5 }}
                                    cx={district.x}
                                    cy={district.y}
                                    r="8"
                                    className="pulse-circle"
                                    fill="var(--gold-400)"
                                />
                                <motion.circle
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 1.6 + index * 0.1, duration: 0.3 }}
                                    cx={district.x}
                                    cy={district.y}
                                    r="4"
                                    fill="var(--gold-400)"
                                    stroke="#fff"
                                    strokeWidth="1.5"
                                />

                                <AnimatePresence>
                                    {activeDistrict === district.id && (
                                        <foreignObject
                                            x={district.x}
                                            y={district.y}
                                            width="180"
                                            height="100"
                                            style={{ transform: 'translate(-90px, -110px)', overflow: 'visible' }}
                                        >
                                            <Link href={`/properties?neighborhood=${district.id}`} style={{ textDecoration: 'none' }}>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                    className="map-tooltip"
                                                >
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--gold-400)', fontWeight: 700, letterSpacing: '0.1em' }}>DISTRICT</span>
                                                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{district.name}</h4>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-500)', marginTop: '0.5rem', display: 'block' }}>
                                                        Explore &rarr;
                                                    </span>
                                                </motion.div>
                                            </Link>
                                        </foreignObject>
                                    )}
                                </AnimatePresence>
                            </g>
                        ))}
                    </svg>

                    {/* Legend / Overlay */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 2, duration: 0.8 }}
                        style={{
                            position: 'absolute',
                            left: '2rem',
                            bottom: '2rem',
                            zIndex: 10,
                            backgroundColor: 'rgba(10,10,15,0.8)',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-md)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--border-subtle)',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold-400)', boxShadow: '0 0 10px var(--gold-400)' }}></div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Premium Neighborhoods</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '20px', height: '2px', background: 'var(--gold-900)', opacity: 0.5 }}></div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Emaar/Nakheel Projects</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <style jsx>{`
                .pulse-circle {
                    animation: mapPulse 2s infinite;
                }

                @keyframes mapPulse {
                    0% { r: 8; opacity: 0.5; }
                    70% { r: 25; opacity: 0; }
                    100% { r: 25; opacity: 0; }
                }

                .map-tooltip {
                    background: rgba(17, 17, 24, 0.95);
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--gold-500);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    backdrop-filter: blur(10px);
                    text-align: center;
                }
            `}</style>
        </section>
    );
};
