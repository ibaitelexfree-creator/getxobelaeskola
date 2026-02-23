'use client';

import { motion } from 'framer-motion';
import { Globe, HardDrive, ExternalLink } from 'lucide-react';
import { useMissionStore } from '@/store/useMissionStore';

export default function EnvironmentSelector() {
    const { previewMode, setPreviewMode, latestPreviews } = useMissionStore();

    const modes = [
        { id: 'render', label: 'Render Preview', icon: <Globe size={14} />, desc: 'Entorno aislado en la nube' },
        { id: 'local', label: 'Local / VPN', icon: <HardDrive size={14} />, desc: 'Túnel directo a desarrollo' },
    ] as const;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest">Preview Environment</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${previewMode === 'render' ? 'bg-buoy-orange/20 text-buoy-orange' : 'bg-status-green/20 text-status-green'}`}>
                    {previewMode.toUpperCase()} ACTIVE
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {modes.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => setPreviewMode(mode.id)}
                        className={`flex flex-col gap-2 p-3 rounded-xl border transition-all text-left ${previewMode === mode.id
                                ? 'bg-white/10 border-white/20'
                                : 'bg-white/5 border-transparent opacity-50 hover:opacity-80'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className={previewMode === mode.id ? 'text-buoy-orange' : 'text-white'}>
                                {mode.icon}
                            </span>
                            <span className="text-xs font-medium">{mode.label}</span>
                        </div>
                        <p className="text-[10px] text-white/40 leading-tight">{mode.desc}</p>
                    </button>
                ))}
            </div>

            {latestPreviews.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-wider">Recent Previews</p>
                    {latestPreviews.slice(0, 3).map((preview, i) => (
                        <motion.a
                            key={i}
                            href={previewMode === 'render' ? preview.url : 'http://localhost:3000'} // Local fallback
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-[11px] font-mono text-white/80 truncate">{preview.branch}</span>
                                <span className="text-[9px] text-white/30">{new Date(preview.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <ExternalLink size={12} className="text-white/20 flex-shrink-0" />
                        </motion.a>
                    ))}
                </div>
            )}
        </div>
    );
}
