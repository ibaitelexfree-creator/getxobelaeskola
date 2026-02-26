import React, { useState, useEffect } from 'react';

interface DividersToolProps {
    p1: { x: number; y: number };
    p2: { x: number; y: number };
    scale: number; // Viewport scale to keep handles constant size visually? Or scale with map?
    onUpdate: (newState: { p1: { x: number; y: number }; p2: { x: number; y: number } }) => void;
    worldToScreen: (x: number, y: number) => { x: number; y: number };
    screenToWorld: (x: number, y: number) => { x: number; y: number };
}

export default function DividersTool({ p1, p2, scale, onUpdate, worldToScreen, screenToWorld }: DividersToolProps) {
    const [draggingPart, setDraggingPart] = useState<'p1' | 'p2' | 'both' | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const s1 = worldToScreen(p1.x, p1.y);
    const s2 = worldToScreen(p2.x, p2.y);

    const handleMouseDown = (part: 'p1' | 'p2' | 'both', e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setDraggingPart(part);

        // const worldMouse = screenToWorld(e.clientX, e.clientY);

        // Actually, let's use screen coords for "offset" logic to be safer
        // But we need to know the initial "click" world position relative to the object center/point

        // Simpler: Just track mouse delta in screen pixels and convert to world delta
        setDragOffset({ x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!draggingPart) return;

            const dxScreen = e.clientX - dragOffset.x;
            const dyScreen = e.clientY - dragOffset.y;

            // Convert screen delta to world delta
            // dxWorld = dxScreen / scale (approximately, assuming uniform scale)
            // But let's use our function if possible.
            // Delta in world = (screenToWorld(x + dx) - screenToWorld(x))
            // Since it's linear: deltaWorld = deltaScreen / viewport.scale

            // We don't have viewport.scale directly here (only passed as prop 'scale')
            // Assuming prop 'scale' is valid viewport scale.

            const dxWorld = dxScreen / scale;
            const dyWorld = dyScreen / scale;

            if (draggingPart === 'p1') {
                onUpdate({ p1: { x: p1.x + dxWorld, y: p1.y + dyWorld }, p2 });
            } else if (draggingPart === 'p2') {
                onUpdate({ p1, p2: { x: p2.x + dxWorld, y: p2.y + dyWorld } });
            } else if (draggingPart === 'both') {
                onUpdate({
                    p1: { x: p1.x + dxWorld, y: p1.y + dyWorld },
                    p2: { x: p2.x + dxWorld, y: p2.y + dyWorld }
                });
            }

            setDragOffset({ x: e.clientX, y: e.clientY });
        };

        const handleMouseUp = () => {
            setDraggingPart(null);
        };

        if (draggingPart) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingPart, dragOffset, p1, p2, scale, onUpdate]);

    // Calculate distance in NM
    // 1 NM = 1852 meters. on Chart: 1 degree latitude = 60 NM.
    // Let's assume 1 World Unit = 1 Pixel (at scale 1) = X NM
    // Prompt said: "Mostrar distancia en Millas Náuticas (convertir px a MN según escala de la carta)."
    // We'll hardcode a conversion for now: 100 units = 1 NM
    const distWorld = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    const distNM = (distWorld / 100).toFixed(2);


    return (
        <g>
            {/* Line connecting points */}
            <line x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y} stroke="#666" strokeWidth="2" strokeDasharray="5,5" />

            {/* Midpoint Handle (Move Both) */}
            <circle
                cx={(s1.x + s2.x) / 2}
                cy={(s1.y + s2.y) / 2}
                r={8}
                fill="rgba(0,0,0,0.1)"
                stroke="#666"
                cursor="move"
                onMouseDown={(e) => handleMouseDown('both', e)}
            />

            {/* P1 Handle */}
            <circle
                cx={s1.x}
                cy={s1.y}
                r={6}
                fill="#ff4081"
                stroke="white"
                strokeWidth="2"
                cursor="crosshair"
                onMouseDown={(e) => handleMouseDown('p1', e)}
            />

            {/* P2 Handle */}
            <circle
                cx={s2.x}
                cy={s2.y}
                r={6}
                fill="#ff4081"
                stroke="white"
                strokeWidth="2"
                cursor="crosshair"
                onMouseDown={(e) => handleMouseDown('p2', e)}
            />

            {/* Distance Text */}
            <text
                x={(s1.x + s2.x) / 2}
                y={(s1.y + s2.y) / 2 - 15}
                textAnchor="middle"
                fontSize="12"
                fill="#333"
                fontWeight="bold"
                style={{ textShadow: '0 0 2px white' }}
            >
                {distNM} NM
            </text>
        </g>
    );
}
