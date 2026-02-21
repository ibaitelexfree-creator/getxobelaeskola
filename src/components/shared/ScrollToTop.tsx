'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    // 1. Force scroll to top on mount/navigation
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });

        const resetScroll = () => {
            window.scrollTo({ top: 0, behavior: 'instant' });
        };

        // Aggressive reset for slow browsers
        const timer = setTimeout(resetScroll, 0);
        const timer2 = setTimeout(resetScroll, 50);

        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
        };
    }, [pathname]);

    // 2. Show button on scroll
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    // 3. Listen for external hide/show events
    const [isExternallyHidden, setIsExternallyHidden] = useState(false);
    useEffect(() => {
        const hideScroll = () => setIsExternallyHidden(true);
        const showScroll = () => setIsExternallyHidden(false);

        window.addEventListener('hide-scroll-to-top', hideScroll);
        window.addEventListener('show-scroll-to-top', showScroll);
        return () => {
            window.removeEventListener('hide-scroll-to-top', hideScroll);
            window.removeEventListener('show-scroll-to-top', showScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-32 md:bottom-8 right-8 z-[9999] p-3 rounded-full bg-accent text-nautical-black shadow-lg shadow-accent/20 transition-all duration-500 hover:scale-110 hover:-translate-y-1 group ${isVisible && !isExternallyHidden ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                }`}
            aria-label="Volver al inicio de la página"
        >
            <div className="absolute inset-0 rounded-full border border-accent/50 animate-ping opacity-20 group-hover:opacity-40" />
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 transform group-hover:-translate-y-0.5 transition-transform"
            >
                <path d="m18 15-6-6-6 6" />
            </svg>
        </button>
    );
}
