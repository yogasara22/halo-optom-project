// services/medicalService.ts
import api from '../lib/api';

// Interface untuk User yang terkait dengan rekam medis
export interface UserInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}

// Interface untuk Appointment yang terkait dengan rekam medis
export interface AppointmentInfo {
  id: string;
  scheduled_time: string;
  status: string;
}

// Interface untuk rekam medis dari backend
export interface MedicalRecord {
  id: string;
  patient: UserInfo;
  optometrist: UserInfo;
  appointment?: AppointmentInfo;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  attachments?: string;
  created_at: string;
  updated_at?: string;
}

// Legacy interface untuk kompatibilitas dengan optometrist/index.tsx
export interface MedicalHistory {
  id: string;
  patientId: string;
  date: string;
  condition: string;
  treatment?: string;
  notes?: string;
}

// Interface untuk resep mata (legacy - jika dibutuhkan nanti)
export interface Prescription {
  id: string;
  patientId: string;
  optometristId: string;
  date: string;
  expiryDate?: string;
  rightEye?: {
    sphere: number;
    cylinder: number;
    axis: number;
    add?: number;
    pd?: number;
  };
  leftEye?: {
    sphere: number;
    cylinder: number;
    axis: number;
    add?: number;
    pd?: number;
  };
  notes?: string;
}

class MedicalService {
  // ==================== PATIENT METHODS ====================

  /**
   * Get all medical records for the current logged-in patient
   * Backend will return records based on auth token
   */
  async getMyMedicalRecords(): Promise<MedicalRecord[]> {
    try {
      const response = await api.get('/medicalRecords');
      return response.data;
    } catch (error) {
      console.error('Get my medical records error:', error);
      throw error;
    }
  }

  /**
   * Get a single medical record by ID
   */
  async getMedicalRecordById(id: string): Promise<MedicalRecord> {
    try {
      const response = await api.get(`/medicalRecords/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get medical record by ID error:', error);
      throw error;
    }
  }

  // ==================== OPTOMETRIST METHODS ====================

  /**
   * Get all medical records created by the current logged-in optometrist
   * Backend will return records based on auth token and optometrist role
   */
  async getOptometristMedicalRecords(): Promise<MedicalRecord[]> {
    try {
      const response = await api.get('/medicalRecords');
      return response.data;
    } catch (error) {
      console.error('Get optometrist medical records error:', error);
      throw error;
    }
  }

  /**
   * Get all medical records for a specific patient (used by optometrist)
   * Returns MedicalHistory format for backward compatibility
   */
  async getPatientMedicalRecords(patientId: string): Promise<MedicalHistory[]> {
    try {
      const response = await api.get(`/medicalRecords/patient/${patientId}`);
      const records: MedicalRecord[] = response.data;

      // Convert to MedicalHistory format for backward compatibility
      return records.map(record => ({
        id: record.id,
        patientId: record.patient?.id || patientId,
        date: record.created_at,
        condition: record.diagnosis || 'Tidak ada diagnosis',
        treatment: record.prescription,
        notes: record.notes,
      }));
    } catch (error) {
      console.error('Get patient medical records error:', error);
      throw error;
    }
  }

  /**
   * Get medical records by appointment ID
   */
  async getMedicalRecordsByAppointment(appointmentId: string): Promise<MedicalRecord[]> {
    try {
      const response = await api.get(`/medicalRecords?appointment_id=${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Get medical records by appointment error:', error);
      throw error;
    }
  }

  /**
   * Create a new medical record (optometrist only)
   */
  async createMedicalRecord(data: {
    appointment_id: string;
    diagnosis?: string;
    prescription?: string;
    notes?: string;
    attachments?: string;
  }): Promise<MedicalRecord> {
    try {
      const response = await api.post('/medicalRecords', data);
      return response.data;
    } catch (error) {
      console.error('Create medical record error:', error);
      throw error;
    }
  }
}

export const medicalService = new MedicalService();
export default medicalService;