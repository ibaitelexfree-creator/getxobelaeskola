'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
    target: number;
    suffix?: string;
    duration?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    target,
    suffix = '',
    duration = 2000
}) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const counterRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (counterRef.current) observer.observe(counterRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [isVisible, target, duration]);

    return (
        <span ref={counterRef} className="gold-text" style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {count.toLocaleString('en-US')}{suffix}
        </span>
    );
};
