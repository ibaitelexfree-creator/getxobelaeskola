'use client';

import React, { useState } from 'react';
import { useCurrency } from '../providers/CurrencyProvider';
import { Coins } from 'lucide-react';

const availableCurrencies: { code: any; name: string; symbol: string }[] = [
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

export default function CurrencySelector() {
    const { currentCurrency, setCurrency } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    transition: 'all 0.3s ease',
                }}
                className="hover:border-[var(--gold-400)] hover:text-[var(--gold-400)]"
            >
                <Coins size={16} />
                {currentCurrency.code}
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        minWidth: '150px',
                        zIndex: 1000,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    }}
                >
                    {availableCurrencies.map((curr) => (
                        <button
                            key={curr.code}
                            onClick={() => {
                                setCurrency(curr.code);
                                setIsOpen(false);
                            }}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                background: currentCurrency.code === curr.code ? 'var(--bg-primary)' : 'transparent',
                                border: 'none',
                                color: currentCurrency.code === curr.code ? 'var(--gold-400)' : 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s ease',
                            }}
                            className="hover:bg-[var(--bg-primary)] hover:text-[var(--gold-400)]"
                        >
                            <span>{curr.name}</span>
                            <span style={{ opacity: 0.6 }}>{curr.symbol}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
