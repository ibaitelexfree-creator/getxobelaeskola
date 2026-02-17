export const getApiBaseUrl = () => {
    // In Capacitor, we can't use relative URLs like /api
    // We must use the absolute URL of the production server or local dev server
    if (typeof window !== 'undefined' &&
        (window.location.protocol === 'file:' ||
            window.location.hostname === 'localhost' ||
            window.location.protocol === 'capacitor:')) {

        // If we have a custom App URL (like production or local IP), use it
        if (process.env.NEXT_PUBLIC_APP_URL) {
            return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
        }

        // Fallback for production if no env var is found
        return 'https://getxobelaeskola.cloud';
    }

    // In standard web environment, use relative paths
    return '';
};

export const apiUrl = (path: string) => {
    const base = getApiBaseUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // Fix common path errors: remove /academy/ prefix if it was incorrectly added
    const fixedPath = cleanPath.replace(/^\/api\/academy\//, '/api/');

    return `${base}${fixedPath}`;
};
