import React from 'react';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'gold' | 'green' | 'red';
    className?: string;
    style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gold', className = '', style }) => {
    const variantClass = `badge-${variant}`;
    return (
        <span className={`badge ${variantClass} ${className}`} style={style}>
            {children}
        </span>
    );
};

export default Badge;
