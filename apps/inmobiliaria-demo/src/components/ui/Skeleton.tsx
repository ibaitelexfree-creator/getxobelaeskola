import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
}

export function Skeleton({ className = '', width = '100%', height = '20px', borderRadius = '4px' }: SkeletonProps) {
    return (
        <div
            className={`skeleton-base ${className}`}
            style={{
                width,
                height,
                borderRadius,
                background: 'linear-gradient(90deg, #1c1c28 25%, #2a2a36 50%, #1c1c28 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-loading 1.5s infinite linear'
            }}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}} />
        </div>
    );
}
