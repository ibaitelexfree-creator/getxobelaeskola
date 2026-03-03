'use client';

import React, { useState } from 'react';

interface PropertyMapSectionProps {
    neighborhood: string;
    name: string;
}

export const PropertyMapSection: React.FC<PropertyMapSectionProps> = ({ neighborhood, name }) => {
    const [isHovered, setIsHovered] = useState(false);

    const highlights = [
        { label: 'Burj Khalifa', dist: '14 mins', icon: '🏙️' },
        { label: 'Dubai Marina', dist: '18 mins', icon: '🚤' },
        { label: 'DXB International', dist: '25 mins', icon: '✈️' },
        { label: 'Palm Jumeirah', dist: '10 mins', icon: '🌴' },
    ];

    return (
        <section style={{ marginTop: '10rem' }}>
            <div style={{ marginBottom: '4rem' }}>
                <span className="section-label" style={{ letterSpacing: '0.4rem' }}>GEOGRAPHIC POSITION</span>
                <div className="reveal-mask" style={{ marginTop: '1rem' }}>
                    <h2 className="reveal-mask-inner section-title" style={{ fontSize: '2.5rem' }}>Strategic Connection</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 300, marginTop: '1rem' }}>
                    Situated at the epicenter of Dubai's vertical expansion in {neighborhood}.
                </p>
            </div>

            <div className="perspective-2000" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '3rem' }}>
                {/* Interactive Map Visual */}
                <div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        height: '550px',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, #0a0a0c 0%, #020205 100%)',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: isHovered ? '0 50px 100px rgba(0,0,0,0.9)' : '0 20px 50px rgba(0,0,0,0.5)',
                        transition: 'all 0.8s var(--ease-rev)',
                        transform: isHovered ? 'translateY(-10px) rotateX(2deg)' : 'translateY(0) rotateX(0)'
                    }}
                >
                    {/* Atmospheric Glow */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '300%',
                            height: '300%',
                            transform: 'translate(-50%, -50%)',
                            background: 'radial-gradient(circle at center, rgba(212,168,67,0.08) 0%, transparent 50%)',
                            opacity: isHovered ? 1 : 0.6,
                            transition: 'opacity 0.8s ease'
                        }}
                    ></div>

                    {/* Fine Grid System */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'linear-gradient(rgba(212,168,67,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.03) 1px, transparent 1px)',
                            backgroundSize: '30px 30px',
                            mixBlendMode: 'screen'
                        }}
                    ></div>

                    {/* Radar Circles */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{
                                width: `${i * 300}px`,
                                height: `${i * 300}px`,
                                border: '1px solid rgba(212,168,67,0.05)',
                                borderRadius: '50%',
                                position: 'absolute',
                                transform: 'translate(-50%, -50%)',
                                opacity: 1 - i * 0.2
                            }} />
                        ))}
                    </div>

                    {/* Property Pulse Marker */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '45%',
                            left: '55%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 20
                        }}
                    >
                        <div style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: 'transparent',
                            border: '2px solid var(--gold-500)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                backgroundColor: 'var(--gold-400)',
                                borderRadius: '50%',
                                boxShadow: '0 0 20px var(--gold-400)'
                            }} />
                            <div className="pulse-slow" style={{
                                position: 'absolute',
                                inset: -15,
                                border: '1px solid var(--gold-500)',
                                borderRadius: '50%',
                                opacity: 0,
                                animation: 'markerPulse 3s infinite'
                            }} />
                        </div>

                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginTop: '1.5rem',
                            whiteSpace: 'nowrap',
                            textAlign: 'center'
                        }}>
                            <span className="shimmer-text" style={{
                                display: 'block',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                letterSpacing: '0.2rem',
                                color: '#fff'
                            }}>
                                {name.toUpperCase()}
                            </span>
                            <span style={{ fontSize: '0.6rem', color: 'var(--gold-600)', letterSpacing: '0.1rem' }}>EXACT COORDINATES FIXED</span>
                        </div>
                    </div>

                    {/* Landmark Nodes */}
                    {[
                        { top: '30%', left: '20%', label: 'Downtown' },
                        { top: '70%', left: '40%', label: 'Sea Front' },
                        { top: '20%', left: '80%', label: 'Airport' }
                    ].map((node, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            top: node.top,
                            left: node.left,
                            opacity: 0.3
                        }}>
                            <div style={{ width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.6rem', color: '#fff', marginLeft: '0.5rem', fontWeight: 300 }}>{node.label}</span>
                        </div>
                    ))}

                    {/* Luxury Overlay */}
                    <div className="luxury-sweep" style={{ opacity: 0.05 }} />
                </div>

                {/* Dashboard Side */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div
                        style={{
                            padding: '3.5rem',
                            backgroundColor: '#0a0a0a',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-subtle)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div>
                            <h3 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.6rem',
                                color: '#fff',
                                marginBottom: '2.5rem',
                                borderLeft: '3px solid var(--gold-500)',
                                paddingLeft: '1.5rem'
                            }}>
                                Proximity Metrics
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {highlights.map((h, i) => (
                                    <div
                                        key={h.label}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            opacity: 0,
                                            animation: `fade-in 0.8s ease forwards ${0.3 + i * 0.15}s`
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ fontSize: '1.2rem' }}>{h.icon}</span>
                                            <div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--gold-600)', fontWeight: 800, letterSpacing: '0.15rem' }}>{h.label.toUpperCase()}</div>
                                                <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 400 }}>Reference Landmark</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.4rem', color: 'var(--gold-400)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{h.dist}</div>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>AV. TRAFFIC</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '3rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <p>This masterplan layout integrates seamlessly with Dubai's transport hubs, ensuring global mobility is just moments away.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes markerPulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </section>
    );
};
