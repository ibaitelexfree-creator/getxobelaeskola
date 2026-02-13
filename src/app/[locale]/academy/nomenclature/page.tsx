'use client';

import { useLocale } from 'next-intl';
import NomenclatureLesson from '@/components/academy/nomenclature/NomenclatureLesson';

export default function NomenclaturePage() {
    const locale = useLocale();

    return (
        <div className="w-full min-h-screen bg-[#000510] relative text-white">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-nautical-black/80 pointer-events-none" />

            {/* Header */}
            <header className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
                <div>
                    <h1 className="text-3xl font-display italic tracking-wide drop-shadow-lg text-white">
                        Nomenclatura Náutica
                    </h1>
                    <p className="text-[10px] text-accent uppercase tracking-[0.3em] font-light mt-2">
                        Taxonomía Montessori
                    </p>
                </div>
            </header>

            {/* Main Lesson Area */}
            <main className="relative z-0 h-screen pt-24 pb-8">
                <NomenclatureLesson locale={locale} />
            </main>
        </div>
    );
}
