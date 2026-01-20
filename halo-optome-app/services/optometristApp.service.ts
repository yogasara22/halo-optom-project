import api from '../lib/api';

export interface ApiAppointment {
  id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time?: string;
  status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  type: 'online' | 'homecare';
  method?: 'chat' | 'video';
  patient?: { id: string; name: string; avatar_url?: string };
  optometrist?: { id: string; name: string; avatar_url?: string };
}

export interface ApiSchedule {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

class OptometristAppService {
  async getMyAppointments(): Promise<ApiAppointment[]> {
    const res = await api.get('/appointments');
    return res.data;
  }

  async getMyNextAppointment(): Promise<ApiAppointment | null> {
    const list = await this.getMyAppointments();
    // Sort upcoming by date/time and filter by status not cancelled/completed
    const upcoming = list
      .filter(a => !['cancelled', 'completed'].includes(a.status))
      .sort((a, b) => {
        const ad = new Date(`${a.date}T${a.start_time}`);
        const bd = new Date(`${b.date}T${b.start_time}`);
        return ad.getTime() - bd.getTime();
      });
    return upcoming[0] || null;
  }

  async getMySchedules(optometristId: string): Promise<ApiSchedule[]> {
    const res = await api.get('/schedules', { params: { optometrist_id: optometristId } });
    return res.data;
  }

  async getConsultationAppointments(): Promise<ApiAppointment[]> {
    const list = await this.getMyAppointments();
    return list.filter(a => a.type === 'online' && (a.method === 'chat' || a.method === 'video'));
  }

  async getHomecareAppointments(): Promise<ApiAppointment[]> {
    const list = await this.getMyAppointments();
    return list.filter(a => a.type === 'homecare');
  }
  async getCommissionBalance(): Promise<{ balance: number; formatted: string }> {
    try {
      const response = await api.get('/optometrists/balance');
      return response.data;
    } catch (error) {
      console.error('Error fetching commission balance:', error);
      return { balance: 0, formatted: 'Rp 0' };
    }
  }

  async getAppointmentDetail(id: string): Promise<ApiAppointment> {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  }

  async updateAppointmentStatus(id: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<ApiAppointment> {
    const res = await api.patch(`/appointments/${id}/status`, { status });
    return res.data;
  }

  async rescheduleAppointment(id: string, date: string, start_time: string): Promise<ApiAppointment> {
    const res = await api.patch(`/appointments/${id}/reschedule`, { date, start_time });
    return res.data;
  }

  async getUnreadChatCount(): Promise<number> {
    try {
      const res = await api.get('/chats/unread/count');
      return res.data.count || 0;
    } catch (e) {
      console.error('Failed to get unread chat count:', e);
      return 0;
    }
  }
}

export const optometristAppService = new OptometristAppService();
export default optometristAppService;

