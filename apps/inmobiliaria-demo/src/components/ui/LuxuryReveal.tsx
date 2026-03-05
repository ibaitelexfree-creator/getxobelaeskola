'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface LuxuryRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export default function LuxuryReveal({
    children,
    className = '',
    delay = 0
}: LuxuryRevealProps) {
    return (
        <div className={`reveal-mask ${className}`} style={{ overflow: 'hidden' }}>
            <motion.div
                initial={{ y: "100%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{
                    duration: 1.2,
                    delay,
                    ease: [0.16, 1, 0.3, 1]
                }}
                className="reveal-mask-inner"
                style={{ display: 'block' }}
            >
                {children}
            </motion.div>
        </div>
    );
}
