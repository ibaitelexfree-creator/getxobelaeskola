'use client';

import { motion } from 'framer-motion';
import { useMissionStore } from '@/store/useMissionStore';
import { setPowerMode, startService } from '@/lib/api';
import { Zap, Shield, Power, Cpu, Database, Binary } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function ResourceManager() {
    const { power } = useMissionStore();

    const handleModeSwitch = async (mode: 'eco' | 'performance') => {
        try {
            await Haptics.impact({ style: ImpactStyle.Medium });
            // Immediate feedback
            useMissionStore.getState().updatePower({ mode });
            await setPowerMode(mode);
        } catch (error) {
            console.error('Failed to set power mode:', error);
        }
    };

    const handleStartService = async (key: string) => {
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
            await startService(key);
        } catch (error) {
            console.error(`Failed to start service ${key}:`, error);
        }
    };

    return (
        <div className="flex flex-col gap-4 mx-1">
            <div className="flex items-center justify-between mb-1">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-[10px] font-mono font-bold text-buoy-orange uppercase tracking-[0.3em]">Reactor Core</h2>
                    <p className="text-[8px] font-mono text-white/20">RESOURCE_CONSUMPTION_MANAGEMENT</p>
                </div>
                <div className="flex bg-white/5 rounded-lg p-1 gap-1 border border-white/5">
                    <button
                        onClick={() => handleModeSwitch('eco')}
                        className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${power.mode === 'eco'
                            ? 'bg-status-green text-black shadow-[0_0_15px_rgba(0,255,148,0.3)]'
                            : 'text-white/30 hover:text-white/60'
                            }`}
                    >
                        Eco
                    </button>
                    <button
                        onClick={() => handleModeSwitch('performance')}
                        className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${power.mode === 'performance'
                            ? 'bg-buoy-orange text-black shadow-[0_0_15px_rgba(255,107,0,0.3)]'
                            : 'text-white/30 hover:text-white/60'
                            }`}
                    >
                        Blast
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {Object.entries(power.services).map(([key, svc], i) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-3 rounded-xl border-white/5 flex items-center justify-between group overflow-hidden relative"
                    >
                        {/* Animated background if running */}
                        {svc.running && (
                            <motion.div
                                className="absolute inset-0 bg-status-green/5 pointer-events-none"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        )}

                        <div className="flex items-center gap-3 relative z-10">
                            <div className={`p-2 rounded-lg ${svc.running ? 'bg-status-green/10 text-status-green' : 'bg-white/5 text-white/20'}`}>
                                {key === 'OLLAMA' ? <Cpu size={14} /> :
                                    key === 'CHROMA' ? <Database size={14} /> :
                                        <Binary size={14} />}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${svc.running ? 'text-white' : 'text-white/30'}`}>
                                    {svc.name}
                                </span>
                                <span className="text-[8px] font-mono text-white/20 uppercase">
                                    {svc.type === 'docker' ? 'Container' : 'Process'} • {svc.running ? 'Active' : 'Standby'}
                                </span>
                            </div>
                        </div>

                        {!svc.running && (
                            <button
                                onClick={() => handleStartService(key)}
                                className="relative z-10 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-mono font-bold text-white/40 hover:text-white transition-all uppercase tracking-widest border border-white/5"
                            >
                                Ignite
                            </button>
                        )}

                        {svc.running && (
                            <div className="flex items-center gap-2 relative z-10">
                                <div className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse shadow-[0_0_5px_rgba(0,255,148,0.8)]" />
                                <span className="text-[9px] font-mono text-status-green uppercase font-bold tracking-tighter">Engaged</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {power.mode === 'eco' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-status-green/5 border border-status-green/10">
                    <Shield size={14} className="text-status-green shrink-0" />
                    <p className="text-[10px] text-status-green/70 font-mono leading-tight uppercase tracking-tight">
                        Power Save Protocol: Standby services auto-purge after 15m idle.
                    </p>
                </div>
            )}
        </div>
    );
}
