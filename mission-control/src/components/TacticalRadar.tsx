'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMissionStore } from '@/store/useMissionStore';

export default function TacticalRadar() {
    const { services, activeThreads } = useMissionStore();
    const [sweepAngle, setSweepAngle] = useState(0);
    const [activeContacts, setActiveContacts] = useState<string[]>([]);

    // Mapeo dinámico de servicios base + hilos activos
    const baseContacts = [
        { id: 'jules-svc', angle: 45, distance: 85, label: 'JULES HQ', health: services.jules.health, icon: '🐙', layer: null },
        { id: 'flash-svc', angle: 160, distance: 75, label: 'FLASH HQ', health: services.flash.health, icon: '🐙', layer: null },
        { id: 'clawd-svc', angle: 280, distance: 85, label: 'CLAWD HQ', health: services.clawdbot.health, icon: '🤖', layer: null },
        { id: 'watchdog-svc', angle: 330, distance: 40, label: 'SONAR', health: services.watchdog.state === 'ACTIVE' ? 'online' : 'degraded', icon: '📡', layer: null },
    ];

    // Combine with active threads (dynamic positions)
    const radarContacts = [
        ...baseContacts,
        ...activeThreads.map((thread, idx) => ({
            id: thread.id,
            angle: (idx * 40 + 20) % 360, // Spread them out
            distance: 50 + (idx * 10) % 40,
            label: thread.label.substring(0, 10).toUpperCase(),
            health: 'online' as const,
            icon: thread.executor === 'jules' ? '🐙' : (thread.executor === 'flash' ? '🐙' : (thread.executor === 'antigravity' ? '🛸' : '🤖')),
            layer: thread.layer,
        }))
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setSweepAngle((prev) => (prev + 2) % 360);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        radarContacts.forEach((c) => {
            const diff = Math.abs(sweepAngle - (c.angle as number));
            if (diff < 5 && !activeContacts.includes(c.id)) {
                setActiveContacts((prev) => [...prev, c.id]);
                setTimeout(() => {
                    setActiveContacts((prev) => prev.filter((id) => id !== c.id));
                }, 2000);
            }
        });
    }, [sweepAngle, radarContacts]);

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
            {/* Outer Rings */}
            <div className="absolute inset-0 border border-white/5 rounded-full" />
            <div className="absolute inset-[15%] border border-white/5 rounded-full" />
            <div className="absolute inset-[30%] border border-white/5 rounded-full" />
            <div className="absolute inset-[45%] border border-white/10 rounded-full" />

            {/* Axis Lines */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5" />
            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/5" />

            {/* Sweep Line */}
            <div
                className="absolute top-1/2 left-1/2 w-1/2 h-full origin-top transform -translate-x-1/2"
                style={{
                    transform: `translate(-50%, -50%) rotate(${sweepAngle}deg)`,
                    background: 'linear-gradient(to right, transparent, rgba(0, 255, 148, 0.05), rgba(0, 255, 148, 0.3))',
                    clipPath: 'polygon(50% 50%, 100% 0, 100% 15%, 50% 50%)'
                }}
            />

            {/* Contacts */}
            {radarContacts.map((c) => {
                const isActive = activeContacts.includes(c.id);
                const isOffline = c.health === 'offline';
                const x = 50 + Math.cos((c.angle - 90) * (Math.PI / 180)) * (c.distance / 2);
                const y = 50 + Math.sin((c.angle - 90) * (Math.PI / 180)) * (c.distance / 2);

                return (
                    <div
                        key={c.id}
                        className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
                        style={{ left: `${x}%`, top: `${y}%` }}
                    >
                        <AnimatePresence>
                            {isActive && !isOffline && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{ scale: 4, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`absolute inset-0 rounded-full ${getHealthColor(c.health)} ${getHealthShadow(c.health)}`}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            )}
                        </AnimatePresence>

                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-1000 ${isActive ? `${getHealthColor(c.health)} opacity-100` : `${getHealthColor(c.health)}/20 opacity-40`
                            } ${isOffline ? 'animate-pulse' : ''}`} />

                        {(isActive || isOffline) && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 5 }}
                                className="absolute left-full top-0 ml-2 whitespace-nowrap z-10"
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded border border-white/5 backdrop-blur-sm">
                                        <span className="text-[10px]">{c.icon}</span>
                                        <span className={`text-[8px] font-mono font-bold tracking-tighter ${isOffline ? 'text-status-red' : 'text-white/80'}`}>
                                            {c.label}
                                        </span>
                                        {c.layer && (
                                            <span className="text-[7px] font-bold text-buoy-orange -mt-1 ml-0.5 font-mono">
                                                [{c.layer}]
                                            </span>
                                        )}
                                    </div>
                                    {isActive && (
                                        <div className="flex gap-1 justify-end">
                                            <span className={`text-[6px] font-mono uppercase px-1 rounded bg-black/40 ${c.health === 'online' ? 'text-status-green' : c.health === 'degraded' ? 'text-status-amber' : 'text-status-red'
                                                }`}>
                                                {c.health}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                );
            })}

            {/* Center Point */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-buoy-orange">
                <Crosshair size={14} className="animate-pulse" />
            </div>

            {/* Metadata Overlay */}
            <div className="absolute bottom-2 left-2 text-[7px] font-mono text-white/20 uppercase">
                Sonar_v3.0 // Gain: 45db
            </div>
            <div className="absolute top-2 right-2 text-[7px] font-mono text-status-green/40">
                LOCKED: {activeContacts.length}
            </div>
        </div>
    );
}
