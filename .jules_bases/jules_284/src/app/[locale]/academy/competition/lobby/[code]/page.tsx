import LobbyClient from './LobbyClient';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale, code: 'placeholder' }));
}

export default function LobbyPage() {
    return <LobbyClient />;
}
