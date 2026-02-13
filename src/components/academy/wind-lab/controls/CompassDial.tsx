'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CompassDialProps {
    value: number; // 0-360
    onChange: (value: number) => void;
    label?: string;
}

export const CompassDial: React.FC<CompassDialProps> = ({ value, onChange, label = 'WIND DIRECTION' }) => {
    const dialRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleInteraction = (clientX: number, clientY: number) => {
        if (!dialRef.current) return;

        const rect = dialRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        // Calculate angle in degrees
        let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
        if (angle < 0) angle += 360;

        onChange(Math.round(angle));
    };

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteraction(e.clientX, e.clientY);
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (isDragging) handleInteraction(e.clientX, e.clientY);
        };
        const onMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging]);

    return (
        <div className="flex flex-col items-center gap-2">
            <span className="text-3xs font-bold text-slate-500 tracking-widest uppercase">{label}</span>

            <div
                ref={dialRef}
                onMouseDown={onMouseDown}
                className="relative w-32 h-32 rounded-full bg-slate-800 border-2 border-slate-700 shadow-xl cursor-pointer group flex items-center justify-center select-none"
            >
                {/* Degree markings */}
                {[0, 90, 180, 270].map(deg => (
                    <div
                        key={deg}
                        className="absolute text-[8px] font-mono text-slate-500"
                        style={{
                            transform: `rotate(${deg}deg) translateY(-50px)`
                        }}
                    >
                        {deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : 'W'}
                    </div>
                ))}

                {/* Dial Center */}
                <div className="absolute inset-4 rounded-full border border-slate-700 pointer-events-none" />
                <div className="absolute inset-8 rounded-full bg-slate-900/50 pointer-events-none" />

                {/* Rotating Indicator */}
                <div
                    className="absolute inset-0 transition-transform duration-75"
                    style={{ transform: `rotate(${value}deg)` }}
                >
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                </div>

                {/* Digital Readout */}
                <div className="z-10 text-lg font-mono font-bold text-cyan-400">
                    {value.toString().padStart(3, '0')}°
                </div>
            </div>
        </div>
    );
};
