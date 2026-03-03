'use client';

import React from 'react';

interface PropertyMapSectionProps {
    neighborhood: string;
    name: string;
}

export const PropertyMapSection: React.FC<PropertyMapSectionProps> = ({ neighborhood, name }) => {
    // Artistic map representation for a specific location
    const highlights = [
        { label: 'Burj Khalifa', dist: '12 mins' },
        { label: 'Dubai Marina', dist: '18 mins' },
        { label: 'DXB Airport', dist: '25 mins' },
        { label: 'Beach Access', dist: '5 mins' },
    ];

    return (
        <section style={{ marginTop: '6rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <span className="section-label">LOCATION & CONNECTIVITY</span>
                <h2 className="section-title" style={{ fontSize: '2rem' }}>Privileged Address</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Nested within the heart of {neighborhood}, offering unparalleled access to Dubai's landmarks.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                <div
                    className="glass-card"
                    style={{
                        height: '450px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #0f0f15 0%, #050508 100%)',
                        border: '1px solid var(--border-gold)',
                        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
                    }}
                >
                    {/* Main Map Background */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '200%',
                            height: '200%',
                            transform: 'translate(-50%, -50%)',
                            background: 'radial-gradient(circle, rgba(212,168,67,0.05) 0%, transparent 60%)',
                            opacity: 0.5
                        }}
                    ></div>

                    {/* Grid Lines */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                            opacity: 0.05
                        }}
                    ></div>

                    {/* Property Marker */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            zIndex: 10
                        }}
                    >
                        <div
                            style={{
                                width: '24px',
                                height: '24px',
                                backgroundColor: 'var(--gold-500)',
                                borderRadius: '50%',
                                border: '4px solid #fff',
                                boxShadow: '0 0 20px var(--gold-500)',
                                animation: 'markerPulse 2s infinite'
                            }}
                        ></div>
                        <div
                            style={{
                                marginTop: '1rem',
                                backgroundColor: 'rgba(212,168,67,0.1)',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--gold-500)',
                                backdropFilter: 'blur(10px)',
                                whiteSpace: 'nowrap',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#fff',
                                letterSpacing: '0.05em'
                            }}
                        >
                            {name.toUpperCase()}
                        </div>
                    </div>

                    {/* Compass / Branding */}
                    <div style={{ position: 'absolute', top: '2rem', right: '2rem', textAlign: 'right', opacity: 0.4 }}>
                        <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', fontWeight: 700, color: 'var(--gold-400)' }}>EXCLUSIVITY MAP</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 300, color: 'var(--text-muted)' }}>25.1972° N, 55.2744° E</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div
                        className="glass-card"
                        style={{
                            padding: '2rem',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '2rem'
                        }}
                    >
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--gold-400)', margin: 0 }}>Proximity Dashboard</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {highlights.map((h) => (
                                <div key={h.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em' }}>{h.label.toUpperCase()}</span>
                                    <span style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{h.dist}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                This prime location ensures that the best of Dubai is always within reach while maintaining a sanctuary of absolute tranquility.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes markerPulse {
          0% { box-shadow: 0 0 0 0 rgba(212, 168, 67, 0.7); }
          70% { box-shadow: 0 0 0 20px rgba(212, 168, 67, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 168, 67, 0); }
        }
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: 1.5fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </section>
    );
};
