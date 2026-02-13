'use client';

import React, { useRef, useState, useEffect } from 'react';

interface HydraulicWinchProps {
    value: number; // 0-90
    min: number;
    max: number;
    onChange: (value: number) => void;
    label: string;
}

export const HydraulicWinch: React.FC<HydraulicWinchProps> = ({ value, min, max, onChange, label }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const percentage = ((value - min) / (max - min)) * 100;

    const handleInteraction = (clientY: number) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
        // Vertical slider: 0 at top, max at bottom? No, usually higher value at top.
        const invPercentage = 1 - (y / rect.height);
        const newValue = min + invPercentage * (max - min);
        onChange(Math.round(newValue));
    };

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteraction(e.clientY);
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (isDragging) handleInteraction(e.clientY);
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
        <div className="flex flex-col items-center gap-2 h-full">
            <span className="text-3xs font-bold text-slate-500 tracking-widest uppercase writing-vertical-lr">{label}</span>

            <div
                ref={trackRef}
                onMouseDown={onMouseDown}
                className="relative w-12 flex-1 bg-slate-800 rounded-xl border border-slate-700 shadow-inner cursor-ns-resize group overflow-hidden"
            >
                {/* Scale markings */}
                <div className="absolute inset-0 flex flex-col justify-between py-4 px-1 pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className={`h-[1px] ${i % 3 === 0 ? 'w-full bg-slate-600' : 'w-2 bg-slate-700'}`} />
                    ))}
                </div>

                {/* Hydraulic Fluid (Active Track) */}
                <div
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-75"
                    style={{ height: `${percentage}%` }}
                >
                    <div className="w-full h-1 bg-white/30 absolute top-0" />
                </div>

                {/* Winch Knob */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 w-10 h-6 bg-slate-600 rounded border-2 border-slate-500 shadow-lg cursor-ns-resize group-active:scale-95 transition-all duration-75"
                    style={{ bottom: `calc(${percentage}% - 12px)` }}
                >
                    <div className="flex flex-col gap-0.5 items-center justify-center h-full">
                        <div className="w-6 h-[1px] bg-slate-400" />
                        <div className="w-6 h-[1px] bg-slate-400" />
                        <div className="w-6 h-[1px] bg-slate-400" />
                    </div>
                </div>

                {/* Value Readout overlay */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-3xs font-mono font-bold text-slate-300 drop-shadow-md">
                    {value}°
                </div>
            </div>
        </div>
    );
};
