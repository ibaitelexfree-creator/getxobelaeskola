'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
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
// Links are relative to locale now
const COSMOS_DATA: ConstellationNode[] = [
    { id: '1', label: 'Fundamentos', x: 400, y: 300, type: 'star', status: 'completed', description: 'El inicio de todo marinero.', link: '/academy/course/iniciacion-j80' },
    { id: '2', label: 'Nudos', x: 600, y: 250, type: 'star', status: 'available', description: 'El arte de la cabuyería.', link: '/academy/tools/knots' },
    { id: '3', label: 'Meteorología', x: 800, y: 400, type: 'planet', status: 'available', description: 'Entendiendo el cielo y el mar.', link: '/academy/tools/wind-lab' },
    { id: '4', label: 'Seguridad', x: 500, y: 600, type: 'star', status: 'available', description: 'Primero, sobrevivir.', link: '/academy/skills' },
    { id: '5', label: 'Navegación', x: 200, y: 500, type: 'nebula', status: 'available', description: 'Arte de ir de A a B.', link: '/academy/tools/chart-plotter' },
    { id: '6', label: 'Partes del Barco', x: 300, y: 200, type: 'planet', status: 'available', description: 'Conoce tu embarcación.', link: '/academy/tools/nomenclature' },
    { id: '7', label: 'Cuaderno', x: 100, y: 150, type: 'star', status: 'available', description: 'Tu viaje personal.', link: '/academy/logbook' },
    { id: '8', label: 'Grandes Regatas', x: 700, y: 150, type: 'nebula', status: 'available', description: 'Revive la historia de la navegación.', link: '/academy/exploration/regattas' },
];

export default function ConstellationMap() {
    const router = useRouter();
    const params = useParams();
    const locale = (params?.locale as string) || 'es';
    const svgRef = useRef<SVGSVGElement>(null);
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1000, h: 800 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [activeNode, setActiveNode] = useState<ConstellationNode | null>(null);
    const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);

    // Pan (Drag) Logic - Mouse
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        pan(e.clientX, e.clientY);
    };

    // Pan Logic - Touch
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            setStartPoint({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            setLastPinchDistance(dist);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 1 && isDragging) {
            pan(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length === 2 && lastPinchDistance !== null) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = dist - lastPinchDistance;
            zoom(delta > 0 ? 0.95 : 1.05);
            setLastPinchDistance(dist);
        }
    };

    const pan = (clientX: number, clientY: number) => {
        const dx = (clientX - startPoint.x) * (viewBox.w / window.innerWidth);
        const dy = (clientY - startPoint.y) * (viewBox.h / window.innerHeight);

        setViewBox(prev => ({
            ...prev,
            x: prev.x - dx,
            y: prev.y - dy
        }));
        setStartPoint({ x: clientX, y: clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setLastPinchDistance(null);
    };

    // Zoom Logic
    const handleWheel = (e: React.WheelEvent) => {
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        zoom(zoomFactor);
    };

    const zoom = (factor: number) => {
        const newW = viewBox.w * factor;
        const newH = viewBox.h * factor;

        if (newW < 200 || newW > 3000) return;

        setViewBox(prev => ({
            ...prev,
            w: newW,
            h: newH,
            x: prev.x - (newW - prev.w) / 2,
            y: prev.y - (newH - prev.h) / 2
        }));
    };

    const handleNodeClick = (node: ConstellationNode) => {
        if (node.status === 'locked') return;
        setActiveNode(node);
    };

    const navigateToNode = (path: string) => {
        const fullPath = path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
        router.push(fullPath);
    };

    return (
        <div className="w-full h-full bg-[#000510] relative overflow-hidden font-display select-none touch-none">
            {/* Background Stars */}
            <div className="absolute inset-0 opacity-50 pointer-events-none" style={{ background: 'url(/images/stars-bg.svg) repeat' }} />

            {/* Hint */}
            <div className="absolute top-6 left-6 text-white/60 text-xs pointer-events-none md:block hidden bg-black/40 p-2 rounded backdrop-blur-sm">
                <p>Arrastra para explorar. Rueda para zoom.</p>
            </div>
            <div className="absolute top-6 left-6 text-white/60 text-xs pointer-events-none block md:hidden bg-black/40 p-2 rounded backdrop-blur-sm">
                <p>Desliza para mover. Pincha para zoom.</p>
            </div>

            {/* Zoom Controls (Floating) */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20" role="group" aria-label="Controles de zoom">
                <button
                    onClick={() => zoom(0.8)}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-accent outline-none"
                    aria-label="Alejar mapa"
                >
                    <span className="text-xl font-bold" aria-hidden="true">−</span>
                </button>
                <button
                    onClick={() => zoom(1.2)}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-accent outline-none"
                    aria-label="Acercar mapa"
                >
                    <span className="text-xl font-bold" aria-hidden="true">+</span>
                </button>
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
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
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
                <line x1="400" y1="300" x2="600" y2="250" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" aria-hidden="true" />
                <line x1="400" y1="300" x2="500" y2="600" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" aria-hidden="true" />
                <line x1="600" y1="250" x2="800" y2="400" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" aria-hidden="true" />
                <line x1="400" y1="300" x2="300" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" aria-hidden="true" />
                <line x1="300" y1="200" x2="100" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" aria-hidden="true" />
                <line x1="400" y1="300" x2="200" y2="500" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" aria-hidden="true" />
                <line x1="600" y1="250" x2="700" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" aria-hidden="true" />

                {/* Nodes */}
                {COSMOS_DATA.map((node) => (
                    <g
                        key={node.id}
                        role="button"
                        tabIndex={node.status === 'locked' ? -1 : 0}
                        aria-label={`${node.label} - ${node.description} - ${node.status === 'locked' ? 'Bloqueado' : 'Disponible'}`}
                        aria-disabled={node.status === 'locked'}
                        onClick={(e) => { e.stopPropagation(); handleNodeClick(node); }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                e.preventDefault();
                                handleNodeClick(node);
                            }
                        }}
                        className={`transition-opacity duration-300 hover:opacity-80 focus:opacity-80 cursor-pointer outline-none ${node.status === 'locked' ? 'opacity-30 grayscale cursor-not-allowed' : 'opacity-100'}`}
                        filter={node.status !== 'locked' ? "url(#glow)" : ""}
                    >
                        <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.type === 'planet' ? 30 : 20} // Hit area increased
                            fill="transparent"
                            className="stroke-transparent focus-visible:stroke-accent"
                            strokeWidth="2"
                        />
                        <circle cx={node.x} cy={node.y} r={node.type === 'planet' ? 25 : 15} fill="transparent" stroke={node.status === 'completed' ? '#4ade80' : '#fbbf24'} strokeWidth="1" strokeOpacity="0.5" />
                        <circle cx={node.x} cy={node.y} r={node.type === 'planet' ? 8 : 5} fill={node.status === 'completed' ? '#4ade80' : '#fbbf24'} />
                        <text x={node.x} y={node.y + 40} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" letterSpacing="1" className="uppercase tracking-widest pointer-events-none drop-shadow-md">
                            {node.label}
                        </text>
                    </g>
                ))}
            </svg>

            {/* Active Node Modal / Card */}
            {activeNode && (
                <div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-nautical-deep/95 backdrop-blur-xl border border-white/20 p-8 rounded-xl shadow-2xl text-center"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="node-title"
                    aria-describedby="node-desc"
                >
                    <button
                        onClick={() => setActiveNode(null)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-accent outline-none"
                        aria-label="Cerrar detalles"
                    >
                        <X size={20} />
                    </button>
                    <h3 id="node-title" className="text-2xl text-accent font-display mb-3">{activeNode.label}</h3>
                    <p id="node-desc" className="text-white/90 text-sm mb-8 leading-relaxed">{activeNode.description}</p>

                    {activeNode.link ? (
                        <button
                            onClick={() => navigateToNode(activeNode.link!)}
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
