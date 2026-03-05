'use client';

import React from 'react';
import Link from 'next/link';
import { getFeaturedProperties } from '@/data/properties';
import { PropertyCard } from '@/components/properties/PropertyCard';
import LuxuryReveal from '@/components/ui/LuxuryReveal';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import { motion } from 'framer-motion';

export const FeaturedProperties = () => {
    const featuredProperties = getFeaturedProperties();

    return (
        <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Decor Element */}
            <motion.div
                initial={{ rotate: 0, opacity: 0 }}
                whileInView={{ rotate: 45, opacity: 0.05 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{
                    position: 'absolute', top: '5%', left: '-50px', width: '150px', height: '150px',
                    border: '1px solid var(--border-gold)', borderRadius: '30px', pointerEvents: 'none'
                }}
            />

            <div className="container">
                <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '4rem',
                        flexWrap: 'wrap',
                        gap: '2rem'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span className="section-label">FEATURED COLLECTION</span>
                        <LuxuryReveal delay={0.2}>
                            <h2 className="section-title" style={{ margin: 0 }}>Handpicked Luxury</h2>
                        </LuxuryReveal>
                    </div>
                    <Link href="/properties" className="btn-secondary" style={{ padding: '0.75rem 2rem' }}>
                        View All Properties
                    </Link>
                </motion.div>

                <StaggerContainer delay={0.4}>
                    <div className="grid-3">
                        {featuredProperties.map((property) => (
                            <StaggerItem key={property.id}>
                                <PropertyCard property={property} />
                            </StaggerItem>
                        ))}
                    </div>
                </StaggerContainer>
            </div>
        </section>
    );
};
