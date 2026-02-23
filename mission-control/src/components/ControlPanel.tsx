'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMissionStore } from '@/store/useMissionStore';
import { pausePool, resumePool, pauseWatchdog, resumeWatchdog } from '@/lib/maestro-client';
import {
    Thermometer, Database, Eye, ToggleLeft, ToggleRight,
    Play, Pause, AlertTriangle, Shield, Settings,
} from 'lucide-react';

import BuildTrigger from './BuildTrigger';
import EnvironmentSelector from './EnvironmentSelector';

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
    const watchdogActive = services.watchdog.state === 'ACTIVE' || services.watchdog.state === 'RUNNING';
    const watchdogPaused = services.watchdog.state === 'PAUSED';

    const [poolOn, setPoolOn] = useState(watchdogActive);
    const [watchdogOn, setWatchdogOn] = useState(!watchdogPaused);
    const [loadingPool, setLoadingPool] = useState(false);
    const [loadingWatchdog, setLoadingWatchdog] = useState(false);

    // Sync with store when polled data changes
    useEffect(() => {
        setPoolOn(watchdogActive);
        setWatchdogOn(!watchdogPaused);
    }, [watchdogActive, watchdogPaused]);

    const handlePoolToggle = async () => {
        setLoadingPool(true);
        try {
            if (poolOn) await pausePool(); else await resumePool();
            setPoolOn(!poolOn);
        } catch (e) {
            console.error('Pool toggle failed:', e);
        } finally {
            setLoadingPool(false);
        }
    };

    const handleWatchdogToggle = async () => {
        setLoadingWatchdog(true);
        try {
            if (watchdogOn) await pauseWatchdog(); else await resumeWatchdog();
            setWatchdogOn(!watchdogOn);
        } catch (e) {
            console.error('Watchdog toggle failed:', e);
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

            {/* Environment Selection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="glass-panel rounded-2xl p-4 border border-buoy-orange/20 shadow-lg shadow-buoy-orange/5"
            >
                <EnvironmentSelector />
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
                    on={poolOn}
                    onToggle={handlePoolToggle}
                    label={!poolOn ? 'Pool Paused' : 'Pool Active'}
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
                    on={watchdogOn}
                    onToggle={handleWatchdogToggle}
                    label={!watchdogOn ? 'Watchdog Paused' : 'Watchdog Active'}
                    loading={loadingWatchdog}
                />
            </motion.div>

            {/* Trust Tunnel Control */}
            <TrustTunnelCard />

            {/* GitHub Build Control */}
            <BuildTrigger />
        </div>
    );
}

function TrustTunnelCard() {
    const [password, setPassword] = useState('');
    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showInput, setShowInput] = useState(false);

    const checkStatus = async () => {
        try {
            const status = await import('@/lib/maestro-client').then(m => m.getTrustStatus());
            setActive(status.active);
        } catch (e) { }
    };

    const handleToggle = async () => {
        if (!showInput && !active) {
            setShowInput(true);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { toggleTrustTunnel } = await import('@/lib/maestro-client');
            const result = await toggleTrustTunnel(password);
            setActive(result.active);
            setPassword('');
            setShowInput(false);
        } catch (e: any) {
            setError(e.message || 'Error toggling tunnel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`glass-panel rounded-2xl p-4 border transition-colors ${active ? 'border-status-green/30 bg-status-green/5' : 'border-white/10'}`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Shield size={16} className={active ? 'text-status-green' : 'text-white/40'} />
                    <span className="text-xs font-mono uppercase tracking-widest text-white/40">Trust Tunnel</span>
                </div>
                {active && (
                    <span className="px-2 py-0.5 rounded-full bg-status-green/20 text-status-green text-[8px] font-bold uppercase tracking-tight">Active</span>
                )}
            </div>

            <p className="text-2xs text-white/40 mb-4">
                Reduces manual confirmations for Jules & Antigravity. Use with caution.
            </p>

            {showInput && (
                <div className="mb-3 space-y-2">
                    <input
                        type="password"
                        placeholder="Trust Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brass-gold/50"
                        autoFocus
                    />
                    {error && <p className="text-[10px] text-status-red">{error}</p>}
                </div>
            )}

            <button
                onClick={handleToggle}
                disabled={loading}
                className={`w-full p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${active
                    ? 'bg-status-red/10 border border-status-red/20 text-status-red hover:bg-status-red/20'
                    : 'bg-brass-gold/10 border border-brass-gold/20 text-brass-gold hover:bg-brass-gold/20'
                    }`}
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : active ? (
                    <>
                        <Pause size={16} />
                        <span className="text-sm font-medium">Deactivate Trust Tunnel</span>
                    </>
                ) : (
                    <>
                        <Play size={16} />
                        <span className="text-sm font-medium">{showInput ? 'Authorize Now' : 'Activate Trust Tunnel'}</span>
                    </>
                )}
            </button>

            {showInput && !active && (
                <button
                    onClick={() => { setShowInput(false); setError(null); }}
                    className="w-full mt-2 text-2xs text-white/20 hover:text-white/40 transition-colors"
                >
                    Cancel
                </button>
            )}
        </motion.div>
    );
}
