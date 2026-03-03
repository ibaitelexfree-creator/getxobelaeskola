import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/data/properties';
import { Badge } from '@/components/ui/Badge';

interface PropertyCardProps {
    property: Property;
    showBadge?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
    property,
    showBadge = true
}) => {
    const formattedPrice = new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        maximumFractionDigits: 0
    }).format(property.price);

    return (
        <Link href={`/properties/${property.slug}`} style={{ textDecoration: 'none' }}>
            <div className="property-card luxury-glow">
                <div className="card-image">
                    <img
                        src={property.mainImage}
                        alt={property.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                        }}
                        className="hover-zoom"
                    />
                    {showBadge && (
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                            <Badge variant="gold">
                                {property.type}
                            </Badge>
                        </div>
                    )}
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.25rem' }}>
                        <span style={{ color: 'var(--gold-500)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em' }}>
                            {property.neighborhood.toUpperCase()}
                        </span>
                        <h3 className="card-title" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
                            {property.name}
                        </h3>
                    </div>

                    <div className="divider" style={{ margin: '1rem 0' }}></div>

                    <div className="specs-row" style={{ marginBottom: '1.5rem' }}>
                        <div className="spec-item">
                            <span style={{ color: 'var(--gold-400)' }}>🛏</span>
                            <span>{property.bedrooms} Beds</span>
                        </div>
                        <div className="spec-item">
                            <span style={{ color: 'var(--gold-400)' }}>🚿</span>
                            <span>{property.bathrooms} Baths</span>
                        </div>
                        <div className="spec-item">
                            <span style={{ color: 'var(--gold-400)' }}>📐</span>
                            <span>{property.sqft.toLocaleString()} Sqft</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="price-tag">{formattedPrice}</span>
                        <span className="explore-link" style={{ color: 'var(--gold-500)', fontSize: '0.9rem', fontWeight: 600 }}>Explore &rarr;</span>
                    </div>
                </div>
                <style jsx>{`
                    .property-card {
                        transition: all 0.5s var(--ease-out);
                        border: 1px solid var(--border-subtle);
                        cursor: pointer;
                        height: 100%;
                        background: var(--bg-secondary);
                        border-radius: var(--radius-lg);
                        overflow: hidden;
                    }
                    .property-card:hover {
                        transform: translateY(-12px);
                        border-color: var(--gold-500);
                        box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(212,168,67,0.1);
                    }
                    .card-image {
                        position: relative;
                        aspect-ratio: 16/10;
                        overflow: hidden;
                    }
                    .card-body {
                        padding: 2rem;
                        background: linear-gradient(to bottom, transparent, rgba(10,10,15,0.2));
                    }
                    .card-title {
                        transition: color 0.3s ease;
                    }
                    .property-card:hover .card-title {
                        color: var(--gold-400) !important;
                    }
                    .explore-link {
                        transform: translateX(-5px);
                        opacity: 0.8;
                        transition: all 0.3s ease;
                    }
                    .property-card:hover .explore-link {
                        transform: translateX(0);
                        opacity: 1;
                        color: #fff !important;
                    }
                `}</style>
            </div>
        </Link>
    );
};
