import RaceClient from './RaceClient';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale, code: 'placeholder' }));
}

export default function RacePage() {
    return <RaceClient />;
}
