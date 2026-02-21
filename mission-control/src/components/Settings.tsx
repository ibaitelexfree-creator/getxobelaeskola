'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMissionStore } from '@/store/useMissionStore';
import {
    Settings as SettingsIcon, Globe, RefreshCcw, Bell,
    Shield, Server, Smartphone, Info, Save, ChevronRight,
    Database, Cpu, Wifi, Package, Download, HardDrive
} from 'lucide-react';
import { getReleases, getDownloadUrl, Release } from '@/lib/maestro-client';
import { Browser } from '@capacitor/browser';

export default function Settings() {
    const {
        serverUrl, setServerUrl,
        autoRefreshMs, setAutoRefresh,
        connected
    } = useMissionStore();

    const [localUrl, setLocalUrl] = useState(serverUrl);
    const [hasChanges, setHasChanges] = useState(false);
    const [releases, setReleases] = useState<Release[]>([]);
    const [downloading, setDownloading] = useState<number | null>(null);

    useEffect(() => {
        setHasChanges(localUrl !== serverUrl);
    }, [localUrl, serverUrl]);

    useEffect(() => {
        if (connected) {
            getReleases().then(res => {
                if (res.success) setReleases(res.releases.slice(0, 5));
            }).catch(console.error);
        }
    }, [connected]);

    const handleSave = () => {
        setServerUrl(localUrl);
        setHasChanges(false);
    };

    const handleDownload = async (assetId: number) => {
        setDownloading(assetId);
        try {
            const url = getDownloadUrl(assetId);
            await Browser.open({ url });
        } catch (err) {
            console.error('Download failed:', err);
        } finally {
            setTimeout(() => setDownloading(null), 2000);
        }
    };

    const intervals = [
        { label: 'Fast (5s)', value: 5000 },
        { label: 'Normal (10s)', value: 10000 },
        { label: 'Balanced (30s)', value: 30000 },
        { label: 'Battery Saver (60s)', value: 60000 },
    ];

    return (
        <div className="flex flex-col gap-6 pb-32">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-display text-glimmer">Configuration</h2>
                <p className="text-xs text-white/30 mt-1 uppercase tracking-widest font-mono">Mission Control Preferences</p>
            </motion.div>

            {/* Connectivity Section */}
            <section className="flex flex-col gap-3">
                <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] ml-1">Orchestration Server</label>
                <div className="glass-panel rounded-3xl p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${connected ? 'bg-status-green/10 border-status-green/20 text-status-green' : 'bg-status-red/10 border-status-red/20 text-status-red'}`}>
                            <Server size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white/90">Maestro v3 Node</p>
                            <p className={`text-[10px] font-mono uppercase tracking-widest ${connected ? 'text-status-green' : 'text-status-red'}`}>
                                {connected ? 'Sync Operational' : 'Offline / Interrupted'}
                            </p>
                        </div>
                    </div>

                    <div className="relative group">
                        <input
                            type="text"
                            value={localUrl}
                            onChange={(e) => setLocalUrl(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-white/80 focus:outline-none focus:border-buoy-orange/40 transition-all"
                            placeholder="http://192.168.1.XX:3323"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                            <Globe size={16} />
                        </div>
                    </div>

                    {hasChanges && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={handleSave}
                            className="btn-primary w-full py-3 rounded-2xl flex items-center justify-center gap-2 group"
                        >
                            <Save size={16} />
                            <span className="font-bold text-xs uppercase tracking-tighter">Save Endpoint</span>
                        </motion.button>
                    )}
                </div>
            </section>

            {/* Real-time Intel Section */}
            <section className="flex flex-col gap-3">
                <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] ml-1">Polling Interval</label>
                <div className="grid grid-cols-2 gap-2">
                    {intervals.map((interval) => (
                        <button
                            key={interval.value}
                            onClick={() => setAutoRefresh(interval.value)}
                            className={`p-4 rounded-3xl border transition-all text-left flex flex-col gap-1 ${autoRefreshMs === interval.value
                                ? 'bg-buoy-orange/10 border-buoy-orange/30'
                                : 'bg-white/3 border-white/5 hover:bg-white/5'
                                }`}
                        >
                            <p className={`text-xs font-bold tracking-tight ${autoRefreshMs === interval.value ? 'text-buoy-orange' : 'text-white/60'}`}>
                                {interval.label}
                            </p>
                            <div className="flex items-center gap-2">
                                <RefreshCcw size={10} className={`${autoRefreshMs === interval.value ? 'animate-spin-slow' : 'opacity-20'}`} />
                                <span className="text-[9px] font-mono uppercase text-white/20">Sync Rate</span>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Version Control Section */}
            <section className="flex flex-col gap-3">
                <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] ml-1">Version Control</label>
                <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-white/5">
                    {/* Active Version */}
                    <div className="p-5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-status-blue/10 border border-status-blue/20 flex items-center justify-center text-status-blue">
                                <Package size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-white/90">Current Version</p>
                                <p className="text-[10px] font-mono text-white/40">3.0.0-PRO-MAX</p>
                            </div>
                        </div>
                        <span className="px-2 py-1 rounded-md bg-status-green/10 border border-status-green/20 text-[8px] font-mono text-status-green uppercase tracking-tighter shadow-lg shadow-status-green/5">
                            Active
                        </span>
                    </div>

                    {/* Release History */}
                    {releases.length > 0 ? (
                        releases.map((release) => (
                            <div key={release.id} className="p-4 flex flex-col gap-3 group">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-xs font-bold text-white/80">{release.name}</p>
                                        <p className="text-[9px] font-mono text-white/20 uppercase">
                                            {release.tagName} • {new Date(release.publishDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {release.assets && release.assets.length > 0 && (
                                        <button
                                            onClick={() => handleDownload(release.assets[0].id)}
                                            disabled={downloading === release.assets[0].id}
                                            className={`p-3 rounded-2xl border transition-all ${downloading === release.assets[0].id
                                                    ? 'bg-buoy-orange/20 border-buoy-orange text-buoy-orange animate-pulse'
                                                    : 'glass-card border-white/10 text-white/60 hover:text-buoy-orange hover:border-buoy-orange/40'
                                                }`}
                                        >
                                            {downloading === release.assets[0].id ? (
                                                <RefreshCcw size={14} className="animate-spin" />
                                            ) : (
                                                <Download size={14} />
                                            )}
                                        </button>
                                    )}
                                </div>
                                {release.body && (
                                    <p className="text-[9px] text-white/40 font-sans leading-relaxed line-clamp-2 px-1">
                                        {release.body.replace(/\r\n/g, ' ')}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <RefreshCcw size={20} className="mx-auto text-white/10 mb-2 animate-spin-slow" />
                            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Scanning for updates...</p>
                        </div>
                    )}
                </div>
                <p className="text-[8px] font-mono text-white/10 uppercase tracking-tighter px-2">
                    Artifacts are served via Maestro Secure Proxy.
                </p>
            </section>

            {/* App Info Footer */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-4 pb-10">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/20 px-2 uppercase tracking-[0.2em]">
                    <span>App Version</span>
                    <span>3.0.0-PRO-MAX</span>
                </div>
                <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
                    <Info size={14} className="text-white/20" />
                    <p className="text-[10px] text-white/40 leading-relaxed font-sans">
                        Build target: Android Arm64. Designed for autonomous orchestration oversight.
                    </p>
                </div>
            </div>
        </div>
    );
}
