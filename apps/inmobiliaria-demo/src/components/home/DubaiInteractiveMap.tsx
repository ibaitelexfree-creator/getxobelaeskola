'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import LuxuryReveal from '@/components/ui/LuxuryReveal';
import { motion, AnimatePresence } from 'framer-motion';
import { useParallax } from '@/lib/useParallax';
import { getAssetPath } from '@/lib/constants';

const DISTRICTS = [
    { id: 'palm', name: 'Palm Jumeirah', x: 420, y: 390, info: 'World-famous man-made island' },
    { id: 'downtown', name: 'Downtown Dubai', x: 620, y: 270, info: 'Heart of the city & Burj Khalifa' },
    { id: 'marina', name: 'Dubai Marina', x: 380, y: 432, info: 'High-end waterfront living' },
    { id: 'hills', name: 'Dubai Hills', x: 580, y: 360, info: 'Vibrant green community' },
    { id: 'creek', name: 'Dubai Creek', x: 750, y: 180, info: 'Historic heart of Dubai' },
];

export const DubaiInteractiveMap = () => {
    const [activeDistrict, setActiveDistrict] = useState<typeof DISTRICTS[0] | null>(null);
    const { getStyle: getDriftStyle } = useParallax({ speed: 0.1, limit: 1500 });
    const containerRef = useRef<HTMLDivElement>(null);

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
                    ref={containerRef}
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
                            background: 'radial-gradient(circle at 30% 70%, rgba(212,168,67,0.12) 0%, transparent 70%)',
                            zIndex: 1,
                            pointerEvents: 'none'
                        }}
                    ></div>

                    {/* SVG Map Layer */}
                    <svg
                        viewBox="0 0 1000 600"
                        preserveAspectRatio="xMidYMid slice"
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            zIndex: 2,
                        }}
                    >
                        {/* Define Gradients & Filters */}
                        <defs>
                            <radialGradient id="landGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" stopColor="rgba(212,168,67,0.15)" />
                                <stop offset="100%" stopColor="rgba(212,168,67,0.02)" />
                            </radialGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Dubai Landmass Simulation (Artistic Representation) */}
                        <motion.path
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 2 }}
                            d="M 1000 600 L 0 600 L 0 540 Q 150 510 320 530 T 450 490 T 680 440 T 850 360 T 1000 340 Z"
                            fill="url(#landGradient)"
                            stroke="rgba(212,168,67,0.2)"
                            strokeWidth="1"
                        />

                        {/* Coastline Highlight */}
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 0.4 }}
                            viewport={{ once: true }}
                            transition={{ duration: 2, delay: 0.5 }}
                            d="M 0 540 Q 150 510 320 530 T 450 490 T 680 440 T 850 360 T 1000 340"
                            fill="none"
                            stroke="var(--gold-400)"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                        />

                        {/* Interactive Palm Jumeirah Visual Marker */}
                        <motion.path
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 0.3, scale: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                            d="M 420 395 L 435 440 L 405 440 Z M 420 440 L 420 480"
                            stroke="var(--gold-400)"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />

                        {/* District Nodes */}
                        {DISTRICTS.map((district, index) => (
                            <g
                                key={district.id}
                                onMouseEnter={() => setActiveDistrict(district)}
                                onMouseLeave={() => setActiveDistrict(null)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Ripple Effect */}
                                <circle
                                    cx={district.x}
                                    cy={district.y}
                                    r="12"
                                    fill="var(--gold-400)"
                                    opacity="0.1"
                                >
                                    <animate attributeName="r" from="8" to="24" dur="2s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                                </circle>

                                {/* Main Node */}
                                <motion.circle
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ delay: 1.5 + index * 0.1, duration: 0.5, type: 'spring' }}
                                    cx={district.x}
                                    cy={district.y}
                                    r="6"
                                    fill={activeDistrict?.id === district.id ? "#fff" : "var(--gold-400)"}
                                    stroke="var(--gold-600)"
                                    strokeWidth="2"
                                    style={{ filter: 'drop-shadow(0 0 5px var(--gold-400))' }}
                                />
                            </g>
                        ))}
                    </svg>

                    {/* HTML Tooltips (Outside SVG for better interaction) */}
                    <AnimatePresence>
                        {activeDistrict && (
                            <motion.div
                                key={activeDistrict.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    position: 'absolute',
                                    left: `${(activeDistrict.x / 1000) * 100}%`,
                                    top: `${(activeDistrict.y / 600) * 100}%`,
                                    transform: 'translate(-50%, -120%)',
                                    zIndex: 100,
                                    pointerEvents: 'auto',
                                }}
                            >
                                <Link
                                    href={`/properties?neighborhood=${activeDistrict.id}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div className="map-tooltip">
                                        <span className="tooltip-label">DISTRICT</span>
                                        <h4 className="tooltip-name">{activeDistrict.name}</h4>
                                        <p className="tooltip-info">{activeDistrict.info}</p>
                                        <div className="tooltip-action">
                                            VIEW PROPERTIES <span>&rarr;</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Legend */}
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
                            padding: '1.25rem',
                            borderRadius: 'var(--radius-md)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid var(--border-subtle)',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold-400)', boxShadow: '0 0 10px var(--gold-400)' }}></div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>PREMIUM DISTRICTS</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '20px', height: '1.5px', background: 'var(--gold-900)', opacity: 0.5 }}></div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>STRATEGIC DEVELOPMENTS</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <style jsx>{`
                .map-tooltip {
                    background: rgba(10, 10, 15, 0.95);
                    min-width: 200px;
                    padding: 1.25rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--gold-500);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(212,168,67,0.05);
                    backdrop-filter: blur(15px);
                    text-align: left;
                    position: relative;
                }

                .map-tooltip::after {
                    content: '';
                    position: absolute;
                    bottom: -6px;
                    left: 50%;
                    transform: translateX(-50%) rotate(45deg);
                    width: 12px;
                    height: 12px;
                    background: rgba(10, 10, 15, 0.95);
                    border-right: 1px solid var(--gold-500);
                    border-bottom: 1px solid var(--gold-500);
                }

                .tooltip-label {
                    font-size: 0.6rem;
                    color: var(--gold-400);
                    font-weight: 800;
                    letter-spacing: 0.15em;
                    display: block;
                    margin-bottom: 0.25rem;
                }

                .tooltip-name {
                    margin: 0;
                    font-size: 1.15rem;
                    color: #fff;
                    font-family: var(--font-display);
                }

                .tooltip-info {
                    margin: 0.5rem 0 0.75rem;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    line-height: 1.4;
                }

                .tooltip-action {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--gold-400);
                    letter-spacing: 0.1em;
                    border-top: 1px solid rgba(212,168,67,0.2);
                    padding-top: 0.75rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .tooltip-action span {
                    transition: transform 0.3s ease;
                }

                .map-tooltip:hover .tooltip-action span {
                    transform: translateX(4px);
                }
            `}</style>
        </section>
    );
};
