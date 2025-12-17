export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'optometris' | 'pasien';
  phone?: string;
  avatar_url?: string;
  bio?: string;
  experience?: string;
  certifications?: string[];
  rating?: number;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  str_number?: string;
  chat_commission_percentage?: number;
  video_commission_percentage?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  stock: number;
  category: string;
  image_url?: string;
  additional_images?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  products: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  optometristId: string;
  patient?: User;
  optometrist?: User;
  scheduledAt: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'consultation' | 'homecare';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patient: User;
  optometrist: User;
  appointment?: Appointment;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  attachments?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Review {
  id: string;
  userId: string;
  optometristId: string;
  user?: User;
  optometrist?: User;
  rating: number;
  comment: string;
  isModerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalOptometrists: number;
  totalPatients: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeAppointments: number;
  pendingReviews: number;
  totalReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageRating: number;
  reportedReviews: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface ServicePricing {
  id: string;
  type: 'online' | 'homecare';
  method: 'chat' | 'video';
  base_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
