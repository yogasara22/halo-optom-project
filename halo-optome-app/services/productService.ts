// services/productService.ts
import api from '../lib/api';

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  image_url?: string;
  description?: string;
  category?: string;
  brand?: string;
  rating?: number;
  stock?: number;
  features?: string[];
}

export interface ProductFilter {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
}

class ProductService {
  async getProducts(filters?: ProductFilter): Promise<Product[]> {
    try {
      const response = await api.get('/products', { params: filters });
      return response.data.data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get product ${id} error:`, error);
      throw error;
    }
  }

  async getRecommendedProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/products/recommended');
      return response.data.data;
    } catch (error) {
      try {
        const fallback = await api.get('/products', { params: { category: 'Kacamata', sort: 'rating_desc' } });
        return fallback.data.data || [];
      } catch (err2) {
        return [];
      }
    }
  }

  async getProductCategories(): Promise<string[]> {
    try {
      const response = await api.get('/products/categories');
      return response.data.data;
    } catch (error) {
      console.error('Get product categories error:', error);
      throw error;
    }
  }

  async getProductBrands(): Promise<string[]> {
    try {
      const response = await api.get('/products/brands');
      return response.data.data;
    } catch (error) {
      console.error('Get product brands error:', error);
      throw error;
    }
  }
}

export const productService = new ProductService();
export default productService;
