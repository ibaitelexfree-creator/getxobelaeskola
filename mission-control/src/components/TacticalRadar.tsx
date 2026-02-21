'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, X, AlertCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useMissionStore } from '@/store/useMissionStore';

// ── Types ──────────────────────────────────────────────────────────────
interface RadarContact {
    id: string;
    angle: number;
    distance: number;
    label: string;
    health: 'online' | 'offline' | 'degraded' | 'unknown';
    icon: string;
    group: 'clawdbot' | 'jules' | 'infra';
    errorMsg?: string;
}

// ── Error Detail Modal ──────────────────────────────────────────────────
function ErrorModal({ contact, onClose }: { contact: RadarContact; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
                initial={{ scale: 0.85, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.85, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-full max-w-xs bg-[#0a0f1a] border border-status-red/40 rounded-2xl p-5 shadow-[0_0_40px_rgba(255,59,59,0.2)]"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={18} className="text-status-red" />
                        <span className="font-mono text-sm font-bold text-status-red uppercase tracking-widest">
                            {contact.icon} {contact.label}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Status pill */}
                <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border ${contact.health === 'offline'
                        ? 'text-status-red border-status-red/40 bg-status-red/10'
                        : 'text-status-amber border-status-amber/40 bg-status-amber/10'
                        }`}>
                        {contact.health}
                    </span>
                </div>

                {/* Error message */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 font-mono text-xs text-white/70 leading-relaxed">
                    {contact.errorMsg || 'No hay respuesta del servicio. Puede que esté caído o inaccesible.'}
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 w-full py-2.5 bg-status-red/10 border border-status-red/30 text-status-red text-xs font-bold font-mono uppercase tracking-widest rounded-xl hover:bg-status-red/20 transition-colors"
                >
                    Cerrar
                </button>
            </motion.div>
        </motion.div>
    );
}

// ── Main Component ──────────────────────────────────────────────────────
export default function TacticalRadar() {
    const { services } = useMissionStore();
    const [sweepAngle, setSweepAngle] = useState(0);
    const [selectedContact, setSelectedContact] = useState<RadarContact | null>(null);

    // ── Static contacts organized by group ────────────────────────────
    const radarContacts: RadarContact[] = useMemo(() => {
        const watchdogH = services.watchdog.state === 'ACTIVE' ? 'online'
            : services.watchdog.state === 'STALLED' ? 'degraded' : 'offline';

        return [
            // ── GROUP: ClawdBot (top-left zone, 230–300°) ──
            {
                id: 'clawd-hq',
                angle: 240,
                distance: 80,
                label: 'CLAWD',
                health: services.clawdbot.health,
                icon: '🤖',
                group: 'clawdbot',
                errorMsg: services.clawdbot.health !== 'online'
                    ? 'ClawdBot HQ no responde. Verifica que el proceso de ClawdBot esté activo.'
                    : undefined,
            },
            {
                id: 'clawd-p1',
                angle: 255,
                distance: 55,
                label: 'PULPO-1',
                health: services.clawdbot.health,
                icon: '🐙',
                group: 'clawdbot',
                errorMsg: 'Pulpo 1 (delegación) no responde.',
            },
            {
                id: 'clawd-p2',
                angle: 270,
                distance: 70,
                label: 'PULPO-2',
                health: services.clawdbot.health,
                icon: '🐙',
                group: 'clawdbot',
                errorMsg: 'Pulpo 2 (delegación) no responde.',
            },
            {
                id: 'clawd-p3',
                angle: 285,
                distance: 50,
                label: 'PULPO-3',
                health: services.clawdbot.health,
                icon: '🐙',
                group: 'clawdbot',
                errorMsg: 'Pulpo 3 (delegación) no responde.',
            },

            // ── GROUP: Jules (right zone, 30–110°) ──
            {
                id: 'jules-1',
                angle: 40,
                distance: 75,
                label: 'JULES-1',
                health: services.jules.health,
                icon: '🐙',
                group: 'jules',
                errorMsg: services.jules.health !== 'online'
                    ? `Jules API no disponible. Sesiones: ${services.jules.used}/${services.jules.total}`
                    : undefined,
            },
            {
                id: 'jules-2',
                angle: 70,
                distance: 60,
                label: 'JULES-2',
                health: services.jules.health,
                icon: '🐙',
                group: 'jules',
                errorMsg: 'Jules instance 2 no responde.',
            },
            {
                id: 'jules-3',
                angle: 100,
                distance: 80,
                label: 'JULES-3',
                health: services.jules.health,
                icon: '🐙',
                group: 'jules',
                errorMsg: 'Jules instance 3 no responde.',
            },

            // ── GROUP: Infra (bottom zone, 140–200°) ──
            {
                id: 'flash-svc',
                angle: 145,
                distance: 72,
                label: 'RELAY',
                health: services.flash.health,
                icon: '⚡',
                group: 'infra',
                errorMsg: 'Fast Relay (flash) no responde. Verifica la API de Claude.',
            },
            {
                id: 'watchdog-svc',
                angle: 170,
                distance: 45,
                label: 'WDOG',
                health: watchdogH,
                icon: '🛡️',
                group: 'infra',
                errorMsg: watchdogH !== 'online'
                    ? `Watchdog ${services.watchdog.state}. Loops: ${services.watchdog.loops}, Stalls: ${services.watchdog.stalls}`
                    : undefined,
            },
            {
                id: 'browserless',
                angle: 195,
                distance: 68,
                label: 'BSRLS',
                health: services.browserless?.health ?? 'unknown',
                icon: '🌐',
                group: 'infra',
                errorMsg: 'Browserless no responde. Docker caído o puerto incorrecto.',
            },
        ];
    }, [services]);

    // ── Sweep animation ──────────────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            setSweepAngle((prev) => (prev + 2) % 360);
        }, 40);
        return () => clearInterval(interval);
    }, []);

    // ── Helpers ──────────────────────────────────────────────────────
    const healthColor = (h: string) => {
        if (h === 'online') return '#00FF94';
        if (h === 'degraded') return '#FFB800';
        if (h === 'offline') return '#FF3B3B';
        return '#555';
    };

    const healthBg = (h: string) => {
        if (h === 'online') return 'bg-status-green';
        if (h === 'degraded') return 'bg-status-amber';
        if (h === 'offline') return 'bg-status-red';
        return 'bg-white/20';
    };

    const groupColor = (g: string) => {
        if (g === 'clawdbot') return 'rgba(0,209,255,0.15)';
        if (g === 'jules') return 'rgba(0,255,148,0.1)';
        return 'rgba(255,184,0,0.1)';
    };

    return (
        <>
            <div className="relative w-full aspect-square max-w-[280px] mx-auto">
                {/* Background */}
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,255,148,0.03)_0%,transparent_70%)]" />

                {/* Rings */}
                {[0, 15, 30, 45].map((inset) => (
                    <div
                        key={inset}
                        className="absolute rounded-full border border-white/[0.06]"
                        style={{ inset: `${inset}%` }}
                    />
                ))}

                {/* Axis */}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/[0.04]" />
                <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/[0.04]" />

                {/* Group zone arcs (visual hint) */}
                {[
                    { group: 'clawdbot', startDeg: 225, endDeg: 305 },
                    { group: 'jules', startDeg: 20, endDeg: 120 },
                    { group: 'infra', startDeg: 130, endDeg: 215 },
                ].map(({ group, startDeg, endDeg }) => (
                    <div
                        key={group}
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                            background: `conic-gradient(from ${startDeg}deg, ${groupColor(group)} 0deg, ${groupColor(group)} ${endDeg - startDeg}deg, transparent ${endDeg - startDeg}deg)`,
                            opacity: 0.5,
                        }}
                    />
                ))}

                {/* Sweep */}
                <div
                    className="absolute inset-0 origin-center pointer-events-none z-10 opacity-50"
                    style={{
                        transform: `rotate(${sweepAngle - 40}deg)`,
                        background: 'conic-gradient(from 0deg at 50% 50%, rgba(0, 255, 148, 0.35) 0deg, rgba(0, 255, 148, 0.08) 22deg, transparent 44deg)',
                        borderRadius: '50%',
                    }}
                />

                {/* Contacts — ALWAYS VISIBLE, not sweep-dependent */}
                {radarContacts.map((c) => {
                    const isOffline = c.health === 'offline' || c.health === 'degraded';
                    const x = 50 + Math.cos((c.angle - 90) * (Math.PI / 180)) * (c.distance / 2);
                    const y = 50 + Math.sin((c.angle - 90) * (Math.PI / 180)) * (c.distance / 2);
                    const clickable = isOffline;

                    return (
                        <div
                            key={c.id}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                            style={{ left: `${x}%`, top: `${y}%` }}
                        >
                            {/* Pulse ring for offline */}
                            {isOffline && (
                                <div
                                    className="absolute inset-[-4px] rounded-full animate-ping opacity-50"
                                    style={{ backgroundColor: healthColor(c.health) }}
                                />
                            )}

                            {/* Dot */}
                            <button
                                onClick={() => clickable ? setSelectedContact(c) : undefined}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 flex-shrink-0 ${healthBg(c.health)} ${clickable ? 'cursor-pointer hover:scale-150 active:scale-125' : 'cursor-default'
                                    }`}
                                style={{
                                    boxShadow: `0 0 ${isOffline ? 10 : 6}px ${healthColor(c.health)}`,
                                }}
                                title={c.label}
                            />

                            {/* Label — always visible */}
                            <div
                                className="absolute left-full top-0 ml-2 whitespace-nowrap pointer-events-none"
                                style={{ transform: 'translateY(-50%)' }}
                            >
                                <div className="flex items-center gap-2 bg-black px-2 py-1 rounded-xl border-2 border-white/20 backdrop-blur-xl">
                                    <span className="text-[14px]">{c.icon}</span>
                                    <span
                                        className="text-[14px] font-black uppercase tracking-tighter"
                                        style={{ color: healthColor(c.health) }}
                                    >
                                        {c.label}
                                    </span>
                                    {isOffline && (
                                        <span className="text-[12px] text-status-red font-black animate-pulse ml-1">!</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
                    <Crosshair size={14} className="text-buoy-orange drop-shadow-[0_0_5px_rgba(255,77,0,0.6)]" />
                </div>

                {/* Group labels */}
                <div className="absolute top-[12%] right-[8%] text-[7px] font-mono text-status-green/50 uppercase tracking-wider">JULES</div>
                <div className="absolute bottom-[22%] left-[5%] text-[7px] font-mono text-status-blue/50 uppercase tracking-wider">CLAWD</div>
                <div className="absolute bottom-[18%] right-[10%] text-[7px] font-mono text-status-amber/50 uppercase tracking-wider">INFRA</div>

                {/* Offline counter */}
                {radarContacts.filter(c => c.health !== 'online').length > 0 && (
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-status-red animate-ping" />
                        <span className="text-[7px] font-mono text-status-red/80 uppercase">
                            {radarContacts.filter(c => c.health !== 'online').length} ALERT
                        </span>
                    </div>
                )}

                {/* Online badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-status-green animate-pulse" />
                    <span className="text-[7px] font-mono text-status-green/50 uppercase">
                        {radarContacts.filter(c => c.health === 'online').length}/{radarContacts.length}
                    </span>
                </div>
            </div>

            {/* Error Modal */}
            <AnimatePresence>
                {selectedContact && (
                    <ErrorModal
                        contact={selectedContact}
                        onClose={() => setSelectedContact(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
