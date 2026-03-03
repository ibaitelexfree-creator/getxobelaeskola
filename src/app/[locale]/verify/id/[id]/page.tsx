import React from 'react';
import VerificationPageClient from './VerificationPageClient';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale, id: 'placeholder' }));
}

export default function VerificationPage({
    params
}: {
    params: { locale: string; id: string }
}) {
    return <VerificationPageClient params={params} />;
}
