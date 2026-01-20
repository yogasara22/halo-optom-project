'use client';

import React, { useState, Suspense } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { MedicalRecord, User, Appointment } from '@/types';
import medicalRecordService, { MedicalRecordFilters, MedicalRecordStats } from '@/services/medicalRecordService';
import { useMedicalRecords, useMedicalRecordStats, useCreateMedicalRecord, useUpdateMedicalRecord, useDeleteMedicalRecord, useExportMedicalRecord } from '@/hooks/useMedicalRecords';
import { FileText, Download, Search, Calendar, User as UserIcon, Eye, Filter, FileDown, FileSpreadsheet, Loader2, FileText as FilePdf } from 'lucide-react';
import { clsx } from 'clsx';
import { format, parseISO } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import Select from '@/components/ui/Select';
import { ColumnDef } from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'react-hot-toast';

interface MedicalRecordDetail {
  id: string;
  patient?: User;
  optometrist?: User;
  appointment?: Appointment;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  attachments?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  user?: User;
  createdAt?: string;
  symptoms?: string;
}

type Row = {
  original: MedicalRecordDetail;
};

const MedicalRecordsPage: React.FC = () => {
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Menggunakan React Query untuk data fetching dan caching
  const { data: recordsData, isLoading, error: queryError, refetch } = useMedicalRecords({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  const records = recordsData?.data || [];
  const totalPages = recordsData?.totalPages || 1;
  const error = queryError instanceof Error ? queryError.message : '';

  // Menggunakan React Query untuk stats
  const { data: stats = {
    totalRecords: 0,
    recentRecords: 0,
    activePatients: 0,
    monthlyRecords: 0,
  } } = useMedicalRecordStats();

  // Define table columns
  const columns: Column<MedicalRecordDetail>[] = [
    {
      key: 'id',
      title: 'ID',
      render: (value: any, row: MedicalRecordDetail) => <span className="text-xs font-mono">{row.id.substring(0, 8)}...</span>
    },
    {
      key: 'patient.name',
      title: 'Pasien',
      render: (value: any, row: MedicalRecordDetail) => (
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <span>{row.patient?.name || 'Unknown'}</span>
        </div>
      )
    },
    {
      key: 'optometrist.name',
      title: 'Optometris',
      render: (value: any, row: MedicalRecordDetail) => <span>{row.optometrist?.name || 'Unknown'}</span>
    },
    {
      key: 'diagnosis',
      title: 'Diagnosis',
      render: (value: any, row: MedicalRecordDetail) => (
        <span className="max-w-[200px] truncate block">
          {row.diagnosis || 'No diagnosis'}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Tanggal',
      render: (value: any, row: MedicalRecordDetail) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{row.created_at ? format(new Date(row.created_at), 'dd MMM yyyy') : '-'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Aksi',
      render: (value: any, row: MedicalRecordDetail) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetail(row.id)}
            title="Lihat Detail"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportRecord(row.id)}
            title="Export Rekam Medis"
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Tidak perlu useEffect untuk fetching data karena React Query menanganinya

  // Fungsi untuk memfilter dan mencari data
  const handleSearch = () => {
    setCurrentPage(1);
    // React Query akan otomatis memicu refetch dengan parameter yang diperbarui
    fetchRecords(1);
  };

  const handleFilterChange = (key: keyof MedicalRecordFilters, value: any) => {
    if (key === 'search') {
      setSearchTerm(value);
    } else if (key === 'startDate' || key === 'endDate') {
      setDateRange(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  // Fungsi untuk memuat ulang data rekam medis
  const fetchRecords = (page = currentPage) => {
    // React Query akan otomatis memicu refetch dengan parameter yang diperbarui
    // Fungsi ini hanya untuk memicu refetch secara manual
    refetch();
  };

  const handleDateRangeChange = (range: { from: Date | undefined, to: Date | undefined }) => {
    setDateRange({
      startDate: range.from ? format(range.from, 'yyyy-MM-dd') : '',
      endDate: range.to ? format(range.to, 'yyyy-MM-dd') : ''
    });
  };

  // Menggunakan React Query untuk mendapatkan detail rekam medis
  const handleViewDetail = async (recordId: string) => {
    try {
      // Idealnya ini menggunakan useQuery dengan queryKey yang mencakup recordId
      const record = await medicalRecordService.getMedicalRecordById(recordId);
      setSelectedRecord(record);
      setShowDetailModal(true);
    } catch (err: any) {
      console.error('Error fetching record details:', err);
      toast.error('Gagal memuat detail rekam medis. Silakan coba lagi.');
    }
  };

  // Menggunakan React Query mutation untuk export record
  const exportRecordMutation = useExportMedicalRecord();

  const exportRecord = async (recordId: string) => {
    try {
      const blob = await exportRecordMutation.mutateAsync({ recordId, format: 'pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rekam-medis-${recordId}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Error exporting record:', err);
      toast.error('Gagal mengekspor rekam medis. Silakan coba lagi.');
    }
  };

  // Menggunakan React Query mutation untuk export semua records
  const exportAllRecordsMutation = useExportMedicalRecord();

  const exportAllRecords = async (exportType: 'excel' | 'pdf' = 'excel') => {
    try {
      const exportFilters = {
        search: searchTerm,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format: exportType
      };

      const blob = await exportAllRecordsMutation.mutateAsync(exportFilters);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      // Menentukan ekstensi file berdasarkan tipe ekspor
      const fileExtension = exportType === 'excel' ? 'xlsx' : 'pdf';
      link.setAttribute('download', `laporan-rekam-medis-${dateStr}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error(`Error exporting ${exportType} report:`, err);
      toast.error(`Gagal mengunduh laporan ${exportType === 'excel' ? 'Excel' : 'PDF'}. Silakan coba lagi.`);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rekam Medis</h1>
            <p className="text-muted-foreground">Kelola dan lihat rekam medis pasien</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => exportAllRecords('pdf')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FilePdf className="h-4 w-4" />
              )}
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => exportAllRecords('excel')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              Export Excel
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Rekam Medis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stats.totalRecords}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rekam Medis Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stats.monthlyRecords}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pasien Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stats.activePatients}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rekam Medis Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stats.recentRecords}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Records Table with Integrated Filters */}
        <Card hover={false}>
          <CardHeader>
            <CardTitle>Daftar Rekam Medis</CardTitle>
            <CardDescription>
              Menampilkan {records.length} rekam medis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Integrated Filters */}
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Filter Rekam Medis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari nama pasien, diagnosis..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                <DateRangePicker
                  className="w-full"
                  placeholder="Pilih rentang tanggal"
                  onUpdate={(range) => {
                    if (range.from && range.to) {
                      handleDateRangeChange({
                        from: range.from,
                        to: range.to
                      });
                    }
                  }}
                />

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleSearch}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSearchTerm('');
                      setDateRange({ startDate: '', endDate: '' });
                      setCurrentPage(1);
                      fetchRecords(1);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Table Content */}
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => fetchRecords()}
                >
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <DataTable
                  columns={columns}
                  data={records}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = Math.max(currentPage - 1, 1);
                  setCurrentPage(newPage);
                  fetchRecords(newPage);
                }}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = Math.min(currentPage + 1, totalPages);
                  setCurrentPage(newPage);
                  fetchRecords(newPage);
                }}
                disabled={currentPage === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detail Rekam Medis</DialogTitle>
              <DialogDescription>
                Informasi lengkap rekam medis pasien
              </DialogDescription>
            </DialogHeader>

            {selectedRecord && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Informasi Pasien</h3>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Nama:</span>{' '}
                        {selectedRecord.patient?.name || 'N/A'}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>{' '}
                        {selectedRecord.patient?.email || 'N/A'}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Telepon:</span>{' '}
                        {selectedRecord.patient?.phone || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Optometris</h3>
                    <p>{selectedRecord.optometrist?.name || 'N/A'}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tanggal</h3>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {selectedRecord.created_at ? format(new Date(selectedRecord.created_at), 'dd MMMM yyyy') : '-'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Diagnosis</h3>
                    <div className="p-3 bg-muted rounded-md">
                      {selectedRecord.diagnosis || '-'}
                    </div>
                  </div>

                  {selectedRecord.symptoms && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Gejala</h3>
                      <div className="p-3 bg-muted rounded-md">
                        {selectedRecord.symptoms || '-'}
                      </div>
                    </div>
                  )}

                  {selectedRecord.notes && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Catatan</h3>
                      <div className="p-3 bg-muted rounded-md">
                        {selectedRecord.notes || '-'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => selectedRecord && exportRecord(selectedRecord.id)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Export Rekam Medis
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MedicalRecordsPage;