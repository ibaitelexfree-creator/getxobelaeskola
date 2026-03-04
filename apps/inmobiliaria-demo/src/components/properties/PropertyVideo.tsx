'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface PropertyVideoProps {
    videoUrl: string;
    posterImage: string;
    className?: string;
    style?: React.CSSProperties;
    autoPlayOnHover?: boolean;
    showControls?: boolean;
}

export const PropertyVideo: React.FC<PropertyVideoProps> = ({
    videoUrl,
    posterImage,
    className = '',
    style = {},
    autoPlayOnHover = false,
    showControls = false,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isSlowConnection, setIsSlowConnection] = useState(false);

    // Detect connection speed
    useEffect(() => {
        if (typeof navigator !== 'undefined' && 'connection' in navigator) {
            const conn = (navigator as any).connection;
            if (conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') {
                setIsSlowConnection(true);
            }
        }
    }, []);

    // Intersection observer for lazy loading
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0.3 }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    // Auto-play when in view (if not hover-only mode)
    useEffect(() => {
        const video = videoRef.current;
        if (!video || autoPlayOnHover || isSlowConnection) return;

        if (isInView && isLoaded) {
            video.play().catch(() => {/* autoplay blocked */ });
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, [isInView, isLoaded, autoPlayOnHover, isSlowConnection]);

    // Hover handlers for card previews
    const handleMouseEnter = useCallback(() => {
        if (!autoPlayOnHover || !videoRef.current || isSlowConnection) return;
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => { });
        setIsPlaying(true);
    }, [autoPlayOnHover, isSlowConnection]);

    const handleMouseLeave = useCallback(() => {
        if (!autoPlayOnHover || !videoRef.current) return;
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
    }, [autoPlayOnHover]);

    // Manual play toggle
    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch(() => { });
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, []);

    // Error or no video URL → show static image
    if (hasError || !videoUrl) {
        return (
            <div className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
                <img
                    src={posterImage}
                    alt="Property"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ position: 'relative', overflow: 'hidden', ...style }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Poster image shown until video loads OR on slow connection */}
            {(!isLoaded || (isSlowConnection && !isPlaying)) && (
                <img
                    src={posterImage}
                    alt="Property preview"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 1,
                    }}
                />
            )}

            {/* Video element */}
            {isInView && (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    poster={posterImage}
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    onLoadedData={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 0.6s ease',
                    }}
                />
            )}

            {/* Play/Pause button */}
            {showControls && isLoaded && (
                <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    style={{
                        position: 'absolute',
                        bottom: '0.75rem',
                        right: '0.75rem',
                        zIndex: 3,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(212,175,55,0.3)',
                        color: 'var(--gold-400, #D4AF37)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {isPlaying ? '❚❚' : '▶'}
                </button>
            )}

            {/* Cinematic badge */}
            {isLoaded && isPlaying && (
                <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    zIndex: 3,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '999px',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    color: 'var(--gold-400, #D4AF37)',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    pointerEvents: 'none',
                }}>
                    <span style={{ fontSize: '0.7rem' }}>🎬</span> CINEMATIC
                </div>
            )}

            {/* Slow connection manual play overlay */}
            {isSlowConnection && isLoaded && !isPlaying && (
                <button
                    onClick={togglePlay}
                    aria-label="Play cinematic preview"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        background: 'rgba(0,0,0,0.3)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(12px)',
                        border: '2px solid var(--gold-400, #D4AF37)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gold-400, #D4AF37)',
                        fontSize: '1.2rem',
                    }}>
                        ▶
                    </div>
                </button>
            )}
        </div>
    );
};

// ===========================================
// Processing state component
// ===========================================

interface VideoProcessingBadgeProps {
    status: 'processing' | 'failed' | 'none';
}

export const VideoProcessingBadge: React.FC<VideoProcessingBadgeProps> = ({ status }) => {
    if (status === 'none') return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '0.75rem',
            zIndex: 3,
            padding: '0.3rem 0.7rem',
            borderRadius: '999px',
            background: status === 'processing'
                ? 'rgba(212,175,55,0.15)'
                : 'rgba(220,38,38,0.15)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${status === 'processing' ? 'rgba(212,175,55,0.4)' : 'rgba(220,38,38,0.4)'}`,
            color: status === 'processing' ? 'var(--gold-400, #D4AF37)' : '#f87171',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            animation: status === 'processing' ? 'pulse-glow 2s infinite' : 'none',
        }}>
            {status === 'processing' ? (
                <>
                    <span style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--gold-400, #D4AF37)',
                        animation: 'blink 1.2s infinite',
                    }} />
                    GENERATING VIDEO...
                </>
            ) : (
                <>✕ VIDEO FAILED</>
            )}
        </div>
    );
};
