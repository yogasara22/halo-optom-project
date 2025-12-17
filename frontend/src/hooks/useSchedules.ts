import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import scheduleService, { Schedule, GetSchedulesParams, CreateScheduleData, BulkCreateScheduleData } from '@/services/scheduleService';
import { toast } from 'react-hot-toast';

// Keys for React Query cache
export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (filters: GetSchedulesParams) => [...scheduleKeys.lists(), filters] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  stats: () => [...scheduleKeys.all, 'stats'] as const,
};

export function useSchedules(params: GetSchedulesParams = {}) {
  return useQuery({
    queryKey: scheduleKeys.list(params),
    queryFn: () => scheduleService.getSchedules(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(id),
    queryFn: () => scheduleService.getScheduleById(id),
    enabled: !!id,
  });
}

export function useScheduleStats() {
  return useQuery({
    queryKey: scheduleKeys.stats(),
    queryFn: async () => {
      const response = await scheduleService.getSchedules();
      const allSchedules = response.data;
      
      return {
        totalSchedules: allSchedules.length,
        activeSchedules: allSchedules.filter(schedule => schedule.is_active).length,
        inactiveSchedules: allSchedules.filter(schedule => !schedule.is_active).length,
        optometristsWithSchedules: new Set(allSchedules.map(schedule => schedule.optometrist.id)).size,
      };
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleData: CreateScheduleData) => scheduleService.createSchedule(scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() });
      toast.success('Jadwal berhasil dibuat');
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat jadwal: ${error.message}`);
    },
  });
}

export function useBulkCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleData: BulkCreateScheduleData) => scheduleService.bulkCreateSchedules(scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() });
      toast.success('Jadwal berhasil dibuat');
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat jadwal: ${error.message}`);
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      scheduleService.updateSchedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() });
      toast.success('Jadwal berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui jadwal: ${error.message}`);
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scheduleService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() });
      toast.success('Jadwal berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus jadwal: ${error.message}`);
    },
  });
}

export function useToggleScheduleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      scheduleService.updateSchedule(id, { is_active: isActive }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.stats() });
      toast.success(`Jadwal berhasil ${variables.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengubah status jadwal: ${error.message}`);
    },
  });
}