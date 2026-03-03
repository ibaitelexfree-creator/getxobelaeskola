'use client';

import React, { useEffect, useRef } from 'react';

export const SpotlightCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            const ease = 0.08;
            currentPos.current.x += (mousePos.current.x - currentPos.current.x) * ease;
            currentPos.current.y += (mousePos.current.y - currentPos.current.y) * ease;

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%)`;
            }

            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className="spotlight-cursor"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '60vw',
                height: '60vw',
                maxHeight: '600px',
                maxWidth: '600px',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9999,
                willChange: 'transform',
                mixBlendMode: 'screen',
                filter: 'blur(40px)',
            }}
        />
    );
};
