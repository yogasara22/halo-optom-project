// services/optometristService.ts
import api from '../lib/api';

export interface Optometrist {
  id: string;
  name: string;
  photo: string;
  avatar_url?: string; // Add this field
  rating: number;
  experience: string;
  schedule: {
    day: string;
    time: string;
  }[];
  specialization?: string;
  education?: string;
  about?: string;
  price?: number;
  bio?: string;
  certifications?: string;
  str_number?: string;
}

export interface OptometristFilter {
  search?: string;
  rating?: number;
  availability?: string; // format: 'day-time'
}

class OptometristService {
  async getOptometrists(filters?: OptometristFilter): Promise<Optometrist[]> {
    try {
      const response = await api.get('/optometrists', { params: filters });
      return response.data.data;
    } catch (error) {
      console.error('Get optometrists error:', error);
      throw error;
    }
  }

  async getOptometristById(id: string): Promise<Optometrist> {
    try {
      const response = await api.get(`/optometrists/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Get optometrist ${id} error:`, error);
      throw error;
    }
  }

  async getFeaturedOptometrists(): Promise<Optometrist[]> {
    try {
      const response = await api.get('/optometrists/featured');
      return response.data.data;
    } catch (error) {
      try {
        const all = await this.getOptometrists();
        return all.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
      } catch (err2) {
        return [];
      }
    }
  }

  async getAvailableSchedules(optometristId: string, date: string): Promise<{ time: string; available: boolean }[]> {
    try {
      const response = await api.get(`/optometrists/${optometristId}/schedules`, {
        params: { date }
      });
      return response.data.data;
    } catch (error) {
      console.error('Get available schedules error:', error);
      throw error;
    }
  }

  async getUpcomingDates(optometristId: string): Promise<{ date: string; day: string; time: string; schedule_id: string }[]> {
    try {
      const response = await api.get('/schedules/available-dates', {
        params: { optometrist_id: optometristId }
      });
      return response.data;
    } catch (error) {
      console.error('Get upcoming dates error:', error);
      return [];
    }
  }
}

export const optometristService = new OptometristService();
export default optometristService;
