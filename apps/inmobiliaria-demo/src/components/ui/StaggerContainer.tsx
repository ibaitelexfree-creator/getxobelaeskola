'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    staggerChildren?: number;
    style?: React.CSSProperties;
}

export function StaggerContainer({
    children,
    className = '',
    delay = 0,
    staggerChildren = 0.1,
    style = {},
}: StaggerContainerProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren,
                        delayChildren: delay,
                    }
                }
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}

interface StaggerItemProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function StaggerItem({ children, className = '', style = {} }: StaggerItemProps) {
    return (
        <motion.div
            variants={{
                hidden: { y: 20, opacity: 0 },
                show: {
                    y: 0,
                    opacity: 1,
                    transition: {
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1]
                    }
                }
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}
