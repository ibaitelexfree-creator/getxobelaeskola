'use client';

import { motion } from 'framer-motion';
import { Building2, ExternalLink, RefreshCw, Loader2, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function RealEstateView() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [key, setKey] = useState(0); // For refreshing the iframe

    // URL of the real estate application
    // local: http://localhost:3000
    // cloud: https://realstate.controlmanager.cloud (example)
    const realEstateUrl = 'http://localhost:3000';

    const handleRefresh = () => {
        setIsLoading(true);
        setError(null);
        setKey(prev => prev + 1);
    };

    useEffect(() => {
        // Simple health check for the iframe URL
        const checkHealth = async () => {
            try {
                // Using no-cors might not give much info, but we try a basic fetch
                const res = await fetch(realEstateUrl, { mode: 'no-cors' });
                setIsLoading(false);
            } catch (err) {
                console.error('Real Estate app unreachable:', err);
                // We don't necessarily set error here because no-cors might fail for other reasons
                // but we'll let the iframe handle its own loading
                setIsLoading(false);
            }
        };

        checkHealth();
    }, [realEstateUrl]);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-buoy-orange" />
                        <h2 className="text-lg font-display text-glimmer">{t('nav.realstate')}</h2>
                    </div>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mt-1">
                        Portal Inmobiliario • Luxe Dubai Estates
                    </p>
                </motion.div>

                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 transition-all active:scale-95"
                        title="Refresh View"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <a
                        href={realEstateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-buoy-orange/20 text-buoy-orange hover:bg-buoy-orange/30 transition-all active:scale-95"
                        title="Open in new tab"
                    >
                        <ExternalLink size={16} />
                    </a>
                </div>
            </div>

            {/* Content Area - Iframe View */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 glass-panel rounded-3xl overflow-hidden border border-white/5 relative bg-black/60 shadow-2xl"
            >
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                        <Loader2 size={40} className="text-buoy-orange animate-spin mb-4" />
                        <p className="text-xs font-mono text-white/40 uppercase tracking-widest animate-pulse">
                            Establishing Link...
                        </p>
                    </div>
                )}

                <iframe
                    key={key}
                    src={realEstateUrl}
                    className="w-full h-full border-none"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setError('Failed to load application. Ensure the server at localhost:3000 is running.');
                    }}
                />

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/90">
                        <Globe size={48} className="text-status-red/40 mb-4" />
                        <h3 className="text-white font-display text-lg mb-2">Conexión Fallida</h3>
                        <p className="text-white/40 text-sm max-w-xs mb-6">
                            No se ha podido establecer conexión con el portal inmobiliario.
                            Verifica que `npm run dev` esté ejecutándose en la carpeta `apps/inmobiliaria-demo`.
                        </p>
                        <button
                            onClick={handleRefresh}
                            className="btn-primary px-8 py-3 rounded-2xl flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Reintentar Enlace
                        </button>
                    </div>
                )}

                {/* Status Overlay (Bottom Left) */}
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
                        <span className="text-[10px] font-mono text-white/60 tracking-wider">LIVE_RELAY: PORT 3000</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
