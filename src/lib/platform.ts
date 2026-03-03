import { Capacitor } from "@capacitor/core";

/**
 * Utility to identify the current platform and handle base URLs
 */
export const getPlatform = () => {
	// SSR safe check
	if (typeof window === "undefined") {
		return {
			isNative: false,
			isAndroid: false,
			isIOS: false,
			isWeb: true,
		};
	}

	const isNative = Capacitor.isNativePlatform();
	const platform = Capacitor.getPlatform();

	return {
		isNative,
		isAndroid: platform === "android",
		isIOS: platform === "ios",
		isWeb: platform === "web",
	};
};

/**
 * Gets the correct API URL depending on the platform.
 * For Native (Android/iOS), it must be the absolute production URL.
 * For Web, it can be relative or based on the current domain.
 */
export const getApiUrl = (path: string = "") => {
	const { isNative } = getPlatform();
	const baseUrl = isNative
		? process.env.NEXT_PUBLIC_APP_URL || "https://getxobelaeskola.cloud"
		: ""; // Relative for web

	// Clean path to ensure no double slashes
	const cleanPath = path.startsWith("/") ? path : `/${path}`;

	return `${baseUrl}${cleanPath}`;
};

/**
 * Helper to conditionally execute logic or return styles based on platform
 */
export const platformSelect = <T>(options: { web: T; native: T }): T => {
	const { isNative } = getPlatform();
	return isNative ? options.native : options.web;
};
