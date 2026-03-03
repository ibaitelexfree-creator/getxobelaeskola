import { getTranslations } from 'next-intl/server';
import WindRose from '@/components/wind-lab/WindRose';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'wind_lab.interactive_rose' });
  return {
    title: `${t('title')} | Getxo Bela Eskola`,
    description: t('drag_instruction'),
  };
}

export default async function WindLabPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'wind_lab.interactive_rose' });

  return (
    <div className="w-full min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('drag_instruction')}
          </p>
        </div>

        <WindRose />
      </div>
    </div>
  );
}
