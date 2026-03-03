import ResetPasswordClient from './ResetPasswordClient';
import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const isEu = locale === 'eu';
    const title = isEu ? 'Pasahitza berrezarri' : 'Restablecer Contraseña';
    const description = isEu
        ? 'Berrezarri zure Getxo Bela Eskolako kontuaren pasahitz berria.'
        : 'Establece una nueva contraseña para tu cuenta de Getxo Bela Eskola.';

    return { title, description };
}

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale }));
}

export default function ResetPasswordPage({ params: { locale } }: { params: { locale: string } }) {
    return <ResetPasswordClient locale={locale} />;
}
