'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function AtmosphericHUD() {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
            {/* CRT Scanline Effect */}
            <div className="crt-scanline" />

            {/* Digital Grain/Noise */}
            <div className="noise-overlay" />

            {/* Moving Scan Bar */}
            <div className="scan-bar" />

            {/* Corner HUD Decorations */}
            <div className="absolute top-[calc(1rem+env(safe-area-inset-top))] left-4 w-48 h-32 opacity-30">
                <div className="hud-frame-tl w-10 h-10 border-l border-t border-white/40" />
                <div className="text-[9px] font-mono text-white/60 mt-2 ml-1 tracking-[0.2em] uppercase leading-none">
                    <span className="text-buoy-orange font-black">MAESTRO</span> // SYS.V3.0.4<br />
                    <span className="opacity-40">AUTO_PILOT: </span> {t('common.active')}
                </div>
            </div>

            <div className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-4 w-48 h-32 opacity-30">
                <div className="hud-frame-tr w-10 h-10 border-r border-t border-white/40 absolute right-0" />
                <div className="text-[9px] font-mono text-white/60 mt-2 mr-1 text-right tracking-[0.2em] uppercase leading-none">
                    RELAY: <span className="text-status-green">SOKO_V4</span><br />
                    <span className="opacity-40">SECTOR: </span> BASQUE_GRID
                </div>
            </div>

            <div className="absolute bottom-[calc(6rem+env(safe-area-inset-bottom))] left-4 w-48 h-32 opacity-30">
                <div className="hud-frame-bl w-10 h-10 border-l border-b border-white/40 absolute bottom-0" />
                <div className="text-[9px] font-mono text-white/60 mb-2 ml-1 absolute bottom-0 tracking-[0.2em] uppercase leading-none">
                    <span className="opacity-40">{t('common.status')}: </span> {t('common.stabilized')}<br />
                    <span className="text-status-blue">CRYPT: 256_AES</span>
                </div>
            </div>

            <div className="absolute bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 w-48 h-32 opacity-30">
                <div className="hud-frame-br w-10 h-10 border-r border-b border-white/40 absolute bottom-0 right-0" />
                <div className="text-[9px] font-mono text-white/60 mb-2 mr-1 text-right absolute bottom-0 right-0 tracking-[0.2em] uppercase leading-none">
                    <span className="opacity-40">COORD: </span> 43.34N 3.00W<br />
                    GETXO_CONTROL
                </div>
            </div>

            {/* Animated Loading Bar (Subtle) */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
                <motion.div
                    className="h-full bg-buoy-orange/40"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {/* Random HUD Glitches (Rare) */}
            <motion.div
                className="absolute top-1/2 left-0 w-full h-[1px] bg-buoy-orange/10 blur-sm"
                animate={{
                    opacity: [0, 0.5, 0],
                    top: ['10%', '90%', '40%']
                }}
                transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 15,
                    ease: 'easeInOut'
                }}
            />
        </div>
    );
}
