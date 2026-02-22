import NauticalCalculator from '@/components/tools/NauticalCalculator';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools' });
  return {
    title: t('title'),
    description: t('title')
  };
}

export default async function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <NauticalCalculator />
      </div>
    </div>
  );
}
