import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import NativeAppRedirect from '@/components/shared/NativeAppRedirect';

const HeroCarousel = dynamic(() => import('@/components/home/HeroCarousel'), {
  loading: () => <div className="h-screen w-full bg-nautical-black animate-pulse" />
});
const ExperienceSection = dynamic(() => import('@/components/home/ExperienceSection'));
const StatsSection = dynamic(() => import('@/components/home/StatsSection'));
const FeaturesSection = dynamic(() => import('@/components/home/FeaturesSection'));
const ProgramsSection = dynamic(() => import('@/components/home/ProgramsSection'));


export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isEu = locale === 'eu';
  const isEn = locale === 'en';
  const isFr = locale === 'fr';

  let title = 'Inicio | Getxo Bela Eskola';
  let description = 'Bienvenido a Getxo Bela Eskola. Aprende a navegar, alquila material y vive experiencias náuticas inolvidables en el Puerto de Getxo.';

  if (isEu) {
    title = 'Hasiera | Getxo Bela Eskola';
    description = 'Ongi etorri Getxo Bela Eskolara. Ikasi nabigatzen, alokatu materiala eta bizi itsas esperientzia ahaztezinak Getxon.';
  } else if (isEn) {
    title = 'Home | Getxo Sailing School';
    description = 'Welcome to Getxo Sailing School. Learn to sail, rent equipment and live unforgettable nautical experiences in Getxo Marina.';
  } else if (isFr) {
    title = 'Accueil | Getxo Sailing School';
    description = 'Bienvenue à Getxo Sailing School. Apprenez la voile, louez du matériel et vivez des expériences nautiques inoubliables à Getxo.';
  }

  return {
    title,
    description,
  };
}

export default async function LandingPage({ params: { locale } }: { params: { locale: string } }) {
  const tHero = await getTranslations({ locale, namespace: 'home.hero' });
  const tStats = await getTranslations({ locale, namespace: 'home.stats' });
  const tExp = await getTranslations({ locale, namespace: 'home.experience' });
  const tProg = await getTranslations({ locale, namespace: 'home.programs' });
  const tFeat = await getTranslations({ locale, namespace: 'home.features' });

  const initialSlides = [
    {
      id: 1,
      image: '/images/home-hero-sailing-action.webp',
      title: tHero('slide1_title'),
      subtitle: tHero('slide1_subtitle'),
      action: tHero('slide1_action'),
      link: '/courses'
    },
    {
      id: 2,
      image: '/images/course-detail-header-sailing.webp',
      title: tHero('slide2_title'),
      subtitle: tHero('slide2_subtitle'),
      action: tHero('slide2_action'),
      link: '/rental'
    },
    {
      id: 3,
      image: '/images/courses/IniciacionJ80.webp',
      title: tHero('slide3_title'),
      subtitle: tHero('slide3_subtitle'),
      action: tHero('slide3_action'),
      link: '/courses/licencia-navegacion'
    },
    {
      id: 4,
      image: '/images/course-raquero-students.webp',
      title: tHero('slide4_title'),
      subtitle: tHero('slide4_subtitle'),
      action: tHero('slide4_action'),
      link: '/courses/vela-ligera'
    }
  ];

  const programs = [
    {
      title: tProg('licencia_title'),
      price: tProg('licencia_price'),
      desc: tProg('licencia_desc'),
      image: '/images/courses/LicenciadeNavegacion.webp',
      link: '/courses/licencia-navegacion'
    },
    {
      title: tProg('j80_title'),
      price: tProg('j80_price'),
      desc: tProg('j80_desc'),
      image: '/images/courses/IniciacionJ80.webp',
      link: '/courses/iniciacion-j80'
    },
    {
      title: tProg('rental_title'),
      price: tProg('price_rental'),
      desc: tProg('rental_desc'),
      image: '/images/courses/PerfeccionamientoVela.webp',
      link: '/rental'
    }
  ];

  const features = [
    {
      icon: '/images/icon-3d-certificate.webp',
      title: tFeat('cert_title'),
      desc: tFeat('cert_desc')
    },
    {
      icon: '/images/icon-3d-instructor.webp',
      title: tFeat('staff_title'),
      desc: tFeat('staff_desc')
    },
    {
      icon: '/images/icon-3d-community.webp',
      title: tFeat('comm_title'),
      desc: tFeat('comm_desc')
    }
  ];

  return (
    <div className="w-full">
      <NativeAppRedirect locale={locale} />
      <HeroCarousel initialSlides={initialSlides} />
      <StatsSection
        pasionLabel={tStats('pasion')}
        alumnosLabel={tStats('alumnos')}
        flotaLabel={tStats('flota')}
        clasesLabel={tStats('clases')}
      />
      <ExperienceSection
        locale={locale}
        filosofia={tExp('filosofia')}
        lifestyle_title={tExp('lifestyle_title')}
        lifestyle_subtitle={tExp('lifestyle_subtitle')}
        desc1={tExp('desc1')}
        desc2={tExp('desc2')}
        about_link={tExp('about_link')}
        live={tExp('live')}
        the={tExp('the')}
        passion={tExp('passion')}
      />
      <ProgramsSection
        locale={locale}
        badge={tProg('badge')}
        title={tProg('title')}
        learn_more={tProg('learn_more')}
        programs={programs}
      />
      <FeaturesSection features={features} />

      {/* SEO Hidden H1 */}
      <h1 className="sr-only">
        {locale === 'eu' ? 'Getxo Bela Eskola | Bela Eskola Getxon' :
          locale === 'en' ? 'Getxo Sailing School | Sailing Lessons in Getxo' :
            locale === 'fr' ? 'Getxo Sailing School | École de Voile à Getxo' :
              'Getxo Bela Eskola | Escuela de Vela en Getxo'}
      </h1>
    </div>
  );
}
