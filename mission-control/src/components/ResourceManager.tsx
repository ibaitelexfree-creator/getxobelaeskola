'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore } from '@/store/useMissionStore';
import { setPowerMode, startService, stopService, resetService, pauseService, getServiceLogs } from '@/lib/api';
import { Zap, Shield, Power, Cpu, Database, Binary, Play, Pause, RotateCcw, Globe, ExternalLink, Monitor, Square, FileText, X, AlertCircle, Lock, Copy, CheckCircle } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// VPN passwords for external services (pulled from env via API ideally, hardcoded fallback is empty)
const EXTERNAL_VPN_HINTS: Record<string, { label: string; password?: string; note?: string }> = {
    'https://getxobelaeskola.cloud': {
        label: 'GetxoBelaEskola VPS',
        note: 'No requiere contraseña (dominio público Hostinger)'
    },
    'https://n8n.scarmonit.com': {
        label: 'n8n Automation (Hostinger VPS)',
        note: 'Accede con las credenciales de n8n. Si usas VPN, desconéctala primero.'
    }
};

// ── Types ──────────────────────────────────────────────────────────────
interface ServiceAction {
    id: string;
    label: string;
    description: string;
    icon: any;
    color: string;
}

const getActions = (t: any): Record<string, ServiceAction> => ({
    start: { id: 'start', label: t('actions.start.label'), description: t('actions.start.desc'), icon: Play, color: 'text-status-green' },
    pause: { id: 'pause', label: t('actions.pause.label'), description: t('actions.pause.desc'), icon: Pause, color: 'text-status-amber' },
    stop: { id: 'stop', label: t('actions.stop.label'), description: t('actions.stop.desc'), icon: Square, color: 'text-status-red' },
    reset: { id: 'reset', label: t('actions.reset.label'), description: t('actions.reset.desc'), icon: RotateCcw, color: 'text-status-blue' },
    logs: { id: 'logs', label: t('actions.logs.label'), description: t('actions.logs.desc'), icon: FileText, color: 'text-status-blue' },
    link: { id: 'link', label: t('actions.link.label'), description: t('actions.link.desc'), icon: ExternalLink, color: 'text-status-blue' },
});

// ── External Link Modal ─────────────────────────────────────────────────
function ExternalLinkModal({ url, onClose }: { url: string; onClose: () => void }) {
    const hint = EXTERNAL_VPN_HINTS[url] || { label: url, note: '' };
    const [copied, setCopied] = useState(false);

    const handleOpen = () => {
        window.open(url, '_blank');
        onClose();
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-end justify-center"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-full max-w-lg bg-[#0a0f1a] border border-white/10 rounded-t-3xl p-6 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]"
            >
                {/* Handle */}
                <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-6" />

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-status-blue/10 text-status-blue border border-status-blue/20">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h3 className="font-mono font-black text-sm text-white uppercase tracking-widest">{hint.label}</h3>
                        <p className="text-[9px] font-mono text-white/30 uppercase tracking-tight mt-0.5">ENLACE EXTERNO</p>
                    </div>
                </div>

                {/* URL Row */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
                    <span className="text-[10px] font-mono text-white/40 flex-1 truncate">{url}</span>
                    <button
                        onClick={handleCopyUrl}
                        className="p-1.5 rounded-lg bg-white/10 text-white/60 active:scale-90 transition-all shrink-0"
                    >
                        {copied ? <CheckCircle size={14} className="text-status-green" /> : <Copy size={14} />}
                    </button>
                </div>

                {/* Note / VPN hint */}
                {hint.note && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-status-amber/10 border border-status-amber/20 mb-6">
                        <AlertCircle size={14} className="text-status-amber shrink-0 mt-0.5" />
                        <p className="text-[10px] font-mono text-status-amber/80 leading-relaxed">{hint.note}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 font-black text-[11px] uppercase tracking-widest active:bg-white/10 active:scale-95 transition-all border border-white/5"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleOpen}
                        className="flex-1 py-4 rounded-2xl bg-status-blue text-black font-black text-[11px] uppercase tracking-widest shadow-[0_10px_30px_rgba(0,120,200,0.4)] active:scale-90 transition-all flex items-center justify-center gap-2"
                    >
                        <ExternalLink size={14} />
                        Abrir
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Tooltip Component ───────────────────────────────────────────────────
function ActionTooltip({ action, position }: { action: ServiceAction; position: { x: number; y: number } }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            className="fixed z-[400] pointer-events-none"
            style={{ left: position.x, top: position.y - 80 }}
        >
            <div className="bg-[#0a0f1a]/95 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                    <action.icon size={12} className={action.color} />
                    <span className={`text-[10px] font-mono font-black uppercase tracking-widest ${action.color}`}>
                        {action.label}
                    </span>
                </div>
                <p className="text-[9px] font-mono text-white/70 leading-relaxed uppercase tracking-tight">
                    {action.description}
                </p>
                {/* Arrow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0a0f1a] border-r border-b border-white/10 rotate-45" />
            </div>
        </motion.div>
    );
}

// ── Smart Button with Long Press ────────────────────────────────────────
function ControlButton({
    actionKey,
    onClick,
    className,
    active = false,
    children,
    actions
}: {
    actionKey: string;
    onClick: () => void;
    className: string;
    active?: boolean;
    children: React.ReactNode;
    actions: Record<string, ServiceAction>;
}) {
    const [isPressed, setIsPressed] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startPress = useCallback((e: React.PointerEvent) => {
        setIsPressed(true);
        setMousePos({ x: e.clientX, y: e.clientY });

        // Long press trigger: 500ms
        timerRef.current = setTimeout(() => {
            setShowTooltip(true);
            Haptics.impact({ style: ImpactStyle.Medium }).catch(() => { });
        }, 500);
    }, []);

    const endPress = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // If they released BEFORE the tooltip showed, it was a normal click
        if (isPressed && !showTooltip) {
            onClick();
        }

        setIsPressed(false);
        setShowTooltip(false);
    }, [isPressed, showTooltip, onClick]);

    return (
        <>
            <button
                onPointerDown={startPress}
                onPointerUp={endPress}
                onPointerLeave={endPress}
                className={`${className} transition-all duration-200 ${isPressed ? 'scale-90 opacity-60' : ''}`}
            >
                {children}
            </button>
            <AnimatePresence>
                {showTooltip && (
                    <ActionTooltip action={actions[actionKey]} position={mousePos} />
                )}
            </AnimatePresence>
        </>
    );
}

// ── Log Viewer Modal ────────────────────────────────────────────────────
function LogViewer({ serviceKey, onClose }: { serviceKey: string; onClose: () => void }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await getServiceLogs(serviceKey);
                setLogs(res.logs || []);
            } catch (e) {
                console.error('Failed to fetch logs:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [serviceKey]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center px-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-full max-w-lg bg-[#0a0f1a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[80vh]"
            >
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-status-blue/10 text-status-blue">
                            <FileText size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">
                                Service Logs: {serviceKey}
                            </span>
                            <span className="text-[8px] font-mono text-white/30 truncate">DIAGNOSTIC_FEED_STREAM</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] leading-relaxed bg-black/40">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-30">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span className="text-[8px] uppercase tracking-widest">Integrating...</span>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 opacity-20">
                            <AlertCircle size={24} />
                            <span className="text-[8px] uppercase tracking-widest">No active logs registered</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-3 border-b border-white/5 pb-2 last:border-0">
                                    <span className="text-white/20 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                    <div className="flex flex-col gap-0.5">
                                        <span className={`font-black tracking-tighter ${log.event === 'LOG_ERR' || log.event === 'LOG_STDERR' ? 'text-status-red' :
                                            log.event === 'START' ? 'text-status-green' : 'text-status-blue'
                                            }`}>
                                            {log.event}
                                        </span>
                                        <span className="text-white/60 break-all">{log.details}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-white/5 bg-white/[0.02] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-bold font-mono uppercase tracking-widest rounded-lg transition-colors border border-white/5"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Main Component ──────────────────────────────────────────────────────
export default function ResourceManager() {
    const { power } = useMissionStore();
    const { t } = useTranslation();
    const actions = getActions(t);
    const [viewingLogs, setViewingLogs] = useState<string | null>(null);
    const [externalLinkUrl, setExternalLinkUrl] = useState<string | null>(null);

    const handleModeSwitch = async (mode: 'eco' | 'performance') => {
        try {
            await Haptics.impact({ style: ImpactStyle.Medium });
            useMissionStore.getState().updatePower({ mode });
            await setPowerMode(mode);
        } catch (error) {
            console.error('Failed to set power mode:', error);
        }
    };

    const handleAction = async (action: string, key: string, impact = ImpactStyle.Light) => {
        try {
            await Haptics.impact({ style: impact });
            if (action === 'start') await startService(key);
            if (action === 'stop') await stopService(key);
            if (action === 'reset') await resetService(key);
            if (action === 'pause') await pauseService(key);
        } catch (error) {
            console.error(`Failed to ${action} service ${key}:`, error);
        }
    };

    return (
        <div className="flex flex-col gap-4 mx-1">
            <div className="flex items-center justify-between mb-1">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-[10px] font-mono font-bold text-buoy-orange uppercase tracking-[0.3em]">{t('reactor.core')}</h2>
                    <p className="text-[8px] font-mono text-white/20">{t('reactor.management')}</p>
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
                        {svc.running && (
                            <motion.div
                                className="absolute inset-0 bg-status-green/5 pointer-events-none"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        )}

                        <div className="flex items-center gap-3 relative z-10 overflow-hidden">
                            <div className={`p-2 rounded-lg shrink-0 ${svc.running ? 'bg-status-green/10 text-status-green' : 'bg-white/5 text-white/20'}`}>
                                {key === 'OLLAMA' ? <Cpu size={14} /> :
                                    key === 'CHROMA' ? <Database size={14} /> :
                                        key === 'ORCHESTRATOR' ? <Monitor size={14} /> :
                                            svc.type === 'external' ? <Globe size={14} /> :
                                                <Binary size={14} />}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest truncate ${svc.running ? 'text-white' : 'text-white/20'}`}>
                                    {svc.name}
                                </span>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[8px] font-mono text-white/20 uppercase whitespace-nowrap">
                                        {svc.type === 'docker' ? 'Container' : svc.type === 'cloud' ? 'Cloud' : svc.type === 'external' ? 'External VPS' : 'Process'} • {svc.running ? 'Active' : (svc as any).paused ? 'Paused' : 'Standby'}
                                    </span>
                                    {svc.description && (
                                        <span className="text-[7px] font-mono text-white/40 uppercase tracking-tighter leading-tight truncate max-w-[120px]">
                                            {svc.description}
                                        </span>
                                    )}
                                    {svc.used !== undefined && svc.limit !== undefined && (
                                        <div className="flex flex-col gap-1 mt-1">
                                            <div className="flex justify-between items-center text-[7px] font-mono uppercase tracking-tighter">
                                                <span className="text-white/30">Usage</span>
                                                <span className={((svc.used / svc.limit) >= 0.9) ? 'text-status-red' : ((svc.used / svc.limit) >= 0.7) ? 'text-status-amber' : 'text-white/60'}>
                                                    {svc.used} / {svc.limit} {svc.unit || ''}
                                                </span>
                                            </div>
                                            <div className="w-24 h-0.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((svc.used / svc.limit) * 100, 100)}%` }}
                                                    className={`h-full ${((svc.used / svc.limit) >= 0.9) ? 'bg-status-red' : ((svc.used / svc.limit) >= 0.7) ? 'bg-status-amber' : 'bg-status-green'}`}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 relative z-10 shrink-0">
                            {svc.url && (
                                <ControlButton
                                    actionKey="link"
                                    actions={actions}
                                    onClick={() => {
                                        Haptics.impact({ style: ImpactStyle.Light });
                                        // Show info modal for external services, direct open otherwise
                                        if (svc.type === 'external') {
                                            setExternalLinkUrl(svc.url ?? null);
                                        } else {
                                            window.open(svc.url, '_blank');
                                        }
                                    }}
                                    className="p-1.5 bg-status-blue/10 hover:bg-status-blue/20 rounded-lg text-status-blue transition-all border border-status-blue/20"
                                >
                                    <ExternalLink size={14} />
                                </ControlButton>
                            )}
                            {svc.type !== 'external' && (
                                <>
                                    <ControlButton
                                        actionKey="logs"
                                        actions={actions}
                                        onClick={() => setViewingLogs(key)}
                                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-status-blue transition-all border border-white/5"
                                    >
                                        <FileText size={14} />
                                    </ControlButton>

                                    {!svc.running ? (
                                        <ControlButton
                                            actionKey="start"
                                            actions={actions}
                                            onClick={() => handleAction('start', key)}
                                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-status-green transition-all border border-white/5"
                                        >
                                            <Play size={14} fill="currentColor" className="opacity-40" />
                                        </ControlButton>
                                    ) : (
                                        <>
                                            <ControlButton
                                                actionKey="pause"
                                                actions={actions}
                                                onClick={() => handleAction('pause', key)}
                                                className={`p-1.5 rounded-lg transition-all border ${(svc as any).paused
                                                    ? 'bg-status-amber/20 text-status-amber border-status-amber/40 shadow-[0_0_10px_rgba(255,184,0,0.2)]'
                                                    : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-status-amber border-white/5'
                                                    }`}
                                            >
                                                <Pause size={14} fill="currentColor" className="opacity-40" />
                                            </ControlButton>
                                            <ControlButton
                                                actionKey="stop"
                                                actions={actions}
                                                onClick={() => handleAction('stop', key)}
                                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-status-red transition-all border border-white/5"
                                            >
                                                <Square size={14} fill="currentColor" className="opacity-40" />
                                            </ControlButton>
                                            <ControlButton
                                                actionKey="reset"
                                                actions={actions}
                                                onClick={() => handleAction('reset', key, ImpactStyle.Medium)}
                                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-status-blue transition-all border border-white/5"
                                            >
                                                <RotateCcw size={14} />
                                            </ControlButton>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {power.mode === 'eco' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-status-green/5 border border-status-green/10">
                    <Shield size={14} className="text-status-green shrink-0" />
                    <p className="text-[10px] text-status-green/70 font-mono leading-tight uppercase tracking-tight">
                        {t('reactor.power_save')}
                    </p>
                </div>
            )}

            <AnimatePresence>
                {viewingLogs && (
                    <LogViewer
                        serviceKey={viewingLogs}
                        onClose={() => setViewingLogs(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {externalLinkUrl && (
                    <ExternalLinkModal
                        url={externalLinkUrl}
                        onClose={() => setExternalLinkUrl(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
