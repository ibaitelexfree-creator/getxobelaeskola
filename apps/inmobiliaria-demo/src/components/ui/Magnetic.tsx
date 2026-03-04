'use client';

import React, { useRef, useState, useEffect } from 'react';

interface MagneticProps {
    children: React.ReactElement<any>;
    strength?: number;
    distance?: number;
}

export const Magnetic = ({ children, strength = 0.5, distance = 100 }: MagneticProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: MouseEvent) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        // If cursor is within range
        const range = distance;
        if (Math.abs(distanceX) < range && Math.abs(distanceY) < range) {
            setPosition({ x: distanceX * strength, y: distanceY * strength });
        } else {
            setPosition({ x: 0, y: 0 });
        }
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return React.cloneElement(children as React.ReactElement<any>, {
        ref: ref,
        style: {
            ...children.props.style,
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            transition: position.x === 0 ? 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)' : 'transform 0.1s linear',
        },
        onMouseLeave: handleMouseLeave,
    });
};
