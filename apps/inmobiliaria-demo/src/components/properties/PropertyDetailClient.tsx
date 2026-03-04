'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyMapSection } from '@/components/properties/PropertyMapSection';
import { BookingModal } from '@/components/ui/BookingModal';
import { DepthParallax3D } from '@/components/ui/DepthParallax3D';
import { PropertyVideo } from '@/components/properties/PropertyVideo';
import { formatSqft } from '@/lib/utils';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { getAssetPath } from '@/lib/constants';
import { Property } from '@/data/properties';
import { Magnetic } from '@/components/ui/Magnetic';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { createClient } from '@/lib/supabase/client';

type ViewMode = '3d' | 'video' | 'static';

interface PropertyDetailClientProps {
    property: Property;
    similarProperties: Property[];
    formattedPrice: string;
}

export const PropertyDetailClient: React.FC<PropertyDetailClientProps> = ({
    property: initialProperty,
    similarProperties,
    formattedPrice
}) => {
    const { formatPrice } = useCurrency();
    const [property, setProperty] = useState(initialProperty);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Fetch dynamic data from database (depth maps, videos, status)
    useEffect(() => {
        const fetchDynamicData = async () => {
            try {
                // Find dynamic property by reference code or ID
                const { data, error } = await createClient()
                    .from('properties')
                    .select('depth_maps, depth_map_status, video_url, video_status')
                    .eq('id', (initialProperty as any).id)
                    .single();

                if (data && !error) {
                    setProperty(prev => ({
                        ...prev,
                        depth_maps: data.depth_maps,
                        depth_map_status: data.depth_map_status,
                        video_url: data.video_url,
                        video_status: data.video_status
                    }));
                }
            } catch (err) {
                console.error('Error fetching dynamic property data:', err);
            }
        };

        fetchDynamicData();
        // Polling if processing
        const interval = setInterval(() => {
            const prop = property as any;
            if (prop.depth_map_status === 'processing' || prop.video_status === 'processing') {
                fetchDynamicData();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [initialProperty]);

    // Immersive image mode
    const hasDepthMap = !!(property as any).depth_maps?.length;
    const hasVideo = !!(property as any).video_url;
    const defaultMode: ViewMode = hasDepthMap ? '3d' : hasVideo ? 'video' : 'static';
    const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Record view if user is logged in
        const recordView = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('view_history').insert([{
                    user_id: user.id,
                    property_slug: property.slug
                }]);
            }
        };
        recordView();

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [property.slug]);

    return (
        <main style={{ paddingTop: '120px', paddingBottom: '8rem', backgroundColor: '#050505' }}>
            <div className="container">
                {/* Gallery Header - Cinematic Reveal */}
                <div
                    className="gallery-grid"
                    style={{
                        display: 'grid',
                        gap: '1.5rem',
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
                        {/* Immersive Hero: 3D Depth / Video / Static */}
                        {viewMode === '3d' && hasDepthMap ? (
                            <DepthParallax3D
                                imageUrl={getAssetPath(property.coverImage)}
                                depthMapUrl={(property as any).depth_maps[0]}
                                intensity={0.04}
                                style={{ width: '100%', height: '100%' }}
                                alt={property.title}
                            />
                        ) : viewMode === 'video' && hasVideo ? (
                            <PropertyVideo
                                videoUrl={(property as any).video_url}
                                posterImage={getAssetPath(property.coverImage)}
                                showControls
                                style={{ width: '100%', height: '100%' }}
                            />
                        ) : (
                            <div style={{
                                height: '100%',
                                width: '100%',
                                animation: 'ken-burns 20s infinite alternate'
                            }}>
                                <img
                                    src={getAssetPath(property.coverImage)}
                                    alt={property.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        )}

                        {/* Immersive Controls - Dubai Midnight Gold Style */}
                        {(hasDepthMap || hasVideo || (property as any).depth_map_status === 'processing' || (property as any).video_status === 'processing') && (
                            <div style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                display: 'flex',
                                gap: '0.75rem',
                                zIndex: 20
                            }}>
                                {hasDepthMap && (
                                    <button
                                        onClick={() => setViewMode('3d')}
                                        style={{
                                            padding: '0.6rem 1.2rem',
                                            borderRadius: 'var(--radius-full)',
                                            background: viewMode === '3d' ? 'var(--gold-500)' : 'rgba(0,0,0,0.4)',
                                            backdropFilter: 'blur(12px)',
                                            border: `1px solid ${viewMode === '3d' ? 'var(--gold-400)' : 'var(--border-gold)'}`,
                                            color: viewMode === '3d' ? '#0a0a0f' : 'var(--gold-400)',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            letterSpacing: '0.1em',
                                            cursor: 'pointer',
                                            boxShadow: viewMode === '3d' ? '0 4px 15px rgba(212,175,55,0.4)' : 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        ✦ 3D MODE
                                    </button>
                                )}
                                {hasVideo && (
                                    <button
                                        onClick={() => setViewMode('video')}
                                        style={{
                                            padding: '0.6rem 1.2rem',
                                            borderRadius: 'var(--radius-full)',
                                            background: viewMode === 'video' ? 'var(--gold-500)' : 'rgba(0,0,0,0.4)',
                                            backdropFilter: 'blur(12px)',
                                            border: `1px solid ${viewMode === 'video' ? 'var(--gold-400)' : 'var(--border-gold)'}`,
                                            color: viewMode === 'video' ? '#0a0a0f' : 'var(--gold-400)',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            letterSpacing: '0.1em',
                                            cursor: 'pointer',
                                            boxShadow: viewMode === 'video' ? '0 4px 15px rgba(212,175,55,0.4)' : 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        🎬 FILM
                                    </button>
                                )}
                                <button
                                    onClick={() => setViewMode('static')}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: 'var(--radius-full)',
                                        background: viewMode === 'static' ? 'var(--gold-500)' : 'rgba(0,0,0,0.4)',
                                        backdropFilter: 'blur(12px)',
                                        border: `1px solid ${viewMode === 'static' ? 'var(--gold-400)' : 'var(--border-gold)'}`,
                                        color: viewMode === 'static' ? '#0a0a0f' : 'var(--gold-400)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.1em',
                                        cursor: 'pointer',
                                        boxShadow: viewMode === 'static' ? '0 4px 15px rgba(212,175,55,0.4)' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    📷 PHOTO
                                </button>
                            </div>
                        )}

                        {/* Processing Badges */}
                        <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 10 }}>
                            {(property as any).depth_map_status === 'processing' && (
                                <div className="badge-processing">
                                    <span className="pulse-dot"></span> GENERATING 3D MODEL...
                                </div>
                            )}
                            {(property as any).video_status === 'processing' && (
                                <div className="badge-processing">
                                    <span className="pulse-dot"></span> GENERATING CINEMATIC...
                                </div>
                            )}
                        </div>

                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)',
                            pointerEvents: 'none'
                        }} />
                    </div>
                    <div className="gallery-side-images" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {property.images.slice(1, 3).map((img, idx) => (
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
                                    alt={`${property.title} gallery ${idx + 2}`}
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
                                <Badge variant="gold" style={{ letterSpacing: '0.2rem', fontWeight: 700 }}>{property.propertyType.toUpperCase()}</Badge>
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
                                    {property.title}
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
                                    { icon: '📐', value: property.sizeSqft.toLocaleString('en-US'), label: 'Total Sq Ft' },
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

                        <PropertyMapSection neighborhood={property.neighborhood} name={property.title} />
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
                                    {formatPrice(property.price)}
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
                propertyName={property.title}
            />

            <style jsx>{`
                .gallery-grid {
                    grid-template-columns: minmax(0, 2fr) 1fr;
                    height: 700px;
                    perspective: 2000px;
                }
                @media (max-width: 1024px) {
                    .gallery-grid {
                        grid-template-columns: 1fr;
                        height: auto;
                    }
                    .gallery-side-images {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr;
                        height: 300px;
                    }
                }
                @media (max-width: 640px) {
                    .gallery-side-images {
                        display: none !important;
                    }
                    .gallery-grid {
                        height: 400px;
                    }
                }
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }
                @keyframes reveal-3d {
                    from { 
                        opacity: 0; 
                        transform: translateY(60px) rotateX(-5deg); 
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
                .badge-processing {
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-full);
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--gold-400);
                    color: var(--gold-400);
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                }
                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    background: var(--gold-400);
                    border-radius: 50%;
                    box-shadow: 0 0 10px var(--gold-400);
                    animation: pulse-glow 1.5s infinite;
                }
                @keyframes pulse-glow {
                    0% { transform: scale(1); opacity: 1; box-shadow: 0 0 5px var(--gold-400); }
                    50% { transform: scale(1.2); opacity: 0.6; box-shadow: 0 0 15px var(--gold-400); }
                    100% { transform: scale(1); opacity: 1; box-shadow: 0 0 5px var(--gold-400); }
                }
            `}</style>
        </main >
    );
};
