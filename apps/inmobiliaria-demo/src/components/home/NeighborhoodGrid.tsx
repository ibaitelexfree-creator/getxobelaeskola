'use client';

import React from 'react';
import Link from 'next/link';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { Badge } from '@/components/ui/Badge';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import LuxuryReveal from '@/components/ui/LuxuryReveal';

import { getAssetPath } from '@/lib/constants';

export const NeighborhoodGrid = () => {
    return (
        <section id="neighborhoods" className="section" style={{ backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <LuxuryReveal>
                        <span className="section-label">NEIGHBORHOODS</span>
                    </LuxuryReveal>
                    <LuxuryReveal delay={0.2}>
                        <h2 className="section-title">The Most Exclusive Postcodes</h2>
                    </LuxuryReveal>
                </div>

                <StaggerContainer
                    className="asymmetric-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gridAutoRows: '340px',
                        gap: '1.5rem',
                    }}
                >
                    {NEIGHBORHOODS.map((neighborhood, index) => (
                        <StaggerItem
                            key={neighborhood.id}
                            style={{
                                gridColumn: index === 0 ? 'span 2' : 'span 1',
                                gridRow: index === 0 ? 'span 2' : 'span 1',
                            }}
                        >
                            <Link
                                href={`/properties?neighborhood=${neighborhood.slug}`}
                                style={{
                                    textDecoration: 'none',
                                    position: 'relative',
                                    borderRadius: 'var(--radius-lg)',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    display: 'block',
                                    height: '100%',
                                    width: '100%'
                                }}
                                className="neighborhood-card perspective-1000"
                            >
                                <img
                                    src={getAssetPath(neighborhood.image)}
                                    alt={neighborhood.name}
                                    className="bg-image luxury-glow"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.8s var(--ease-out)',
                                        zIndex: 0
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.8))',
                                        zIndex: 1
                                    }}
                                ></div>

                                <div
                                    className="card-info"
                                    style={{
                                        position: 'absolute',
                                        bottom: '2rem',
                                        left: '2rem',
                                        right: '2rem',
                                        zIndex: 10,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#fff', margin: 0 }}>
                                            {neighborhood.name}
                                        </h3>
                                        <Badge variant="gold" style={{ fontSize: '0.65rem' }}>{neighborhood.propertyCount} Properties</Badge>
                                    </div>
                                    <span className="explore-text">Explore Area &rarr;</span>
                                </div>
                            </Link>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
            <style jsx>{`
                .neighborhood-card {
                    transition: transform 0.6s var(--ease-out) !important;
                }
                .neighborhood-card:hover {
                    transform: rotateX(4deg) rotateY(-4deg) translateY(-8px) scale(1.02) !important;
                    z-index: 20;
                }
                .neighborhood-card:hover .bg-image {
                    transform: scale(1.1);
                }
                .explore-text {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--gold-400);
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.4s ease;
                }
                .neighborhood-card:hover .explore-text {
                    opacity: 1;
                    transform: translateX(0);
                }

                @media (max-width: 1024px) {
                  .asymmetric-grid { 
                    grid-template-columns: repeat(2, 1fr) !important;
                  }
                  .neighborhood-card:nth-of-type(1) { grid-column: span 1 !important; grid-row: span 1 !important; }
                }
                @media (max-width: 640px) {
                  .asymmetric-grid { 
                    grid-template-columns: 1fr !important;
                    grid-auto-rows: 280px !important;
                  }
                }
            `}</style>
        </section>
    );
};

export default NeighborhoodGrid;

