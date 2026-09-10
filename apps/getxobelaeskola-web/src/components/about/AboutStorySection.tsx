'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import HoverVideoOrImage from '@/components/shared/HoverVideoOrImage';
import StaggeredEntrance from '@/components/shared/StaggeredEntrance';
import { useScrollLock } from '@/hooks/useScrollLock';

interface AboutStorySectionProps {
    title: string;
    desc1: string;
    desc2: string;
    readMoreText: string;
    modalData: {
        title: string;
        p1: string;
        p2: string;
        p3: string;
    };
}

export default function AboutStorySection({
    title,
    desc1,
    desc2,
    readMoreText,
    modalData
}: AboutStorySectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isPhone, setIsPhone] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    useScrollLock(modalRef as React.RefObject<HTMLElement>, isModalOpen);

    useEffect(() => {
        setMounted(true);
        const checkSize = () => setIsPhone(window.innerWidth < 768);
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsModalOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <section className="py-12 sm:py-16 md:py-24 relative overflow-hidden flex items-center min-h-0 sm:min-h-[85vh] lg:min-h-[100dvh] w-full">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                <StaggeredEntrance className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                    {/* Decorative Quote Mark */}
                    <div className="lg:col-span-1 hidden lg:block self-start pt-4">
                        <span className="font-display text-7xl xl:text-8xl text-accent/10 italic leading-none">&quot;</span>
                    </div>

                    <div className="lg:col-span-5 space-y-4 sm:space-y-6 relative">
                        <div className="space-y-2 md:space-y-3">
                            <h2 className="text-[clamp(1.5rem,3.2vw,2.75rem)] font-display leading-tight tracking-tight text-sea-foam font-bold uppercase">
                                {title}
                            </h2>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            <p className="text-foreground/85 font-light text-sm sm:text-base md:text-lg leading-relaxed first-letter:text-2xl sm:first-letter:text-4xl first-letter:font-display first-letter:text-accent first-letter:float-left first-letter:mr-2.5 sm:first-letter:mr-3 first-letter:mt-0.5">
                                {desc1}
                            </p>
                            <p className="text-foreground/80 font-light text-sm sm:text-base md:text-lg leading-relaxed">
                                {desc2}
                            </p>
                        </div>

                        <div className="pt-2 sm:pt-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg active:scale-95 text-white hover:scale-105"
                                style={{
                                    backgroundColor: 'var(--gbe-navy-900, #002B49)',
                                    color: '#ffffff',
                                    border: '1px solid rgba(242, 169, 59, 0.4)',
                                    padding: '0.875rem 2.25rem',
                                    fontSize: '0.875rem',
                                    borderRadius: '50px',
                                    letterSpacing: '0.12em',
                                    boxShadow: '0 4px 15px rgba(0, 43, 73, 0.3)',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--gbe-navy-800, #0A436D)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--gbe-navy-900, #002B49)';
                                }}
                            >
                                {readMoreText}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-6 lg:pl-4 xl:pl-6 mt-4 lg:mt-0">
                        <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/11] max-w-md sm:max-w-lg mx-auto lg:max-w-none group border border-sea-foam/20 shadow-2xl overflow-hidden rounded-lg sm:rounded-none">
                            <HoverVideoOrImage
                                src="/images/womes-8139.jpg"
                                alt="Sea Experience"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
                                containerClassName="w-full h-full relative"
                                imageClassName="object-cover object-center sm:object-[5%_20%] w-full h-full"
                            />
                            {/* Image Badge */}
                            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-nautical-deep/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 border border-sea-foam/15 shadow-2xl z-20 transition-transform duration-300">
                                <span className="text-[9px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-accent font-bold whitespace-nowrap">
                                    EST. 1993
                                </span>
                            </div>
                        </div>
                    </div>
                </StaggeredEntrance>
            </div>

            {/* Modal Pop-up (Portaled) */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 999999,
                                backgroundColor: 'rgba(11, 61, 99, 0.85)',
                                backdropFilter: 'blur(8px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1.5rem',
                            }}
                            onClick={() => setIsModalOpen(false)}
                        >
                            <motion.div
                                ref={modalRef}
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '20px',
                                    padding: isPhone ? '2rem 1.5rem' : '3rem 4rem',
                                    maxWidth: '800px',
                                    width: '100%',
                                    maxHeight: '90vh',
                                    overflowY: 'auto',
                                    position: 'relative',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                                }}
                            >
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    aria-label="Cerrar modal"
                                    style={{
                                        position: 'absolute',
                                        top: '1.5rem',
                                        right: '1.5rem',
                                        background: 'rgba(0,0,0,0.06)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '38px',
                                        height: '38px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '1.25rem',
                                        color: 'var(--gbe-navy-900, #002B49)',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(0,0,0,0.12)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                                    }}
                                >
                                    ✕
                                </button>

                                <h3 
                                    className="font-display font-bold uppercase tracking-tight"
                                    style={{ 
                                        fontSize: '1.75rem', 
                                        color: 'var(--gbe-navy-900, #002B49)', 
                                        marginBottom: '1.75rem',
                                        borderBottom: '2px solid rgba(242, 169, 59, 0.3)',
                                        paddingBottom: '0.75rem'
                                    }}
                                >
                                    {modalData.title}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: '#334155', lineHeight: 1.75, fontSize: isPhone ? '0.95rem' : '1.05rem' }}>
                                    <p>{modalData.p1}</p>
                                    <p>{modalData.p2}</p>
                                    <p style={{ fontWeight: 500, color: 'var(--gbe-navy-900, #002B49)' }}>{modalData.p3}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </section>
    );
}