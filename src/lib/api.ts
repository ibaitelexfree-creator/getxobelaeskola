export const getApiBaseUrl = () => {
    // In Capacitor, we can't use relative URLs like /api
    // We must use the absolute URL of the production server
    if (typeof window !== 'undefined' && (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.protocol === 'capacitor:')) {
        return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://getxobelaeskola.cloud';
    }
    return '';
};

export const apiUrl = (path: string) => {
    const base = getApiBaseUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
};
