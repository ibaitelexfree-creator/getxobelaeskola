import { notFound } from 'next/navigation';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale, rest: ['404'] }));
}

export default function CatchAllPage() {
    notFound();
}
