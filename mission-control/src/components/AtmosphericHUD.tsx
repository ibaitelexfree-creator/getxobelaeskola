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

            {/* HUD Decorations removed per user request */}

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
