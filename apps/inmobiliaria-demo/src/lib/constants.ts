export const BASE_PATH = '/controlmanager/realstate';

export const getAssetPath = (path: string) => {
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_PATH}${cleanPath}`;
};
