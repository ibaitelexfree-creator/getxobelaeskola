'use client';

import NomenclatureLesson from '@/components/academy/nomenclature/NomenclatureLesson';
import { useTranslations } from 'next-intl';

import { useParams } from 'next/navigation';

export default function NomenclaturePage() {
    const params = useParams();
    const locale = params.locale as string;

    return (
        <div className="w-full h-screen relative bg-nautical-black overflow-hidden flex flex-col">
            {/* Header */}
            <div className="w-full h-16 flex items-center justify-center border-b border-white/10 z-10 shrink-0">
                <h1 className="text-xl font-display italic text-white tracking-wider">
                    Nomenclatura Náutica
                </h1>
            </div>

            {/* Lesson Component */}
            <div className="flex-grow overflow-hidden relative">
                <NomenclatureLesson locale={locale} />
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.1),transparent)] pointer-events-none" />
        </div>
    );
}
