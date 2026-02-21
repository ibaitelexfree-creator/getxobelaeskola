'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useMissionStore } from '@/store/useMissionStore';

export default function TacticalRadar() {
    const { services, activeThreads } = useMissionStore();
    const [sweepAngle, setSweepAngle] = useState(0);
    const [activeContacts, setActiveContacts] = useState<string[]>([]);

    // Combine base services with active threads
    const radarContacts = useMemo(() => {
        const base = [
            { id: 'jules-svc', angle: 45, distance: 85, label: 'JULES HQ', health: services.jules.health, icon: '🐙', layer: null },
            { id: 'flash-svc', angle: 160, distance: 75, label: 'FLASH HQ', health: services.flash.health, icon: '🐙', layer: null },
            { id: 'clawd-svc', angle: 280, distance: 85, label: 'CLAWD HQ', health: services.clawdbot.health, icon: '🤖', layer: null },
            { id: 'watchdog-svc', angle: 330, distance: 40, label: 'SONAR', health: services.watchdog.state === 'ACTIVE' ? 'online' : 'degraded', icon: '📡', layer: null },
        ];

        const threads = activeThreads.map((thread, idx) => ({
            id: thread.id,
            angle: (idx * 40 + 20) % 360, // Spread them out
            distance: 50 + (idx * 10) % 40,
            label: thread.label.substring(0, 10).toUpperCase(),
            health: 'online' as const,
            icon: thread.executor === 'jules' ? '🐙' : (thread.executor === 'flash' ? '🐙' : (thread.executor === 'antigravity' ? '🛸' : '🤖')),
            layer: thread.layer,
        }));

        return [...base, ...threads];
    }, [services, activeThreads]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSweepAngle((prev) => (prev + 3) % 360); // Faster sweep for responsiveness
        }, 40);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        radarContacts.forEach((c) => {
            const angle = c.angle as number;
            // Handle 360-degree wrap-around for detection
            const diff = Math.min(Math.abs(sweepAngle - angle), 360 - Math.abs(sweepAngle - angle));

            if (diff < 6 && !activeContacts.includes(c.id)) {
                setActiveContacts((prev) => [...prev, c.id]);
                // Stay visible for slightly more than one full rotation (~5s) to provide "current vision"
                setTimeout(() => {
                    setActiveContacts((prev) => prev.filter((id) => id !== c.id));
                }, 5000);
            }
        });
    }, [sweepAngle, radarContacts, activeContacts]);

    const getHealthColor = (health: string) => {
        if (health === 'online') return 'bg-status-green';
        if (health === 'degraded') return 'bg-status-amber';
        return 'bg-status-red';
    };

    const getHealthShadow = (health: string) => {
        if (health === 'online') return 'shadow-[0_0_15px_rgba(0,255,148,0.5)]';
        if (health === 'degraded') return 'shadow-[0_0_15px_rgba(255,184,0,0.5)]';
        return 'shadow-[0_0_10px_rgba(255,59,59,0.5)]';
    };

    return (
        <div className="relative w-full aspect-square max-w-[280px] mx-auto group">
            {/* Background Grid */}
            <div className="absolute inset-0 rounded-full border border-white/[0.03] bg-[radial-gradient(circle_at_center,rgba(0,255,148,0.02)_0%,transparent_70%)]" />

            {/* Outer Rings */}
            <div className="absolute inset-0 border border-white/5 rounded-full" />
            <div className="absolute inset-[15%] border border-white/5 rounded-full" />
            <div className="absolute inset-[30%] border border-white/5 rounded-full" />
            <div className="absolute inset-[45%] border border-white/10 rounded-full" />

            {/* Axis Lines */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5" />
            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/5" />

            {/* Sweep Line - FIXED: Centered and Rotating correctly around center */}
            <div
                className="absolute inset-0 origin-center pointer-events-none z-10 opacity-70"
                style={{
                    transform: `rotate(${sweepAngle - 40}deg)`, // Offset to match the leading edge
                    background: 'conic-gradient(from 0deg at 50% 50%, rgba(0, 255, 148, 0.4) 0deg, rgba(0, 255, 148, 0.1) 20deg, transparent 40deg)',
                    borderRadius: '50%'
                }}
            />

            {/* Faint Glow at Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-status-green/5 blur-3xl pointer-events-none" />

            {/* Contacts */}
            {radarContacts.map((c) => {
                const isActive = activeContacts.includes(c.id);
                const isOffline = c.health === 'offline';
                // Polar to Cartesian conversion
                const x = 50 + Math.cos((c.angle - 90) * (Math.PI / 180)) * (c.distance / 2);
                const y = 50 + Math.sin((c.angle - 90) * (Math.PI / 180)) * (c.distance / 2);

                return (
                    <div
                        key={c.id}
                        className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 z-20"
                        style={{ left: `${x}%`, top: `${y}%` }}
                    >
                        <AnimatePresence>
                            {isActive && !isOffline && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{ scale: 5, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`absolute inset-0 rounded-full ${getHealthColor(c.health)} ${getHealthShadow(c.health)}`}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                />
                            )}
                        </AnimatePresence>

                        <div className={`w-2 h-2 rounded-full transition-all duration-700 ${isActive ? `${getHealthColor(c.health)} scale-125 shadow-[0_0_8px_currentColor]` : `${getHealthColor(c.health)}/20`
                            } ${isOffline ? 'animate-pulse' : ''}`} />

                        {(isActive || isOffline) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                                animate={{ opacity: 1, scale: 1, x: 5 }}
                                className="absolute left-full top-0 ml-2 whitespace-nowrap z-30"
                            >
                                <div className="flex flex-col gap-1 items-start">
                                    <div className="flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded border border-white/10 backdrop-blur-md shadow-xl">
                                        <span className="text-[10px]">{c.icon}</span>
                                        <span className={`text-[9px] font-mono font-bold tracking-tight ${isOffline ? 'text-status-red' : 'text-white/90'}`}>
                                            {c.label}
                                        </span>
                                        {c.layer && (
                                            <span className="text-[7px] font-bold text-buoy-orange -mt-1 ml-0.5 font-mono">
                                                [{c.layer}]
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <span className={`text-[6px] font-mono uppercase px-1 rounded-sm bg-black/40 ${c.health === 'online' ? 'text-status-green' : c.health === 'degraded' ? 'text-status-amber' : 'text-status-red'
                                            }`}>
                                            {c.health}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                );
            })}

            {/* Center Point */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-buoy-orange z-40">
                <Crosshair size={16} className="animate-pulse drop-shadow-[0_0_5px_rgba(255,77,0,0.5)]" />
            </div>

            {/* Metadata Overlay */}
            <div className="absolute bottom-2 left-2 text-[7px] font-mono text-white/20 uppercase tracking-widest">
                SCAN_MODE: ACTIVE // GAIN_45db
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-status-green animate-ping" />
                <span className="text-[7px] font-mono text-status-green/60 uppercase">
                    LOCKED: {activeContacts.length}
                </span>
            </div>
        </div>
    );
}
