'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore } from '@/store/useMissionStore';
import {
    Camera, Eye, Share2, Trash2, Maximize2, X,
    ExternalLink, Download, Image as ImageIcon
} from 'lucide-react';

interface Screenshot {
    id: string;
    url: string;
    timestamp: number;
    label: string;
}

export default function VisualRelay({ onClose }: { onClose?: () => void }) {
    const { services } = useMissionStore();
    const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([
        { id: '1', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800', timestamp: Date.now() - 3600000, label: 'Weather Radar 01' },
        { id: '2', url: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=800', timestamp: Date.now() - 7200000, label: 'Port Authority View' },
        { id: '3', url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800', timestamp: Date.now() - 10800000, label: 'Wind Trend Chart' },
    ]);

    const handleShare = async (screenshot: Screenshot) => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Mission Control Screenshot',
                    text: `Snapshot from ${new Date(screenshot.timestamp).toLocaleString()}`,
                    url: screenshot.url,
                });
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header Section */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-display text-glimmer">Visual Relay</h2>
                <p className="text-xs text-white/30 mt-1 uppercase tracking-widest font-mono">Remote Observation Module</p>
            </motion.div>

            {/* Action Bar */}
            <div className="flex gap-2">
                <button
                    className="btn-primary flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl"
                    onClick={() => console.log('Capture requested')}
                >
                    <Camera size={18} />
                    <span className="text-xs font-bold tracking-tighter">New Screenshot</span>
                </button>
                <button className="btn-glass px-4 rounded-2xl border-white/5">
                    <ImageIcon size={18} className="text-white/40" />
                </button>
            </div>

            {/* Browserless Status */}
            <div className="flex items-center gap-3 px-1">
                <div className={`w-2 h-2 rounded-full ${services.browserless.health === 'online' ? 'bg-status-green shadow-[0_0_8px_rgba(0,230,118,0.5)]' : 'bg-status-red'}`} />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/20">
                    Browserless Relay: {services.browserless.health.toUpperCase()}
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 pb-24">
                <AnimatePresence>
                    {screenshots.map((shot, index) => (
                        <motion.div
                            key={shot.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card rounded-3xl overflow-hidden aspect-[4/5] relative group"
                        >
                            <img
                                src={shot.url}
                                alt={shot.label}
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-[10px] font-mono text-white/40 mb-1">
                                    {new Date(shot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-xs font-medium text-white/90 truncate">{shot.label}</p>
                            </div>

                            {/* Quick Actions Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
                                <button
                                    onClick={() => setSelectedImage(shot)}
                                    className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20"
                                >
                                    <Maximize2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleShare(shot)}
                                    className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20"
                                >
                                    <Share2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Fullscreen Viewer */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
                    >
                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-display text-white">{selectedImage.label}</h3>
                                <p className="text-xs font-mono text-white/30">Captured via Visual Relay v3</p>
                            </div>
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
                            <motion.img
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                src={selectedImage.url}
                                className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
                            />
                        </div>

                        <div className="p-8 flex gap-4">
                            <button
                                onClick={() => handleShare(selectedImage)}
                                className="btn-primary flex-1 py-4 flex items-center justify-center gap-3 rounded-2xl"
                            >
                                <Share2 size={18} />
                                <span className="font-bold tracking-tight">Share Intelligence</span>
                            </button>
                            <button className="btn-glass p-4 rounded-2xl aspect-square border-white/10">
                                <Download size={18} />
                            </button>
                            <button className="btn-glass p-4 rounded-2xl aspect-square border-white/10 text-status-red/60">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
