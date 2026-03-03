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
        <div className="flex flex-col items-center gap-2 h-full pb-1 relative group select-none">
            {/* Value Label (Top) */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-cyan-300 drop-shadow-[0_0_5px_cyan]">
                {value}°
            </div>

            <div
                ref={trackRef}
                onMouseDown={onMouseDown}
                className="relative w-8 h-full flex-1 cursor-ns-resize group"
            >
                {/* Thin Center Rail / Track */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-slate-700/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                    {/* Active Fill (from bottom) */}
                    <div
                        className="absolute bottom-0 left-0 w-full bg-cyan-400 shadow-[0_0_10px_cyan]"
                        style={{ height: `${percentage}%` }}
                    />
                </div>

                {/* Glow Line behind track */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-cyan-500/10 blur-sm pointer-events-none" />

                {/* Winch Handle / Thumb */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 w-6 h-3 bg-slate-900 border border-cyan-400 rounded-sm shadow-[0_0_15px_cyan] flex items-center justify-center transition-all duration-75 group-active:scale-95 z-20 hover:scale-110"
                    style={{ bottom: `calc(${percentage}% - 6px)` }}
                >
                    <div className="w-4 h-[1px] bg-cyan-400 shadow-[0_0_5px_cyan]" />
                </div>
            </div>

            <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase mt-1">{label}</span>
        </div>
    );
};
