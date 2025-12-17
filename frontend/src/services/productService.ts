import { Product, PaginatedResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
};

// Helper function to create headers
const createHeaders = (options?: { noCache?: boolean }): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    // Only add no-cache headers when explicitly requested
    ...(options?.noCache && { 
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }),
  };
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText || 'Terjadi kesalahan pada server'}`);
    } catch (error) {
      // Jika gagal parse JSON, gunakan status text
      throw new Error(`Error ${response.status}: ${response.statusText || 'Terjadi kesalahan pada server'}`);
    }
  }
  
  try {
    return await response.json();
  } catch (error) {
    console.error('Error parsing response JSON:', error);
    throw new Error('Gagal memproses respons dari server');
  }
};

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Cache for products data
const productsCache: Record<string, { data: PaginatedResponse<Product>, timestamp: number }> = {};

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

class ProductService {
  // Get all products with pagination and filters
  async getProducts(params: GetProductsParams = {}): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.category && params.category !== 'all') queryParams.append('category', params.category);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    // Pastikan sortOrder selalu string yang valid (ASC atau DESC)
    if (params.sortOrder) {
      const validSortOrder = ['ASC', 'DESC'].includes(params.sortOrder) ? params.sortOrder : 'DESC';
      queryParams.append('sortOrder', validSortOrder);
    }

    // Perbaikan konstruksi URL untuk memastikan format query string yang benar
    let queryString = queryParams.toString();
    // Pastikan format query string benar dengan menambahkan '?' di awal jika ada parameter
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
    
    // Check if we have a valid cache for this URL
    const cacheKey = url;
    const now = Date.now();
    const cachedData = productsCache[cacheKey];
    
    // Use cache if it exists and is not expired
    if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRATION)) {
      return cachedData.data;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders({ noCache: false }),
      cache: 'default',
    });

    const data = await handleResponse<Product[] | any>(response);
    
    // Store the result in cache
    const paginatedResponse = await this.processProductData(data, params);
    productsCache[cacheKey] = {
      data: paginatedResponse,
      timestamp: now
    };
    
    return paginatedResponse;
  }
  
  // Helper method to process product data
  private async processProductData(data: any, params: GetProductsParams): Promise<PaginatedResponse<Product>> {
    // Since the backend doesn't return paginated response yet, we'll simulate it
    // In a real scenario, you'd modify the backend to return proper pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // Ensure filteredData is always an array
    let filteredData = Array.isArray(data) ? data : (data.data || []);
    
    // Apply search filter if backend doesn't support it
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredData = filteredData.filter((product: Product) => 
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply category filter if backend doesn't support it
    if (params.category && params.category !== 'all') {
      filteredData = filteredData.filter((product: Product) => product.category === params.category);
    }
    
    // Apply sorting if backend doesn't support it
    if (params.sortBy) {
      const sortField = params.sortBy as keyof Product;
      const sortOrder = params.sortOrder === 'ASC' ? 1 : -1;
      
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[sortField] ?? '';
        const bValue = b[sortField] ?? '';
        if (aValue < bValue) return -1 * sortOrder;
        if (aValue > bValue) return 1 * sortOrder;
        return 0;
      });
    }
    
    const paginatedData = filteredData.slice(startIndex, endIndex);
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    
    return {
      data: paginatedData,
      total: totalItems,
      page,
      limit,
      totalPages
    };
  }

  // Cache for individual products
  private productCache: Record<string, { data: Product, timestamp: number }> = {};
  
  // Get product by ID
  async getProductById(id: string): Promise<Product> {
    // Check if we have a valid cache for this product
    const cacheKey = `product_${id}`;
    const now = Date.now();
    const cachedData = this.productCache[cacheKey];
    
    // Use cache if it exists and is not expired
    if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRATION)) {
      return cachedData.data;
    }
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: createHeaders({ noCache: false }),
      cache: 'default',
    });
    
    const data = await handleResponse<Product>(response);
    
    // Store the result in cache
    this.productCache[cacheKey] = {
      data,
      timestamp: now
    };
    
    return data;
  }

  // Create new product
  async createProduct(productData: FormData): Promise<Product> {
    // Untuk FormData, jangan set Content-Type header karena browser akan otomatis menambahkan boundary
    // Jika manual set Content-Type untuk FormData, akan menyebabkan error karena boundary tidak ditambahkan
    try {
      console.log('Sending product data to server...');
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: productData,
      });

      console.log('Create product response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      return handleResponse<Product>(response);
    } catch (error) {
      console.error('Network error during product creation:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(id: string, productData: FormData): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: productData,
    });

    return handleResponse<Product>(response);
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });

    return handleResponse<void>(response);
  }

  // Get product stats
  async getProductStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/stats/products`, {
      method: 'GET',
      headers: createHeaders({ noCache: true }),
      cache: 'no-store',
    });

    return handleResponse<any>(response);
  }
}

export default new ProductService();