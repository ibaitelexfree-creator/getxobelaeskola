'use client';

import { motion } from 'framer-motion';

export default function AtmosphericHUD() {
    return (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
            {/* CRT Scanline Effect */}
            <div className="crt-scanline" />

            {/* Digital Grain/Noise */}
            <div className="noise-overlay" />

            {/* Moving Scan Bar */}
            <div className="scan-bar" />

            {/* Corner HUD Decorations */}
            <div className="absolute top-4 left-4 w-32 h-32 opacity-20">
                <div className="hud-frame-tl w-8 h-8" />
                <div className="text-[8px] font-mono text-white/40 mt-1 ml-1 tracking-widest uppercase">Maestro v3.0 // Ready</div>
            </div>

            <div className="absolute top-4 right-4 w-32 h-32 opacity-20">
                <div className="hud-frame-tr w-8 h-8" />
                <div className="text-[8px] font-mono text-white/40 mt-1 mr-1 text-right tracking-widest uppercase">Sector: GETXO_BASQUE</div>
            </div>

            <div className="absolute bottom-24 left-4 w-32 h-32 opacity-20">
                <div className="hud-frame-bl w-8 h-8" />
                <div className="text-[8px] font-mono text-white/40 mb-1 ml-1 tracking-widest uppercase">
                    Safety: Stabilized // SOKO RELAY
                </div>
            </div>

            <div className="absolute bottom-24 right-4 w-32 h-32 opacity-20">
                <div className="hud-frame-br w-8 h-8" />
                <div className="text-[8px] font-mono text-white/40 mb-1 mr-1 text-right tracking-widest uppercase">Grid: 43.34N 3.00W</div>
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
