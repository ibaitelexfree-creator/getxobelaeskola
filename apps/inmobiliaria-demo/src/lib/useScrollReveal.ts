'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
    delay?: number;
}

export const useScrollReveal = (options: UseScrollRevealOptions = {}) => {
    const {
        threshold = 0,
        rootMargin = '0px',
        once = true,
        delay = 0
    } = options;

    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (delay > 0) {
                        setTimeout(() => setIsVisible(true), delay);
                    } else {
                        setIsVisible(true);
                    }

                    if (once && elementRef.current) {
                        observer.unobserve(elementRef.current);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [threshold, rootMargin, once, delay]);

    const getClassName = (baseClass: string = '') => {
        return `${baseClass} reveal-on-scroll ${isVisible ? 'is-visible' : ''}`.trim();
    };

    return { elementRef, isVisible, getClassName };
};
