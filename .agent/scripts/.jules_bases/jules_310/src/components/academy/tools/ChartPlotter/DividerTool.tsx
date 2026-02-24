'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';

// Divider (Compás de Puntas)
// Needs TWO draggable points connected by a visual mechanism.

interface DividerToolProps {
    initialP1: { x: number, y: number };
    initialP2: { x: number, y: number };
    onUpdate?: (p1: { x: number, y: number }, p2: { x: number, y: number }) => void;
}

export default function DividerTool({ initialP1, initialP2, onUpdate }: DividerToolProps) {
    const [p1, setP1] = useState(initialP1);
    const [p2, setP2] = useState(initialP2);

    useEffect(() => {
        onUpdate?.(p1, p2);
    }, [p1, p2, onUpdate]);

    const constraintsRef = useRef(null);

    const handleDragEndP1 = (e: any, info: any) => setP1(p => ({ x: p.x + info.offset.x, y: p.y + info.offset.y }));
    const handleDragEndP2 = (e: any, info: any) => setP2(p => ({ x: p.x + info.offset.x, y: p.y + info.offset.y }));

    // Derived Visuals for Arms
    const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x); // In Radians
    const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const armH = Math.min(200, Math.max(50, distance)); // Adjust arm height visually based on spread

    // Vertex (Where arms meet)
    const vertex = {
        x: midPoint.x - (Math.sin(angle) * armH),
        y: midPoint.y + (Math.cos(angle) * armH)
    };

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Visual Arms (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
                    </marker>
                </defs>
                {/* Arm 1 */}
                <line x1={vertex.x} y1={vertex.y} x2={p1.x} y2={p1.y} stroke="rgba(200,200,200,0.8)" strokeWidth="4" strokeLinecap="round" />
                {/* Arm 2 */}
                <line x1={vertex.x} y1={vertex.y} x2={p2.x} y2={p2.y} stroke="rgba(200,200,200,0.8)" strokeWidth="4" strokeLinecap="round" />
                {/* Hinge */}
                <circle cx={vertex.x} cy={vertex.y} r="6" fill="#666" stroke="#333" strokeWidth="2" />

                {/* Distance Label */}
                <text x={midPoint.x} y={midPoint.y - 10} textAnchor="middle" fill="#333" fontSize="10" fontWeight="bold" className="bg-white/80 px-1 rounded">
                    {(distance / 100).toFixed(2)} NM
                </text>
            </svg>

            {/* Draggable Point 1 */}
            <motion.div
                drag
                dragMomentum={false}
                dragElastic={0}
                onDrag={(e, info) => {
                    const newP1 = { x: p1.x + info.delta.x, y: p1.y + info.delta.y };
                    setP1(newP1);
                }}
                className="absolute w-4 h-4 -ml-2 -mt-2 bg-accent border-2 border-nautical-black rounded-full cursor-crosshair pointer-events-auto z-30 hover:scale-150 transition-transform shadow-lg"
                style={{ x: p1.x, y: p1.y }}
                title="Punta 1"
            />

            {/* Draggable Point 2 */}
            <motion.div
                drag
                dragMomentum={false}
                dragElastic={0}
                onDrag={(e, info) => {
                    const newP2 = { x: p2.x + info.delta.x, y: p2.y + info.delta.y };
                    setP2(newP2);
                }}
                className="absolute w-4 h-4 -ml-2 -mt-2 bg-accent border-2 border-nautical-black rounded-full cursor-crosshair pointer-events-auto z-30 hover:scale-150 transition-transform shadow-lg"
                style={{ x: p2.x, y: p2.y }}
                title="Punta 2"
            />
        </div>
    );
}
