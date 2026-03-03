'use client';

import { useRef, useEffect, useState } from 'react';
import { getDailyQuote } from '@/data/nauticalQuotes';
import { Compass } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

interface DailyNauticalQuoteProps {
    locale: string;
}

function WaveSVG() {
    return (
        <svg
            className="absolute bottom-0 left-0 w-full h-10 opacity-[0.04] pointer-events-none"
            viewBox="0 0 400 40"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                d="M0,20 C40,10 80,30 120,20 C160,10 200,30 240,20 C280,10 320,30 360,20 C380,15 400,20 400,20 L400,40 L0,40 Z"
                fill="currentColor"
                className="text-accent"
            >
                <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0,0;-20,0;0,0"
                    dur="6s"
                    repeatCount="indefinite"
                />
            </path>
            <path
                d="M0,25 C50,15 90,35 140,25 C190,15 230,35 280,25 C330,15 370,30 400,25 L400,40 L0,40 Z"
                fill="currentColor"
                className="text-white"
                opacity="0.3"
            >
                <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0,0;15,0;0,0"
                    dur="8s"
                    repeatCount="indefinite"
                />
            </path>
        </svg>
    );
}

const quoteVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
    },
};

const authorVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] as any },
    },
};

const headerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as any },
    },
};

export default function DailyNauticalQuote({ locale }: DailyNauticalQuoteProps) {
    const quote = getDailyQuote();
    const text = locale === 'eu' ? quote.quote_eu : quote.quote_es;
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-40px' });
    const [isHovered, setIsHovered] = useState(false);

    const quoteNumber = String(quote.id).padStart(3, '0');

    return (
        <section
            ref={ref}
            className="relative overflow-hidden border border-accent/15 bg-gradient-to-br from-[#0c1a2e]/90 via-[#081222] to-[#050c18] rounded-sm group cursor-default"
            aria-label={locale === 'eu' ? 'Eguneko esaldia' : 'Cita náutica del día'}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Ambient glow on hover */}
            <div
                className="absolute -top-8 -right-8 w-32 h-32 bg-accent/5 blur-[50px] rounded-full pointer-events-none transition-all duration-1000 group-hover:bg-accent/15 group-hover:w-40 group-hover:h-40"
                aria-hidden="true"
            />
            <div
                className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/[0.02] blur-[30px] rounded-full pointer-events-none"
                aria-hidden="true"
            />

            {/* Top rule with logbook number */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-white/[0.06]">
                <motion.div
                    className="w-8 h-8 bg-accent/10 border border-accent/20 flex items-center justify-center rounded-full text-accent shrink-0"
                    variants={headerVariants as any}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                >
                    <motion.div
                        animate={{ rotate: isHovered ? 360 : 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }}
                    >
                        <Compass size={14} strokeWidth={2.5} />
                    </motion.div>
                </motion.div>

                <motion.div
                    className="flex items-center gap-2 flex-1 min-w-0"
                    variants={headerVariants as any}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                >
                    <span className="text-[9px] uppercase tracking-[0.3em] font-black text-accent/80">
                        {locale === 'eu' ? 'Eguneko Esaldia' : 'Bitácora'}
                    </span>
                    <span className="text-[8px] font-mono text-white/20 ml-auto">
                        Nº {quoteNumber}
                    </span>
                </motion.div>
            </div>

            {/* Quote body */}
            <div className="px-5 py-5 relative z-10">
                {/* Giant decorative quote mark */}
                <div
                    className="absolute top-2 left-3 text-accent/[0.06] text-[5rem] leading-none font-serif pointer-events-none select-none"
                    aria-hidden="true"
                >
                    &ldquo;
                </div>

                <blockquote className="relative z-10">
                    <motion.p
                        className="text-white/85 text-[0.84rem] italic leading-[1.75] font-serif pl-3"
                        variants={quoteVariants as any}
                        initial="hidden"
                        animate={isInView ? 'visible' : 'hidden'}
                    >
                        &ldquo;{text}&rdquo;
                    </motion.p>

                    <motion.footer
                        className="mt-4 flex items-center gap-2 pl-3"
                        variants={authorVariants as any}
                        initial="hidden"
                        animate={isInView ? 'visible' : 'hidden'}
                    >
                        <span className="w-6 h-px bg-accent/40" aria-hidden="true" />
                        <cite className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent/60 not-italic">
                            {quote.author}
                        </cite>
                    </motion.footer>
                </blockquote>
            </div>

            {/* Animated wave at bottom */}
            <WaveSVG />

            {/* Bottom accent gradient line */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                aria-hidden="true"
            />
        </section>
    );
}
