'use client';

import React, { useState, useEffect } from 'react';
import LuxuryReveal from '@/components/ui/LuxuryReveal';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ListPropertyPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setIsLoading(false);
        };
        checkUser();
    }, [supabase]);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        location: NEIGHBORHOODS[0].name,
        bedrooms: '',
        bathrooms: '',
        property_type: 'Villa',
        description: '',
        images: [] as File[]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...Array.from(e.target.files!)]
            }));
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('price', formData.price.toString());
            submitData.append('location', formData.location);
            submitData.append('property_type', formData.property_type);
            submitData.append('bedrooms', formData.bedrooms.toString());
            submitData.append('bathrooms', formData.bathrooms.toString());
            submitData.append('description', formData.description);

            formData.images.forEach(file => {
                submitData.append('images', file);
            });

            const response = await fetch('/realstate/api/properties', {
                method: 'POST',
                body: submitData
            });

            // Handle non-JSON responses (like 404 or 500 HTML pages)
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Server returned non-JSON response:', text);
                throw new Error('Server returned an invalid response. Please check the API status.');
            }

            const resData = await response.json();
            if (!response.ok) {
                throw new Error(resData.error || 'Failed to submit property');
            }

            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Error connecting to the property database.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
            {isLoading ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    gap: '2rem'
                }}>
                    <div className="luxury-spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '2px solid rgba(212,168,67,0.1)',
                        borderTopColor: 'var(--gold-500)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <span style={{ color: 'var(--gold-400)', letterSpacing: '0.2em', fontSize: '0.8rem', fontWeight: 600 }}>AUTHENTICATING...</span>
                    <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
                </div>
            ) : !user ? (
                <main style={{ paddingTop: '10rem', paddingBottom: '10rem' }}>
                    <div className="container" style={{ maxWidth: '800px' }}>
                        <div className="glass-card" style={{
                            padding: '6rem 4rem',
                            textAlign: 'center',
                            border: '1px solid rgba(212,168,67,0.2)',
                            background: 'linear-gradient(135deg, rgba(15,15,15,0.85) 0%, rgba(5,5,5,0.95) 100%)',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Animated Background Accent */}
                            <div style={{
                                position: 'absolute',
                                top: '-50%',
                                left: '-50%',
                                width: '200%',
                                height: '200%',
                                background: 'radial-gradient(circle at center, rgba(212,168,67,0.05) 0%, transparent 70%)',
                                zIndex: 0,
                                opacity: 0.5
                            }} />
                            <LuxuryReveal>
                                <div style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>💎</div>
                            </LuxuryReveal>
                            <LuxuryReveal delay={0.2}>
                                <h1 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                    color: '#fff',
                                    marginBottom: '1.5rem',
                                    lineHeight: 1.2
                                }}>
                                    Exclusive <span className="gold-text">Membership</span> Required
                                </h1>
                            </LuxuryReveal>
                            <LuxuryReveal delay={0.4}>
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '1.1rem',
                                    maxWidth: '500px',
                                    margin: '0 auto 3.5rem',
                                    fontWeight: 300,
                                    lineHeight: 1.8
                                }}>
                                    To maintain the integrity of our ultra-luxury portfolio, only registered members can list assets on our global platform.
                                </p>
                            </LuxuryReveal>
                            <LuxuryReveal delay={0.6}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
                                    <Link href="/auth/login?returnTo=/list-property" className="btn-primary" style={{ padding: '1.2rem 3.5rem', textDecoration: 'none' }}>
                                        SIGN IN / JOIN NOW
                                    </Link>
                                    <Link href="/" className="btn-secondary" style={{ padding: '1.2rem 3rem', textDecoration: 'none' }}>
                                        RETURN HOME
                                    </Link>
                                </div>
                            </LuxuryReveal>
                        </div>
                    </div>
                </main>
            ) : (
                <main style={{ paddingTop: '10rem', paddingBottom: '10rem' }}>
                    <div className="container" style={{ maxWidth: '900px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                            <LuxuryReveal>
                                <span className="section-label" style={{ letterSpacing: '0.4em' }}>PRIVATE LISTING</span>
                            </LuxuryReveal>
                            <LuxuryReveal delay={0.2}>
                                <h1 className="section-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '1.5rem' }}>
                                    List Your <span className="gold-text">Extraordinary</span> Property
                                </h1>
                            </LuxuryReveal>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 300 }}>
                                Entrust us with your masterpiece and reach our global clientele of elite buyers.
                            </p>
                        </div>

                        {isSuccess ? (
                            <div className="glass-card" style={{ padding: '6rem', textAlign: 'center', borderColor: 'var(--gold-600)' }}>
                                <div style={{ width: '80px', height: '80px', background: 'rgba(212,168,67,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem' }}>
                                    <span style={{ fontSize: '2.5rem' }}>✨</span>
                                </div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#fff', marginBottom: '1.5rem' }}>Submission Received</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '500px', margin: '0 auto 3rem', fontWeight: 300 }}>
                                    Your exquisite listing has been securely recorded. Our advisory team will review the portfolio
                                    and contact you shortly to coordinate a private presentation strategy.
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => {
                                            setIsSuccess(false);
                                            setFormData({ title: '', price: '', location: NEIGHBORHOODS[0].name, bedrooms: '', bathrooms: '', property_type: 'Villa', description: '', images: [] });
                                        }}
                                        className="btn-primary"
                                        style={{ padding: '1.2rem 3rem' }}
                                    >
                                        Submit Another Asset
                                    </button>
                                    <Link
                                        href="/dashboard"
                                        className="btn-secondary"
                                        style={{ padding: '1.2rem 3rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                                    >
                                        View My Portfolio
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="glass-card"
                                style={{ padding: '4rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
                            >
                                {error && (
                                    <div style={{ padding: '1.25rem', backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                                        {error}
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }} className="grid-2">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--gold-500)', fontWeight: 700, letterSpacing: '0.15em' }}>PROPERTY TITLE</label>
                                        <input
                                            type="text"
                                            name="title"
                                            required
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            placeholder="e.g. Ultra-Luxury Penthouse"
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--gold-500)', fontWeight: 700, letterSpacing: '0.15em' }}>VALUATION (AED)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            min="1000000"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            placeholder="e.g. 15000000"
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--gold-500)', fontWeight: 700, letterSpacing: '0.15em' }}>NEIGHBORHOOD</label>
                                        <select
                                            name="location"
                                            required
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            style={{ appearance: 'none' }}
                                        >
                                            {NEIGHBORHOODS.map(n => (
                                                <option key={n.id} value={n.name}>{n.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--gold-500)', fontWeight: 700, letterSpacing: '0.15em' }}>ARCHITECTURAL TYPE</label>
                                        <select
                                            name="property_type"
                                            value={formData.property_type}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            style={{ appearance: 'none' }}
                                        >
                                            <option value="Villa">Villa</option>
                                            <option value="Penthouse">Penthouse</option>
                                            <option value="Mansion">Mansion</option>
                                            <option value="Apartment">Apartment</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--gold-500)', fontWeight: 700, letterSpacing: '0.15em' }}>BEDROOMS</label>
                                        <input
                                            type="number"
                                            name="bedrooms"
                                            min="1"
                                            value={formData.bedrooms}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            placeholder="e.g. 5"
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--gold-500)', fontWeight: 700, letterSpacing: '0.15em' }}>BATHROOMS</label>
                                        <input
                                            type="number"
                                            name="bathrooms"
                                            min="1"
                                            value={formData.bathrooms}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            placeholder="e.g. 6"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--gold-500)', fontWeight: 700, letterSpacing: '0.15em' }}>EXECUTIVE SUMMARY</label>
                                    <textarea
                                        name="description"
                                        required
                                        rows={5}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        style={{ resize: 'none' }}
                                        placeholder="Describe the architectural uniqueness, amenities, and lifestyle..."
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--gold-500)', fontWeight: 700, letterSpacing: '0.15em' }}>VISUAL ASSETS</label>
                                    <div
                                        style={{
                                            border: '2px dashed var(--border-subtle)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: '3rem',
                                            textAlign: 'center',
                                            position: 'relative',
                                            transition: 'background-color 0.4s ease'
                                        }}
                                        className="upload-zone"
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                            accept="image/*"
                                        />
                                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>📸</div>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ color: 'var(--gold-400)', fontWeight: 600 }}>Click to upload</span> or drag and drop
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>High-resolution JPEG or PNG (max 10MB)</p>
                                    </div>
                                    {formData.images.length > 0 && (
                                        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(212,168,67,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)' }}>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: 700, marginBottom: '0.5rem' }}>{formData.images.length} FILES SELECTED</p>
                                            <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {formData.images.map((img, i) => (
                                                    <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                                                        <span style={{ opacity: 0.8 }}>• {img.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(i)}
                                                            className="remove-btn"
                                                            aria-label="Remove image"
                                                        >
                                                            ✕
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: '2rem' }}>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary"
                                        style={{ width: '100%', padding: '1.5rem', fontSize: '1.1rem', opacity: isSubmitting ? 0.7 : 1 }}
                                    >
                                        {isSubmitting ? "Authenticating Portfolio..." : "Register Global Listing"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </main>
            )}
            <style jsx>{`
                .upload-zone:hover {
                    background-color: rgba(255,255,255,0.02);
                    border-color: var(--gold-500);
                }
                .remove-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-size: 1.1rem;
                    padding: 0 0.5rem;
                    transition: all 0.3s ease;
                }
                .remove-btn:hover {
                    color: #f87171;
                    transform: scale(1.1);
                }
                @media (max-width: 640px) {
                    .grid-2 { grid-template-columns: 1fr !important; gap: 2rem !important; }
                }
            `}</style>
        </div>
    );
}
