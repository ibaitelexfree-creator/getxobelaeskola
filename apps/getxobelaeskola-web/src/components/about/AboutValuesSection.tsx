'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ValueItem {
    title: string;
    desc: string;
    icon: string;
    bg: string;
    objectPosition?: string;
    objectFit?: 'cover' | 'contain';
    brightness?: string;
    hoverBrightness?: string;
    saturate?: string;
    hoverSaturate?: string;
    opacity?: string;
}

interface AboutValuesSectionProps {
    items: ValueItem[];
}

export default function AboutValuesSection({ items }: AboutValuesSectionProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
            {items.map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{ duration: 0.8, delay: i * 0.15, ease: [0.215, 0.61, 0.355, 1] }}
                    className="group relative min-h-[260px] sm:min-h-[300px] aspect-auto sm:aspect-square p-5 sm:p-6 lg:p-8 flex flex-col justify-end overflow-hidden border border-sea-foam/10 rounded-xl cursor-pointer touch-manipulation transition-all duration-700 active:bg-accent/10 bg-nautical-black/50 shadow-lg"
                >
                    {/* Background image with subtle scroll scale */}
                    <motion.div 
                        initial={{ scale: 1.05 }}
                        whileInView={{ scale: 1.0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`absolute inset-0 z-0 ${item.opacity || 'opacity-65'} group-hover:opacity-95 group-active:opacity-95 transition-all duration-700 ease-out`}
                    >
                        <Image
                            src={item.bg}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            style={{ objectPosition: item.objectPosition || 'center' }}
                            className={`${item.objectFit === 'contain' ? 'object-contain' : 'object-cover'} aspect-square grayscale-[80%] ${item.brightness || 'brightness-[0.9]'} group-hover:grayscale-0 ${item.hoverSaturate || 'group-hover:saturate-[1.05]'} ${item.hoverBrightness || 'group-hover:brightness-[1.05]'} group-hover:scale-105 transition-all duration-700`}
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-nautical-black/90 via-nautical-black/40 to-transparent z-1 pointer-events-none" />

                    <motion.div 
                        initial={{ y: 20, opacity: 0.8 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.6, delay: i * 0.15 + 0.2 }}
                        className="relative z-10 transition-transform duration-700 group-hover:-translate-y-2 group-active:-translate-y-2"
                    >
                        <span className="text-3xl sm:text-4xl lg:text-5xl mb-3 block opacity-90 group-hover:opacity-100 group-active:opacity-100 group-hover:scale-110 group-active:scale-110 transition-all duration-700 origin-left inline-block drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            {item.icon}
                        </span>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-display text-orange-500 mb-2 sm:mb-3 transition-colors duration-700 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-bold">
                            {item.title}
                        </h3>
                        <p className="text-white font-medium text-xs sm:text-sm leading-relaxed max-w-xs transition-colors duration-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] [text-shadow:_0_0_8px_rgba(234,179,8,0.6),_0_1px_2px_rgba(0,0,0,0.9)]">
                            {item.desc}
                        </p>
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
}
