'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PROPERTIES } from '@/data/properties';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { PropertyCard } from '@/components/properties/PropertyCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Magnetic } from '@/components/ui/Magnetic';

function PropertiesContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get values from URL or defaults
    const query = searchParams.get('q') || '';
    const filterType = searchParams.get('type') || 'All';
    const filterNeighborhood = searchParams.get('neighborhood') || 'All';
    const filterBeds = searchParams.get('beds') || 'All';
    const sortBy = searchParams.get('sort') || 'Featured';

    const [searchInput, setSearchInput] = useState(query);

    // Sync search input with URL query param
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== query) {
                updateUrl({ q: searchInput });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput, query]);

    const updateUrl = (newParams: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === 'All' || value === '' || (key === 'beds' && value === 'All')) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const filteredProperties = useMemo(() => {
        let result = [...PROPERTIES];

        if (query) {
            const q = query.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.neighborhood.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.type.toLowerCase().includes(q)
            );
        }

        if (filterType !== 'All') {
            result = result.filter(p => p.type === filterType);
        }

        if (filterNeighborhood !== 'All') {
            result = result.filter(p =>
                p.neighborhood === filterNeighborhood ||
                p.neighborhood.toLowerCase().replace(/\s+/g, '-') === filterNeighborhood.toLowerCase()
            );
        }

        if (filterBeds !== 'All') {
            const bedsNum = parseInt(filterBeds);
            result = result.filter(p => p.bedrooms === 'Studio' ? bedsNum === 0 : (p.bedrooms as number) >= bedsNum);
        }

        if (sortBy === 'Price↑') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'Price↓') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'Newest') {
            result.sort((a, b) => b.yearBuilt - a.yearBuilt);
        }

        return result;
    }, [query, filterType, filterNeighborhood, filterBeds, sortBy]);

    const clearFilters = () => {
        setSearchInput('');
        router.replace(pathname, { scroll: false });
    };

    return (
        <div className="container" style={{ paddingTop: '10rem', paddingBottom: '10rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '5rem' }}>
                {/* Curator Filter Panel */}
                <aside style={{ position: 'sticky', top: '140px', height: 'fit-content' }}>
                    <div
                        style={{
                            padding: '3rem',
                            backgroundColor: '#0a0a0a',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3rem'
                        }}
                    >
                        <div>
                            <span className="section-label" style={{ fontSize: '0.65rem', marginBottom: '1rem', display: 'block' }}>REFINEMENT</span>
                            <div className="reveal-mask">
                                <h3 className="reveal-mask-inner" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>Filter Estates</h3>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--gold-500)', fontWeight: 800, letterSpacing: '0.2rem' }}>COLLECTION</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Search by name..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        style={{
                                            padding: '1.2rem',
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--border-subtle)',
                                            color: '#fff',
                                            borderRadius: 'var(--radius-md)',
                                            width: '100%',
                                            transition: 'border-color 0.4s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--gold-500)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                                    />
                                    {searchInput && (
                                        <button
                                            onClick={() => setSearchInput('')}
                                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gold-400)', cursor: 'pointer' }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {[
                                    {
                                        label: 'ARCHITECTURAL TYPE',
                                        value: filterType,
                                        options: ['All', 'Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Duplex', 'Mansion', 'Sky Villa', 'Waterfront Mansion'],
                                        onChange: (v: string) => updateUrl({ type: v })
                                    },
                                    {
                                        label: 'RESIDENTIAL AREA',
                                        value: filterNeighborhood,
                                        options: ['All', ...NEIGHBORHOODS.map(n => n.name)],
                                        onChange: (v: string) => updateUrl({ neighborhood: v })
                                    },
                                    {
                                        label: 'SPATIAL CAPACITY',
                                        value: filterBeds,
                                        options: ['All', '0', '1', '2', '3', '4', '5'],
                                        labels: ['Any', 'Studio', '1+ Beds', '2+ Beds', '3+ Beds', '4+ Beds', '5+ Beds'],
                                        onChange: (v: string) => updateUrl({ beds: v })
                                    },
                                    {
                                        label: 'VALUATION SORT',
                                        value: sortBy,
                                        options: ['Featured', 'Price↑', 'Price↓', 'Newest'],
                                        labels: ['Featured First', 'Price: Ascending', 'Price: Descending', 'Newest Acquisitions'],
                                        onChange: (v: string) => updateUrl({ sort: v })
                                    }
                                ].map((filter, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--gold-500)', fontWeight: 800, letterSpacing: '0.2rem' }}>{filter.label}</label>
                                        <select
                                            className="luxury-select"
                                            value={filter.value}
                                            onChange={(e) => filter.onChange(e.target.value)}
                                            style={{
                                                padding: '1rem',
                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                border: '1px solid var(--border-subtle)',
                                                color: '#fff',
                                                borderRadius: 'var(--radius-md)',
                                                width: '100%',
                                                cursor: 'pointer',
                                                appearance: 'none',
                                                outline: 'none'
                                            }}
                                        >
                                            {filter.options.map((opt, idx) => (
                                                <option key={opt} value={opt} style={{ backgroundColor: '#0a0a0a' }}>
                                                    {filter.labels ? filter.labels[idx] : opt}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <Magnetic distance={20}>
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        marginTop: '1rem',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        letterSpacing: '0.1rem',
                                        textDecoration: 'underline',
                                        width: '100%',
                                        transition: 'color 0.4s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold-400)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    RESET CURATION
                                </button>
                            </Magnetic>
                        </div>
                    </div>
                </aside>

                {/* Properties Grid */}
                <main>
                    <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <span className="section-label" style={{ opacity: 0.6 }}>DUBAI PORTFOLIO</span>
                            <div className="reveal-mask" style={{ marginTop: '0.5rem' }}>
                                <h1 className="reveal-mask-inner" style={{ fontSize: '3.5rem', fontFamily: 'var(--font-display)', color: '#fff', margin: 0 }}>Discover Assets</h1>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>
                            <span className="shimmer-text" style={{ fontSize: '1.1rem', color: 'var(--gold-400)', fontWeight: 600 }}>
                                {filteredProperties.length} EXCLUSIVE LISTINGS
                            </span>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '3rem'
                        }}
                    >
                        {filteredProperties.length > 0 ? (
                            filteredProperties.map((p, i) => (
                                <PropertyCard key={p.id} property={p} index={i} />
                            ))
                        ) : (
                            <div
                                style={{
                                    gridColumn: '1 / -1',
                                    padding: '8rem 2rem',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2rem',
                                    alignItems: 'center',
                                    border: '1px dashed var(--border-subtle)',
                                    borderRadius: 'var(--radius-lg)'
                                }}
                            >
                                <div style={{ fontSize: '4rem', opacity: 0.3 }}>🏛️</div>
                                <h3 style={{ fontSize: '2rem', color: 'var(--gold-500)', fontFamily: 'var(--font-display)' }}>Unmatched Curation</h3>
                                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.8 }}>
                                    Your specific criteria currently exceeds our available ultra-prime inventory. Please adjust your refinement parameters or consult with an advisor.
                                </p>
                                <Magnetic distance={30}>
                                    <button
                                        onClick={clearFilters}
                                        className="btn-primary"
                                        style={{ width: 'fit-content', padding: '1.2rem 3rem' }}
                                    >
                                        REVEAL ALL ASSETS
                                    </button>
                                </Magnetic>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <div style={{ backgroundColor: '#050505', minHeight: '100vh' }}>
            <Header />
            <Suspense fallback={<div className="container" style={{ padding: '20vh', textAlign: 'center', color: 'var(--gold-500)' }}>INITIALIZING PORTFOLIO...</div>}>
                <PropertiesContent />
            </Suspense>
            <Footer locale="en" />
            <style jsx>{`
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }
                @media (max-width: 1100px) {
                    div[style*="gridTemplateColumns: 320px 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                    aside {
                        position: static !important;
                        margin-bottom: 4rem;
                    }
                }
                @media (max-width: 768px) {
                    div[style*="gridTemplateColumns: repeat(2, 1fr)"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
