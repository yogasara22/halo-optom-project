import { API_BASE_URL } from '../constants/config';

export const fixImageUrl = (url?: string) => {
    if (!url) return undefined;

    // Jika URL sudah valid (bukan localhost/127.0.0.1), kembalikan langsung
    if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
        return url;
    }

    // Ambil hostname dari API_BASE_URL (misal: 10.84.155.39)
    // API_BASE_URL format: http://10.84.155.39:4000/api
    const targetHost = API_BASE_URL.split('://')[1].split(':')[0];

    // Replace localhost atau 127.0.0.1 dengan targetHost
    let newUrl = url.replace('localhost', targetHost).replace('127.0.0.1', targetHost);

    return newUrl;
};
