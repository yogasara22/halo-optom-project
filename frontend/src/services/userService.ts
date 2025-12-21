import { User, PaginatedResponse, ApiResponse } from '../types';
import { CreateUserFormData } from '../components/forms/CreateUserForm';

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
    if (response.status === 401) {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
      }
      throw new Error('Missing or invalid token format');
    }
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'optometris' | 'pasien';
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  bio?: string;
  experience?: string;
  certifications?: string[];
  str_number?: string;
  chat_commission_percentage?: number;
  video_commission_percentage?: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  is_verified?: boolean;
  is_active?: boolean;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  avatar_url?: string;
  bio?: string;
  experience?: string;
  certifications?: string[];
  str_number?: string;
  chat_commission_percentage?: number;
  video_commission_percentage?: number;
}

class UserService {
  // Get all users with pagination and filters
  async getUsers(params: GetUsersParams = {}): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE_URL}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders({ noCache: true }),
      cache: 'no-store',
    });

    const data = await handleResponse<User[]>(response);

    // Since the backend doesn't return paginated response yet, we'll simulate it
    // In a real scenario, you'd modify the backend to return proper pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    let filteredData = data;

    // Apply search filter
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredData = filteredData.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (params.role && params.role !== 'all') {
      filteredData = filteredData.filter(user => user.role === params.role);
    }

    // Apply sorting
    if (params.sortBy) {
      filteredData.sort((a, b) => {
        const aValue = a[params.sortBy as keyof User];
        const bValue = b[params.sortBy as keyof User];

        // Handle undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (aValue < bValue) return params.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return params.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    const total = filteredData.length;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });

    return handleResponse<User>(response);
  }

  // Create new user
  async createUser(userData: CreateUserFormData): Promise<User> {
    const requestData: CreateUserRequest = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      phone: userData.phone,
      date_of_birth: userData.date_of_birth,
      gender: userData.gender,
      address: userData.address,
      bio: userData.bio,
      experience: userData.experience,
      certifications: userData.certifications,
      str_number: userData.str_number,
      chat_commission_percentage: userData.chat_commission_percentage,
      video_commission_percentage: userData.video_commission_percentage,
    };

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(requestData),
    });

    return handleResponse<User>(response);
  }

  // Update user
  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(userData),
    });

    return handleResponse<User>(response);
  }

  // Delete user
  async deleteUser(id: string): Promise<{ message: string; deleted_id: string }> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });

    return handleResponse<{ message: string; deleted_id: string }>(response);
  }

  // Verify user (for optometrists)
  async verifyUser(id: string): Promise<{ message: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/users/${id}/verify`, {
      method: 'PATCH',
      headers: createHeaders(),
    });

    return handleResponse<{ message: string; user: User }>(response);
  }

  // Toggle user active status
  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}/toggle-status`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify({ isActive }),
    });

    return handleResponse<User>(response);
  }

  // Get user statistics
  async getUserStats(): Promise<{
    totalUsers: number;
    totalOptometrists: number;
    totalPatients: number;
    verifiedOptometrists: number;
    activeUsers: number;
  }> {
    const users = await this.getUsers({ limit: 1000 }); // Get all users for stats

    const stats = {
      totalUsers: users.total,
      totalOptometrists: users.data.filter(u => u.role === 'optometris').length,
      totalPatients: users.data.filter(u => u.role === 'pasien').length,
      verifiedOptometrists: users.data.filter(u => u.role === 'optometris' && u.isActive).length,
      activeUsers: users.data.filter(u => u.isActive).length,
    };

    return stats;
  }
}

export const userService = new UserService();
export default userService;