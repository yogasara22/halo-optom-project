import { DayOfWeek } from '@/types';

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
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export interface Schedule {
  id: string;
  optometrist: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleData {
  optometrist_id?: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export interface UpdateScheduleData {
  day_of_week?: DayOfWeek;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

export interface BulkCreateScheduleData {
  optometrist_id?: string;
  schedules: CreateScheduleData[];
}

export interface GetSchedulesParams {
  optometrist_id?: string;
  day_of_week?: DayOfWeek;
  month?: number;
  year?: number;
}

class ScheduleService {
  async getSchedules(params?: GetSchedulesParams): Promise<{ data: Schedule[] }> {
    const queryParams = new URLSearchParams();
    if (params?.optometrist_id) queryParams.append('optometrist_id', params.optometrist_id);
    if (params?.day_of_week) queryParams.append('day_of_week', params.day_of_week);
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    
    const response = await fetch(`${API_BASE_URL}/schedules?${queryParams.toString()}`, {
      method: 'GET',
      headers: createHeaders({ noCache: true }),
      cache: 'no-store',
    });
    const data = await handleResponse<Schedule[]>(response);
    return { data }; // Wrap the array in an object with data property
  }

  async getScheduleById(id: string): Promise<Schedule> {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse<Schedule>(response);
  }

  async createSchedule(data: CreateScheduleData): Promise<Schedule> {
    const response = await fetch(`${API_BASE_URL}/schedules`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Schedule>(response);
  }

  async bulkCreateSchedules(data: BulkCreateScheduleData): Promise<{ message: string; schedules: Schedule[] }> {
    const response = await fetch(`${API_BASE_URL}/schedules/bulk`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; schedules: Schedule[] }>(response);
  }

  async updateSchedule(id: string, data: UpdateScheduleData): Promise<Schedule> {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Schedule>(response);
  }

  async deleteSchedule(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  }
}

export default new ScheduleService();