'use client';

import React, { useState } from 'react';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyName?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, propertyName }) => {
    const [step, setStep] = useState(1);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [service, setService] = useState('Private Viewing');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(3); // Success step
        setTimeout(() => {
            onClose();
            setStep(1);
        }, 4000);
    };

    const timeSlots = ['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}
            onClick={onClose}
        >
            <div
                className="glass-card animate-scale-up"
                style={{
                    width: '100%',
                    maxWidth: '550px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-gold)',
                    padding: 0,
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), var(--shadow-gold)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
                    <span style={{ color: 'var(--gold-400)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2rem', textTransform: 'uppercase' }}>
                        {propertyName ? `RESERVE ${propertyName}` : 'PRIVATE CONSULTATION'}
                    </span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: '0.5rem 0 0 0', color: '#fff' }}>
                        Book Your Session
                    </h2>
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ padding: '2rem' }}>
                    {step === 1 && (
                        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SELECT SERVICE</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {['Private Viewing', 'Virtual Tour', 'Investment Plan', 'VIP Gala'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setService(s)}
                                            style={{
                                                padding: '1rem',
                                                backgroundColor: service === s ? 'var(--gold-500)' : 'var(--bg-elevated)',
                                                color: service === s ? '#0a0a0f' : 'var(--text-primary)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button className="btn-primary" onClick={() => setStep(2)} style={{ width: '100%', padding: '1.25rem' }}>
                                Continue to Schedule
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PREFERRED DATE</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    style={{ backgroundColor: 'var(--bg-elevated)' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVAILABLE SLOTS</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {timeSlots.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTime(t)}
                                            style={{
                                                padding: '0.6rem 1rem',
                                                backgroundColor: time === t ? 'var(--gold-500)' : 'transparent',
                                                color: time === t ? '#0a0a0f' : 'var(--text-secondary)',
                                                border: `1px solid ${time === t ? 'var(--gold-500)' : 'var(--border-subtle)'}`,
                                                borderRadius: '2rem',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</button>
                                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Confirm Reservation</button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem 0' }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--gold-500)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 2rem auto',
                                    fontSize: '2rem'
                                }}
                            >
                                ✓
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#fff', marginBottom: '1rem' }}>Reservation Confirmed</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                An advisor will contact you within 15 minutes to finalize the details of your {service.toLowerCase()} for {propertyName || 'the property'}.
                            </p>
                            <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--gold-400)', letterSpacing: '0.1em', fontWeight: 700 }}>
                                INVITATION SENT TO YOUR EMAIL
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .animate-scale-up {
          animation: scaleUp 0.4s var(--ease-out) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
};
