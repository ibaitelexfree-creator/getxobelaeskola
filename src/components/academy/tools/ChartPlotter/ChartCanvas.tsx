'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Ruler, Move, Compass, Pencil, Map as MapIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import ParallelRuler from './ParallelRuler';
import DividerTool from './DividerTool';

// Chart Coordinates
const CHART_SIZE = 2000;
const INITIAL_SCALE = 1;
const SCALE_MARK = 1852; // 1 Nautical Mile in our fake coordinates (px)

export default function ChartCanvas() {
    // 1. STATE INITIALIZATION (with persistence)
    const [currentChart, setCurrentChart] = useState(1);
    const [viewPos, setViewPos] = useState({ x: -CHART_SIZE / 2, y: -CHART_SIZE / 2 });
    const [scale, setScale] = useState(INITIAL_SCALE);
    const [activeTool, setActiveTool] = useState<'pan' | 'ruler' | 'divider' | 'pencil'>('pan');
    const [rulerState, setRulerState] = useState({ x: 800, y: 600, angle: 45 });
    const [dividerState, setDividerState] = useState({ x1: 600, y1: 600, x2: 700, y2: 700 });
    const [marks, setMarks] = useState<{ x: number, y: number, label?: string }[]>([
        { x: 500, y: 500, label: 'Faro Cabo Mayor' },
        { x: 1200, y: 800, label: 'Isla de Mouro' },
    ]);

    const containerRef = useRef<HTMLDivElement>(null);
    const isFirstMount = useRef(true);

    // Persistence: Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('chart-plotter-state');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.currentChart) setCurrentChart(data.currentChart);
                if (data.viewPos) setViewPos(data.viewPos);
                if (data.scale) setScale(data.scale);
                if (data.activeTool) setActiveTool(data.activeTool);
                if (data.rulerState) setRulerState(data.rulerState);
                if (data.dividerState) setDividerState(data.dividerState);
                if (data.marks) setMarks(data.marks);
            } catch (e) {
                console.error("Error loading chart state", e);
            }
        }
        isFirstMount.current = false;
    }, []);

    // Persistence: Save to LocalStorage
    useEffect(() => {
        if (isFirstMount.current) return;

        const state = {
            currentChart,
            viewPos,
            scale,
            activeTool,
            rulerState,
            dividerState,
            marks
        };
        localStorage.setItem('chart-plotter-state', JSON.stringify(state));
    }, [currentChart, viewPos, scale, activeTool, rulerState, dividerState, marks]);

    // Panning Logic
    const [panning, setPanning] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'pan') {
            setPanning(true);
            startPos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (panning) {
            const dx = e.clientX - startPos.current.x;
            const dy = e.clientY - startPos.current.y;
            setViewPos(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            startPos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => setPanning(false);

    const handleWheel = (e: React.WheelEvent) => {
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(s => Math.min(3, Math.max(0.2, s * factor)));
    };

    return (
        <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#e0e0e0] cursor-crosshair select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 bg-white/90 backdrop-blur border border-black/10 p-2 rounded-lg shadow-xl">
                <button
                    onClick={() => setActiveTool('pan')}
                    className={`p-3 rounded-md transition-all ${activeTool === 'pan' ? 'bg-accent text-nautical-black shadow-inner' : 'hover:bg-black/5'}`}
                    title="Mover Carta (Pan)"
                >
                    <Move size={20} />
                </button>
                <button
                    onClick={() => setActiveTool('ruler')}
                    className={`p-3 rounded-md transition-all ${activeTool === 'ruler' ? 'bg-accent text-nautical-black shadow-inner' : 'hover:bg-black/5'}`}
                    title="Regla Paralela"
                >
                    <Ruler size={20} />
                </button>
                <button
                    onClick={() => setActiveTool('divider')}
                    className={`p-3 rounded-md transition-all ${activeTool === 'divider' ? 'bg-accent text-nautical-black shadow-inner' : 'hover:bg-black/5'}`}
                    title="Compás de Puntas"
                >
                    <Compass size={20} />
                </button>

                <div className="h-px bg-black/10 my-1" />

                {/* Chart Selector */}
                <select
                    value={currentChart}
                    onChange={(e) => setCurrentChart(parseInt(e.target.value))}
                    className="p-1 text-3xs font-bold bg-transparent border border-black/10 rounded outline-none"
                >
                    {Array.from({ length: 17 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>Carta {i + 1}</option>
                    ))}
                </select>
            </div>

            {/* Info Panel */}
            <div className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur border border-black/10 p-4 rounded-lg shadow-xl text-2xs font-mono space-y-2 w-48">
                <div className="flex justify-between">
                    <span>Posición:</span>
                    <span className="font-bold">{(Math.abs(viewPos.x) / 10).toFixed(0)}N, {(Math.abs(viewPos.y) / 10).toFixed(0)}W</span>
                </div>
                <div className="flex justify-between">
                    <span>Escala:</span>
                    <span className="font-bold">{(scale * 100).toFixed(0)}%</span>
                </div>
                {activeTool === 'ruler' && (
                    <div className="flex justify-between text-accent-dark">
                        <span>Rumbo:</span>
                        <span className="font-bold">{rulerState.angle.toFixed(1)}°</span>
                    </div>
                )}
                {activeTool === 'divider' && (
                    <div className="flex justify-between text-accent-dark">
                        <span>Distancia:</span>
                        <span className="font-bold">{((Math.sqrt(Math.pow(dividerState.x2 - dividerState.x1, 2) + Math.pow(dividerState.y2 - dividerState.y1, 2))) / 100).toFixed(2)} MN</span>
                    </div>
                )}
            </div>

            {/* World Container */}
            <div
                ref={containerRef}
                className="absolute inset-0 origin-center transition-transform duration-75 will-change-transform"
                style={{
                    transform: `translate(${viewPos.x}px, ${viewPos.y}px) scale(${scale})`
                }}
            >
                {/* 1. Base Chart (Using the selected image) */}
                <div className="w-[3000px] h-[2000px] bg-[#f8f5f0] relative shadow-2xl border-[12px] border-[#3e2723] rounded-sm overflow-hidden">
                    {/* Selected Chart Image Optimized */}
                    <Image
                        src={`/images/academy/ChartPlotterMap/Chart${currentChart}.webp`}
                        fill
                        priority
                        className="object-cover opacity-90"
                        alt={`Chart ${currentChart}`}
                        sizes="3000px"
                    />

                    {/* Subtle Sea Tint Overlay */}
                    <div className="absolute inset-0 bg-[#0ea5e9]/5 pointer-events-none" />

                    {/* Grid Lines (Nautical Lat/Lon) */}
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#94a3b833 1px, transparent 1px), linear-gradient(90deg, #94a3b833 1px, transparent 1px)', backgroundSize: '200px 200px' }} />

                    {/* Marks Overlay (Optional) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {marks.map((m, i) => (
                            <g key={i}>
                                <circle cx={m.x} cy={m.y} r="5" fill="red" stroke="white" strokeWidth="2" />
                                <text x={m.x + 10} y={m.y + 5} fontSize="14" fontWeight="bold" fill="#0f172a">{m.label}</text>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* 2. Tools Layer */}
                {activeTool === 'ruler' && (
                    <ParallelRuler
                        initialX={rulerState.x}
                        initialY={rulerState.y}
                        initialAngle={rulerState.angle}
                        scale={scale}
                        onUpdate={(d) => setRulerState(d)}
                    />
                )}

                {activeTool === 'divider' && (
                    <DividerTool
                        initialP1={{ x: dividerState.x1, y: dividerState.y1 }}
                        initialP2={{ x: dividerState.x2, y: dividerState.y2 }}
                        onUpdate={(p1, p2) => setDividerState({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })}
                    />
                )}
            </div>
        </div>
    );
}

// NOTE: This basic prototype uses simplified drag logic.
// For production, we'd need robust matrix math (d3-zoom or react-use-gesture)
// to handle drag-on-transformed-element correctly.
