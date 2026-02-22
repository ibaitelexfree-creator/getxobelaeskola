'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMissionStore } from '@/store/useMissionStore';
import {
    WifiOff, Server, Globe, RefreshCcw, Save,
    AlertCircle, ChevronRight, Terminal, Activity,
    ShieldAlert, Zap, AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ConnectionDiagnostics() {
    const { serverUrl, setServerUrl } = useMissionStore();
    const { t } = useTranslation();
    const [tempUrl, setTempUrl] = useState(serverUrl);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const response = await fetch(`${tempUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                setTestResult({
                    success: true,
                    msg: `${t('connection.test_success')} (v${data.version || '?'})`
                });
            } else {
                setTestResult({
                    success: false,
                    msg: `${t('connection.test_fail_http')} ${response.status}: ${response.statusText}`
                });
            }
        } catch (err: any) {
            setTestResult({
                success: false,
                msg: t('connection.test_fail_network')
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveAndConnect = () => {
        setServerUrl(tempUrl);
        handleTestConnection();
    };

    const presets = [
        { label: 'Localhost', url: 'http://localhost:3323' },
        { label: 'WiFi (10.60)', url: 'http://10.60.73.74:3323' },
        { label: 'Production', url: 'https://orchestrator.getxobelaeskola.cloud' },
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-32 px-4">
            {/* Status Header */}
            <div className="bg-status-red/10 border-2 border-status-red/30 rounded-[2.5rem] p-8 text-center relative overflow-hidden mt-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-status-red/50 shadow-[0_0_20px_rgba(255,51,51,0.5)]" />
                <div className="w-20 h-20 rounded-full bg-status-red/20 flex items-center justify-center mx-auto mb-6 border-2 border-status-red/40 shadow-2xl">
                    <WifiOff size={40} className="text-status-red animate-pulse" />
                </div>
                <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-2">
                    {t('dashboard.system_offline')}
                </h2>
                <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.2em]">
                    Sync: <span className="text-status-red font-black">DISCONNECTED</span>
                </p>
            </div>

            {/* Diagnostics Panel */}
            <div className="glass-panel rounded-[2rem] p-6 border-t-4 border-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <Terminal size={18} className="text-buoy-orange" />
                    <h3 className="text-white font-black uppercase tracking-widest text-xs">{t('connection.diagnostic_title')}</h3>
                </div>

                <div className="space-y-6">
                    {/* URL Input */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-1">{t('connection.endpoint_label')}</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={tempUrl}
                                onChange={(e) => setTempUrl(e.target.value)}
                                className="w-full bg-black/40 border-2 border-white/10 rounded-2xl py-5 px-6 text-sm font-mono text-white focus:outline-none focus:border-status-blue/50 transition-all shadow-inner"
                                placeholder="http://192.168.1.XX:3323"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Globe size={18} className="text-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-3 gap-2">
                        {presets.map(p => (
                            <button
                                key={p.url}
                                onClick={() => setTempUrl(p.url)}
                                className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all ${tempUrl === p.url
                                    ? 'bg-status-blue/20 border-status-blue text-status-blue'
                                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Test & Save */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleTestConnection}
                            disabled={isTesting}
                            className={`flex-1 py-5 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all active:scale-95 ${isTesting
                                ? 'bg-white/5 border-white/10 text-white/20'
                                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                }`}
                        >
                            <RefreshCcw size={20} className={isTesting ? 'animate-spin' : ''} />
                            <span className="font-black uppercase text-xs tracking-widest">{t('connection.test_btn')}</span>
                        </button>
                        <button
                            onClick={handleSaveAndConnect}
                            className="flex-[1.5] py-5 bg-status-green text-black rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,255,149,0.3)] active:scale-95 transition-all"
                        >
                            <Save size={20} />
                            <span className="font-black uppercase text-xs tracking-widest">{t('connection.apply_btn')}</span>
                        </button>
                    </div>

                    {/* Feedback */}
                    {testResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl border flex items-start gap-3 ${testResult.success ? 'bg-status-green/10 border-status-green/20' : 'bg-status-red/10 border-status-red/20'
                                }`}
                        >
                            {testResult.success ? (
                                <Activity size={18} className="text-status-green mt-0.5" />
                            ) : (
                                <AlertTriangle size={18} className="text-status-red mt-0.5" />
                            )}
                            <p className={`text-[11px] font-mono leading-relaxed ${testResult.success ? 'text-status-green' : 'text-status-red'
                                }`}>
                                {testResult.msg}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Additional Help */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-2">
                    <ShieldAlert size={14} />
                    <span>{t('connection.recovery_guide')}</span>
                </div>

                {[
                    { icon: <Zap size={14} />, text: t('connection.guide_step_1') },
                    { icon: <Server size={14} />, text: t('connection.guide_step_2') },
                    { icon: <Globe size={14} />, text: t('connection.guide_step_3') },
                ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start bg-black/20 p-4 rounded-2xl border border-white/5">
                        <div className="text-buoy-orange mt-0.5">{item.icon}</div>
                        <p className="text-[11px] text-white/60 leading-relaxed">{item.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
