'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';

export default function NativeAppRedirect({ locale }: { locale: string }) {
    const router = useRouter();

    useEffect(() => {
        // If we are on a native platform (Android/iOS APK)
        if (Capacitor.isNativePlatform()) {
            console.log('Native platform detected, redirecting to student dashboard...');
            router.replace(`/${locale}/student/dashboard`);
        }
    }, [locale, router]);

    return null;
}
