'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMissionStore } from '@/store/useMissionStore';
import { pausePool, resumePool, pauseWatchdog, resumeWatchdog } from '@/lib/maestro-client';
import {
    Thermometer, Database, Eye, ToggleLeft, ToggleRight,
    Play, Pause, AlertTriangle, Shield, Settings,
} from 'lucide-react';

function ToggleSwitch({
    on,
    onToggle,
    label,
    loading,
}: {
    on: boolean;
    onToggle: () => void;
    label: string;
    loading?: boolean;
}) {
    return (
        <button
            onClick={onToggle}
            disabled={loading}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
        >
            <span className="text-sm text-white/60">{label}</span>
            <div className="flex items-center gap-2">
                {loading && <div className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />}
                {on ? (
                    <ToggleRight size={24} className="text-status-green" />
                ) : (
                    <ToggleLeft size={24} className="text-white/30" />
                )}
            </div>
        </button>
    );
}

export default function ControlPanel() {
    const { services } = useMissionStore();
    const [poolPaused, setPoolPaused] = useState(false);
    const [watchdogPaused, setWatchdogPaused] = useState(services.watchdog.state === 'PAUSED');
    const [loadingPool, setLoadingPool] = useState(false);
    const [loadingWatchdog, setLoadingWatchdog] = useState(false);

    const handlePoolToggle = async () => {
        setLoadingPool(true);
        try {
            if (poolPaused) await resumePool(); else await pausePool();
            setPoolPaused(!poolPaused);
        } finally {
            setLoadingPool(false);
        }
    };

    const handleWatchdogToggle = async () => {
        setLoadingWatchdog(true);
        try {
            if (watchdogPaused) await resumeWatchdog(); else await pauseWatchdog();
            setWatchdogPaused(!watchdogPaused);
        } finally {
            setLoadingWatchdog(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-display text-glimmer">Control Panel</h2>
                <p className="text-2xs text-white/30 mt-1">System controls & monitoring</p>
            </motion.div>

            {/* Thermal Monitor */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel rounded-2xl p-4"
            >
                <div className="flex items-center gap-2 mb-3">
                    <Thermometer size={16} className="text-buoy-orange" />
                    <span className="text-xs font-mono uppercase tracking-widest text-white/40">Thermal Monitor</span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-2xl font-display ${services.thermal.level > 2 ? 'text-status-red' :
                                services.thermal.level > 1 ? 'text-status-amber' : 'text-status-green'
                            }`}>
                            {services.thermal.label}
                        </p>
                        <p className="text-2xs text-white/30">Level {services.thermal.level}/5</p>
                    </div>

                    {/* Simple thermal bar */}
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((l) => (
                            <div
                                key={l}
                                className={`w-2 rounded-full transition-all ${l < services.thermal.level ? 'h-8' : 'h-3'
                                    } ${l < 2 ? 'bg-status-green/50' :
                                        l < 4 ? 'bg-status-amber/50' : 'bg-status-red/50'
                                    } ${l < services.thermal.level ? 'opacity-100' : 'opacity-20'}`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Pool Control */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-panel rounded-2xl p-4"
            >
                <div className="flex items-center gap-2 mb-3">
                    <Database size={16} className="text-nautical-blue" />
                    <span className="text-xs font-mono uppercase tracking-widest text-white/40">Jules Pool</span>
                </div>

                {/* Pool bar */}
                <div className="mb-3">
                    <div className="flex justify-between mb-1">
                        <span className="text-2xs text-white/40">{services.jules.used} / {services.jules.total}</span>
                        <span className="text-2xs text-white/40">{services.jules.active} active</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-buoy-orange/60 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(services.jules.used / services.jules.total) * 100}%` }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        />
                    </div>
                </div>

                <ToggleSwitch
                    on={!poolPaused}
                    onToggle={handlePoolToggle}
                    label={poolPaused ? 'Pool Paused' : 'Pool Active'}
                    loading={loadingPool}
                />
            </motion.div>

            {/* Watchdog Control */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel rounded-2xl p-4"
            >
                <div className="flex items-center gap-2 mb-3">
                    <Eye size={16} className="text-brass-gold" />
                    <span className="text-xs font-mono uppercase tracking-widest text-white/40">Watchdog</span>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                        { label: 'Loops', value: services.watchdog.loops, color: 'text-status-amber' },
                        { label: 'Stalls', value: services.watchdog.stalls, color: 'text-status-amber' },
                        { label: 'Crashes', value: services.watchdog.crashes, color: 'text-status-red' },
                        { label: 'State', value: services.watchdog.state.slice(0, 3), color: 'text-white/60' },
                    ].map((s) => (
                        <div key={s.label} className="text-center">
                            <p className={`text-lg font-display ${s.color}`}>{s.value}</p>
                            <p className="text-2xs text-white/20">{s.label}</p>
                        </div>
                    ))}
                </div>

                <ToggleSwitch
                    on={!watchdogPaused}
                    onToggle={handleWatchdogToggle}
                    label={watchdogPaused ? 'Watchdog Paused' : 'Watchdog Active'}
                    loading={loadingWatchdog}
                />
            </motion.div>
        </div>
    );
}
