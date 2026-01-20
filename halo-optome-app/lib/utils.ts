import { API_BASE_URL } from '../constants/config';

export const fixImageUrl = (url?: string) => {
    if (!url || typeof url !== 'string') {
        console.log('🔗 fixImageUrl: no URL provided', url);
        return undefined;
    }

    // Hilangkan /api di akhir API_BASE_URL untuk mendapatkan root domain
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');

    // 1. Jika starts with /, prepend baseUrl
    if (url.startsWith('/')) {
        const result = `${baseUrl}${url}`;
        console.log('🔗 fixImageUrl (relative):', url, '→', result);
        return result;
    }

    // 2. Jika starts with http/https
    if (url.match(/^https?:\/\//)) {
        // Jika localhost, replace origin with baseUrl
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            const result = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, baseUrl);
            console.log('🔗 fixImageUrl (localhost):', url, '→', result);
            return result;
        }
        console.log('🔗 fixImageUrl (absolute):', url);
        return url;
    }

    // 3. Jika tidak start with slash dan tidak start with http, assume relative path missing slash
    const result = `${baseUrl}/${url}`;
    console.log('🔗 fixImageUrl (relative without /):', url, '→', result);
    return result;
};
