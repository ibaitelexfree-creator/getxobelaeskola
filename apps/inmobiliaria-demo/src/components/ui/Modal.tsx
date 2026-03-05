'use client';
import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
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

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)'
        }}>
            <div
                style={{
                    position: 'absolute', inset: 0
                }}
                onClick={onClose}
            />
            <div className="glass-card animate-fade-in" style={{
                position: 'relative', width: '100%', maxWidth: '600px', maxHeight: '90vh',
                overflowY: 'auto', padding: '2rem'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem', background: 'transparent',
                        border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer'
                    }}
                >
                    &times;
                </button>
                {title && <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{title}</h2>}
                {children}
            </div>
        </div>
    );
}
