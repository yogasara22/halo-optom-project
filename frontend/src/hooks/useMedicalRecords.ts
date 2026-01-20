import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import medicalRecordService, { MedicalRecordFilters, MedicalRecordStats } from '@/services/medicalRecordService';
import { toast } from 'react-hot-toast';

// Keys for React Query cache
export const medicalRecordKeys = {
  all: ['medicalRecords'] as const,
  lists: () => [...medicalRecordKeys.all, 'list'] as const,
  list: (filters: MedicalRecordFilters) => [...medicalRecordKeys.lists(), filters] as const,
  details: () => [...medicalRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...medicalRecordKeys.details(), id] as const,
  stats: () => [...medicalRecordKeys.all, 'stats'] as const,
};

export function useMedicalRecords(filters: MedicalRecordFilters = {}) {
  return useQuery({
    queryKey: medicalRecordKeys.list(filters),
    queryFn: () => medicalRecordService.getAllMedicalRecords(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMedicalRecord(id: string) {
  return useQuery({
    queryKey: medicalRecordKeys.detail(id),
    queryFn: () => medicalRecordService.getMedicalRecordById(id),
    enabled: !!id,
  });
}

export function useMedicalRecordStats() {
  return useQuery({
    queryKey: medicalRecordKeys.stats(),
    queryFn: () => medicalRecordService.getMedicalRecordStats(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => medicalRecordService.createMedicalRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.stats() });
      toast.success('Rekam medis berhasil dibuat');
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat rekam medis: ${error.message}`);
    },
  });
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      medicalRecordService.updateMedicalRecord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.stats() });
      toast.success('Rekam medis berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui rekam medis: ${error.message}`);
    },
  });
}

export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => medicalRecordService.deleteMedicalRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.stats() });
      toast.success('Rekam medis berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus rekam medis: ${error.message}`);
    },
  });
}

export function useExportMedicalRecord() {
  return useMutation({
    mutationFn: (params: { recordId: string; format: 'pdf' | 'excel' } | { search: string; startDate: string; endDate: string; format: "pdf" | "excel" }) => {
      if ('recordId' in params) {
        return medicalRecordService.exportMedicalRecord(params.recordId, params.format);
      } else {
        // Untuk ekspor semua rekam medis berdasarkan filter
        return params.format === 'excel'
          ? medicalRecordService.downloadExcelReport(params)
          : medicalRecordService.downloadPdfReport(params);
      }
    },
    onSuccess: () => {
      toast.success('Rekam medis berhasil diekspor');
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengekspor rekam medis: ${error.message}`);
    },
  });
}