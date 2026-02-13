'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PhysicsEngine } from '../physics/PhysicsEngine';

interface GhostBoatOverlayProps {
    boatHeading: number;
    apparentWindAngle: number;
    visible: boolean;
}

export const GhostBoatOverlay: React.FC<GhostBoatOverlayProps> = ({
    boatHeading,
    apparentWindAngle,
    visible
}) => {
    const [lerpedSailAngle, setLerpedSailAngle] = useState(0);
    const targetSailAngleRef = useRef(0);

    // Calculate optimal angle and lerp towards it with deltaTime
    useEffect(() => {
        if (!visible) return;

        let animationFrameId: number;
        let lastTime = performance.now();

        const updateLerp = (time: number) => {
            const dt = (time - lastTime) / 1000; // Delta time in seconds
            lastTime = time;

            const optimal = PhysicsEngine.getOptimalSailAngle(apparentWindAngle);
            targetSailAngleRef.current = optimal;

            setLerpedSailAngle(prev => {
                const diff = targetSailAngleRef.current - prev;
                // Use exponential decay for smooth, heavy movement
                // Formula: current + (target - current) * (1 - Math.exp(-decay * dt))
                // Decay factor 5.0 gives a nice heavy feel
                return prev + diff * (1 - Math.exp(-5.0 * dt));
            });

            animationFrameId = requestAnimationFrame(updateLerp);
        };

        animationFrameId = requestAnimationFrame(updateLerp);
        return () => cancelAnimationFrame(animationFrameId);
    }, [apparentWindAngle, visible]);

    if (!visible) return null;

    return (
        <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 opacity-40"
            style={{
                transform: `rotate(${boatHeading}deg)`,
                transition: 'transform 0.1s linear'
            }}
        >
            {/* Ghost Hull */}
            <div className="w-24 h-48 border-2 border-cyan-400/50 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)] bg-cyan-900/10">
                {/* Mast */}
                <div className="absolute top-1/2 left-1/2 w-0.5 h-1 bg-cyan-300 -translate-x-1/2 -translate-y-1/2" />

                {/* Optimal Sail (Ghost) */}
                <div
                    className="absolute top-1/2 left-1/2 w-1 h-36 bg-cyan-500/60 origin-bottom shadow-[0_0_8px_cyan]"
                    style={{
                        transform: `translate(-50%, -100%) rotate(${lerpedSailAngle}deg)`
                    }}
                >
                    {/* Shadow/Outline of optimal position */}
                    <div className="absolute inset-0 border-l border-cyan-200/50" />
                </div>
            </div>

            {/* Label */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xs font-bold text-cyan-400 tracking-widest uppercase opacity-70">
                Optimal Trim
            </div>
        </div>
    );
};
