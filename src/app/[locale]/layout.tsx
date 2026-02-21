import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cormorantGaramond, outfit, jetbrainsMono } from '@/app/fonts';
import '@/app/globals.css';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
const AcademyFeedbackProvider = dynamic(() => import('@/components/academy/AcademyFeedbackProvider'), { ssr: false });
const PushNotificationInitializer = dynamic(() => import('@/components/academy/notifications/PushNotificationInitializer'), { ssr: false });
const SmartNotificationManager = dynamic(() => import('@/components/academy/notifications/SmartNotificationManager'), { ssr: false });
import ConditionalLayout from '@/components/layout/ConditionalLayout';
const ScrollUpButton = dynamic(() => import('@/components/shared/ScrollToTop'), { ssr: false });
import { Viewport } from 'next';
import { Suspense } from 'react';
const StatusToast = dynamic(() => import('@/components/shared/StatusToast'), { ssr: false });

export const viewport: Viewport = {
  themeColor: '#001B3A', // Nautical Black
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
      <head>
        <link rel="dns-prefetch" href="https://xbledhifomblirxurtyv.supabase.co" />
      </head>
      <body suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          {locale === 'eu' ? 'Edukira jo' : locale === 'en' ? 'Skip to content' : locale === 'fr' ? 'Aller au contenu' : 'Saltar al contenido'}
        </a>
        <NextIntlClientProvider messages={messages} locale={locale} timeZone="Europe/Madrid">
          <AcademyFeedbackProvider>
            <PushNotificationInitializer />
            <SmartNotificationManager />
            <div className="min-h-screen flex flex-col relative w-full overflow-x-hidden">
              <ConditionalLayout
                locale={locale}
                navbar={<Navbar locale={locale} />}
                footer={<Footer locale={locale} />}
              >
                <main id="main-content" className="flex-grow">
                  {children}
                </main>
              </ConditionalLayout>
            </div>
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

  let title = 'Getxo Bela Eskola | Escuela de Navegación en Getxo';
  let description = 'Aprende a navegar en el Cantábrico. Cursos de vela ligera, cruceros J80, academia náutica online y alquiler de material en el Puerto Deportivo de Getxo.';

  if (isEu) {
    title = 'Getxo Bela Eskola | Nabigazio Akademia Getxon';
    description = 'Ikasi nabigatzen Kantauri itsasoan. Bela ikastaroak, J80 ontziak, online akademia eta material alokairua Getxoko Portu Kiroleruan.';
  } else if (isEn) {
    title = 'Getxo Sailing School | Sailing Lessons in Getxo';
    description = 'Learn to sail in the Bay of Biscay. Pro sailing courses, J80 yacht training, online academy, and boat rentals in Getxo Marina.';
  } else if (isFr) {
    title = 'Getxo Sailing School | École de Voile à Getxo';
    description = 'Apprenez la navigation en mer Cantabrique. Cours de voile, formation J80, académie en ligne et location de bateaux à Getxo.';
  }

  const ogLocale = isEu ? 'eu_ES' : isEn ? 'en_US' : isFr ? 'fr_FR' : 'es_ES';
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud';

  return {
    title: {
      default: title,
      template: `%s | Getxo Sailing School`
    },
    description,
    keywords: ['vela getxo', 'escuela náutica', 'bela eskola', 'alquiler barcos getxo', 'cursos vela', 'licencia navegación', 'J80 getxo', 'pakea bela'],
    authors: [{ name: 'Getxo Sailing School' }],
    creator: 'Getxo Sailing School',
    publisher: 'Getxo Sailing School',
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/${locale}/`,
      languages: {
        'es-ES': '/es/',
        'eu-ES': '/eu/',
        'en-US': '/en/',
        'fr-FR': '/fr/',
      },
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: 'Getxo Sailing School',
      images: [
        {
          url: '/images/home-hero-sailing-action.webp',
          width: 1200,
          height: 630,
          alt: 'Getxo Sailing School - Sailing Action'
        },
      ],
      locale: ogLocale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/home-hero-sailing-action.webp'],
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
