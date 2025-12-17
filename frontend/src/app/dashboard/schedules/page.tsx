'use client';

import React, { useReducer, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentPlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Modal from '@/components/ui/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import CreateScheduleForm, { CreateScheduleFormData } from '@/components/forms/CreateScheduleForm';
import BulkCreateScheduleForm, { BulkCreateScheduleFormData } from '@/components/forms/BulkCreateScheduleForm';
import { Schedule } from '@/services/scheduleService';
import { scheduleReducer, initialScheduleState } from '@/reducers/scheduleReducer';
import { useSchedules, useScheduleStats, useCreateSchedule, useBulkCreateSchedule, useUpdateSchedule, useDeleteSchedule, useToggleScheduleStatus } from '@/hooks/useSchedules';
import { useUsers } from '@/hooks/useUsers';
import { User, DayOfWeek } from '@/types';

interface ScheduleStats {
  totalSchedules: number;
  activeSchedules: number;
  inactiveSchedules: number;
  optometristsWithSchedules: number;
}

const SchedulesPage: React.FC = () => {
  const router = useRouter();
  const [state, dispatch] = useReducer(scheduleReducer, initialScheduleState);
  const {
    searchTerm,
    optometristFilter,
    dayFilter,
    statusFilter,
    isCreateModalOpen,
    isCreatingSchedule,
    isEditModalOpen,
    editingSchedule,
    isBulkCreateModalOpen,
    isTogglingStatus,
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder
  } = state;
  
  // Menggunakan React Query untuk data fetching dan caching
  const { 
    data: schedulesData, 
    isLoading: loading, 
    error: queryError 
  } = useSchedules({
    optometrist_id: optometristFilter !== 'all' ? optometristFilter : undefined,
    day_of_week: dayFilter !== 'all' ? dayFilter as DayOfWeek : undefined
  });
  
  const schedules = schedulesData?.data || [];
  const error = queryError instanceof Error ? queryError.message : null;
  
  // Menggunakan React Query untuk stats
  const { data: stats = {
    totalSchedules: 0,
    activeSchedules: 0,
    inactiveSchedules: 0,
    optometristsWithSchedules: 0,
  } } = useScheduleStats();
  
  // Menggunakan React Query untuk optometrists
  const { data: optometristsData } = useUsers({ role: 'optometris', limit: 1000 });
  const optometrists = optometristsData?.data || [];

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
  ];

  const dayOptions = [
    { value: 'all', label: 'Semua Hari' },
    { value: 'monday', label: 'Senin' },
    { value: 'tuesday', label: 'Selasa' },
    { value: 'wednesday', label: 'Rabu' },
    { value: 'thursday', label: 'Kamis' },
    { value: 'friday', label: 'Jumat' },
    { value: 'saturday', label: 'Sabtu' },
    { value: 'sunday', label: 'Minggu' },
  ];

  // Tidak perlu useEffect untuk fetching data karena React Query menanganinya

  // Tidak perlu debounce untuk search karena React Query menanganinya

  // Tidak perlu fetchSchedules, fetchOptometrists, dan fetchStats karena React Query menanganinya
  
  // Filter and sort schedules using useMemo for performance
  const filteredSchedules = useMemo(() => {
    let result = [...schedules];
    
    // Filter by status if needed
    if (statusFilter === 'active') {
      result = result.filter(schedule => schedule.is_active);
    } else if (statusFilter === 'inactive') {
      result = result.filter(schedule => !schedule.is_active);
    }
    
    // Filter by search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(schedule => 
        schedule.optometrist?.name?.toLowerCase().includes(term) ||
        schedule.optometrist?.email?.toLowerCase().includes(term)
      );
    }
    
    // Sort by selected column
    if (sortBy) {
      result.sort((a, b) => {
        let aValue, bValue;
        
        if (sortBy === 'optometrist') {
          aValue = a.optometrist?.name || '';
          bValue = b.optometrist?.name || '';
        } else if (sortBy === 'day_of_week') {
          // Custom sort order for days of week
          const dayOrder = {
            'monday': 1, 'Senin': 1,
            'tuesday': 2, 'Selasa': 2,
            'wednesday': 3, 'Rabu': 3,
            'thursday': 4, 'Kamis': 4,
            'friday': 5, 'Jumat': 5,
            'saturday': 6, 'Sabtu': 6,
            'sunday': 7, 'Minggu': 7
          };
          aValue = dayOrder[a.day_of_week] || 0;
          bValue = dayOrder[b.day_of_week] || 0;
        } else if (sortBy === 'time') {
          aValue = a.start_time;
          bValue = b.start_time;
        } else if (sortBy === 'is_active') {
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
        } else if (sortBy === 'created_at') {
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
        } else {
          aValue = a[sortBy as keyof Schedule] || '';
          bValue = b[sortBy as keyof Schedule] || '';
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        return sortOrder === 'asc' 
          ? (aValue > bValue ? 1 : -1) 
          : (bValue > aValue ? 1 : -1);
      });
    }
    
    return result;
  }, [schedules, statusFilter, searchTerm, sortBy, sortOrder, optometristFilter, dayFilter]);
  
  // Pagination
  const totalItems = filteredSchedules.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

  // Menggunakan React Query mutation untuk create schedule
  const createScheduleMutation = useCreateSchedule();
  
  const handleCreateSchedule = async (data: CreateScheduleFormData) => {
    try {
      dispatch({ type: 'SET_CREATING_SCHEDULE', payload: true });
      await createScheduleMutation.mutateAsync(data);
      toast.success('Jadwal berhasil dibuat');
      dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: false });
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat jadwal');
    } finally {
      dispatch({ type: 'SET_CREATING_SCHEDULE', payload: false });
    }
  };

  // Menggunakan React Query mutation untuk update schedule
  const updateScheduleMutation = useUpdateSchedule();
  
  const handleEditSchedule = async (data: CreateScheduleFormData) => {
    if (!editingSchedule) return;
    
    try {
      dispatch({ type: 'SET_CREATING_SCHEDULE', payload: true });
      await updateScheduleMutation.mutateAsync({
        id: editingSchedule.id,
        data: data
      });
      toast.success('Jadwal berhasil diperbarui');
      dispatch({ type: 'TOGGLE_EDIT_MODAL', payload: false });
      dispatch({ type: 'SET_EDITING_SCHEDULE', payload: null });
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui jadwal');
    } finally {
      dispatch({ type: 'SET_CREATING_SCHEDULE', payload: false });
    }
  };

  // Menggunakan React Query mutation untuk toggle status
  const toggleStatusMutation = useToggleScheduleStatus();
  
  const handleToggleStatus = async (schedule: Schedule) => {
    try {
      dispatch({ type: 'SET_TOGGLING_STATUS', payload: schedule.id });
      await toggleStatusMutation.mutateAsync({ id: schedule.id, isActive: !schedule.is_active });
      toast.success(`Jadwal berhasil ${!schedule.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error: any) {
      console.error('Error toggling schedule status:', error);
      toast.error(error.response?.data?.message || 'Gagal mengubah status jadwal');
    } finally {
      dispatch({ type: 'SET_TOGGLING_STATUS', payload: null });
    }
  };

  // Menggunakan React Query mutation untuk bulk create schedule
  const bulkCreateScheduleMutation = useBulkCreateSchedule();
  
  const handleBulkCreateSchedule = async (data: BulkCreateScheduleFormData) => {
    try {
      dispatch({ type: 'SET_CREATING_SCHEDULE', payload: true });
      await bulkCreateScheduleMutation.mutateAsync(data);
      toast.success('Jadwal bulk berhasil dibuat');
      dispatch({ type: 'TOGGLE_BULK_CREATE_MODAL', payload: false });
    } catch (error: any) {
      console.error('Error creating bulk schedules:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat jadwal bulk');
    } finally {
      dispatch({ type: 'SET_CREATING_SCHEDULE', payload: false });
    }
  };

  // Menggunakan React Query mutation untuk delete schedule
  const deleteScheduleMutation = useDeleteSchedule();
  
  const handleDeleteSchedule = async (schedule: Schedule) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus jadwal ${getDayLabel(schedule.day_of_week)} ${schedule.start_time}-${schedule.end_time}?`)) {
      return;
    }
    
    try {
      await deleteScheduleMutation.mutateAsync(schedule.id);
      toast.success('Jadwal berhasil dihapus');
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus jadwal');
    }
  };

  // Remove handleSearch function as it's no longer needed for real-time search

  const getDayLabel = (day: DayOfWeek): string => {
    const dayLabels: Record<string, string> = {
      // Bahasa Indonesia
      'Senin': 'Senin',
      'Selasa': 'Selasa',
      'Rabu': 'Rabu',
      'Kamis': 'Kamis',
      'Jumat': 'Jumat',
      'Sabtu': 'Sabtu',
      'Minggu': 'Minggu',
      // Bahasa Inggris
      'monday': 'Senin',
      'tuesday': 'Selasa',
      'wednesday': 'Rabu',
      'thursday': 'Kamis',
      'friday': 'Jumat',
      'saturday': 'Sabtu',
      'sunday': 'Minggu'
    };
    return dayLabels[day] || day;
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Aktif
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm">
          <XCircleIcon className="w-4 h-4 mr-1" />
          Tidak Aktif
        </span>
      );
    }
  };

  const openEditModal = (schedule: Schedule) => {
    dispatch({ type: 'SET_EDITING_SCHEDULE', payload: schedule });
    dispatch({ type: 'TOGGLE_EDIT_MODAL', payload: true });
    dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: false });
  };

  // Helper function to format time
  const formatTime = (time: string) => {
    return time.substring(0, 5); // Format HH:MM from HH:MM:SS
  };

  // Define columns for DataTable
  const columns: Column<Schedule>[] = [
    {
      key: 'day_of_week',
      title: 'Hari',
      render: (value: any, schedule: Schedule) => (
        <div className="flex flex-col">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-sky-300 to-blue-200 text-blue-800 shadow-sm">
            <CalendarDaysIcon className="w-4 h-4 mr-1" />
            {getDayLabel(schedule.day_of_week)}
          </span>
        </div>
      ),
    },
    {
      key: 'time',
      title: 'Waktu',
      render: (value: any, schedule: Schedule) => (
        <div className="flex items-center">
          <div className="p-1.5 bg-blue-50 rounded-full mr-2">
            <ClockIcon className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
          </span>
        </div>
      ),
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value: any, schedule: Schedule) => getStatusBadge(schedule.is_active),
    },
    {
      key: 'actions',
      title: 'Aksi',
      render: (value: any, schedule: Schedule) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/dashboard/schedules/${schedule.id}`)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200"
            title="Lihat detail jadwal"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleStatus(schedule)}
            disabled={isTogglingStatus === schedule.id}
            className={`${
              schedule.is_active 
                ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
            } transition-colors duration-200`}
            title={schedule.is_active ? 'Nonaktifkan jadwal' : 'Aktifkan jadwal'}
          >
            {isTogglingStatus === schedule.id ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowPathIcon className="w-4 h-4" />
            )}
          </Button>
          <Button
              size="sm"
              variant="outline"
              onClick={() => openEditModal(schedule)}
              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors duration-200"
            >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteSchedule(schedule)}
            className="hover:bg-red-600 transition-colors duration-200"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Jadwal</h1>
            <p className="text-gray-600">Kelola jadwal praktik optometris</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => dispatch({ type: 'TOGGLE_BULK_CREATE_MODAL', payload: true })}
              variant="outline"
              className="flex items-center transition-all duration-300 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md"
            >
              <DocumentPlusIcon className="w-5 h-5 mr-2" />
              Buat Jadwal Bulk
            </Button>
            <Button
              onClick={() => dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: true })}
              className="flex items-center transition-all duration-300 hover:bg-blue-600 hover:shadow-lg"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Tambah Jadwal
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg shadow-md">
                  <CalendarDaysIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jadwal</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSchedules}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-green-400 to-green-600 rounded-lg shadow-md">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Jadwal Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSchedules}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-red-400 to-red-600 rounded-lg shadow-md">
                  <XCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Jadwal Tidak Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactiveSchedules}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg shadow-md">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Optometris Terjadwal</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.optometristsWithSchedules}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedules List */}
        <Card hover={false}>
          <CardHeader>
            <CardTitle>Daftar Jadwal</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Cari jadwal..."
                    value={searchTerm}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
                    className="pl-10 transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <SearchableSelect
                    value={optometristFilter}
                    onChange={(value) => dispatch({ type: 'SET_OPTOMETRIST_FILTER', payload: value })}
                    options={[
                      { value: '', label: 'Semua Optometris' },
                      ...optometrists.map((optometrist) => ({
                        value: optometrist.id,
                        label: optometrist.name,
                      })),
                    ]}
                    placeholder="Pilih Optometris"
                    searchPlaceholder="Cari optometris..."
                    allowClear
                  />
                </div>
                <div>
                  <SearchableSelect
                    value={dayFilter}
                    onChange={(value) => dispatch({ type: 'SET_DAY_FILTER', payload: value })}
                    options={dayOptions}
                    placeholder="Pilih Hari"
                    searchPlaceholder="Cari hari..."
                    allowClear
                  />
                </div>
                <div>
                  <SearchableSelect
                    value={statusFilter}
                    onChange={(value) => dispatch({ type: 'SET_STATUS_FILTER', payload: value })}
                    options={statusOptions}
                    placeholder="Pilih Status"
                    searchPlaceholder="Cari status..."
                    allowClear
                  />
                </div>
              </div>
            </div>
            <DataTable
              columns={columns}
              data={schedules}
              isLoading={loading}
              pagination={{
                currentPage: currentPage,
                totalPages: totalPages,
                onPageChange: (page: number) => dispatch({ type: 'SET_PAGE', payload: page }),
              }}
              sortConfig={{
                key: sortBy,
                direction: sortOrder,
              }}
              onSort={(key: string) => {
                if (sortBy === key) {
                  dispatch({ type: 'SET_SORT', payload: { sortBy: key, sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' } });
                } else {
                  dispatch({ type: 'SET_SORT', payload: { sortBy: key, sortOrder: 'asc' } });
                }
              }}
              emptyMessage="Tidak ada jadwal ditemukan"
              groupBy={{
                key: 'optometrist',
                render: (optometrist: Schedule['optometrist']) => (
                  <div className="flex items-center p-2">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-sky-200 to-blue-100 flex items-center justify-center shadow-md">
                        <span className="text-blue-800 font-bold text-lg">{optometrist.name.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-base font-medium text-gray-900">{optometrist.name}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {optometrist.email}
                      </div>
                    </div>
                  </div>
                )
              }}
            />
          </CardContent>
        </Card>

        {/* Create/Edit Schedule Modal */}
        <Modal
          isOpen={isCreateModalOpen || isEditModalOpen}
          onClose={() => {
            dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: false });
            dispatch({ type: 'TOGGLE_EDIT_MODAL', payload: false });
            dispatch({ type: 'SET_EDITING_SCHEDULE', payload: null });
          }}
          title={editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'}
        >
          <CreateScheduleForm
            optometrists={optometrists}
            initialData={editingSchedule ? {
              optometrist_id: editingSchedule.optometrist.id,
              day_of_week: editingSchedule.day_of_week,
              start_time: editingSchedule.start_time,
              end_time: editingSchedule.end_time,
              is_active: editingSchedule.is_active,
            } : undefined}
            onSubmit={editingSchedule ? handleEditSchedule : handleCreateSchedule}
            onCancel={() => {
              dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: false });
              dispatch({ type: 'TOGGLE_EDIT_MODAL', payload: false });
              dispatch({ type: 'SET_EDITING_SCHEDULE', payload: null });
            }}
            isLoading={isCreatingSchedule}
          />
        </Modal>

        {/* Bulk Create Schedule Modal */}
        <Modal
          isOpen={isBulkCreateModalOpen}
          onClose={() => dispatch({ type: 'TOGGLE_BULK_CREATE_MODAL', payload: false })}
          title="Buat Jadwal Bulk"
        >
          <BulkCreateScheduleForm
            optometrists={optometrists}
            onSubmit={handleBulkCreateSchedule}
            onCancel={() => dispatch({ type: 'TOGGLE_BULK_CREATE_MODAL', payload: false })}
            isLoading={isCreatingSchedule}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default SchedulesPage;