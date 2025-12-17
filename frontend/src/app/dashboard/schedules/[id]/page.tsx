'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  MapPinIcon,
  UsersIcon,
  DocumentTextIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CreateScheduleForm, { CreateScheduleFormData } from '@/components/forms/CreateScheduleForm';
import scheduleService, { Schedule } from '@/services/scheduleService';
import userService from '@/services/userService';
import { User } from '@/types';

const ScheduleDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params.id as string;

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [optometrists, setOptometrists] = useState<User[]>([]);
  const [allOptometristSchedules, setAllOptometristSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOptometristSchedules, setLoadingOptometristSchedules] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAllSchedules, setShowAllSchedules] = useState(false);

  useEffect(() => {
    fetchScheduleDetail();
    fetchOptometrists();
  }, [scheduleId]);

  const fetchScheduleDetail = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getScheduleById(scheduleId);
      setSchedule(data);
    } catch (error) {
      console.error('Error fetching schedule detail:', error);
      toast.error('Gagal memuat detail jadwal');
      router.push('/dashboard/schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptometrists = async () => {
    try {
      const response = await userService.getUsers({ role: 'optometrist' });
      setOptometrists(response.data);
    } catch (error) {
      console.error('Error fetching optometrists:', error);
    }
  };

  const fetchOptometristSchedules = async (optometristId: string) => {
    try {
      setLoadingOptometristSchedules(true);
      const response = await scheduleService.getSchedules({ optometrist_id: optometristId });
      setAllOptometristSchedules(response.data);
    } catch (error) {
      console.error('Error fetching optometrist schedules:', error);
      toast.error('Gagal memuat jadwal optometris');
    } finally {
      setLoadingOptometristSchedules(false);
    }
  };

  const handleShowAllSchedules = () => {
    if (schedule?.optometrist?.id && !showAllSchedules) {
      fetchOptometristSchedules(schedule.optometrist.id);
    }
    setShowAllSchedules(!showAllSchedules);
  };

  const handleEditSchedule = async (formData: CreateScheduleFormData) => {
    if (!schedule) return;

    try {
      const updatedSchedule = await scheduleService.updateSchedule(schedule.id, {
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_active: formData.is_active,
      });
      setSchedule(updatedSchedule);
      setIsEditModalOpen(false);
      toast.success('Jadwal berhasil diperbarui');
      
      // Refresh optometrist schedules if showing all schedules
      if (showAllSchedules && schedule.optometrist?.id) {
        fetchOptometristSchedules(schedule.optometrist.id);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Gagal memperbarui jadwal');
    }
  };

  const handleToggleStatus = async () => {
    if (!schedule) return;

    try {
      setIsTogglingStatus(true);
      const updatedSchedule = await scheduleService.updateSchedule(schedule.id, {
        is_active: !schedule.is_active,
      });
      setSchedule(updatedSchedule);
      toast.success(
        `Jadwal berhasil ${updatedSchedule.is_active ? 'diaktifkan' : 'dinonaktifkan'}`
      );
    } catch (error) {
      console.error('Error toggling schedule status:', error);
      toast.error('Gagal mengubah status jadwal');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!schedule) return;

    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await scheduleService.deleteSchedule(schedule.id);
      toast.success('Jadwal berhasil dihapus');
      router.push('/dashboard/schedules');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Gagal menghapus jadwal');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateString: any) => {
    try {
      // Pastikan dateString adalah string yang valid
      if (!dateString) return 'Tidak tersedia';
      
      // Konversi ke string jika bukan string
      if (typeof dateString !== 'string') {
        // Jika dateString adalah objek Date
        if (dateString instanceof Date) {
          return dateString.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        }
        
        // Jika dateString adalah objek dengan properti toISOString (seperti objek Date)
        if (dateString && typeof dateString === 'object' && 'toISOString' in dateString) {
          return new Date(dateString.toISOString()).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        }
        
        // Jika dateString adalah objek lain, coba ekstrak properti yang mungkin berisi tanggal
        if (dateString && typeof dateString === 'object') {
          // Log untuk debugging
          console.log('Object date format:', dateString);
          
          // Coba beberapa properti umum yang mungkin berisi tanggal
          if (dateString.date) return formatDate(dateString.date);
          if (dateString.time) return formatDate(dateString.time);
          if (dateString.timestamp) return formatDate(dateString.timestamp);
          
          // Jika tidak ada properti yang cocok, konversi ke string JSON
          dateString = JSON.stringify(dateString);
        } else {
          // Coba konversi ke string
          dateString = String(dateString);
        }
      }
      
      // Coba parse tanggal dengan berbagai format
      let date;
      
      // Coba beberapa format tanggal yang mungkin
      if (dateString.includes('T')) {
        // Format ISO dengan T (2023-01-01T12:00:00.000Z)
        date = new Date(dateString);
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        // Format SQL (2023-01-01 12:00:00)
        date = new Date(dateString.replace(' ', 'T') + 'Z');
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Format tanggal saja (2023-01-01)
        date = new Date(dateString + 'T00:00:00Z');
      } else {
        // Coba parse langsung
        date = new Date(dateString);
      }
      
      // Periksa apakah tanggal valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date format:', dateString);
        
        // Coba format timestamp (unix epoch)
        if (/^\d+$/.test(dateString)) {
          const timestamp = parseInt(dateString);
          date = new Date(timestamp * (/^\d{10}$/.test(dateString) ? 1000 : 1));
          
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          }
        }
        
        return 'Format tanggal tidak valid';
      }
      
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Error format tanggal';
    }
  };

  const getDayName = (dayOfWeek: string) => {
    const days: Record<string, string> = {
      // Uppercase format
      'MONDAY': 'Senin',
      'TUESDAY': 'Selasa',
      'WEDNESDAY': 'Rabu',
      'THURSDAY': 'Kamis',
      'FRIDAY': 'Jumat',
      'SATURDAY': 'Sabtu',
      'SUNDAY': 'Minggu',
      // Lowercase format
      'monday': 'Senin',
      'tuesday': 'Selasa',
      'wednesday': 'Rabu',
      'thursday': 'Kamis',
      'friday': 'Jumat',
      'saturday': 'Sabtu',
      'sunday': 'Minggu'
    };
    return days[dayOfWeek] || dayOfWeek;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!schedule) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Jadwal tidak ditemukan</h2>
          <p className="text-gray-600 mb-4">Jadwal yang Anda cari tidak dapat ditemukan.</p>
          <Button onClick={() => router.push('/dashboard/schedules')}>Kembali ke Daftar Jadwal</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/schedules')}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Kembali</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detail Jadwal</h1>
              <p className="text-gray-600">Informasi lengkap jadwal optometris</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className="flex items-center space-x-2"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isTogglingStatus ? 'animate-spin' : ''}`} />
              <span>{schedule.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit</span>
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSchedule}
              disabled={isDeleting}
              className="flex items-center space-x-2"
            >
              <TrashIcon className="h-4 w-4" />
              <span>{isDeleting ? 'Menghapus...' : 'Hapus'}</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                  <span>Informasi Jadwal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Hari</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">
                          {getDayName(schedule.day_of_week)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Waktu Mulai</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">
                          {formatTime(schedule.start_time)}
                        </span>
                      </div>
                    </div>

                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1 flex items-center space-x-2">
                        {schedule.is_active ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span className="text-green-700 font-medium">Aktif</span>
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-4 w-4 text-red-500" />
                            <span className="text-red-700 font-medium">Tidak Aktif</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Waktu Selesai</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">
                          {formatTime(schedule.end_time)}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Duration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                  <span>Durasi Jadwal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {(() => {
                        const start = new Date(`1970-01-01T${schedule.start_time}`);
                        const end = new Date(`1970-01-01T${schedule.end_time}`);
                        const diffMs = end.getTime() - start.getTime();
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        return `${diffHours}h ${diffMinutes}m`;
                      })()}
                    </div>
                    <p className="text-blue-700 font-medium">Total Durasi Praktik</p>
                    <p className="text-sm text-blue-600 mt-1">
                      {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informasi tambahan telah dihapus karena field description dan notes tidak ada lagi */}
          </div>

          {/* Optometrist Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  <span>Optometris</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <UserIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {schedule.optometrist.name}
                    </h3>
                    <p className="text-gray-600">{schedule.optometrist.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {schedule.optometrist.role}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Optometrist Schedules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                    <span>Semua Jadwal {schedule.optometrist.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowAllSchedules}
                    disabled={loadingOptometristSchedules}
                  >
                    {showAllSchedules ? 'Sembunyikan' : 'Tampilkan'}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showAllSchedules && (
                <CardContent>
                  {loadingOptometristSchedules ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Memuat jadwal...</p>
                    </div>
                  ) : allOptometristSchedules.length === 0 ? (
                    <div className="text-center py-4">
                      <InformationCircleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Tidak ada jadwal lain</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {allOptometristSchedules.map((scheduleItem) => (
                        <div
                          key={scheduleItem.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            scheduleItem.id === schedule.id
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {getDayName(scheduleItem.day_of_week)}
                                </span>
                                {/* Tanggal spesifik telah dihapus karena field date tidak ada lagi */}
                                {scheduleItem.id === schedule.id && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    Saat ini
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-600 flex items-center">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  {formatTime(scheduleItem.start_time)} - {formatTime(scheduleItem.end_time)}
                                </span>

                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {scheduleItem.is_active ? (
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 text-red-500" />
                              )}
                              {scheduleItem.id !== schedule.id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/schedules/${scheduleItem.id}`)}
                                  className="text-xs"
                                >
                                  Lihat
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Jadwal"
      >
        <CreateScheduleForm
          optometrists={optometrists}
          onSubmit={handleEditSchedule}
          onCancel={() => setIsEditModalOpen(false)}
          initialData={{
            optometrist_id: schedule.optometrist.id,
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            is_active: schedule.is_active,
          }}

        />
      </Modal>
    </DashboardLayout>
  );
};

export default ScheduleDetailPage;