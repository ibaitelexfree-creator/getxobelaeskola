export const getApiBaseUrl = () => {
	// In Capacitor, we can't use relative URLs like /api
	// We must use the absolute URL of the production server or local dev server
	if (typeof window !== "undefined") {
		const isLocalhost =
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1";
		const isCapacitor =
			window.location.protocol === "capacitor:" ||
			window.location.protocol === "file:";

		// If we are on localhost in a browser, use the current origin
		if (isLocalhost && !isCapacitor) {
			return window.location.origin;
		}

		// In Capacitor or if NEXT_PUBLIC_APP_URL is explicitly set
		if (process.env.NEXT_PUBLIC_APP_URL) {
			return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
		}

		// Fallback for production if no env var is found
		return "https://getxobelaeskola.cloud";
	}

	// In standard web environment, use relative paths
	return "";
};

export const apiUrl = (path: string) => {
	const base = getApiBaseUrl();
	const cleanPath = path.startsWith("/") ? path : `/${path}`;

	// Fix common path errors: remove /academy/ prefix if it was incorrectly added
	const fixedPath = cleanPath.replace(/^\/api\/academy\//, "/api/");

	return `${base}${fixedPath}`;
};
