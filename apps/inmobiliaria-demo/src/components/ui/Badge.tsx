import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'gold' | 'green';
    className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, variant = 'gold', className = '', style }: BadgeProps) {
    const variantClass = variant === 'gold' ? 'badge-gold' : 'badge-green';
    return (
        <span className={`badge ${variantClass} ${className}`}>
            {children}
        </span>
    );
}
