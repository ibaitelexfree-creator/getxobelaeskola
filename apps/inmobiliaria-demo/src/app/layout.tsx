import type { Metadata } from "next";
import "./globals.css";
import { AishaChatWidget } from "@/components/chat/AishaChatWidget";

export const metadata: Metadata = {
  title: "Luxe Dubai Estates | Premium Real Estate in Dubai",
  description: "Discover the most exclusive properties in Dubai. From Palm Jumeirah penthouses to Emirates Hills mansions, find your ultra-luxury home with Luxe Dubai Estates.",
  keywords: "Dubai real estate, luxury properties Dubai, buy villa Dubai, Palm Jumeirah penthouse, Emirates Hills mansion, real estate investment Dubai",
  authors: [{ name: "Luxe Dubai Estates" }],
  openGraph: {
    title: "Luxe Dubai Estates | Premium Real Estate in Dubai",
    description: "Discover the most exclusive properties in Dubai. From Palm Jumeirah penthouses to Emirates Hills mansions.",
    type: "website",
    locale: "en_AE",
    siteName: "Luxe Dubai Estates",
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
      <body>
        {children}
        <AishaChatWidget />
      </body>
    </html>
  );
}
