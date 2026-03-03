import { getTranslations } from 'next-intl/server';
import LeaderboardClient from './LeaderboardClient';
import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'leaderboard' });
    return {
        title: t('title'),
        description: t('subtitle'),
        robots: {
            index: false,
            follow: false,
        }
    };
}

export default async function LeaderboardPage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const t = await getTranslations({ locale, namespace: 'leaderboard' });

    // Pass raw translations
    const translations = {
        title: t('title'),
        subtitle: t('subtitle'),
        my_position: t('my_position'),
        xp: t('xp'),
        streak: t('streak'),
        modules: t('modules'),
        privacy_title: t('privacy_title'),
        privacy_desc: t('privacy_desc'),
        public: t('public'),
        private: t('private'),
        anonymous_user: t('anonymous_user'),
        empty_state: t('empty_state'),
        rank: t('rank'),
        sailor: t('sailor'),
        level: t('level')
    };

    return <LeaderboardClient locale={locale} translations={translations} />;
}
