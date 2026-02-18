import LoginPageClient from './LoginPageClient';
import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const isEu = locale === 'eu';
    const title = isEu ? 'Hasi saioa' : 'Iniciar Sesión';
    const description = isEu
        ? 'Hasi saioa Getxo Bela Eskolako zure kontuan.'
        : 'Inicia sesión en tu cuenta de Getxo Bela Eskola.';

    return { title, description };
}

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale }));
}

export default function LoginPage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    return <LoginPageClient locale={locale} />;
}

