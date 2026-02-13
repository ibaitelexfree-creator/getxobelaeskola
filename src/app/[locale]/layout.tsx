import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cormorantGaramond, outfit, jetbrainsMono } from '@/app/fonts';
import '@/app/globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NotificationContainer from '@/components/academy/notifications/NotificationContainer';
import RealtimeNotifications from '@/components/academy/notifications/RealtimeNotifications';
import ActivityTracker from '@/components/academy/ActivityTracker';
import AcademyFeedbackProvider from '@/components/academy/AcademyFeedbackProvider';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import ScrollUpButton from '@/components/shared/ScrollToTop';
import { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#001B3A', // Nautical Black
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages({ locale });


  return (
    <html lang={locale} className={`${cormorantGaramond.variable} ${outfit.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale} timeZone="Europe/Madrid">
          <AcademyFeedbackProvider>
            <div className="min-h-screen flex flex-col relative">
              <ConditionalLayout
                navbar={<Navbar locale={locale} />}
                footer={<Footer locale={locale} />}
              >
                {children}
              </ConditionalLayout>
            </div>
            <NotificationContainer />
            <RealtimeNotifications />
            <ActivityTracker />
            <ScrollUpButton />
          </AcademyFeedbackProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const isEu = locale === 'eu';
  const title = isEu ? 'Getxo Bela Eskola | Nabigazio Akademia' : 'Getxo Sailing School | Escuela de Navegación';
  const description = isEu
    ? 'Ezagutu nabigazioaren mundua Getxon. Cursos de vela, academia online y alquiler de embarcaciones.'
    : 'Descubre el mundo de la navegación en Getxo. Cursos de vela, academia online y alquiler de embarcaciones.';

  return {
    title: {
      default: title,
      template: `%s | Getxo Sailing School`
    },
    description,
    keywords: ['vela', 'sailing', 'getxo', 'academia náutica', 'bela eskola', 'alquiler barcos'],
    authors: [{ name: 'Getxo Sailing School' }],
    creator: 'Getxo Sailing School',
    publisher: 'Getxo Sailing School',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://getxo-sailing-school.vercel.app'), // Cambiar a dominio real
    alternates: {
      canonical: '/',
      languages: {
        'es-ES': '/es',
        'eu-ES': '/eu',
      },
    },
    openGraph: {
      title,
      description,
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://getxo-sailing-school.vercel.app',
      siteName: 'Getxo Sailing School',
      images: [
        {
          url: '/og-image.jpg', // Requiere crear esta imagen
          width: 1200,
          height: 630,
        },
      ],
      locale: isEu ? 'eu_ES' : 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
