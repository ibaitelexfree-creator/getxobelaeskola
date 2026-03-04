'use client';

import React from 'react';
import Link from 'next/link';
import { getFeaturedProperties } from '../../data/properties';
import { PropertyCard } from '../../components/properties/PropertyCard';
import { useScrollReveal } from '../../lib/useScrollReveal';

export const FeaturedProperties = () => {
    const featuredProperties = getFeaturedProperties();
    const { elementRef, isVisible } = useScrollReveal({ threshold: 0.1 });

    return (
        <section ref={elementRef as any} className="section" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Decor Element */}
            <div
                className="rotate-float"
                style={{
                    position: 'absolute', top: '5%', left: '-50px', width: '150px', height: '150px',
                    border: '1px solid var(--border-gold)', borderRadius: '30px', opacity: 0.05, pointerEvents: 'none'
                }}
            />

            <div className="container">
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '4rem',
                        flexWrap: 'wrap',
                        gap: '2rem',
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateX(0)' : 'translateX(-40px)',
                        transition: 'all 0.8s var(--ease-out)'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span className="section-label">FEATURED COLLECTION</span>
                        <h2 className="section-title reveal-mask" style={{ animationDelay: '0.2s' }}>Handpicked Luxury</h2>
                    </div>
                    <Link href="/properties" className="btn-secondary" style={{ padding: '0.75rem 2rem' }}>
                        View All Properties
                    </Link>
                </div>

                <div className="grid-3">
                    {featuredProperties.map((property, index) => (
                        <div
                            key={property.id}
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                                transition: `all 0.7s var(--ease-out) ${index * 0.2 + 0.4}s`
                            }}
                        >
                            <PropertyCard property={property} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
