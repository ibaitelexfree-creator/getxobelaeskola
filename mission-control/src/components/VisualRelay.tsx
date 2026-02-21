'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore } from '@/store/useMissionStore';
import {
    Camera, Eye, Share2, Trash2, Maximize2, X,
    ExternalLink, Download, Image as ImageIcon,
    RefreshCw, Shield, Globe, Terminal, Activity,
    Zap, Lock, Radio
} from 'lucide-react';

interface Screenshot {
    id: string;
    url: string;
    timestamp: number;
    label: string;
}

export default function VisualRelay() {
    const { services, livePreviewUrl, setLivePreviewUrl } = useMissionStore();
    const [viewMode, setViewMode] = useState<'live' | 'history'>('live');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);
    const [customUrl, setCustomUrl] = useState(livePreviewUrl);
    const [showSettings, setShowSettings] = useState(false);

    // Mock screenshots for the history view
    const [screenshots] = useState<Screenshot[]>([
        { id: '1', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800', timestamp: Date.now() - 3600000, label: 'Course Layout v1' },
        { id: '2', url: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=800', timestamp: Date.now() - 7200000, label: 'Hero Section Mobile' },
    ]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setIframeKey(prev => prev + 1);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleUpdateUrl = () => {
        setLivePreviewUrl(customUrl);
        setShowSettings(false);
    };

    return (
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5">
            {/* HUD Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-status-green/40 animate-ping" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display text-white tracking-widest uppercase flex items-center gap-2">
                            Visual Relay <span className="text-[10px] text-glimmer px-1.5 py-0.5 rounded border border-glimmer/20">V3.5</span>
                        </h2>
                        <p className="text-[9px] text-white/40 font-mono flex items-center gap-1 mt-0.5">
                            <Shield size={10} className="text-status-green" /> ENCRYPTED TUNNEL ACTIVE
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode(viewMode === 'live' ? 'history' : 'live')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'live' ? 'bg-glimmer/10 text-glimmer' : 'text-white/40 hover:bg-white/5'}`}
                    >
                        {viewMode === 'live' ? <Activity size={18} /> : <ImageIcon size={18} />}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-xl text-white/40 hover:bg-white/5"
                    >
                        <Globe size={18} />
                    </button>
                    <button
                        onClick={handleRefresh}
                        className={`p-2 rounded-xl text-white/40 hover:bg-white/5 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Main Viewport */}
            <div className="flex-1 relative overflow-hidden bg-[#050505]">
                <AnimatePresence mode="wait">
                    {viewMode === 'live' ? (
                        <motion.div
                            key="live-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full relative"
                        >
                            {livePreviewUrl ? (
                                <>
                                    <iframe
                                        key={iframeKey}
                                        src={livePreviewUrl}
                                        className="w-full h-full border-none pointer-events-auto"
                                        title="Jules Instant Preview"
                                    />
                                    {/* Scanline Overlay */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-30" />

                                    {/* HUD Elements */}
                                    <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-2">
                                        <div className="flex items-center gap-2 px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-status-green" />
                                            <span className="text-[10px] font-mono text-white/80 tracking-tighter uppercase font-bold">LIVE_FEED: JULES_WORKSPACE</span>
                                        </div>

                                        {useMissionStore.getState().livePreviewPassword && (
                                            <div className="flex items-center gap-2 px-2 py-1 rounded bg-buoy-orange/80 border border-buoy-orange/20 backdrop-blur-sm shadow-[0_0_15px_rgba(255,107,0,0.3)] animate-pulse pointer-events-auto">
                                                <Lock size={10} className="text-white" />
                                                <span className="text-[10px] font-mono text-white tracking-tighter uppercase font-bold">PASS: {useMissionStore.getState().livePreviewPassword}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-sm">
                                                <span className="text-[10px] font-mono text-white/40 tracking-tighter uppercase font-bold text-right block">LATENCY: 42ms</span>
                                            </div>
                                            <div className="px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-sm">
                                                <span className="text-[10px] font-mono text-glimmer tracking-tighter uppercase font-bold">HMR ACTIVE</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                    <div className="w-20 h-20 rounded-full bg-glimmer/5 border border-glimmer/20 flex items-center justify-center mb-6">
                                        <Radio size={40} className="text-glimmer/40 animate-pulse" />
                                    </div>
                                    <h3 className="text-lg font-display text-white mb-2">No Tunnel Detected</h3>
                                    <p className="text-sm text-white/40 max-w-xs mb-8">
                                        Active your secure tunnel or enter a custom URL to see Jules' changes in real-time.
                                    </p>
                                    <button
                                        onClick={() => setShowSettings(true)}
                                        className="btn-primary px-8 py-3 rounded-2xl flex items-center gap-3"
                                    >
                                        <Globe size={18} />
                                        <span>Establish Connection</span>
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="history-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="w-full h-full p-6 overflow-y-auto custom-scrollbar"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                {screenshots.map((shot, index) => (
                                    <div
                                        key={shot.id}
                                        className="glass-card rounded-2xl overflow-hidden aspect-[4/5] relative group"
                                    >
                                        <img src={shot.url} className="w-full h-full object-cover opacity-60" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-3">
                                            <p className="text-[8px] font-mono text-white/40">{new Date(shot.timestamp).toLocaleTimeString()}</p>
                                            <p className="text-xs font-bold text-white truncate">{shot.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Settings Overlay */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-8 items-center justify-center"
                        >
                            <div className="w-full max-w-sm">
                                <h3 className="text-xl font-display text-white mb-2 text-center">Visual Relay Setup</h3>
                                <p className="text-xs text-white/40 mb-8 text-center font-mono uppercase tracking-widest">VPN / Secure Tunnel Configuration</p>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono uppercase text-white/40 ml-1">Live Preview URL</label>
                                        <div className="relative group">
                                            <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-glimmer transition-colors" />
                                            <input
                                                type="text"
                                                value={customUrl}
                                                onChange={(e) => setCustomUrl(e.target.value)}
                                                placeholder="https://your-tunnel.loca.lt"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-glimmer/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setCustomUrl('http://192.168.1.50:3000')}
                                            className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono text-white/60 hover:bg-white/10 hover:text-white transition-all uppercase"
                                        >
                                            Local Host (WiFi)
                                        </button>
                                        <button
                                            onClick={() => setCustomUrl('https://getxobelaeskola.cloud')}
                                            className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono text-white/60 hover:bg-white/10 hover:text-white transition-all uppercase"
                                        >
                                            Production CI
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4">
                                        <button
                                            onClick={() => setShowSettings(false)}
                                            className="flex-1 py-4 rounded-2xl bg-white/5 text-white/60 font-bold text-sm"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            onClick={handleUpdateUrl}
                                            className="flex-1 py-4 rounded-2xl bg-glimmer text-black font-bold text-sm shadow-[0_0_20px_rgba(0,184,212,0.4)]"
                                        >
                                            Link Relay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer / Status Bar */}
            <div className="px-4 py-2 bg-black/20 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-white/20" />
                    <span className="text-[10px] font-mono text-white/20 tracking-tighter select-none">SYSTEM_READY // REMOTE_VISUAL_ENABLED</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Zap size={10} className="text-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
                        <span className="text-[9px] font-mono text-white/40">HMR: ON</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Lock size={10} className="text-status-green shadow-[0_0_5px_rgba(0,230,118,0.5)]" />
                        <span className="text-[9px] font-mono text-white/40">TLS 1.3</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
