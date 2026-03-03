
'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Option {
    id: string;
    label: string;
    subLabel?: string;
    status?: 'free' | 'occupied' | 'warning' | 'neutral';
    statusLabel?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    loading?: boolean;
    onSearch?: (query: string) => void;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    label,
    loading = false,
    onSearch
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (onSearch) {
            onSearch(val);
        }
    };

    const filteredOptions = onSearch
        ? options
        : options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    return (
        <div className={`space-y-2 relative ${isOpen ? 'z-[400]' : 'z-10'}`} ref={wrapperRef}>
            {label && <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">{label}</label>}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-nautical-black border ${isOpen ? 'border-accent' : 'border-white/10'} p-3 text-white cursor-pointer flex justify-between items-center transition-all`}
            >
                <div className="truncate flex items-center gap-2">
                    {selectedOption ? (
                        <>
                            {selectedOption.status === 'free' && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />}
                            {selectedOption.status === 'occupied' && <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
                            <span className="text-sm">{selectedOption.label}</span>
                        </>
                    ) : (
                        <span className="text-white/20 text-sm">{placeholder}</span>
                    )}
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 z-[500] mt-1 bg-nautical-black border border-white/10 shadow-2xl overflow-hidden rounded-sm">
                    <div className="p-2 border-b border-white/5 bg-white/[0.02]">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Buscar..."
                            className="w-full bg-white/5 border border-white/10 p-2 text-2xs text-white outline-none focus:border-accent/50"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar bg-nautical-black">
                        {loading ? (
                            <div className="p-4 text-center text-white/20 text-3xs uppercase tracking-widest animate-pulse">
                                Buscando...
                            </div>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => {
                                        onChange(opt.id);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`p-3 cursor-pointer group hover:bg-white/5 transition-colors border-b border-white/[0.02] last:border-0 ${value === opt.id ? 'bg-accent/10 border-l-2 border-l-accent' : ''}`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex flex-col">
                                            <div className={`text-sm font-medium ${value === opt.id ? 'text-accent' : 'text-white/90 group-hover:text-white'}`}>
                                                {opt.label}
                                            </div>
                                            {opt.subLabel && (
                                                <div className={`text-3xs tracking-wide mt-1 font-light ${opt.status === 'occupied' ? 'text-red-400/80' : 'text-white/40'}`}>
                                                    {opt.subLabel}
                                                </div>
                                            )}
                                        </div>
                                        {opt.status && (
                                            <div className={`px-2 py-0.5 rounded-[2px] text-[9px] uppercase font-bold tracking-tighter ${opt.status === 'free' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                opt.status === 'occupied' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-white/5 text-white/40 border border-white/10'
                                                }`}>
                                                {opt.statusLabel || (opt.status === 'free' ? 'Libre' : 'Ocupado')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (

                            <div className="p-4 text-center text-white/20 text-2xs italic">
                                No se encontraron resultados
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
