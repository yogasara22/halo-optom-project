import { User } from '@/types';

// Define the state type
export interface UserState {
  currentPage: number;
  searchTerm: string;
  roleFilter: string;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  isCreateModalOpen: boolean;
  isCreatingUser: boolean;
  isEditModalOpen: boolean;
  editingUser: User | null;
  limit: number;
}

// Define the initial state
export const initialUserState: UserState = {
  currentPage: 1,
  searchTerm: '',
  roleFilter: 'all',
  sortConfig: { key: 'createdAt', direction: 'desc' },
  isCreateModalOpen: false,
  isCreatingUser: false,
  isEditModalOpen: false,
  editingUser: null,
  limit: 10,
};

// Define action types
export type UserAction =
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_ROLE_FILTER'; payload: string }
  | { type: 'SET_SORT_CONFIG'; payload: { key: string; direction: 'asc' | 'desc' } }
  | { type: 'TOGGLE_CREATE_MODAL'; payload: boolean }
  | { type: 'SET_CREATING_USER'; payload: boolean }
  | { type: 'TOGGLE_EDIT_MODAL'; payload: boolean }
  | { type: 'SET_EDITING_USER'; payload: User | null };

// Create the reducer function
export const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
      };
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
        currentPage: 1, // Reset to first page when searching
      };
    case 'SET_ROLE_FILTER':
      return {
        ...state,
        roleFilter: action.payload,
        currentPage: 1, // Reset to first page when filtering
      };
    case 'SET_SORT_CONFIG':
      return {
        ...state,
        sortConfig: action.payload,
      };
    case 'TOGGLE_CREATE_MODAL':
      return {
        ...state,
        isCreateModalOpen: action.payload,
      };
    case 'SET_CREATING_USER':
      return {
        ...state,
        isCreatingUser: action.payload,
      };
    case 'TOGGLE_EDIT_MODAL':
      return {
        ...state,
        isEditModalOpen: action.payload,
        // Reset editing user when closing modal
        editingUser: action.payload ? state.editingUser : null,
      };
    case 'SET_EDITING_USER':
      return {
        ...state,
        editingUser: action.payload,
      };
    default:
      return state;
  }
};