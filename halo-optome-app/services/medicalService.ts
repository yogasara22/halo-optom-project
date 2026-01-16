// services/medicalService.ts
import api from '../lib/api';

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

export interface MedicalHistory {
  id: string;
  patientId: string;
  date: string;
  condition: string;
  treatment?: string;
  notes?: string;
}

class MedicalService {
  // Untuk Optometris
  async getPatientMedicalRecords(patientId: string): Promise<MedicalHistory[]> {
    try {
      const response = await api.get(`/medicalRecords/patient/${patientId}`);
      return response.data.data;
    } catch (error) {
      console.error('Get patient medical records error:', error);
      throw error;
    }
  }

  async createMedicalRecord(data: {
    patientId: string;
    condition: string;
    treatment?: string;
    notes?: string;
  }): Promise<MedicalHistory> {
    try {
      const response = await api.post('/medical/records', data);
      return response.data.data;
    } catch (error) {
      console.error('Create medical record error:', error);
      throw error;
    }
  }

  async createPrescription(data: {
    patientId: string;
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
    expiryDate?: string;
  }): Promise<Prescription> {
    try {
      const response = await api.post('/medical/prescriptions', data);
      return response.data.data;
    } catch (error) {
      console.error('Create prescription error:', error);
      throw error;
    }
  }

  // Untuk Pasien
  async getMyPrescriptions(): Promise<Prescription[]> {
    try {
      const response = await api.get('/medical/my-prescriptions');
      return response.data.data;
    } catch (error) {
      console.error('Get my prescriptions error:', error);
      throw error;
    }
  }

  async getLatestPrescription(): Promise<Prescription | null> {
    try {
      const response = await api.get('/medical/my-prescriptions/latest');
      return response.data.data;
    } catch (error) {
      console.error('Get latest prescription error:', error);
      return null;
    }
  }

  async getMyMedicalHistory(): Promise<MedicalHistory[]> {
    try {
      const response = await api.get('/medical/my-history');
      return response.data.data;
    } catch (error) {
      console.error('Get my medical history error:', error);
      throw error;
    }
  }
}

export const medicalService = new MedicalService();
export default medicalService;