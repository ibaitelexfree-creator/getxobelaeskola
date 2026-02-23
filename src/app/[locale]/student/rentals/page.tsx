import { createClient } from '@/lib/supabase/server';
import MobileRentalList from '@/components/student/MobileRentalList';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale }));
}

// Define the interface to match what MobileRentalList expects
// Assuming MobileRentalList expects a similar shape to RentalService
interface MobileRentalService {
    id: string;
    nombre: string;
    nombre_es: string;
    nombre_eu?: string;
    nombre_en?: string;
    descripcion: string;
    descripcion_es?: string;
    descripcion_eu?: string;
    descripcion_en?: string;
    imagen_url?: string;
    precio_base?: number;
    precio_hora?: number;
    categoria: string;
    activo: boolean;
}

export default async function MobileRentalPage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    const supabase = createClient();
    let services: MobileRentalService[] = [];

    try {
        const { data, error } = await supabase
            .from('servicios_alquiler')
            .select('*')
            .eq('activo', true)
            .order('precio_base', { ascending: true });

        if (!error && data) {
            services = data as unknown as MobileRentalService[];
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
