/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontSize: {
                '2xs': ['0.6875rem', { lineHeight: '1rem' }], // ~11px
                'xs': ['0.75rem', { lineHeight: '1.125rem' }], // ~12px
                'sm': ['0.875rem', { lineHeight: '1.25rem' }], // ~14px
                'base': ['1rem', { lineHeight: '1.5rem' }], // ~16px
                'lg': ['1.125rem', { lineHeight: '1.75rem' }], // ~18px
            },
            colors: {
                brand: {
                    blue: '#154FA3',
                    black: '#000000',
                    grey: '#F2F2F2',
                },
                nautical: {
                    black: '#000000',
                    deep: '#010409',
                    blue: '#154FA3',
                },
                ocean: {
                    dark: 'var(--ocean-dark)',
                    medium: 'var(--ocean-medium)',
                    light: 'var(--ocean-light)',
                    deep: 'var(--ocean-deep)',
                },
                'sea-foam': '#F2F2F2',
                'buoy-orange': '#FF4D00',
                'brass-gold': '#c5a059',
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: 'var(--accent-foreground)',
                },
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                card: {
                    DEFAULT: 'var(--card)',
                    foreground: 'var(--card-foreground)',
                    border: 'var(--card-border)', // Keep hardcoded or make variable if needed
                },
            },
            fontFamily: {
                display: ['var(--font-display)', 'serif'],
                sans: ['var(--font-sans)', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards',
                'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards',
                'bounce-slow': 'bounceSlow 3s infinite',
                'pulse-gentle': 'pulseGentle 4s infinite',
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
                bounceSlow: {
                    '0%, 100%': { transform: 'translateY(-5%)' },
                    '50%': { transform: 'translateY(0)' },
                },
                pulseGentle: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                }
            },
        },
    },
    plugins: [],
}
