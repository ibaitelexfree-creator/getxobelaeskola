'use client';

import React from 'react';
import { NeighborhoodGrid } from '@/components/home/NeighborhoodGrid';
import LuxuryReveal from '@/components/ui/LuxuryReveal';

export default function NeighborhoodsPage() {
    return (
        <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
            
            <main style={{ paddingTop: '12rem', paddingBottom: '10rem' }}>
                <div className="container" style={{ textAlign: 'center', marginBottom: '8rem' }}>
                    <LuxuryReveal>
                        <span className="section-label" style={{ letterSpacing: '0.6em' }}>CURATED DESTINATIONS</span>
                    </LuxuryReveal>
                    <LuxuryReveal delay={0.2}>
                        <h1 className="section-title" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', marginBottom: '2.5rem' }}>
                            Exclusive <span className="gold-text">Neighborhoods</span>
                        </h1>
                    </LuxuryReveal>
                    <LuxuryReveal delay={0.4}>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.2rem',
                            maxWidth: '700px',
                            margin: '0 auto',
                            fontWeight: 300,
                            lineHeight: 1.8
                        }}>
                            Discover the most prestigious addresses in Dubai, each offering a unique
                            lifestyle of unparalleled luxury and distinction. From the iconic Palm Jumeirah
                            to the serene fairways of Emirates Hills.
                        </p>
                    </LuxuryReveal>

                    <div style={{
                        width: '80px',
                        height: '1px',
                        background: 'var(--gold-500)',
                        margin: '4rem auto 0',
                        opacity: 0.5
                    }} />
                </div>

                <NeighborhoodGrid />
            </main>
            
        </div>
    );
}
