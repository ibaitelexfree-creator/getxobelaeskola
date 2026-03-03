'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { useParallax } from '@/lib/useParallax';

const DISTRICTS = [
    {
        id: 'palm',
        name: 'Palm Jumeirah',
        x: '42%', y: '65%',
    },
    {
        id: 'downtown',
        name: 'Downtown Dubai',
        x: '62%', y: '45%',
    },
    {
        id: 'marina',
        name: 'Dubai Marina',
        x: '38%', y: '72%',
    },
    {
        id: 'hills',
        name: 'Dubai Hills',
        x: '58%', y: '60%',
    },
    {
        id: 'creek',
        name: 'Dubai Creek',
        x: '75%', y: '30%',
    },
];

export const DubaiInteractiveMap = () => {
    const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
    const { elementRef, isVisible } = useScrollReveal({ threshold: 0.2 });
    const { getStyle: getDriftStyle } = useParallax({ speed: 0.1, limit: 1500 });

    return (
        <section ref={elementRef as any} className="section" style={{ backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
            <div className="container">
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '4rem',
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'all 0.8s var(--ease-out)'
                    }}
                >
                    <span className="section-label">LUXURY GEOGRAPHY</span>
                    <h2 className="section-title reveal-mask" style={{ animationDelay: '0.2s' }}>Explore Dubai's Elite Districts</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        Interactive cartography of the most sought-after investment destinations in the Middle East.
                    </p>
                </div>

                <div
                    className={`glass-card luxury-glow ${isVisible ? 'is-visible' : ''}`}
                    style={{
                        height: '600px',
                        position: 'relative',
                        background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 100%)',
                        overflow: 'hidden',
                        border: '1px solid var(--border-gold)',
                        boxShadow: 'var(--shadow-gold)',
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'scale(1)' : 'scale(0.95)',
                        transition: 'all 1s var(--ease-out) 0.3s'
                    }}
                >
                    {/* Artistic Sea Background with Parallax Drift */}
                    <div
                        style={{
                            ...getDriftStyle(),
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
                        <path
                            d="M 0 550 Q 200 500 400 520 T 700 450 T 1000 400"
                            fill="none"
                            stroke="var(--gold-900)"
                            strokeWidth="2"
                            opacity="0.3"
                        />

                        {/* District Markers */}
                        {DISTRICTS.map((district, index) => (
                            <g
                                key={district.id}
                                className="marker-group rotate-float"
                                onMouseEnter={() => setActiveDistrict(district.id)}
                                onMouseLeave={() => setActiveDistrict(null)}
                                style={{
                                    cursor: 'pointer',
                                    animationDelay: `${index * 1.2}s`
                                }}
                            >
                                {/* Pulse Animation */}
                                <circle
                                    cx={district.x}
                                    cy={district.y}
                                    r="8"
                                    className="pulse-circle"
                                    fill="var(--gold-400)"
                                />

                                {/* Main Dot */}
                                <circle
                                    cx={district.x}
                                    cy={district.y}
                                    r="4"
                                    fill="var(--gold-400)"
                                    stroke="#fff"
                                    strokeWidth="1.5"
                                />

                                {activeDistrict === district.id && (
                                    <foreignObject
                                        x={district.x}
                                        y={district.y}
                                        width="180"
                                        height="80"
                                        style={{ transform: 'translate(-90px, -90px)', overflow: 'visible' }}
                                    >
                                        <div className="map-tooltip animate-fade-up">
                                            <span style={{ fontSize: '0.65rem', color: 'var(--gold-400)', fontWeight: 700, letterSpacing: '0.1em' }}>DISTRICT</span>
                                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{district.name}</h4>
                                            <Link
                                                href={`/properties?neighborhood=${district.id}`}
                                                style={{ fontSize: '0.75rem', color: 'var(--gold-500)', textDecoration: 'none', marginTop: '0.5rem', display: 'block' }}
                                            >
                                                Explore &rarr;
                                            </Link>
                                        </div>
                                    </foreignObject>
                                )}
                            </g>
                        ))}
                    </svg>

                    {/* Legend / Overlay */}
                    <div
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
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateX(0)' : 'translateX(-40px)',
                            transition: 'all 0.8s var(--ease-out) 1s'
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
                    </div>
                </div>
            </div>

            <style jsx>{`
        .pulse-circle {
          animation: mapPulse 2s infinite;
          opacity: 0.5;
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

        .marker-group:hover .pulse-circle {
            animation-duration: 1s;
        }
      `}</style>
        </section>
    );
};
