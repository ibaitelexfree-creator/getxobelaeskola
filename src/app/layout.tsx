import { ReactNode } from 'react';

// This is the root layout that will be used for any pages NOT covered by [locale]
// and for the internal Next.js error pages/not-found fallback.
export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="es">
            <head>
                <title>Getxo Bela Eskola</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body>{children}</body>
        </html>
    );
}
