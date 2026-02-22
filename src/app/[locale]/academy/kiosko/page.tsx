import KioskContainer from '@/components/academy/kiosko/KioskContainer';
import { Viewport } from 'next';

export const dynamic = 'force-static';

export const viewport: Viewport = {
    themeColor: '#000000',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

interface KioskPageProps {
    params: {
        locale: string;
    };
}

export default function KioskPage({ params: { locale } }: KioskPageProps) {
    return (
        <main className="w-full h-screen overflow-hidden bg-black">
            <KioskContainer locale={locale} />
        </main>
    );
}
