'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useTranslations } from 'next-intl';

interface AccessibleModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

/**
 * Modal accesible de alto nivel con Focus Trap, ARIA roles y cierre por teclado.
 * Renderizado vía Portal para evitar saltos de layout.
 */
export default function AccessibleModal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-2xl'
}: AccessibleModalProps) {
    const t = useTranslations('nav');
    const modalRef = useFocusTrap(isOpen);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Bloquear scroll del body
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-nautical-black/80 backdrop-blur-md animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Content */}
            <div
                ref={modalRef}
                className={`relative w-full ${maxWidth} bg-nautical-deep border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-premium-in`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <h2 id="modal-title" className="text-xl font-display italic text-white">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label={t('close')}
                        className="p-2 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
