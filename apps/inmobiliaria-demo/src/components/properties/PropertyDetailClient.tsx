'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Badge } from '../../components/ui/Badge';
import { PropertyCard } from '../../components/properties/PropertyCard';
import { PropertyMapSection } from '../../components/properties/PropertyMapSection';
import { BookingModal } from '../../components/ui/BookingModal';
import { Property } from '../../data/properties';

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

    return (
        <main style={{ paddingTop: '100px', paddingBottom: '8rem' }}>
            <div className="container">
                {/* Gallery Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: '1rem', height: '600px', marginBottom: '3rem' }}>
                    <div style={{ position: 'relative', height: '100%' }}>
                        <img
                            src={property.mainImage}
                            alt={property.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {property.gallery.slice(1, 3).map((img, idx) => (
                            <div key={idx} style={{ position: 'relative', height: 'calc(50% - 0.5rem)' }}>
                                <img
                                    src={img}
                                    alt={`${property.name} gallery ${idx + 2}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '5rem' }}>
                    {/* Main Content */}
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Badge variant="gold">{property.type}</Badge>
                                <Badge variant="green">Available</Badge>
                            </div>
                            <h1 className="section-title" style={{ fontSize: '3.5rem' }}>{property.name}</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>{property.neighborhood}, Dubai</p>
                        </div>

                        <div className="divider"></div>

                        <section style={{ marginBottom: '4rem' }}>
                            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Overview</h2>
                            <div
                                className="glass-card"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    padding: '2.5rem',
                                    gap: '2rem',
                                    border: '1px solid var(--border-gold)'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🛏</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gold-400)' }}>{property.bedrooms}</span>
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>BEDROOMS</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🚿</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gold-400)' }}>{property.bathrooms}</span>
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>BATHROOMS</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📐</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gold-400)' }}>{property.sqft.toLocaleString()}</span>
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>SQFT</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📅</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gold-400)' }}>{property.yearBuilt}</span>
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>YEAR BUILT</span>
                                </div>
                            </div>
                        </section>

                        <section style={{ marginBottom: '4rem' }}>
                            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Description</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                                {property.description}
                            </p>
                        </section>

                        <section style={{ marginBottom: '4rem' }}>
                            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Amenities</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {property.amenities.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                                        <span style={{ color: 'var(--gold-400)' }}>✓</span>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* NEW: Map Section */}
                        <PropertyMapSection neighborhood={property.neighborhood} name={property.name} />
                    </div>

                    {/* Sticky Sidebar */}
                    <aside style={{ height: 'fit-content', position: 'sticky', top: '120px' }}>
                        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid var(--border-gold)' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em' }}>LIST PRICE</span>
                                <div className="price-tag" style={{ fontSize: '2.5rem', color: 'var(--gold-400)', marginTop: '0.5rem' }}>
                                    {formattedPrice}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', padding: '1.25rem' }}
                                    onClick={() => setIsBookingOpen(true)}
                                >
                                    Schedule Viewing
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ width: '100%', padding: '1.25rem' }}
                                    onClick={() => {
                                        const chatBtn = document.querySelector('.chat-toggle') as HTMLButtonElement;
                                        if (chatBtn) chatBtn.click();
                                    }}
                                >
                                    Talk to Aisha
                                </button>
                            </div>

                            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    "An exceptional investment in Dubai's most growing district."
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--gold-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>A</div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Aisha Al-Hashimi</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--gold-500)' }}>VIP ADVISOR</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Similar Properties */}
                {similarProperties.length > 0 && (
                    <section style={{ marginTop: '6rem' }}>
                        <div style={{ marginBottom: '3rem' }}>
                            <span className="section-label">RECOMMENDATIONS</span>
                            <h2 className="section-title" style={{ fontSize: '2rem' }}>Similar Properties nearby</h2>
                        </div>
                        <div className="grid-3">
                            {similarProperties.map(p => (
                                <PropertyCard key={p.id} property={p} />
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
        </main>
    );
};
