import { DayOfWeek } from '@/types';
import { Schedule } from '@/services/scheduleService';

// Define the state type
export interface ScheduleState {
  searchTerm: string;
  optometristFilter: string;
  dayFilter: string;
  statusFilter: string;
  isCreateModalOpen: boolean;
  isCreatingSchedule: boolean;
  isEditModalOpen: boolean;
  editingSchedule: Schedule | null;
  isBulkCreateModalOpen: boolean;
  isTogglingStatus: string | null;
  currentPage: number;
  itemsPerPage: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Define the initial state
export const initialScheduleState: ScheduleState = {
  searchTerm: '',
  optometristFilter: 'all',
  dayFilter: 'all',
  statusFilter: 'all',
  isCreateModalOpen: false,
  isCreatingSchedule: false,
  isEditModalOpen: false,
  editingSchedule: null,
  isBulkCreateModalOpen: false,
  isTogglingStatus: null,
  currentPage: 1,
  itemsPerPage: 10,
  sortBy: 'created_at',
  sortOrder: 'desc',
};

// Define action types
export type ScheduleAction =
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_OPTOMETRIST_FILTER'; payload: string }
  | { type: 'SET_DAY_FILTER'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: string }
  | { type: 'TOGGLE_CREATE_MODAL'; payload: boolean }
  | { type: 'SET_CREATING_SCHEDULE'; payload: boolean }
  | { type: 'TOGGLE_EDIT_MODAL'; payload: boolean }
  | { type: 'SET_EDITING_SCHEDULE'; payload: Schedule | null }
  | { type: 'TOGGLE_BULK_CREATE_MODAL'; payload: boolean }
  | { type: 'SET_TOGGLING_STATUS'; payload: string | null }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_ITEMS_PER_PAGE'; payload: number }
  | { type: 'SET_SORT'; payload: { sortBy: string; sortOrder: 'asc' | 'desc' } };

// Create the reducer function
export const scheduleReducer = (state: ScheduleState, action: ScheduleAction): ScheduleState => {
  switch (action.type) {
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
        currentPage: 1, // Reset to first page when searching
      };
    case 'SET_OPTOMETRIST_FILTER':
      return {
        ...state,
        optometristFilter: action.payload,
        currentPage: 1, // Reset to first page when filtering
      };
    case 'SET_DAY_FILTER':
      return {
        ...state,
        dayFilter: action.payload,
        currentPage: 1, // Reset to first page when filtering
      };
    case 'SET_STATUS_FILTER':
      return {
        ...state,
        statusFilter: action.payload,
        currentPage: 1, // Reset to first page when filtering
      };
    case 'TOGGLE_CREATE_MODAL':
      return {
        ...state,
        isCreateModalOpen: action.payload,
      };
    case 'SET_CREATING_SCHEDULE':
      return {
        ...state,
        isCreatingSchedule: action.payload,
      };
    case 'TOGGLE_EDIT_MODAL':
      return {
        ...state,
        isEditModalOpen: action.payload,
        // Reset editing schedule when closing modal
        editingSchedule: action.payload ? state.editingSchedule : null,
      };
    case 'SET_EDITING_SCHEDULE':
      return {
        ...state,
        editingSchedule: action.payload,
      };
    case 'TOGGLE_BULK_CREATE_MODAL':
      return {
        ...state,
        isBulkCreateModalOpen: action.payload,
      };
    case 'SET_TOGGLING_STATUS':
      return {
        ...state,
        isTogglingStatus: action.payload,
      };
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
      };
    case 'SET_ITEMS_PER_PAGE':
      return {
        ...state,
        itemsPerPage: action.payload,
        currentPage: 1, // Reset to first page when changing items per page
      };
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
      };
    default:
      return state;
  }
};