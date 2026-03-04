'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Filter, Home, LayoutGrid, List as ListIcon, Loader2, MapPin, Bed, Bath, ArrowRight, Building, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Property {
    id: number;
    title: string;
    location: string;
    price: string;
    status: string;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    images: string[];
}

export default function UserDashboard() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        fetchMyProperties();
    }, []);

    const fetchMyProperties = async () => {
        try {
            const res = await fetch('/realstate/api/properties?userId=me');
            const data = await res.json();
            if (data.success) {
                setProperties(data.properties || []);
            }
        } catch (err) {
            console.error('Error fetching my properties:', err);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: any = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100, damping: 20 }
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="container max-w-7xl mx-auto px-6">

                {/* Dashboard Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
                >
                    <div>
                        <span className="section-label" style={{ opacity: 0.8 }}>Private Portfolio</span>
                        <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-display)', color: '#fff', margin: '0.5rem 0 0 0', lineHeight: 1.1 }}>
                            My <span style={{ color: 'var(--gold-400)' }}>Dashboard</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                            Manage your exclusive listings and track their real-time performance on Luxe Dubai Estates.
                        </p>
                    </div>
                    <Link
                        href="/list-property"
                        className="btn-primary luxury-glow flex items-center justify-center gap-2"
                        style={{ padding: '1rem 2.5rem', letterSpacing: '0.1rem' }}
                    >
                        <Plus size={20} />
                        REGISTER NEW ASSET
                    </Link>
                </motion.div>

                {/* KPI Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                    <motion.div variants={itemVariants} className="glass-card" style={{ padding: '2rem', borderTop: '2px solid var(--gold-500)' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1rem', textTransform: 'uppercase' }}>Total Properties</p>
                                <p style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', color: '#fff', margin: '0.5rem 0 0 0', lineHeight: 1 }}>{properties.length}</p>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%' }}>
                                <Building size={28} color="var(--gold-400)" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-card" style={{ padding: '2rem' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1rem', textTransform: 'uppercase' }}>Awaiting Approval</p>
                                <p style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', color: '#fbbf24', margin: '0.5rem 0 0 0', lineHeight: 1 }}>
                                    {properties.filter(p => p.status === 'pending').length}
                                </p>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: '50%' }}>
                                <Clock size={28} color="#fbbf24" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-card" style={{ padding: '2rem' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1rem', textTransform: 'uppercase' }}>Published Assets</p>
                                <p style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', color: '#10b981', margin: '0.5rem 0 0 0', lineHeight: 1 }}>
                                    {properties.filter(p => p.status === 'published').length}
                                </p>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
                                <CheckCircle size={28} color="#10b981" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--gold-400)' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', letterSpacing: '0.1rem' }}>RETRIEVING PORTFOLIO...</p>
                    </div>
                ) : properties.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card"
                        style={{ textAlign: 'center', padding: '6rem 2rem', borderStyle: 'dashed', borderWidth: '1px' }}
                    >
                        <Home size={64} style={{ margin: '0 auto', color: 'var(--border-strong)', marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '1rem' }}>Your Portfolio is Empty</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
                            Begin your luxurious real estate journey with Luxe Dubai Estates. List your premium property to connect with elite buyers globally.
                        </p>
                        <Link href="/list-property" className="btn-primary" style={{ padding: '1rem 3rem' }}>
                            LIST YOUR FIRST ASSET
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: '#fff' }}>Asset Collection</h2>
                            <div className="glass-card" style={{ display: 'flex', padding: '0.3rem', borderRadius: '1rem', border: '1px solid var(--border-subtle)' }}>
                                <button onClick={() => setView('grid')} style={{ padding: '0.5rem', background: view === 'grid' ? 'var(--gold-500)' : 'transparent', color: view === 'grid' ? '#000' : 'var(--text-muted)', borderRadius: '0.7rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}>
                                    <LayoutGrid size={20} />
                                </button>
                                <button onClick={() => setView('list')} style={{ padding: '0.5rem', background: view === 'list' ? 'var(--gold-500)' : 'transparent', color: view === 'list' ? '#000' : 'var(--text-muted)', borderRadius: '0.7rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}>
                                    <ListIcon size={20} />
                                </button>
                            </div>
                        </div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-6"}
                        >
                            {properties.map((property) => (
                                <motion.div key={property.id} variants={itemVariants} className="glass-card" style={{ overflow: 'hidden', display: view === 'list' ? 'flex' : 'block', padding: 0, paddingBottom: view === 'list' ? 0 : '1.5rem', position: 'relative' }}>

                                    {/* Status Badge Over Image */}
                                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
                                        {property.status === 'published' ? (
                                            <span style={{
                                                backgroundColor: 'rgba(16, 185, 129, 0.9)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.4rem 1rem', borderRadius: '2rem', letterSpacing: '0.1rem', backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem'
                                            }}>
                                                <CheckCircle size={12} /> ACTIVE
                                            </span>
                                        ) : property.status === 'rejected' ? (
                                            <span style={{
                                                backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.4rem 1rem', borderRadius: '2rem', letterSpacing: '0.1rem', backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem'
                                            }}>
                                                <XCircle size={12} /> REJECTED
                                            </span>
                                        ) : (
                                            <span style={{
                                                backgroundColor: 'rgba(245, 158, 11, 0.9)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.4rem 1rem', borderRadius: '2rem', letterSpacing: '0.1rem', backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem'
                                            }}>
                                                <Clock size={12} /> PENDING
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ width: view === 'list' ? '300px' : '100%', height: view === 'list' ? '100%' : '260px', overflow: 'hidden' }}>
                                        <img
                                            src={property.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'}
                                            alt={property.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </div>

                                    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-400)', letterSpacing: '0.1rem', textTransform: 'uppercase' }}>
                                                {property.property_type}
                                            </span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>
                                                {property.price}
                                            </span>
                                        </div>

                                        <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '1rem', lineHeight: 1.3 }}>
                                            {property.title}
                                        </h3>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                            <MapPin size={16} color="var(--gold-500)" />
                                            {property.location}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                                                <Bed size={18} color="var(--gold-500)" />
                                                <span style={{ fontWeight: 600 }}>{property.bedrooms}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                                                <Bath size={18} color="var(--gold-500)" />
                                                <span style={{ fontWeight: 600 }}>{property.bathrooms}</span>
                                            </div>

                                            {property.status === 'published' && (
                                                <Link
                                                    href={`/properties/${property.id}`} // Or actual slug, need mapping if so. Using ID as fallback
                                                    style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-400)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.3s' }}
                                                    onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--gold-400)'}
                                                >
                                                    VIEW LIVE <ArrowRight size={16} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}

