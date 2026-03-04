'use client';

import React, { useRef, useCallback } from 'react';
import Link from 'next/link';
import { Property } from '@/data/properties';
import { formatSqft, getBadgeForProperty } from '@/lib/utils';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { getAssetPath } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { useFavorites } from '@/hooks/useFavorites';
import { useRouter } from 'next/navigation';

interface PropertyCardProps {
    property: Property;
    index?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
    property,
    index = 0
}) => {
    const { formatPrice } = useCurrency();
    const badge = getBadgeForProperty({
        featured: property.featured,
        status: 'available',
        yearBuilt: property.yearBuilt
    });

    const [user, setUser] = React.useState<any>(null);
    const router = useRouter();
    const supabase = createClient();
    const { favorites, toggleFavorite } = useFavorites(user?.id);
    const isFavorite = favorites.includes(property.slug);

    React.useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };
        getUser();
    }, [supabase]);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push(`/auth/login?returnTo=${window.location.pathname}`);
            return;
        }

        await toggleFavorite(property.slug);
    };

    // Video preview on hover
    const videoRef = useRef<HTMLVideoElement>(null);
    const hasVideo = !!(property as any).video_url;

    const handleImageMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1.1)';
        if (hasVideo && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => { });
            videoRef.current.style.opacity = '1';
        }
    }, [hasVideo]);

    const handleImageMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1)';
        if (hasVideo && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.style.opacity = '0';
        }
    }, [hasVideo]);

    return (
        <div className="property-card-wrapper">
            <article className="property-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <Link
                    href={`/properties/${property.slug}`}
                    style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                    <div
                        className="card-image"
                        style={{ position: 'relative', height: '260px', overflow: 'hidden' }}
                        onMouseEnter={handleImageMouseEnter}
                        onMouseLeave={handleImageMouseLeave}
                    >
                        <img
                            src={getAssetPath(property.coverImage)}
                            alt={property.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease'
                            }}
                        />

                        {/* Video hover layer */}
                        {hasVideo && (
                            <video
                                ref={videoRef}
                                src={(property as any).video_url}
                                loop
                                muted
                                playsInline
                                preload="none"
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    opacity: 0,
                                    transition: 'opacity 0.6s ease',
                                    zIndex: 1,
                                }}
                            />
                        )}
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
                                {property.propertyType.toUpperCase()}
                            </span>
                            {hasVideo && (
                                <span style={{
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    backdropFilter: 'blur(4px)',
                                    color: 'var(--gold-400, #D4AF37)',
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.6rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.08rem',
                                    border: '1px solid rgba(212,175,55,0.3)',
                                }}>
                                    🎬 FILM
                                </span>
                            )}
                        </div>

                        {/* Favorite Button */}
                        <button
                            onClick={handleFavoriteClick}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                zIndex: 10,
                                background: 'rgba(0,0,0,0.4)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                color: isFavorite ? '#ff4b4b' : '#fff'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)';
                            }}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill={isFavorite ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
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
                                {property.title}
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
                                    <span style={{ fontWeight: 500 }}>{property.bedrooms === 0 ? 'S' : property.bedrooms}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span style={{ opacity: 0.6 }}>🚿</span>
                                    <span style={{ fontWeight: 500 }}>{property.bathrooms}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span style={{ opacity: 0.6 }}>📐</span>
                                    <span style={{ fontWeight: 500 }}>{formatSqft(property.sizeSqft)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </article>
        </div>
    );
};
