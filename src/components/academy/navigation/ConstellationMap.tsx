'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Info, X } from 'lucide-react';

interface ConstellationNode {
    id: string;
    label: string;
    x: number;
    y: number;
    type: 'star' | 'planet' | 'nebula';
    status: 'locked' | 'available' | 'completed';
    description?: string;
    link?: string;
}

// Mock Data representing a "Sailing Galaxy"
const COSMOS_DATA: ConstellationNode[] = [
    { id: '1', label: 'Fundamentos', x: 400, y: 300, type: 'star', status: 'completed', description: 'El inicio de todo marinero.', link: '/academy/course/per-patron-embarcaciones-recreo' },
    { id: '2', label: 'Nudos', x: 600, y: 250, type: 'star', status: 'available', description: 'El arte de la cabuyería.', link: '/academy/tools/knots' },
    { id: '3', label: 'Meteorología', x: 800, y: 400, type: 'planet', status: 'available', description: 'Entendiendo el cielo y el mar.', link: '/academy/tools/wind-lab' },
    { id: '4', label: 'Seguridad', x: 500, y: 600, type: 'star', status: 'available', description: 'Primero, sobrevivir.' },
    { id: '5', label: 'Navegación', x: 200, y: 500, type: 'nebula', status: 'available', description: 'Arte de ir de A a B.', link: '/academy/tools/chart-plotter' },
    { id: '6', label: 'Partes del Barco', x: 300, y: 200, type: 'planet', status: 'available', description: 'Conoce tu embarcación.', link: '/academy/tools/nomenclature' },
    { id: '7', label: 'Cuaderno', x: 100, y: 150, type: 'star', status: 'available', description: 'Tu viaje personal.', link: '/academy/logbook' },
];

export default function ConstellationMap() {
    const router = useRouter();
    const svgRef = useRef<SVGSVGElement>(null);
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1000, h: 800 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [activeNode, setActiveNode] = useState<ConstellationNode | null>(null);

    // Pan (Drag) Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = (e.clientX - startPoint.x) * (viewBox.w / window.innerWidth); // Scale drag to viewBox
        const dy = (e.clientY - startPoint.y) * (viewBox.h / window.innerHeight);

        setViewBox(prev => ({
            ...prev,
            x: prev.x - dx,
            y: prev.y - dy
        }));
        setStartPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Zoom Logic
    const handleWheel = (e: React.WheelEvent) => {
        const zoomFactor = 1.1;
        const newW = e.deltaY > 0 ? viewBox.w * zoomFactor : viewBox.w / zoomFactor;
        const newH = e.deltaY > 0 ? viewBox.h * zoomFactor : viewBox.h / zoomFactor;

        // Limit zoom
        if (newW < 200 || newW > 2000) return;

        setViewBox(prev => ({
            ...prev,
            w: newW,
            h: newH,
            // Zoom towards center attempt (simplified)
            x: prev.x - (newW - prev.w) / 2,
            y: prev.y - (newH - prev.h) / 2
        }));
    };

    const handleNodeClick = (node: ConstellationNode) => {
        if (node.status === 'locked') return;
        setActiveNode(node);
    };

    return (
        <div className="w-full h-full bg-[#000510] relative overflow-hidden font-display select-none">
            {/* Background Stars (Static CSS) */}
            <div className="absolute inset-0 opacity-50 pointer-events-none" style={{ background: 'url(/images/stars-bg.png) repeat' }} />

            {/* Hint */}
            <div className="absolute top-6 left-6 text-white/40 text-2xs pointer-events-none">
                <p>Arrastra para explorar. Rueda para zoom.</p>
            </div>

            {/* Main Interactive SVG */}
            <svg
                ref={svgRef}
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Connections (Lines) */}
                <line x1="400" y1="300" x2="600" y2="250" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="400" y1="300" x2="500" y2="600" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="600" y1="250" x2="800" y2="400" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="400" y1="300" x2="300" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="300" y1="200" x2="100" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="400" y1="300" x2="200" y2="500" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" />

                {/* Nodes */}
                {COSMOS_DATA.map((node) => (
                    <g
                        key={node.id}
                        onClick={(e) => { e.stopPropagation(); handleNodeClick(node); }}
                        className={`transition-opacity duration-300 hover:opacity-80 cursor-pointer ${node.status === 'locked' ? 'opacity-30 grayscale' : 'opacity-100'}`}
                        filter={node.status !== 'locked' ? "url(#glow)" : ""}
                    >
                        {/* Orbit/Ring */}
                        <circle cx={node.x} cy={node.y} r={node.type === 'planet' ? 25 : 15} fill="transparent" stroke={node.status === 'completed' ? '#4ade80' : '#fbbf24'} strokeWidth="1" strokeOpacity="0.5" />

                        {/* Core Star */}
                        <circle cx={node.x} cy={node.y} r={node.type === 'planet' ? 8 : 5} fill={node.status === 'completed' ? '#4ade80' : '#fbbf24'} />

                        {/* Label */}
                        <text x={node.x} y={node.y + 40} textAnchor="middle" fill="white" fontSize="12" letterSpacing="1" className="uppercase font-light tracking-widest pointer-events-none">
                            {node.label}
                        </text>
                    </g>
                ))}
            </svg>

            {/* Active Node Modal / Card */}
            {activeNode && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-80 bg-nautical-deep/90 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-2xl text-center">
                    <button onClick={() => setActiveNode(null)} className="absolute top-2 right-2 text-white/50 hover:text-white">
                        <X size={16} />
                    </button>
                    <h3 className="text-xl text-accent font-display mb-2">{activeNode.label}</h3>
                    <p className="text-white/70 text-sm mb-6">{activeNode.description}</p>

                    {activeNode.link ? (
                        <button
                            onClick={() => router.push(activeNode.link!)}
                            className="bg-accent text-nautical-black px-6 py-2 rounded-sm font-bold uppercase text-2xs tracking-widest hover:bg-white transition-colors"
                        >
                            Explorar
                        </button>
                    ) : (
                        <span className="text-2xs text-white/30 uppercase tracking-widest">Próximamente</span>
                    )}
                </div>
            )}
        </div>
    );
}
