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
import { Suspense } from 'react';
import StatusToast from '@/components/shared/StatusToast';

export const viewport: Viewport = {
  themeColor: '#001B3A', // Nautical Black
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'eu' }, { locale: 'en' }, { locale: 'fr' }];
}

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
            <Suspense fallback={null}>
              <StatusToast />
            </Suspense>
          </AcademyFeedbackProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const isEu = locale === 'eu';
  const isEn = locale === 'en';
  const isFr = locale === 'fr';

  let title = 'Getxo Sailing School | Escuela de Navegación';
  let description = 'Descubre el mundo de la navegación en Getxo. Cursos de vela, academia online y alquiler de embarcaciones.';

  if (isEu) {
    title = 'Getxo Bela Eskola | Nabigazio Akademia';
    description = 'Ezagutu nabigazioaren mundua Getxon. Bela ikastaroak, online akademia eta ontzien alokairua.';
  } else if (isEn) {
    title = 'Getxo Sailing School | Nautical Academy';
    description = 'Discover the world of sailing in Getxo. Sailing courses, online academy, and boat rentals.';
  } else if (isFr) {
    title = 'Getxo Sailing School | École Nautique';
    description = 'Découvrez le monde de la navigation à Getxo. Cours de voile, académie en ligne et location de bateaux.';
  }

  const ogLocale = isEu ? 'eu_ES' : isEn ? 'en_US' : isFr ? 'fr_FR' : 'es_ES';

  return {
    title: {
      default: title,
      template: `%s | Getxo Sailing School`
    },
    description,
    keywords: ['vela', 'sailing', 'getxo', 'academia náutica', 'bela eskola', 'alquiler barcos', 'voile', 'école nautique'],
    authors: [{ name: 'Getxo Sailing School' }],
    creator: 'Getxo Sailing School',
    publisher: 'Getxo Sailing School',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud'), // Cambiar a dominio real
    alternates: {
      canonical: '/',
      languages: {
        'es-ES': '/es',
        'eu-ES': '/eu',
        'en-US': '/en',
        'fr-FR': '/fr',
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
      locale: ogLocale,
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
