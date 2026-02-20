
'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Volume2, X, ShieldAlert, History, Clock, Trash2 } from 'lucide-react';
import { useSafetySettingsStore } from '@/lib/store/useSafetySettingsStore';

interface SafetySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SafetySettingsModal({ isOpen, onClose }: SafetySettingsModalProps) {
    const {
        notificationsEnabled,
        soundEnabled,
        alertHistory,
        setNotificationsEnabled,
        setSoundEnabled,
        clearAlertHistory
    } = useSafetySettingsStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-nautical-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-card border border-white/10 p-8 rounded-sm w-full max-w-md shadow-2xl space-y-8 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/5 blur-3xl rounded-full" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <header className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center text-accent">
                            <ShieldAlert size={18} />
                        </div>
                        <h3 className="text-xl font-display text-white italic">Configuración de Seguridad</h3>
                    </div>
                    <p className="text-3xs uppercase tracking-[0.2em] text-white/40 font-bold">Alertas y Notificaciones</p>
                </header>

                <div className="space-y-6 relative z-10">
                    {/* Notifications Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${notificationsEnabled ? 'bg-accent/20 text-accent' : 'bg-white/5 text-white/20'}`}>
                                <Bell size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Notificaciones Visuales</p>
                                <p className="text-[10px] text-white/40">Recibe avisos de Euskalmet y viento</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-accent' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-nautical-black rounded-full transition-all ${notificationsEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${soundEnabled ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-white/20'}`}>
                                <Volume2 size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Alerta Sonora (Sirena)</p>
                                <p className="text-[10px] text-white/40">Sonido de emergencia persistente</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${soundEnabled ? 'bg-red-500' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-nautical-black rounded-full transition-all ${soundEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="p-4 bg-accent/5 border border-accent/10 rounded-sm">
                        <p className="text-[9px] text-accent/60 leading-relaxed uppercase tracking-wider font-bold italic">
                            * Las alertas sonoras críticas solo se activan en horario lectivo para administradores e instructores para evitar molestias innecesarias fuera del trabajo.
                        </p>
                    </div>

                    {/* Alert History Section */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white/40">
                                <History size={14} />
                                <h4 className="text-[10px] uppercase font-black tracking-widest">Historial de Alertas</h4>
                            </div>
                            {alertHistory && alertHistory.length > 0 && (
                                <button
                                    onClick={clearAlertHistory}
                                    className="text-[9px] uppercase font-bold text-red-500/60 hover:text-red-500 transition-colors flex items-center gap-1"
                                >
                                    <Trash2 size={10} />
                                    Limpiar
                                </button>
                            )}
                        </div>

                        <div className="max-h-[160px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                            {!alertHistory || alertHistory.length === 0 ? (
                                <div className="py-8 text-center border border-dashed border-white/5 rounded-sm">
                                    <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold italic">Sin alertas registradas</p>
                                </div>
                            ) : (
                                alertHistory.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-3 rounded-sm border ${
                                            alert.type === 'critical'
                                                ? 'bg-red-500/5 border-red-500/20'
                                                : 'bg-white/5 border-white/10'
                                        } space-y-1`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <p className={`text-[10px] font-black uppercase tracking-wider ${
                                                alert.type === 'critical' ? 'text-red-500' : 'text-accent'
                                            }`}>
                                                {alert.title}
                                            </p>
                                            <div className="flex items-center gap-1 text-white/30 whitespace-nowrap">
                                                <Clock size={10} />
                                                <span className="text-[9px] font-mono">
                                                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                                            {alert.message}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-3xs uppercase tracking-[0.3em] text-white font-black transition-all"
                    >
                        Cerrar Configuración
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
