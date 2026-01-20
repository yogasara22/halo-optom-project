import api from '@/lib/api';
import { MedicalRecord, PaginatedResponse } from '@/types';

interface MedicalRecordFilters {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  optometristId?: string;
  patientId?: string;
}

interface MedicalRecordStats {
  totalRecords: number;
  recentRecords: number;
  activePatients: number;
  monthlyRecords: number;
}

const medicalRecordService = {
  // Get all medical records with pagination and filters
  getAllMedicalRecords: async (filters: MedicalRecordFilters = {}): Promise<PaginatedResponse<MedicalRecord>> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.optometristId) params.append('optometristId', filters.optometristId);
    if (filters.patientId) params.append('patientId', filters.patientId);

    const response = await api.get<PaginatedResponse<MedicalRecord>>(`/admin/medical-records?${params}`);
    return response.data;
  },

  // Get a single medical record by ID
  getMedicalRecordById: async (id: string): Promise<MedicalRecord> => {
    const response = await api.get<MedicalRecord>(`/admin/medical-records/${id}`);
    return response.data;
  },

  // Create a new medical record
  createMedicalRecord: async (data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const response = await api.post<MedicalRecord>('/admin/medical-records', data);
    return response.data;
  },

  // Update a medical record
  updateMedicalRecord: async (id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const response = await api.put<MedicalRecord>(`/admin/medical-records/${id}`, data);
    return response.data;
  },

  // Delete a medical record (soft delete)
  deleteMedicalRecord: async (id: string): Promise<{ message: string; deleted_id: string }> => {
    const response = await api.delete(`/admin/medical-records/${id}`);
    return response.data;
  },

  // Download medical records report in Excel format
  downloadExcelReport: async (filters: Omit<MedicalRecordFilters, 'page' | 'limit'> = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('format', 'excel');

    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.optometristId) params.append('optometristId', filters.optometristId);
    if (filters.patientId) params.append('patientId', filters.patientId);

    const response = await api.get(`/admin/medical-records/report?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Download medical records report in PDF format
  downloadPdfReport: async (filters: Omit<MedicalRecordFilters, 'page' | 'limit'> = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('format', 'pdf');

    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.optometristId) params.append('optometristId', filters.optometristId);
    if (filters.patientId) params.append('patientId', filters.patientId);

    const response = await api.get(`/admin/medical-records/report?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Download patient medical records report
  downloadPatientReport: async (patientId: string, format: 'pdf' | 'excel' = 'pdf', dateRange?: { startDate: string; endDate: string }): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('format', format);

    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

    const response = await api.get(`/admin/medical-records/patient/${patientId}/report?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get medical records statistics
  getMedicalRecordStats: async (): Promise<MedicalRecordStats> => {
    const response = await api.get<MedicalRecordStats>('/admin/stats/medical-records');
    return response.data;
  },

  // Export a medical record
  exportMedicalRecord: async (id: string, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> => {
    const response = await api.get(`/admin/medical-records/${id}/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default medicalRecordService;
export type { MedicalRecordFilters, MedicalRecordStats };