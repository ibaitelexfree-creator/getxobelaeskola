'use client';

import React, { useState } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setFormData({ name: '', email: '', phone: '', message: '' });
            setTimeout(() => setIsSuccess(false), 5000);
        }, 1500);
    };

    const contactItems = [
        { label: 'VISIT US', value: 'Dubai Marina, Tower 2, Level 18' },
        { label: 'CALL US', value: '+971 4 000 0000' },
        { label: 'EMAIL US', value: 'info@luxedubaiestates.com' }
    ];

    return (
        <>
            <Header />
            <main style={{ paddingTop: '100px', minHeight: '80vh' }}>
                <section
                    style={{
                        height: '400px',
                        width: '100%',
                        position: 'relative',
                        background: `linear-gradient(rgba(0,0,0,0.6), var(--bg-primary)), url('https://images.unsplash.com/photo-1518684079-3c830dcef090') center/cover no-repeat`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}
                >
                    <div className="container">
                        <span className="section-label">CONTACT US</span>
                        <h1 className="section-title" style={{ fontSize: '4rem', color: '#fff' }}>Get in Touch</h1>
                    </div>
                </section>

                <section className="section">
                    <div className="container">
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6rem' }}>
                            <div>
                                <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Send a Message</h2>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>FULL NAME</span>
                                            <input
                                                type="text"
                                                required
                                                className="input-field"
                                                placeholder="Your name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>EMAIL ADDRESS</span>
                                            <input
                                                type="email"
                                                required
                                                className="input-field"
                                                placeholder="Your email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PHONE NUMBER</span>
                                        <input
                                            type="tel"
                                            className="input-field"
                                            placeholder="+971 50 XXXXXXX"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>YOUR MESSAGE</span>
                                        <textarea
                                            required
                                            className="input-field"
                                            rows={5}
                                            placeholder="Tell us about the property you're looking for..."
                                            style={{ resize: 'none' }}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <button
                                        disabled={isSubmitting}
                                        className="btn-primary"
                                        style={{ padding: '1.5rem', opacity: isSubmitting ? 0.7 : 1 }}
                                    >
                                        {isSubmitting ? 'Sending Request...' : 'Send Message'}
                                    </button>
                                    {isSuccess && (
                                        <div className="glass-card" style={{ padding: '1rem', backgroundColor: 'rgba(34,197,94,0.1)', borderColor: '#22c55e', textAlign: 'center' }}>
                                            <span style={{ color: '#22c55e', fontWeight: 600 }}>Message sent successfully! Our advisors will contact you soon.</span>
                                        </div>
                                    )}
                                </form>
                            </div>

                            <div>
                                <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>Connect With Us</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                    {contactItems.map((item) => (
                                        <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-500)', letterSpacing: '0.2em' }}>{item.label}</span>
                                            <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{item.value}</span>
                                        </div>
                                    ))}

                                    <div className="divider" style={{ margin: '1rem 0' }}></div>

                                    <div>
                                        <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1.5rem' }}>OFFICE HOURS</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                            <span>Monday - Friday</span>
                                            <span>9:00 AM - 7:00 PM</span>
                                            <span>Saturday</span>
                                            <span>10:00 AM - 5:00 PM</span>
                                            <span>Sunday</span>
                                            <span style={{ color: 'var(--gold-500)', fontWeight: 600 }}>Closed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer locale="en" />
            <style jsx>{`
        @media (max-width: 1024px) {
          .container > div { grid-template-columns: 1fr !important; gap: 4rem !important; }
        }
      `}</style>
        </>
    );
}
