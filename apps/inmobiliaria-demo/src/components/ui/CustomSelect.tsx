'use client';

import React from 'react';

interface CustomSelectProps {
    value: string;
    options: string[];
    labels?: string[];
    onChange: (value: string) => void;
    placeholder?: string;
    triggerStyle?: React.CSSProperties;
}

export function CustomSelect({ value, options, labels, onChange, placeholder, triggerStyle }: CustomSelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={triggerStyle}
            className="w-full bg-[#0a0a0f] text-white outline-none focus:ring-1 focus:ring-[#d4a843]/20"
        >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt, i) => (
                <option key={opt} value={opt}>
                    {labels && labels[i] ? labels[i] : opt}
                </option>
            ))}
        </select>
    );
}
