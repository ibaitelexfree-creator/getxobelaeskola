'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyMapSection } from '@/components/properties/PropertyMapSection';
import { BookingModal } from '@/components/ui/BookingModal';
import { formatPrice, formatSqft } from '@/lib/utils';
import { getAssetPath } from '@/lib/constants';
import { Property } from '@/data/properties';
import { Magnetic } from '@/components/ui/Magnetic';
import { useScrollReveal } from '@/lib/useScrollReveal';

interface PropertyDetailClientProps {
    property: Property;
    similarProperties: Property[];
    formattedPrice: string;
}

export const PropertyDetailClient: React.FC<PropertyDetailClientProps> = ({
    property,
    similarProperties,
    formattedPrice
}) => {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <main style={{ paddingTop: '120px', paddingBottom: '8rem', backgroundColor: '#050505' }}>
            <div className="container">
                {/* Gallery Header - Cinematic Reveal */}
                <div
                    className="perspective-2000"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 2fr) 1fr',
                        gap: '1.5rem',
                        height: '700px',
                        marginBottom: '4rem',
                        opacity: 0,
                        animation: 'reveal-3d 1.2s var(--ease-rev) forwards'
                    }}
                >
                    <div style={{
                        position: 'relative',
                        height: '100%',
                        overflow: 'hidden',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{
                            height: '100%',
                            width: '100%',
                            animation: 'ken-burns 20s infinite alternate'
                        }}>
                            <img
                                src={getAssetPath(property.mainImage)}
                                alt={property.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)',
                            pointerEvents: 'none'
                        }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {property.gallery.slice(1, 3).map((img, idx) => (
                            <div
                                key={idx}
                                style={{
                                    position: 'relative',
                                    height: 'calc(50% - 0.75rem)',
                                    overflow: 'hidden',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border-subtle)',
                                    opacity: 0,
                                    animation: `reveal-3d 1s var(--ease-rev) forwards ${0.2 + idx * 0.2}s`
                                }}
                            >
                                <img
                                    src={getAssetPath(img)}
                                    alt={`${property.name} gallery ${idx + 2}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 1.5s var(--ease-rev)'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                />
                                <div className="luxury-sweep" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '6rem' }}>
                    {/* Main Content */}
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3.5rem' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    opacity: 0,
                                    animation: 'reveal-mask 0.8s var(--ease-rev) forwards'
                                }}
                            >
                                <Badge variant="gold" style={{ letterSpacing: '0.2rem', fontWeight: 700 }}>{property.type.toUpperCase()}</Badge>
                                <Badge variant="green" style={{ letterSpacing: '0.1rem' }}>RESIDENTIAL ELITE</Badge>
                            </div>

                            <div className="reveal-mask">
                                <h1
                                    className="reveal-mask-inner"
                                    style={{
                                        fontSize: '4.5rem',
                                        fontFamily: 'var(--font-display)',
                                        lineHeight: 1.1,
                                        color: '#fff',
                                        fontWeight: 400
                                    }}
                                >
                                    {property.name}
                                </h1>
                            </div>

                            <p
                                className="shimmer-text"
                                style={{
                                    fontSize: '1.4rem',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 300,
                                    letterSpacing: '0.05rem',
                                    opacity: 0,
                                    animation: 'fade-in 1s ease forwards 0.6s'
                                }}
                            >
                                {property.neighborhood}, Dubai
                            </p>
                        </div>

                        <div className="divider" style={{ opacity: 0.2, margin: '3rem 0' }}></div>

                        <section style={{ marginBottom: '5rem' }}>
                            <div className="reveal-mask" style={{ marginBottom: '2rem' }}>
                                <h2 className="reveal-mask-inner section-title" style={{ fontSize: '1.8rem' }}>Architectural Overview</h2>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: '2px',
                                    backgroundColor: 'var(--border-subtle)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-lg)',
                                    overflow: 'hidden'
                                }}
                            >
                                {[
                                    { icon: '🛏', value: property.bedrooms, label: 'Suites' },
                                    { icon: '🚿', value: property.bathrooms, label: 'Bathrooms' },
                                    { icon: '📐', value: property.sqft.toLocaleString('en-US'), label: 'Total Sq Ft' },
                                    { icon: '📅', value: property.yearBuilt, label: 'Built Year' }
                                ].map((stat, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            backgroundColor: '#0a0a0a',
                                            padding: '3rem 2rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            transition: 'background-color 0.4s ease'
                                        }}
                                        className="luxury-glow-hover"
                                    >
                                        <span style={{ fontSize: '2rem', opacity: 0.7 }}>{stat.icon}</span>
                                        <span style={{ fontSize: '1.8rem', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)' }}>{stat.value}</span>
                                        <span style={{ fontSize: '0.75rem', letterSpacing: '0.2rem', color: 'var(--gold-500)', fontWeight: 700, textTransform: 'uppercase' }}>{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section style={{ marginBottom: '5rem' }}>
                            <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>The Experience</h2>
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '1.25rem',
                                lineHeight: 1.9,
                                fontWeight: 300,
                                maxWidth: '90%'
                            }}>
                                {property.description}
                            </p>
                        </section>

                        <section style={{ marginBottom: '5rem' }}>
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '2.5rem', fontFamily: 'var(--font-display)', color: '#fff' }}>Amenities & Features</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                {property.amenities.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.2rem',
                                            color: '#eee',
                                            padding: '1.2rem',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid transparent',
                                            transition: 'all 0.4s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--gold-900)';
                                            e.currentTarget.style.backgroundColor = 'rgba(212,168,67,0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'transparent';
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                                        }}
                                    >
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            backgroundColor: 'var(--gold-500)',
                                            borderRadius: '50%',
                                            boxShadow: '0 0 10px var(--gold-500)'
                                        }} />
                                        <span style={{ fontSize: '1.1rem', fontWeight: 300 }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <PropertyMapSection neighborhood={property.neighborhood} name={property.name} />
                    </div>

                    {/* Sticky Sidebar - Refined Luxury */}
                    <aside style={{ height: 'fit-content', position: 'sticky', top: '140px' }}>
                        <div
                            style={{
                                padding: '3.5rem',
                                backgroundColor: '#0a0a0a',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-lg)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div className="luxury-sweep" style={{ opacity: 0.1 }} />

                            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                                <span style={{ color: 'var(--gold-500)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.3rem' }}>INVESTMENT VALUE</span>
                                <div
                                    className="shimmer-text"
                                    style={{
                                        fontSize: '2.5rem',
                                        color: '#fff',
                                        marginTop: '1rem',
                                        fontFamily: 'var(--font-display)',
                                        fontWeight: 800
                                    }}
                                >
                                    {formattedPrice}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <Magnetic distance={30}>
                                    <button
                                        className="btn-primary"
                                        style={{
                                            width: '100%',
                                            padding: '1.8rem',
                                            fontSize: '1.1rem',
                                            letterSpacing: '0.2rem',
                                            fontWeight: 700
                                        }}
                                        onClick={() => setIsBookingOpen(true)}
                                    >
                                        SCHEDULE VIEWING
                                    </button>
                                </Magnetic>

                                <Magnetic distance={20}>
                                    <button
                                        className="btn-secondary"
                                        style={{
                                            width: '100%',
                                            padding: '1.5rem',
                                            fontSize: '1rem',
                                            letterSpacing: '0.15rem',
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--border-gold)',
                                            color: 'var(--gold-400)'
                                        }}
                                        onClick={() => {
                                            const chatBtn = document.querySelector('.chat-toggle') as HTMLButtonElement;
                                            if (chatBtn) chatBtn.click();
                                        }}
                                    >
                                        SPEAK WITH ADVISOR
                                    </button>
                                </Magnetic>
                            </div>

                            <div style={{
                                marginTop: '3.5rem',
                                paddingTop: '3.5rem',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                textAlign: 'center'
                            }}>
                                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        width: '85px',
                                        height: '85px',
                                        borderRadius: '50%',
                                        padding: '4px',
                                        background: 'linear-gradient(45deg, var(--gold-600), transparent, var(--gold-400))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            backgroundColor: '#050505',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.8rem',
                                            color: 'var(--gold-400)',
                                            fontWeight: 300
                                        }}>
                                            AH
                                        </div>
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '2px',
                                        right: '2px',
                                        width: '15px',
                                        height: '15px',
                                        backgroundColor: '#22c55e',
                                        borderRadius: '50%',
                                        border: '2px solid #0a0a0a'
                                    }} />
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>Aisha Al-Hashimi</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gold-500)', letterSpacing: '0.15rem', marginTop: '0.3rem' }}>VIP PORTFOLIO MANAGER</div>

                                <p style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--text-muted)',
                                    fontStyle: 'italic',
                                    marginTop: '1.5rem',
                                    lineHeight: 1.6
                                }}>
                                    "This property matches your profile's preference for architectural purity and capital appreciation."
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Similar Properties */}
                {similarProperties.length > 0 && (
                    <section style={{ marginTop: '10rem' }}>
                        <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
                            <span className="section-label" style={{ letterSpacing: '0.4rem' }}>EXCERPTS</span>
                            <h2 className="section-title" style={{ fontSize: '2.5rem', marginTop: '1rem' }}>Comparable Estates</h2>
                        </div>
                        <div className="grid-3" style={{ gap: '2.5rem' }}>
                            {similarProperties.map((p, i) => (
                                <PropertyCard key={p.id} property={p} index={i} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                propertyName={property.name}
            />

            <style jsx>{`
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }
                .perspective-2000 {
                    perspective: 2000px;
                }
                @keyframes reveal-3d {
                    from { 
                        opacity: 0; 
                        transform: translateY(100px) rotateX(-15deg); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) rotateX(0); 
                    }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .luxury-glow-hover:hover {
                    background-color: #111 !important;
                    box-shadow: inset 0 0 30px rgba(212,168,67,0.1);
                }
            `}</style>
        </main>
    );
};
