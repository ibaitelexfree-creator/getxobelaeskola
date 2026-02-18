'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect, useMemo } from 'react';

type NauticalCategory = 'veleros' | 'kayak' | 'paddle' | 'windsurf' | 'piragua' | 'academy' | 'general';

interface NauticalImageProps extends Omit<ImageProps, 'onError'> {
    fallbackSrc?: string;
    category?: NauticalCategory;
}

const CATEGORY_FALLBACKS: Record<NauticalCategory, string> = {
    veleros: '/images/J80.webp',
    kayak: '/images/home-hero-sailing-action.webp',
    paddle: '/images/home-hero-sailing-action.webp',
    windsurf: '/images/courses/PerfeccionamientoVela.webp',
    piragua: '/images/home-hero-sailing-action.webp',
    academy: '/images/courses/CursodeVelaLigera.webp',
    general: '/images/home-hero-sailing-action.webp'
};

export default function NauticalImage({
    src,
    alt,
    category = 'general',
    fallbackSrc,
    className,
    ...props
}: NauticalImageProps) {
    const defaultFallback = useMemo(() => CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.general, [category]);
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    return (
        <Image
            {...props}
            src={(!imgSrc || hasError) ? (fallbackSrc || defaultFallback) : imgSrc}
            alt={alt}
            className={className}
            onError={() => {
                setHasError(true);
            }}
        />
    );
}
