'use client';

import { useEffect, useState, useCallback } from 'react';

interface UseParallaxOptions {
    speed?: number;
    direction?: 'vertical' | 'horizontal';
    limit?: number;
}

export const useParallax = (options: UseParallaxOptions = {}) => {
    const { speed = 0.2, direction = 'vertical', limit = 1000 } = options;
    const [offset, setOffset] = useState(0);

    const handleScroll = useCallback(() => {
        const scrolled = window.scrollY;

        // Only run if within limit to save performance
        if (scrolled < limit) {
            setOffset(scrolled * speed);
        }
    }, [speed, limit]);

    useEffect(() => {
        // Use requestAnimationFrame for smoother performance
        let rafId: number;

        const onScroll = () => {
            rafId = requestAnimationFrame(handleScroll);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        // Initial call
        handleScroll();

        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(rafId);
        };
    }, [handleScroll]);

    const getStyle = (): React.CSSProperties => {
        if (direction === 'vertical') {
            return { transform: `translateY(${offset}px)` };
        }
        return { transform: `translateX(${offset}px)` };
    };

    return { offset, getStyle };
};
