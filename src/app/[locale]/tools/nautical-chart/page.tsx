import { getTranslations } from 'next-intl/server';
import NauticalChart from '@/components/tools/NauticalChart';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'nautical_chart' });
    return {
        title: t('title'),
        description: t('subtitle')
    };
}

export default function NauticalChartPage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen bg-slate-50/50">
            <NauticalChart />
        </div>
    );
}
