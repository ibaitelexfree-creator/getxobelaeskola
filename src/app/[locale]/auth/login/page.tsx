import LoginPageClient from './LoginPageClient';

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

