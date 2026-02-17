import React from 'react';
import VerifyCertificateClient from './VerifyCertificateClient';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale, hash: 'placeholder' }));
}

export default function VerifyCertificatePage({ params }: { params: { locale: string; hash: string } }) {
    return <VerifyCertificateClient params={params} />;
}
