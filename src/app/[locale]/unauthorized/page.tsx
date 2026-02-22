import React from 'react';
import Link from 'next/link';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale }));
}

export default function UnauthorizedPage({ params: { locale } }: { params: { locale: string } }) {
    return (
        <div className="min-h-screen bg-nautical-black text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-4 text-red-500">403 - Acceso Denegado</h1>
            <p className="mb-8 text-white/60 text-center max-w-md">
                No tienes permisos suficientes para acceder a esta área.
                Esta zona está restringida a administradores e instructores.
            </p>
            <Link
                href={`/${locale}/student/dashboard`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
                Volver al Dashboard
            </Link>
        </div>
    );
}
