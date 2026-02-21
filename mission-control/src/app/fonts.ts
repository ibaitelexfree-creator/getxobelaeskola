import { Cormorant_Garamond, Outfit, JetBrains_Mono } from 'next/font/google';

export const cormorantGaramond = Cormorant_Garamond({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-display',
    weight: ['300', '400', '600'],
    style: ['normal', 'italic'],
});

export const outfit = Outfit({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-sans',
    weight: ['300', '400', '600'],
});

export const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-mono',
    weight: ['300', '400', '700'],
});
