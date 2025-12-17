export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'optometrist' | 'patient' | 'staff';

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

export interface UserFilter {
  search?: string;
  role?: UserRole;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}