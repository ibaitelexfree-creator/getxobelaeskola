'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type CurrencyCode = 'AED' | 'USD' | 'EUR' | 'GBP' | 'RUB' | 'CNY';

interface Currency {
    code: CurrencyCode;
    symbol: string;
    name: string;
    locale: string;
}

const currencies: Record<CurrencyCode, Currency> = {
    AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'ar-AE' },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
    CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
};

interface CurrencyContextType {
    currentCurrency: Currency;
    setCurrency: (code: CurrencyCode) => void;
    rates: Record<string, number>;
    loading: boolean;
    formatPrice: (priceAED: number, options?: { compact?: boolean; full?: boolean }) => string;
    convert: (priceAED: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currentCurrency, setCurrentCurrencyState] = useState<Currency>(currencies.AED);
    const [rates, setRates] = useState<Record<string, number>>({ AED: 1 });
    const [loading, setLoading] = useState(true);

    const fetchRates = useCallback(async () => {
        try {
            const response = await fetch('https://open.er-api.com/v6/latest/AED');
            const data = await response.json();
            if (data && data.rates) {
                setRates(data.rates);
            }
        } catch (error) {
            console.error('Error fetching currency rates:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRates();
        const savedCurrency = localStorage.getItem('selectedCurrency') as CurrencyCode;
        if (savedCurrency && currencies[savedCurrency]) {
            setCurrentCurrencyState(currencies[savedCurrency]);
        }
    }, [fetchRates]);

    const setCurrency = (code: CurrencyCode) => {
        if (currencies[code]) {
            setCurrentCurrencyState(currencies[code]);
            localStorage.setItem('selectedCurrency', code);
        }
    };

    const convert = useCallback((priceAED: number) => {
        const rate = rates[currentCurrency.code] || 1;
        return priceAED * rate;
    }, [currentCurrency.code, rates]);

    const formatPrice = useCallback((priceAED: number, options: { compact?: boolean; full?: boolean } = {}) => {
        const converted = convert(priceAED);
        const { code, symbol, locale } = currentCurrency;

        if (options.compact !== false && converted >= 1_000_000) {
            return `${symbol} ${(converted / 1_000_000).toFixed(2)}M`;
        }

        if (options.full) {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: code,
                maximumFractionDigits: 0,
            }).format(converted);
        }

        return `${symbol} ${converted.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
    }, [convert, currentCurrency]);

    return (
        <CurrencyContext.Provider value={{ currentCurrency, setCurrency, rates, loading, formatPrice, convert }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
