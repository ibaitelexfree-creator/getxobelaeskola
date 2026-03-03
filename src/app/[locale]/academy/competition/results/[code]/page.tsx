import ResultsClient from './ResultsClient';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale, code: 'placeholder' }));
}

export default function ResultsPage() {
    return <ResultsClient />;
}
