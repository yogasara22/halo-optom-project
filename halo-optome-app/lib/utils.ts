import { API_BASE_URL } from '../constants/config';

export const fixImageUrl = (url?: string) => {
    if (!url || typeof url !== 'string') {
        return undefined;
    }

    // Hilangkan /api di akhir API_BASE_URL untuk mendapatkan root domain
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');

    // 1. Jika starts with /, prepend baseUrl
    if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
    }

    // 2. Jika starts with http/https
    if (url.match(/^https?:\/\//)) {
        // Jika localhost, replace origin with baseUrl
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, baseUrl);
        }
        return url;
    }

    // 3. Jika tidak start with slash dan tidak start with http, assume relative path missing slash
    return `${baseUrl}/${url}`;
};
