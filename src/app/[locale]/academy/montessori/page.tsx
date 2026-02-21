import MontessoriExplorer from '@/components/academy/montessori/MontessoriExplorer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Exploración Libre - Montessori',
    description: 'Navega tu aprendizaje a tu propio ritmo.'
};

export default function MontessoriPage() {
    return (
        <main className="min-h-screen bg-nautical-deep py-8 md:py-12">
            <MontessoriExplorer />
        </main>
    );
}
