import { Product } from '@/types';

// Define the state type
export interface ProductState {
  searchTerm: string;
  selectedCategory: string;
  currentPage: number;
  limit: number;
  isSubmitting: boolean;
  productStats: {
    totalActive: number;
    totalInactive: number;
    lowStock: number;
    outOfStock: number;
    categoryCounts: Record<string, number>;
  };
}

// Define the initial state
export const initialProductState: ProductState = {
  searchTerm: '',
  selectedCategory: 'all',
  currentPage: 1,
  limit: 10,
  isSubmitting: false,
  productStats: {
    totalActive: 0,
    totalInactive: 0,
    lowStock: 0,
    outOfStock: 0,
    categoryCounts: {},
  },
};

// Define action types
export type ProductAction =
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'UPDATE_PRODUCT_STATS'; payload: Product[] };

// Create the reducer function
export const productReducer = (state: ProductState, action: ProductAction): ProductState => {
  switch (action.type) {
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
        currentPage: 1, // Reset to first page when searching
      };
    case 'SET_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload,
        currentPage: 1, // Reset to first page when changing category
      };
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };
    case 'UPDATE_PRODUCT_STATS':
      const products = action.payload;
      const stats = {
        totalActive: 0,
        totalInactive: 0,
        lowStock: 0,
        outOfStock: 0,
        categoryCounts: {} as Record<string, number>,
      };
      
      products.forEach(product => {
        // Count active/inactive
        if (product.is_active) {
          stats.totalActive++;
        } else {
          stats.totalInactive++;
        }
        
        // Count stock status
        if (product.stock === 0) {
          stats.outOfStock++;
        } else if (product.stock <= 5) {
          stats.lowStock++;
        }
        
        // Count by category
        const category = product.category || 'Uncategorized';
        stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;
      });
      
      return {
        ...state,
        productStats: stats,
      };
    default:
      return state;
  }
};