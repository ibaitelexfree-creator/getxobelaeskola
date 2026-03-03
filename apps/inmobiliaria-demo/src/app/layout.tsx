import type { Metadata } from 'next';
import './globals.css';
import { AishaChatWidget } from '@/components/chat/AishaChatWidget';
import { SpotlightCursor } from '@/components/ui/SpotlightCursor';

export const metadata: Metadata = {
  metadataBase: new URL('https://controlmanager.cloud/realstate'),
  title: 'Luxe Dubai Estates | Premium Real Estate in Dubai',
  description: 'Discover the most exclusive properties in Dubai. From Palm Jumeirah penthouses to Emirates Hills mansions, find your ultra-luxury home with Luxe Dubai Estates.',
  keywords: 'Dubai real estate, luxury properties Dubai, buy villa Dubai, Palm Jumeirah penthouse, Emirates Hills mansion, real estate investment Dubai',
  authors: [{ name: 'Luxe Dubai Estates' }],
  openGraph: {
    title: 'Luxe Dubai Estates | Premium Real Estate in Dubai',
    description: 'Discover the most exclusive properties in Dubai. From Palm Jumeirah penthouses to Emirates Hills mansions.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'Luxe Dubai Estates',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ backgroundColor: '#050505' }}>
        {/* Global Luxury Texture */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <SpotlightCursor />

        {children}

        <AishaChatWidget />
      </body>
    </html>
  );
}
// forces CI to deploy due to line append
