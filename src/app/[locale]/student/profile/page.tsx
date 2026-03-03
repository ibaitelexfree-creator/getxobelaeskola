import MobileProfileClient from '@/components/student/MobileProfileClient';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale }));
}

export default async function MobileProfilePage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    // We no longer do server-side redirect here.
    // MobileProfileClient will handle auth check on the client side.
    // This provides much better stability for the Android APK / Capacitor.

    return (
        <main className="min-h-screen bg-nautical-black">
            <MobileProfileClient
                locale={locale}
            />
        </main>
    );
}
