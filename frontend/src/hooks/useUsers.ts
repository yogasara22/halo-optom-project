import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService, { GetUsersParams } from '@/services/userService';
import { CreateUserFormData } from '@/components/forms/CreateUserForm';
import { toast } from 'react-hot-toast';

// Keys for React Query cache
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: GetUsersParams) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
};

export function useUsers(params: GetUsersParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
    placeholderData: (previousData) => previousData,
    staleTime: 10 * 60 * 1000, // 10 minutes (optimized from 5 min)
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Use cached data if available
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: async () => {
      const response = await userService.getUsers({ limit: 1000 });
      const allUsers = response.data;

      return {
        total: allUsers.length,
        admin: allUsers.filter(user => user.role === 'admin').length,
        optometris: allUsers.filter(user => user.role === 'optometris').length,
        pasien: allUsers.filter(user => user.role === 'pasien').length,
        active: allUsers.filter(user => user.isActive).length,
        inactive: allUsers.filter(user => !user.isActive).length
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserFormData) => userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success('Pengguna berhasil dibuat');
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat pengguna: ${error.message}`);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      userService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success('Pengguna berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui pengguna: ${error.message}`);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success('Pengguna berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus pengguna: ${error.message}`);
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.toggleUserStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success(`Pengguna berhasil ${variables.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengubah status pengguna: ${error.message}`);
    },
  });
}