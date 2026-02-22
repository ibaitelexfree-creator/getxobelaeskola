'use client';

import { motion } from 'framer-motion';
import { Cpu, Thermometer, Zap } from 'lucide-react';
import { useMissionStore } from '@/store/useMissionStore';

export default function HardwareStats({ side }: { side: 'left' | 'right' }) {
    const { hardware } = useMissionStore();

    if (side === 'left') {
        return (
            <div className="hidden lg:flex flex-col gap-6 w-48">
                {/* CPU Panel */}
                <div className="bg-[#0a0f1a]/80 border border-white/5 rounded-2xl p-4 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-status-blue/40" />
                    <div className="flex items-center gap-2 mb-3">
                        <Cpu size={16} className="text-status-blue" />
                        <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">CPU Compute</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[9px] font-mono text-white/30 uppercase">Workload</span>
                                <span className="text-sm font-mono font-bold text-status-blue">{hardware.cpu.load}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-status-blue shadow-[0_0_10px_rgba(0,209,255,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${hardware.cpu.load}%` }}
                                />
                            </div>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <Thermometer size={12} className="text-status-amber" />
                                <span className="text-[9px] font-mono text-white/30 uppercase">Core Temp</span>
                                <span className="ml-auto text-xs font-mono font-bold text-white/80">{hardware.cpu.temp || 42}°C</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System HUD small info */}
                <div className="px-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-1 rounded-full bg-status-green animate-pulse" />
                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">System Kernel: 2.6.2-Stable</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-status-green" />
                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">I/O Bridge: Active</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="hidden lg:flex flex-col gap-6 w-48">
            {/* GPU Panel */}
            <div className="bg-[#0a0f1a]/80 border border-white/5 rounded-2xl p-4 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1 h-full bg-status-green/40" />
                <div className="flex items-center gap-2 mb-3">
                    <Zap size={16} className="text-status-green" />
                    <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">GPU Engine</span>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[9px] font-mono text-white/30 uppercase">Package Temp</span>
                            <span className="text-sm font-mono font-bold text-status-green">{hardware.gpu.temp}°C</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-status-green shadow-[0_0_10px_rgba(0,255,148,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (hardware.gpu.temp / 100) * 100)}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[9px] font-mono text-white/30 uppercase">Hot Spot</span>
                            <span className="text-sm font-mono font-bold text-status-amber">{hardware.gpu.hotspot}°C</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-status-amber shadow-[0_0_10px_rgba(255,184,0,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (hardware.gpu.hotspot / 110) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-2 border-t border-white/5">
                    <span className="text-[8px] font-mono text-white/20 uppercase block truncate">{hardware.gpu.name}</span>
                </div>
            </div>

            {/* Network small info */}
            <div className="px-2 text-right">
                <div className="flex items-center justify-end gap-2 mb-2">
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">Uplink: Synchronized</span>
                    <div className="w-1 h-1 rounded-full bg-status-blue animate-pulse" />
                </div>
                <div className="flex items-center justify-end gap-2">
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">Auth Layer: Secure</span>
                    <div className="w-1 h-1 rounded-full bg-status-blue" />
                </div>
            </div>
        </div>
    );
}
