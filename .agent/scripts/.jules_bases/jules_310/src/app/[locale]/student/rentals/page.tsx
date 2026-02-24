import { createClient } from '@/lib/supabase/server';
import MobileRentalList from '@/components/student/MobileRentalList';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale }));
}

export default async function MobileRentalPage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    const supabase = createClient();
    let services = [];

    try {
        const { data, error } = await supabase
            .from('servicios_alquiler')
            .select('*')
            .eq('activo', true)
            .order('precio_base', { ascending: true });

        if (!error && data) {
            services = data;
        }
    } catch (err) {
        console.error('Error loading rentals:', err);
    }

    return (
        <main className="min-h-screen bg-nautical-black">
            <MobileRentalList services={services} locale={locale} />
        </main>
    );
}
