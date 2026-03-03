'use client';

import React from 'react';
import Link from 'next/link';
import { Property } from '@/data/properties';
import { formatPrice, formatSqft, getBadgeForProperty } from '@/lib/utils';

interface PropertyCardProps {
    property: Property;
    index?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
    property,
    index = 0
}) => {
    const badge = getBadgeForProperty({
        featured: property.featured,
        status: 'available', // Assuming available by default for the card
        yearBuilt: property.yearBuilt
    });

    return (
        <article className="property-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Link
                href={`/properties/${property.slug}`}
                style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                <div className="card-image" style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
                    <img
                        src={`/controlmanager/realstate${property.mainImage}`}
                        alt={property.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        display: 'flex',
                        gap: '0.5rem',
                        zIndex: 1
                    }}>
                        {badge && (
                            <span className="badge badge-gold" style={{
                                backgroundColor: 'var(--gold-500)',
                                color: '#0a0a0a',
                                padding: '0.25rem 0.75rem',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                letterSpacing: '0.1rem'
                            }}>
                                {badge.toUpperCase()}
                            </span>
                        )}
                        <span className="badge" style={{
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            color: '#fff',
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.1rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {property.type.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--gold-500)',
                            fontWeight: 700,
                            letterSpacing: '0.15rem',
                            textTransform: 'uppercase'
                        }}>
                            {property.neighborhood}
                        </span>
                        <h3 style={{
                            fontSize: '1.4rem',
                            marginTop: '0.5rem',
                            marginBottom: '0.5rem',
                            fontFamily: 'var(--font-display)',
                            color: '#fff',
                            fontWeight: 400,
                            lineHeight: 1.2
                        }}>
                            {property.name}
                        </h3>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.6rem',
                            color: 'var(--gold-400)',
                            fontWeight: 600,
                            marginBottom: '1rem'
                        }}>
                            {formatPrice(property.price)}
                        </div>

                        <div style={{
                            width: '100%',
                            height: '1px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            margin: '1.2rem 0'
                        }} />

                        <div className="specs-row" style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ opacity: 0.6 }}>🛏</span>
                                <span style={{ fontWeight: 500 }}>{property.bedrooms === 'Studio' ? 'S' : property.bedrooms}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ opacity: 0.6 }}>🚿</span>
                                <span style={{ fontWeight: 500 }}>{property.bathrooms}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ opacity: 0.6 }}>📐</span>
                                <span style={{ fontWeight: 500 }}>{formatSqft(property.sqft)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
};
