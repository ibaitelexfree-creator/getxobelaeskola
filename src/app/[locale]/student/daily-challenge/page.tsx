import { getTranslations } from 'next-intl/server';
import DailyChallengeWidget from '@/components/student/DailyChallengeWidget';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Props {
    params: {
        locale: string;
    }
}

export default async function DailyChallengePage({ params: { locale } }: Props) {
    const t = await getTranslations('student_dashboard.daily_challenge');

    return (
        <main className="min-h-screen bg-nautical-black pt-24 pb-12 px-6">
            <div className="max-w-md mx-auto">
                <Link
                    href={`/${locale}/student/dashboard`}
                    className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest font-bold mb-8 hover:text-accent transition-colors"
                >
                    <ChevronLeft size={16} />
                    Volver al Panel
                </Link>

                <header className="mb-10">
                    <h1 className="text-3xl font-display text-white italic mb-2">Reto Diario</h1>
                    <p className="text-white/40 text-sm">Demuestra tus conocimientos náuticos y gana XP.</p>
                </header>

                <DailyChallengeWidget locale={locale} />
            </div>
        </main>
    );
}
