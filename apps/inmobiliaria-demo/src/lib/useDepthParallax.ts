'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface UseDepthParallaxOptions {
    intensity?: number;
    smoothing?: number;
    enableGyroscope?: boolean;
}

interface DepthParallaxResult {
    mouseX: number;
    mouseY: number;
    isSupported: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useDepthParallax(options: UseDepthParallaxOptions = {}): DepthParallaxResult {
    const { intensity = 1, smoothing = 0.08, enableGyroscope = true } = options;

    const containerRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef({ x: 0, y: 0 });
    const currentRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number>(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isSupported, setIsSupported] = useState(true);
    const isMobileRef = useRef(false);

    // Lerp helper
    const lerp = useCallback((current: number, target: number, factor: number) => {
        return current + (target - current) * factor;
    }, []);

    // Mouse handler
    const handleMouseMove = useCallback((e: MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * intensity;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2 * intensity;

        targetRef.current = { x, y };
    }, [intensity]);

    const handleMouseLeave = useCallback(() => {
        targetRef.current = { x: 0, y: 0 };
    }, []);

    // Gyroscope handler for mobile
    const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
        if (!isMobileRef.current) return;
        const gamma = (e.gamma || 0) / 45; // -1 to 1
        const beta = ((e.beta || 0) - 45) / 45; // Adjusted for holding angle
        targetRef.current = {
            x: Math.max(-1, Math.min(1, gamma)) * intensity,
            y: Math.max(-1, Math.min(1, beta)) * intensity,
        };
    }, [intensity]);

    // Animation loop
    useEffect(() => {
        isMobileRef.current = typeof window !== 'undefined' && window.innerWidth < 768;

        const animate = () => {
            currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, smoothing);
            currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, smoothing);

            // Only update state if there's meaningful change
            const dx = Math.abs(currentRef.current.x - mousePos.x);
            const dy = Math.abs(currentRef.current.y - mousePos.y);
            if (dx > 0.001 || dy > 0.001) {
                setMousePos({ x: currentRef.current.x, y: currentRef.current.y });
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(rafRef.current);
    }, [lerp, smoothing, mousePos.x, mousePos.y]);

    // Event listeners
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Check WebGL support
        try {
            const testCanvas = document.createElement('canvas');
            const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
            setIsSupported(!!gl);
        } catch {
            setIsSupported(false);
        }

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        // Gyroscope for mobile
        if (enableGyroscope && isMobileRef.current && typeof DeviceOrientationEvent !== 'undefined') {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [handleMouseMove, handleMouseLeave, handleOrientation, enableGyroscope]);

    return { mouseX: mousePos.x, mouseY: mousePos.y, isSupported, containerRef };
}
