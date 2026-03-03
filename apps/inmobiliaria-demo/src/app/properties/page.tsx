'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PROPERTIES, PropertyType } from '@/data/properties';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { PropertyCard } from '@/components/properties/PropertyCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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

    // Sync search input with URL query param (debounced-ish via controlled input + effect)
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

        // Text search
        if (query) {
            const q = query.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.neighborhood.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.type.toLowerCase().includes(q)
            );
        }

        // Type filter
        if (filterType !== 'All') {
            result = result.filter(p => p.type === filterType);
        }

        // Neighborhood filter
        if (filterNeighborhood !== 'All') {
            // Match by name or slug
            result = result.filter(p =>
                p.neighborhood === filterNeighborhood ||
                p.neighborhood.toLowerCase().replace(/\s+/g, '-') === filterNeighborhood.toLowerCase()
            );
        }

        // Bedrooms filter
        if (filterBeds !== 'All') {
            const bedsNum = parseInt(filterBeds);
            result = result.filter(p => p.bedrooms === 'Studio' ? bedsNum === 0 : (p.bedrooms as number) >= bedsNum);
        }

        // Sorting
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
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem' }}>
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'sticky', top: '100px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--gold-400)' }}>Search</h3>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Keywords, property name..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    style={{ paddingLeft: '1rem' }}
                                />
                                {searchInput && (
                                    <button
                                        onClick={() => setSearchInput('')}
                                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>Filter By</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PROPERTY TYPE</span>
                                    <select
                                        className="input-field"
                                        value={filterType}
                                        onChange={(e) => updateUrl({ type: e.target.value })}
                                        style={{ background: 'var(--bg-secondary)' }}
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Apartment">Apartment</option>
                                        <option value="Villa">Villa</option>
                                        <option value="Penthouse">Penthouse</option>
                                        <option value="Townhouse">Townhouse</option>
                                        <option value="Duplex">Duplex</option>
                                        <option value="Mansion">Mansion</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NEIGHBORHOOD</span>
                                    <select
                                        className="input-field"
                                        value={filterNeighborhood}
                                        onChange={(e) => updateUrl({ neighborhood: e.target.value })}
                                        style={{ background: 'var(--bg-secondary)' }}
                                    >
                                        <option value="All">All Neighborhoods</option>
                                        {NEIGHBORHOODS.map(n => (
                                            <option key={n.id} value={n.name}>{n.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>BEDROOMS</span>
                                    <select
                                        className="input-field"
                                        value={filterBeds}
                                        onChange={(e) => updateUrl({ beds: e.target.value })}
                                        style={{ background: 'var(--bg-secondary)' }}
                                    >
                                        <option value="All">Any</option>
                                        <option value="0">Studio</option>
                                        <option value="1">1+ Bedrooms</option>
                                        <option value="2">2+ Bedrooms</option>
                                        <option value="3">3+ Bedrooms</option>
                                        <option value="4">4+ Bedrooms</option>
                                        <option value="5">5+ Bedrooms</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SORT BY</span>
                                    <select
                                        className="input-field"
                                        value={sortBy}
                                        onChange={(e) => updateUrl({ sort: e.target.value })}
                                        style={{ background: 'var(--bg-secondary)' }}
                                    >
                                        <option value="Featured">Featured First</option>
                                        <option value="Price↑">Price Low to High</option>
                                        <option value="Price↓">Price High to Low</option>
                                        <option value="Newest">Newest Listed</option>
                                    </select>
                                </div>

                                <button
                                    onClick={clearFilters}
                                    style={{
                                        marginTop: '1rem',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--gold-400)',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Reset all filters
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                <main>
                    <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="section-title" style={{ fontSize: '2rem' }}>Properties In Dubai</h1>
                            {query && (
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    Showing results for "<span style={{ color: 'var(--gold-400)' }}>{query}</span>"
                                </p>
                            )}
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <strong>{filteredProperties.length}</strong> luxurious residences found
                        </span>
                    </div>

                    <div
                        className="grid-2"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '2.5rem'
                        }}
                    >
                        {filteredProperties.length > 0 ? (
                            filteredProperties.map(p => (
                                <PropertyCard key={p.id} property={p} />
                            ))
                        ) : (
                            <div
                                className="glass-card"
                                style={{
                                    gridColumn: '1 / -1',
                                    padding: '5rem',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.5rem',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ fontSize: '3rem' }}>🏙️</div>
                                <h3 style={{ fontSize: '1.5rem', color: 'var(--gold-400)' }}>No matches found</h3>
                                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                                    We couldn't find any properties matching your current filters. Try broadening your search or resetting all filters.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="btn-secondary"
                                    style={{ width: 'fit-content', marginTop: '1rem' }}
                                >
                                    Clear All Filters
                                </button>
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
        <>
            <Header />
            <Suspense fallback={<div className="container" style={{ padding: '20vh' }}>Loading properties...</div>}>
                <PropertiesContent />
            </Suspense>
            <Footer locale="en" />
            <style jsx>{`
        @media (max-width: 1024px) {
          .container > div { grid-template-columns: 1fr !important; }
          aside { position: static !important; border-bottom: 1px solid var(--border-subtle); padding-bottom: 2rem; margin-bottom: 3rem; }
        }
        @media (max-width: 640px) {
          .grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </>
    );
}
