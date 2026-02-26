'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Wind } from 'lucide-react';

interface WindRoseProps {
  initialAngle?: number;
}

export default function WindRose({ initialAngle = 45 }: WindRoseProps) {
  const t = useTranslations('wind_lab.interactive_rose');
  const svgRef = useRef<SVGSVGElement>(null);

  const [windAngle, setWindAngle] = useState(initialAngle); // Degrees, 0 = North
  const [isDragging, setIsDragging] = useState(false);
  const [boatSpeed, setBoatSpeed] = useState(0);
  const [vmg, setVmg] = useState(0);
  // Constants for display, could be state if dynamic
  const bestUpwind = 45;
  const bestDownwind = 150;

  const calculatePhysics = useCallback((angle: number) => {
    // Normalize angle to 0-180 for symmetric polar (TWA)
    let twa = angle % 360;
    if (twa < 0) twa += 360;
    if (twa > 180) twa = 360 - twa;

    // Simple Polar Model
    const maxSpeed = 8.0; // knots
    let speed = 0;

    if (twa < 30) {
      speed = 0;
    } else if (twa < 45) {
      speed = maxSpeed * 0.6 * ((twa - 30) / 15);
    } else if (twa < 100) {
      speed = maxSpeed * (0.6 + 0.4 * ((twa - 45) / 55));
    } else if (twa < 150) {
       // Broad reach is fastest usually
      speed = maxSpeed;
    } else {
      // Run
      speed = maxSpeed * (1 - 0.3 * ((twa - 150) / 30));
    }

    setBoatSpeed(parseFloat(speed.toFixed(1)));

    // VMG = Speed * cos(TWA)
    const rad = (twa * Math.PI) / 180;
    const calculatedVmg = speed * Math.cos(rad);
    setVmg(parseFloat(calculatedVmg.toFixed(1)));

  }, []);

  useEffect(() => {
    calculatePhysics(windAngle);
  }, [windAngle, calculatePhysics]);

  const updateAngle = useCallback((e: React.PointerEvent | MouseEvent | TouchEvent | { clientX: number, clientY: number }) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Client coordinates
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && (e as TouchEvent).touches && (e as TouchEvent).touches.length > 0) {
        clientX = (e as TouchEvent).touches[0].clientX;
        clientY = (e as TouchEvent).touches[0].clientY;
    } else if ('clientX' in e) {
        clientX = (e as React.PointerEvent).clientX;
        clientY = (e as React.PointerEvent).clientY;
    }

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // Calculate angle in degrees
    const rad = Math.atan2(dy, dx);
    const deg = (rad * 180) / Math.PI;

    // Rotate so -90 (North in math) becomes 0
    let navAngle = deg + 90;
    if (navAngle < 0) navAngle += 360;

    setWindAngle(Math.round(navAngle));
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateAngle(e);
  };

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global event listeners for dragging outside SVG
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', updateAngle);
      window.addEventListener('pointerup', handlePointerUp);
      // Add touch events support for mobile if pointer events fail (though pointermove usually covers it)
      window.addEventListener('touchmove', updateAngle, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    } else {
      window.removeEventListener('pointermove', updateAngle);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', updateAngle);
      window.removeEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', updateAngle);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', updateAngle);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, updateAngle, handlePointerUp]);


  // Helper to polar to cartesian
  const p2c = (angleDeg: number, radius: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: 150 + radius * Math.cos(angleRad),
      y: 150 + radius * Math.sin(angleRad)
    };
  };

  const windPos = p2c(windAngle, 120);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-8 items-center justify-center">

      {/* Visualizer */}
      <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] select-none touch-none">
        <svg
          ref={svgRef}
          viewBox="0 0 300 300"
          className="w-full h-full drop-shadow-xl cursor-crosshair"
          onPointerDown={handlePointerDown}
        >
          {/* Background Circle */}
          <circle cx="150" cy="150" r="140" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

          {/* Compass Marks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(ang => {
            const pos1 = p2c(ang, 130);
            const pos2 = p2c(ang, 140);
            return (
              <line
                key={ang}
                x1={pos1.x} y1={pos1.y}
                x2={pos2.x} y2={pos2.y}
                stroke="#94a3b8"
                strokeWidth={ang % 90 === 0 ? 3 : 1}
              />
            );
          })}
          <text x="150" y="25" textAnchor="middle" className="text-xs font-bold fill-slate-400">N</text>
          <text x="275" y="155" textAnchor="middle" className="text-xs font-bold fill-slate-400">E</text>
          <text x="150" y="285" textAnchor="middle" className="text-xs font-bold fill-slate-400">S</text>
          <text x="25" y="155" textAnchor="middle" className="text-xs font-bold fill-slate-400">W</text>

          {/* Zones */}
          {/* No Go Zone (30 deg each side) */}
          <path d={`M 150 150 L ${p2c(-30, 140).x} ${p2c(-30, 140).y} A 140 140 0 0 1 ${p2c(30, 140).x} ${p2c(30, 140).y} Z`} fill="rgba(239, 68, 68, 0.1)" />

          {/* Optimal Upwind Lines (45 deg) */}
          <line x1="150" y1="150" x2={p2c(bestUpwind, 140).x} y2={p2c(bestUpwind, 140).y} stroke="rgba(34, 197, 94, 0.5)" strokeDasharray="4 2" />
          <line x1="150" y1="150" x2={p2c(360 - bestUpwind, 140).x} y2={p2c(360 - bestUpwind, 140).y} stroke="rgba(34, 197, 94, 0.5)" strokeDasharray="4 2" />

          {/* Boat (Fixed Heading North) */}
          <g transform="translate(150, 150)">
             {/* Simple Boat Shape */}
             <path d="M 0 -20 Q 10 0 10 20 L -10 20 Q -10 0 0 -20" fill="#0f172a" />
          </g>

          {/* Wind Vector (Draggable) */}
          {/* Arrow pointing to center from windPos */}
          <g
            transform={`translate(${windPos.x}, ${windPos.y}) rotate(${windAngle + 180})`}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
             <circle r="15" fill="rgba(59, 130, 246, 0.2)" />
             <line x1="0" y1="0" x2="0" y2="40" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrowhead)" />
             {/* Drag Handle */}
             <circle r="20" fill="transparent" />
          </g>

           <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>

        </svg>
        <div className="absolute top-2 left-2 text-xs text-slate-500 bg-white/80 p-1 rounded backdrop-blur-sm pointer-events-none">
          {t('drag_instruction')}
        </div>
      </div>

      {/* Data Panel */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 w-full max-w-sm">
        <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
          <Wind className="w-5 h-5" />
          {t('title')}
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-slate-500">{t('twa')}</span>
            <span className="text-2xl font-mono font-bold text-blue-600">{windAngle}°</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
             <span className="text-slate-500">{t('boat_heading')}</span>
             <span className="text-lg font-mono font-bold text-slate-800">000° (N)</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 uppercase mb-1">{t('speed')}</div>
                <div className="text-xl font-bold text-slate-700">{boatSpeed} kn</div>
             </div>
             <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 uppercase mb-1">{t('vmg')}</div>
                <div className={`text-xl font-bold ${vmg > 0 ? 'text-green-600' : 'text-orange-500'}`}>
                  {vmg} kn
                </div>
             </div>
          </div>

          <div className="pt-2">
            <div className="text-xs font-bold text-slate-400 mb-2 uppercase">{t('optimal_angle')}</div>
            <div className="flex justify-between text-sm">
               <span>{t('close_hauled')}:</span>
               <span className="font-mono">{bestUpwind}° / {360 - bestUpwind}°</span>
            </div>
             <div className="flex justify-between text-sm mt-1">
               <span>Downwind:</span>
               <span className="font-mono">{bestDownwind}° / {360 - bestDownwind}°</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
