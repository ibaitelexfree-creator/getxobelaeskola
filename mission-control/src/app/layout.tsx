import type { Metadata, Viewport } from 'next';
import { cormorantGaramond, outfit, jetbrainsMono } from './fonts';
import './globals.css';

export const metadata: Metadata = {
    title: 'Mission Control',
    description: 'Orchestration command center for Maestro v3',
};

export const viewport: Viewport = {
    themeColor: '#010409',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${cormorantGaramond.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
            <body className="bg-mission-mesh min-h-screen safe-area-top">
                {children}
            </body>
        </html>
    );
}
