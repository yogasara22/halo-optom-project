import api from '../lib/api';

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category: string;
    image_url?: string;
    rating?: number;
    sold?: number;
}

class ShopService {
    async getProducts(params?: { search?: string; category?: string }): Promise<Product[]> {
        try {
            const response = await api.get('/products', { params });
            return response.data.data;
        } catch (error) {
            console.error('Get products error:', error);
            return [];
        }
    }

    async getProductById(id: string): Promise<Product | null> {
        try {
            const response = await api.get(`/products/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Get product by id error:', error);
            return null;
        }
    }
}

export const shopService = new ShopService();
export default shopService;
