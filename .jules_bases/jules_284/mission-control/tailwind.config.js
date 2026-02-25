/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontSize: {
                '2xs': ['0.6875rem', { lineHeight: '1rem' }],
                xs: ['0.75rem', { lineHeight: '1.125rem' }],
                sm: ['0.875rem', { lineHeight: '1.25rem' }],
                base: ['1rem', { lineHeight: '1.5rem' }],
                lg: ['1.125rem', { lineHeight: '1.75rem' }],
            },
            colors: {
                nautical: {
                    black: '#000000',
                    deep: '#010409',
                    blue: '#154FA3',
                },
                'sea-foam': '#F2F2F2',
                'buoy-orange': '#FF4D00',
                'brass-gold': '#c5a059',
                accent: {
                    DEFAULT: '#FF4D00',
                    foreground: '#F2F2F2',
                },
                background: '#000000',
                foreground: '#F2F2F2',
                card: {
                    DEFAULT: 'rgba(255, 255, 255, 0.03)',
                    border: 'rgba(255, 255, 255, 0.1)',
                },
                status: {
                    green: '#00E676',
                    amber: '#FFD740',
                    red: '#FF5252',
                    blue: '#448AFF',
                },
            },
            fontFamily: {
                display: ['var(--font-display)', 'serif'],
                sans: ['var(--font-sans)', 'sans-serif'],
                mono: ['var(--font-mono)', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards',
                'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards',
                'pulse-gentle': 'pulseGentle 4s infinite',
                'pulse-status': 'pulseStatus 2s ease-in-out infinite',
                'spin-slow': 'spinSlow 10s linear infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                pulseGentle: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                pulseStatus: {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 currentColor' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 12px 2px currentColor' },
                },
                spinSlow: {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                },
            },
        },
    },
    plugins: [],
};
