'use client';

import React, { useState } from 'react';
import { Magnetic } from './Magnetic';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyName?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, propertyName }) => {
    const [step, setStep] = useState(1);
    const [service, setService] = useState('Private Viewing');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Collect data from form (simplifying since it's a demo but functional)
        const formData = new FormData(e.target as HTMLFormElement);
        const name = (e.target as any).elements[0].value;
        const email = (e.target as any).elements[1].value;

        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: name,
                    email: email,
                    service_type: service,
                    propertyName: propertyName
                })
            });
            setStep(3);
            setTimeout(() => {
                onClose();
                setStep(1);
            }, 5000);
        } catch (err) {
            console.error('Failed to submit booking:', err);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.95)',
                backdropFilter: 'blur(20px)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}
            onClick={onClose}
        >
            <div
                className="perspective-2000"
                style={{
                    width: '100%',
                    maxWidth: '650px',
                    opacity: 0,
                    animation: 'modalReveal 0.8s var(--ease-rev) forwards'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        backgroundColor: '#0a0a0a',
                        border: '1px solid var(--border-gold)',
                        boxShadow: '0 50px 100px rgba(0,0,0,0.8), 0 0 50px rgba(212,168,67,0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 'var(--radius-lg)'
                    }}
                >
                    <div className="luxury-sweep" style={{ opacity: 0.1 }} />

                    {/* Header */}
                    <div style={{ padding: '3.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{
                            color: 'var(--gold-500)',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            letterSpacing: '0.4rem',
                            textTransform: 'uppercase'
                        }}>
                            PRIVATE RESERVATION
                        </span>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '2.5rem',
                            marginTop: '1.5rem',
                            color: '#fff',
                            fontWeight: 400
                        }}>
                            {propertyName ? propertyName : 'VIP Consultation'}
                        </h2>
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '2rem',
                                right: '2rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ padding: '4rem' }}>
                        {step === 1 && (
                            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--gold-600)', fontWeight: 800, letterSpacing: '0.15rem', marginBottom: '1.5rem', display: 'block' }}>CHOOSE YOUR EXPERIENCE</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        {['Private Viewing', 'Investment Brief', 'Virtual Showcase', 'Digital Concierge'].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setService(s)}
                                                className="luxury-option-btn"
                                                style={{
                                                    padding: '1.5rem',
                                                    backgroundColor: service === s ? 'var(--gold-600)' : 'transparent',
                                                    color: service === s ? '#000' : '#fff',
                                                    border: '1px solid var(--border-subtle)',
                                                    borderRadius: 'var(--radius-md)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                    transition: 'all 0.4s ease',
                                                    letterSpacing: '0.05rem'
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Magnetic distance={30}>
                                    <button
                                        className="btn-primary"
                                        onClick={() => setStep(2)}
                                        style={{ width: '100%', padding: '1.8rem', fontSize: '1.1rem', letterSpacing: '0.2rem' }}
                                    >
                                        PROCEED TO SCHEDULE
                                    </button>
                                </Magnetic>
                            </div>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleSubmit} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--gold-600)', fontWeight: 800, letterSpacing: '0.15rem' }}>VIP IDENTIFICATION</label>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="input-field"
                                        required
                                        style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderColor: 'rgba(255,255,255,0.1)' }}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Private Email"
                                        className="input-field"
                                        required
                                        style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderColor: 'rgba(255,255,255,0.1)' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <button type="button" className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1, padding: '1.5rem' }}>BACK</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 2, padding: '1.5rem' }}>CONFIRM ACCESS</button>
                                </div>
                            </form>
                        )}

                        {step === 3 && (
                            <div className="fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    border: '1px solid var(--gold-500)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 3rem auto',
                                    position: 'relative'
                                }}>
                                    <div className="pulse-slow" style={{ position: 'absolute', inset: -10, border: '1px solid var(--gold-600)', borderRadius: '50%' }} />
                                    <span style={{ fontSize: '2.5rem', color: 'var(--gold-400)' }}>✓</span>
                                </div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginBottom: '1.5rem' }}>Request Formalized</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem', fontWeight: 300 }}>
                                    Your portfolio advisor will be notified immediately. Expect an encrypted confirmation within minutes.
                                </p>
                                <div style={{
                                    marginTop: '3.5rem',
                                    fontSize: '0.7rem',
                                    color: 'var(--gold-500)',
                                    letterSpacing: '0.4rem',
                                    fontWeight: 900
                                }}>
                                    LUXURY REFINEMENT SECURED
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes modalReveal {
                    from { opacity: 0; transform: scale(0.9) translateY(40px) rotateX(-10deg); }
                    to { opacity: 1; transform: scale(1) translateY(0) rotateX(0); }
                }
                .fade-in {
                    animation: fadeIn 0.8s ease forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .luxury-option-btn:hover {
                    border-color: var(--gold-500) !important;
                    background-color: rgba(212,168,67,0.05) !important;
                }
            `}</style>
        </div>
    );
};
