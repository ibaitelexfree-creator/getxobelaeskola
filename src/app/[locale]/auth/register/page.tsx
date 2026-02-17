import RegisterPageClient from './RegisterPageClient';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale }));
}

export default function RegisterPage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    return <RegisterPageClient params={{ locale }} />;
}

