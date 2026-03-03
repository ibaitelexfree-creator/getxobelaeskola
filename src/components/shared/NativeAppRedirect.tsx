"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// import { Capacitor } from '@capacitor/core';

export default function NativeAppRedirect({ locale }: { locale: string }) {
	const router = useRouter();

	useEffect(() => {
		// If we are on a native platform (Android/iOS APK)
		import("@capacitor/core").then(({ Capacitor }) => {
			if (Capacitor.isNativePlatform()) {
				console.log(
					"Native platform detected, redirecting to student dashboard...",
				);
				router.replace(`/${locale}/student/dashboard`);
			}
		});
	}, [locale, router]);

	return null;
}
