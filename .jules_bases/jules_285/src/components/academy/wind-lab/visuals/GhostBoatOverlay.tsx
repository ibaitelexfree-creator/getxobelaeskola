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
    const [lerpedJibAngle, setLerpedJibAngle] = useState(0);

    const targetSailAngleRef = useRef(0);
    const targetJibAngleRef = useRef(0);

    // Calculate optimal angle and lerp towards it with deltaTime
    useEffect(() => {
        if (!visible) return;

        let animationFrameId: number;
        let lastTime = performance.now();

        const updateLerp = (time: number) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            const optimalMain = PhysicsEngine.getOptimalSailAngle(apparentWindAngle);
            const optimalJib = PhysicsEngine.getOptimalSailAngle(apparentWindAngle, 5);

            targetSailAngleRef.current = optimalMain;
            targetJibAngleRef.current = optimalJib;

            setLerpedSailAngle(prev => {
                const diff = targetSailAngleRef.current - prev;
                return prev + diff * (1 - Math.exp(-5.0 * dt));
            });

            setLerpedJibAngle(prev => {
                const diff = targetJibAngleRef.current - prev;
                return prev + diff * (1 - Math.exp(-5.0 * dt));
            });

            animationFrameId = requestAnimationFrame(updateLerp);
        };

        animationFrameId = requestAnimationFrame(updateLerp);
        return () => cancelAnimationFrame(animationFrameId);
    }, [apparentWindAngle, visible]);

    // Wind Side for visuals
    const windSide = Math.sign(apparentWindAngle || 0.01) || 1;

    if (!visible) return null;

    return (
        <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 opacity-40"
            style={{
                transform: `rotateZ(${boatHeading}deg)`,
                transformStyle: 'preserve-3d'
            }}
        >
            {/* Ghost Hull */}
            <div
                className="relative border-4 border-cyan-400/30 rounded-[50%_50%_20%_20%] shadow-[0_0_20px_rgba(34,211,238,0.2)] bg-cyan-900/5"
                style={{ width: '100px', height: '240px', transform: 'translateZ(-5px)' }}
            >
                {/* Center / Mast Point */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400/50 rounded-full -translate-x-1/2 -translate-y-1/2" />

                {/* Optimal Main Sail (Ghost) */}
                <div
                    className="absolute top-1/2 left-1/2 w-4 origin-bottom transition-transform duration-300"
                    style={{
                        height: '200px',
                        transform: `translate(-50%, -100%) rotateZ(${lerpedSailAngle * -windSide}deg) translateZ(10px)`
                    }}
                >
                    <div className="absolute inset-0 border-l-4 border-cyan-400/40 shadow-[0_0_10px_cyan]" />
                    <div className="absolute inset-0 bg-cyan-400/5 rounded-tr-[100%]" style={{ width: '150px', transform: windSide > 0 ? 'scaleX(-1)' : 'none', transformOrigin: 'left' }} />
                </div>

                {/* Optimal Jib Sail (Ghost) */}
                <div
                    className="absolute top-[5%] left-1/2 w-4 origin-top transition-transform duration-300"
                    style={{
                        height: '160px',
                        transform: `translate(-50%, 0) rotateZ(${lerpedJibAngle * -windSide}deg) translateZ(5px)`
                    }}
                >
                    <div className="absolute inset-0 border-l-4 border-cyan-400/40 shadow-[0_0_10px_cyan]" />
                    <div className="absolute inset-0 bg-cyan-400/5 rounded-br-[100%]" style={{ width: '120px', transform: windSide > 0 ? 'scaleX(-1)' : 'none', transformOrigin: 'left' }} />
                </div>
            </div>

            {/* Label */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-xs font-black text-cyan-400 tracking-[0.3em] uppercase opacity-80 whitespace-nowrap shadow-black drop-shadow-lg">
                TRIMADO ÓPTIMO
            </div>
        </div>
    );
};
