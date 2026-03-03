'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore } from '@/store/useMissionStore';
import {
    Camera, Eye, Share2, Trash2, Maximize2, X,
    ExternalLink, Download, Image as ImageIcon,
    RefreshCw, Shield, Globe, Terminal, Activity,
    Zap, Lock, Radio, Play, Square, Power, Settings
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    getLivePreviewConfig, getVisualHistory, Screenshot,
    startService, stopService, resetService
} from '@/lib/api';

export default function VisualRelay() {
    const { services, livePreviewUrl, setLivePreviewUrl, serverUrl } = useMissionStore();
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<'live' | 'history'>('live');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);
    const [customUrl, setCustomUrl] = useState(livePreviewUrl);
    const [showSettings, setShowSettings] = useState(false);
    const [tunnelSource, setTunnelSource] = useState<string | null>(null);
    const [localIp, setLocalIp] = useState('localhost');
    const [availableApps, setAvailableApps] = useState<any[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string>('MAIN_APP');
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const config = await getLivePreviewConfig();
                if (config?.url) {
                    setLivePreviewUrl(config.url);
                    setCustomUrl(config.url);
                    setTunnelSource(config.source || null);
                    if (config.localIp) setLocalIp(config.localIp);
                    if (config.apps) setAvailableApps(config.apps);

                    if (config.password) {
                        useMissionStore.getState().setLivePreviewPassword(config.password);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch live preview config:', error);
            }
        };

        fetchConfig();

        if (viewMode === 'history') {
            loadHistory();
        }
    }, [viewMode, setLivePreviewUrl]);

    // Handle iframe source with proxy for Cloudflare tunnels
    const getIframeSrc = () => {
        if (!livePreviewUrl) return '';
        if (tunnelSource === 'cloudflare') {
            const serverUrl = useMissionStore.getState().serverUrl;
            // Pass encoded URL to proxy so it knows what to load
            return `${serverUrl}/api/visual/proxy?url=${encodeURIComponent(livePreviewUrl)}&t=${iframeKey}`;
        }
        return livePreviewUrl;
    };

    const loadHistory = async () => {
        try {
            const data = await getVisualHistory();
            if (data?.screenshots) {
                // Ensure URLs are absolute if they are relative
                const baseUrl = serverUrl;
                const prepared = data.screenshots.map(s => ({
                    ...s,
                    url: s.url.startsWith('http') ? s.url : `${baseUrl}${s.url}`
                }));
                setScreenshots(prepared);
            }
        } catch (error) {
            console.error('Failed to load visual history:', error);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        if (viewMode === 'live') {
            setIframeKey(prev => prev + 1);
        } else {
            loadHistory();
        }
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleUpdateUrl = (url?: string) => {
        const targetUrl = url || customUrl;

        // Detect source - explicitly check if it's cloudflare
        if (targetUrl.includes('cloudflare') || targetUrl.includes('trycloudflare')) {
            setTunnelSource('cloudflare');
        } else {
            // If it's the exact same URL as when we loaded, keep the original tunnel source
            // otherwise clear it to avoid proxying non-tunnel links
            setTunnelSource(targetUrl === customUrl ? tunnelSource : null);
        }

        setLivePreviewUrl(targetUrl);
        setCustomUrl(targetUrl);
        setIframeKey(prev => prev + 1);
        setShowSettings(false);
    };

    const handleServiceAction = async (action: 'start' | 'stop' | 'reset') => {
        try {
            if (action === 'start') await startService(selectedAppId);
            else if (action === 'stop') await stopService(selectedAppId);
            else if (action === 'reset') await resetService(selectedAppId);

            // Notification or visual feedback could go here
            handleRefresh();
        } catch (error) {
            console.error(`Service action ${action} failed:`, error);
        }
    };

    const handleAppSelect = (app: any) => {
        setSelectedAppId(app.id);
        const url = app.url || `http://${localIp}:${app.port}`;
        handleUpdateUrl(url);
    };

    return (
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5">
            {/* HUD Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md relative z-50 pointer-events-auto">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-status-green animate-pulse" />
                        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-status-green/40 animate-ping" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display text-white tracking-widest uppercase flex items-center gap-2">
                            {t('visual.title')} <span className="text-[10px] text-glimmer px-1.5 py-0.5 rounded border border-glimmer/20">V3.5</span>
                        </h2>
                        <p className="text-[10px] text-white/40 font-mono flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
                            <Shield size={12} className="text-status-green" /> {t('visual.tunnel_active')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            setViewMode(viewMode === 'live' ? 'history' : 'live');
                        }}
                        className={`p-3 rounded-2xl transition-all active:scale-75 cursor-pointer touch-none ${viewMode === 'live' ? 'bg-glimmer/20 text-glimmer border border-glimmer/50 shadow-[0_0_15px_rgba(0,184,212,0.3)]' : 'bg-white/10 text-white/60 border border-white/20'}`}
                        title={viewMode === 'live' ? 'Ver Historial' : 'Ver En Vivo'}
                    >
                        {viewMode === 'live' ? <Activity size={24} /> : <ImageIcon size={24} />}
                    </button>
                    <button
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            setShowSettings(!showSettings);
                        }}
                        className="p-3 rounded-2xl bg-white/10 text-white/60 border border-white/20 active:scale-75 transition-all cursor-pointer touch-none"
                        title="Configuración de Red"
                    >
                        <Globe size={24} />
                    </button>
                    <button
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            handleRefresh();
                        }}
                        className={`p-3 rounded-2xl bg-white/10 text-white/60 border border-white/20 active:scale-75 transition-all cursor-pointer touch-none ${isRefreshing ? 'animate-spin' : ''}`}
                        title="Refrescar Feed"
                    >
                        <RefreshCw size={24} />
                    </button>
                </div>
            </div>

            {/* Main Viewport */}
            <div className="flex-1 relative overflow-hidden bg-[#050505] min-h-[400px]">
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
                                        src={getIframeSrc()}
                                        className="w-full h-full border-none pointer-events-auto bg-white"
                                        title="Jules Instant Preview"
                                        onLoad={() => console.log('Iframe loaded')}
                                    />
                                    {/* Scanline Overlay */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-10" />

                                    {/* HUD Elements */}
                                    <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-2">
                                        <div className="flex items-center gap-2 px-2 py-1 rounded bg-black/80 border border-white/10 backdrop-blur-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
                                            <span className="text-[10px] font-mono text-white/80 tracking-tighter uppercase font-bold">{t('visual.live_feed')}</span>
                                        </div>

                                        {useMissionStore.getState().livePreviewPassword && (
                                            <div
                                                className="flex flex-col gap-1 pointer-events-auto cursor-pointer group"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(useMissionStore.getState().livePreviewPassword);
                                                    alert('Password copied to clipboard!');
                                                }}
                                            >
                                                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-buoy-orange border border-white/20 shadow-[0_0_15px_rgba(255,107,0,0.4)] transition-transform active:scale-95">
                                                    <Lock size={12} className="text-white" />
                                                    <span className="text-[11px] font-mono text-white tracking-tighter uppercase font-black">
                                                        TUNNEL_PWD: {useMissionStore.getState().livePreviewPassword}
                                                    </span>
                                                    <span className="text-[8px] bg-white/20 px-1 rounded text-white ml-auto">{t('visual.tap_to_copy')}</span>
                                                </div>
                                                <p className="text-[8px] text-white/40 font-mono italic ml-1 group-hover:text-white/60">{t('visual.pwd_help')}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                                        <button
                                            onClick={() => {
                                                if (confirm(t('visual.troubleshoot_msg'))) {
                                                    handleRefresh();
                                                }
                                            }}
                                            className="px-2 py-1 rounded bg-status-red/20 border border-status-red/40 backdrop-blur-sm text-[10px] font-mono text-status-red hover:bg-status-red/30 transition-colors pointer-events-auto"
                                        >
                                            {t('visual.troubleshoot')}
                                        </button>
                                    </div>

                                    <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-sm">
                                                <span className="text-[10px] font-mono text-white/40 tracking-tighter uppercase font-bold text-right block">{t('visual.signal')}</span>
                                            </div>
                                            <div className="px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-sm">
                                                <span className="text-[10px] font-mono text-glimmer tracking-tighter uppercase font-bold">{t('visual.bypass')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                    <div className="w-20 h-20 rounded-full bg-glimmer/5 border border-glimmer/20 flex items-center justify-center mb-6">
                                        <Radio size={40} className="text-glimmer/40 animate-pulse" />
                                    </div>
                                    <h3 className="text-lg font-display text-white mb-2">{t('visual.no_tunnel')}</h3>
                                    <p className="text-sm text-white/40 max-w-xs mb-8">
                                        {t('visual.no_tunnel_desc')}
                                    </p>
                                    <button
                                        onClick={() => setShowSettings(true)}
                                        className="btn-primary px-8 py-3 rounded-2xl flex items-center gap-3"
                                    >
                                        <Globe size={18} />
                                        <span>{t('visual.establish')}</span>
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
                            className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col p-8 items-center justify-center pointer-events-auto"
                        >
                            <div className="w-full max-w-sm">
                                <h3 className="text-2xl font-display text-white mb-2 text-center">{t('visual.settings_title')}</h3>
                                <p className="text-[10px] text-glimmer mb-8 text-center font-mono uppercase tracking-[0.3em] font-black">{t('visual.settings_subtitle')}</p>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-mono uppercase text-white/40 ml-1 font-bold tracking-widest">{t('visual.preview_url')}</label>
                                        <div className="relative group">
                                            <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-glimmer transition-colors" />
                                            <input
                                                type="text"
                                                value={customUrl}
                                                onChange={(e) => setCustomUrl(e.target.value)}
                                                placeholder="https://your-tunnel.loca.lt"
                                                className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] py-5 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-glimmer/50 transition-all font-mono shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    {/* App Selector / Services */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Settings className="w-3 h-3 text-glimmer" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter text-white/40">Select Project</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {availableApps.map(app => (
                                                <button
                                                    key={app.id}
                                                    onPointerDown={() => handleAppSelect(app)}
                                                    className={`px-4 py-3 rounded-xl border transition-all flex items-center justify-between group ${selectedAppId === app.id
                                                            ? 'bg-glimmer/10 border-glimmer text-glimmer'
                                                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-[11px] font-black uppercase tracking-tighter">{app.name}</span>
                                                        <span className="text-[9px] opacity-40 font-mono italic">{app.type.toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onPointerDown={(e) => { e.stopPropagation(); handleServiceAction('start'); }}
                                                            className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 active:scale-90 transition-all"
                                                        >
                                                            <Play className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onPointerDown={(e) => { e.stopPropagation(); handleServiceAction('stop'); }}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-90 transition-all"
                                                        >
                                                            <Square className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                                        <button
                                            onPointerDown={() => setShowSettings(false)}
                                            className="flex-1 py-5 rounded-[2rem] bg-white/5 text-white/40 font-black text-xs uppercase tracking-widest active:bg-white/10 active:scale-95 transition-all border border-white/5"
                                        >
                                            {t('visual.dismiss')}
                                        </button>
                                        <button
                                            onPointerDown={() => handleUpdateUrl()}
                                            className="flex-1 py-5 rounded-[2rem] bg-glimmer text-black font-black text-xs uppercase tracking-widest shadow-[0_15px_35px_rgba(0,184,212,0.4)] active:scale-90 transition-all"
                                        >
                                            {t('visual.link_relay')}
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
                    <span className="text-[10px] font-mono text-white/20 tracking-tighter select-none">SYSTEM_READY // {t('visual.remote_enabled')}</span>
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
