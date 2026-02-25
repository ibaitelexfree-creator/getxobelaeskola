import PublicProfileMain from './PublicProfileMain';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale, userId: 'me' }));
}

export default function PublicProfilePage({ params }: { params: { locale: string; userId: string } }) {
    return <PublicProfileMain params={params} />;
}
