// services/patientService.ts
import api from '../lib/api';

export interface Patient {
  id: string;
  name: string;
  photo?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE';
  phone?: string;
  email?: string;
  address?: string;
  medicalHistory?: string[];
}

export interface Appointment {
  id: string;
  patientId?: string;
  optometristId?: string;
  date: string;
  start_time: string;
  end_time?: string;
  status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'waiting_verification';
  type: 'online' | 'homecare';
  method?: 'chat' | 'video';
  location?: string;
  price?: number;
  notes?: string;
  patient?: Patient;
  optometrist: {
    id: string;
    name: string;
    avatar_url?: string;
    photo?: string; // fallback
  };
  chat?: {
    room_id: string;
  };
  payment?: {
    id: string;
    status: 'pending' | 'paid' | 'expired' | 'failed' | 'waiting_verification' | 'rejected';
    payment_method: string;
  };
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  optometristId: string;
  date: string;
  time?: string; // format: HH:MM
  serviceType?: string;
  diagnosis: string;
  prescription?: string;
  notes?: string;
  followUpDate?: string;
  patient?: Patient;
  optometrist?: {
    id: string;
    name: string;
  };
}

class PatientService {
  async getPatientProfile(): Promise<Patient> {
    try {
      const response = await api.get('/patients/profile');
      return response.data.data;
    } catch (error) {
      console.error('Get patient profile error:', error);
      throw error;
    }
  }

  async updatePatientProfile(data: Partial<Patient>): Promise<Patient> {
    try {
      const response = await api.put('/patients/profile', data);
      return response.data.data;
    } catch (error) {
      console.error('Update patient profile error:', error);
      throw error;
    }
  }

  async getAppointments(status?: Appointment['status']): Promise<Appointment[]> {
    try {
      const response = await api.get('/patients/appointments', {
        params: status ? { status } : undefined
      });
      return response.data;
    } catch (error) {
      console.error('Get appointments error:', error);
      throw error;
    }
  }

  async getNextAppointment(): Promise<Appointment | null> {
    try {
      const response = await api.get('/patients/appointments/next');
      return response.data;
    } catch (error) {
      try {
        const confirmed = await this.getAppointments('confirmed');
        const pending = await this.getAppointments('pending');
        const upcoming = [...confirmed, ...pending]
          .filter(a => a.status !== 'cancelled' && a.status !== 'completed')
          .sort((a, b) => {
            const ad = new Date(`${a.date}T${a.start_time}`);
            const bd = new Date(`${b.date}T${b.start_time}`);
            return ad.getTime() - bd.getTime();
          });
        return upcoming[0] || null;
      } catch {
        return null;
      }
    }
  }

  async bookAppointment(data: any): Promise<Appointment> {
    try {
      const payload = {
        optometrist_id: data.optometrist_id || data.optometristId,
        type: data.type === 'homecare' ? 'homecare' : 'online',
        method: data.type === 'homecare' ? undefined : data.method,
        date: data.date,
        start_time: data.start_time || data.time,
        location: data.type === 'homecare' ? data.location : undefined,
      };
      const response = await api.post('/appointments', payload);
      return response.data.appointment || response.data;
    } catch (error) {
      console.error('Book appointment error:', error);
      throw error;
    }
  }

  async getServicePrice(type: 'online' | 'homecare', method: 'chat' | 'video'): Promise<number | null> {
    try {
      if (type === 'homecare') return null;
      const res = await api.get('/services/pricing/lookup', { params: { type: 'online', method } });
      return Number(res.data?.data?.base_price ?? 0);
    } catch {
      return null;
    }
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    try {
      await api.put(`/patients/appointments/${appointmentId}/cancel`);
    } catch (error) {
      console.error('Cancel appointment error:', error);
      throw error;
    }
  }

  async getMedicalRecords(): Promise<MedicalRecord[]> {
    try {
      const response = await api.get('/patients/medical-records');
      return response.data.data;
    } catch (error) {
      console.error('Get medical records error:', error);
      throw error;
    }
  }

  async uploadMyAvatar(file: { uri: string; name?: string; type?: string }): Promise<string> {
    const fd: any = new FormData();
    fd.append('avatar', {
      uri: file.uri,
      name: file.name || `avatar-${Date.now()}.jpg`,
      type: file.type || 'image/jpeg',
    } as any);
    const response = await api.post('/users/profile/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.avatar_url;
  }

  async updateMyProfile(data: Partial<{ name: string; phone: string; date_of_birth: string; gender: 'laki-laki' | 'perempuan'; address: string; bio?: string; experience?: string; certifications?: string[]; str_number?: string; avatar_url?: string }>): Promise<any> {
    const response = await api.put('/users/profile/update', data);
    return response.data.data || response.data;
  }
}

export const patientService = new PatientService();
export default patientService;
