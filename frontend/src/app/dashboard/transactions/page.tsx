'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/use-toast';
import { PaginatedResponse } from '@/types';
import { Payment, PaymentFilter, PaymentStats, PaymentStatus, PaymentType, PaymentMethod } from '@/types/payment';
import { getPayments, updatePaymentStatus, getPaymentStats, exportPaymentReport } from '@/services/payment.service';
import { updateAppointmentCommission } from '@/services/appointment.service';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  UserIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import PaymentDetailModal from '@/components/payment/PaymentDetailModal';

const TransactionsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalAmount: 0,
    pendingPayments: 0,
    pendingAmount: 0,
    paidPayments: 0,
    paidAmount: 0,
    failedPayments: 0,
    monthlyRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<PaymentFilter>({
    startDate: '',
    endDate: '',
    status: 'all',
    payment_type: 'all',
    payment_method: 'all',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu Pembayaran' },
    { value: 'paid', label: 'Sudah Dibayar' },
    { value: 'failed', label: 'Gagal' },
    { value: 'expired', label: 'Kadaluarsa' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ];

  const paymentTypeOptions = [
    { value: 'all', label: 'Semua Tipe' },
    { value: 'order', label: 'Order Produk' },
    { value: 'appointment', label: 'Appointment' },
  ];

  const paymentMethodOptions = [
    { value: 'all', label: 'Semua Metode' },
    { value: 'xendit', label: 'Xendit' },
    { value: 'manual', label: 'Manual' },
    { value: 'other', label: 'Lainnya' },
  ];

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [currentPage]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const apiFilter: PaymentFilter = {
        ...filter,
        status: filter.status === 'all' ? undefined : filter.status,
        payment_type: filter.payment_type === 'all' ? undefined : filter.payment_type,
        payment_method: filter.payment_method === 'all' ? undefined : filter.payment_method,
      };
      const response = await getPayments(currentPage, 10, apiFilter);
      setPayments(response.data);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError('Gagal memuat data transaksi');
      console.error('Error fetching payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getPaymentStats();
      setStats(response);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPayments();
  };

  const handleFilterChange = (key: keyof PaymentFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: 'approve' | 'reject';
    title: string;
    message: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprovePayment = async (id: string) => {
    setConfirmAction({
      id,
      action: 'approve',
      title: 'Setujui Pembayaran',
      message: 'Apakah Anda yakin ingin menyetujui pembayaran ini?'
    });
    setShowConfirmDialog(true);
  };

  const handleRejectPayment = async (id: string) => {
    setConfirmAction({
      id,
      action: 'reject',
      title: 'Tolak Pembayaran',
      message: 'Apakah Anda yakin ingin menolak pembayaran ini?'
    });
    setShowConfirmDialog(true);
  };

  const { toast } = useToast();

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    setIsProcessing(true);
    try {
      const status: PaymentStatus = confirmAction.action === 'approve' ? 'paid' : 'failed';
      await updatePaymentStatus(confirmAction.id, status);
      await fetchPayments();
      await fetchStats();

      toast({
        title: confirmAction.action === 'approve' ? 'Pembayaran Disetujui' : 'Pembayaran Ditolak',
        description: confirmAction.action === 'approve'
          ? 'Pembayaran telah berhasil disetujui'
          : 'Pembayaran telah ditolak',
        variant: confirmAction.action === 'approve' ? 'default' : 'destructive',
      });
      setShowConfirmDialog(false);
    } catch (err: any) {
      toast({
        title: 'Gagal Mengupdate Status',
        description: 'Terjadi kesalahan saat mengupdate status pembayaran',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const exportReport = async () => {
    try {
      const apiFilter: PaymentFilter = {
        ...filter,
        status: filter.status === 'all' ? undefined : filter.status,
        payment_type: filter.payment_type === 'all' ? undefined : filter.payment_type,
        payment_method: filter.payment_method === 'all' ? undefined : filter.payment_method,
        format: 'xlsx' // Menentukan format Excel
      };
      const blob = await exportPaymentReport(apiFilter);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-transaksi-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert('Gagal mengunduh laporan Excel');
    }
  };

  const exportPaymentCSV = async () => {
    try {
      const apiFilter: PaymentFilter = {
        ...filter,
        status: filter.status === 'all' ? undefined : filter.status,
        payment_type: filter.payment_type === 'all' ? undefined : filter.payment_type,
        payment_method: filter.payment_method === 'all' ? undefined : filter.payment_method,
        format: 'csv' // Menentukan format CSV
      };
      const blob = await exportPaymentReport(apiFilter);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transaksi-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert('Gagal mengunduh CSV');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'expired':
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBagIcon className="w-5 h-5 text-blue-500" />;
      case 'appointment':
        return <CalendarIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <CreditCardIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-800';
      case 'appointment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const getPaymentTypeLabel = (type: string) => {
    const option = paymentTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  const handleViewDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Transaksi</h1>
            <p className="text-gray-600">Kelola pembayaran dan laporan keuangan</p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => exportPaymentCSV()}
              variant="outline"
              className="flex items-center text-sm border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-sm"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
            <Button onClick={exportReport} className="flex items-center">
              <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Total Pendapatan</p>
                  <p className="text-base font-bold text-gray-800 tracking-tight">
                    <span className="text-[10px] font-medium text-gray-400 mr-1">Rp</span>
                    {(stats.totalAmount || stats.totalRevenue || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-amber-50 rounded-xl">
                  <ClockIcon className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Pembayaran Pending</p>
                  <p className="text-base font-bold text-gray-800 tracking-tight">
                    {stats.pendingPayments || 0}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Est. Rp {(stats.pendingAmount || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Pembayaran Sukses</p>
                  <p className="text-base font-bold text-gray-800 tracking-tight">
                    {stats.paidPayments || 0}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Rp {(stats.paidAmount || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Pendapatan Bulan Ini</p>
                  <p className="text-base font-bold text-gray-800 tracking-tight">
                    <span className="text-[10px] font-medium text-gray-400 mr-1">Rp</span>
                    {(stats.monthlyRevenue || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table with Integrated Filters */}
        <Card className="shadow-sm border border-gray-100 overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 bg-linear-to-r from-blue-50 to-white border-b border-gray-100">
            <CardTitle className="text-blue-700">Daftar Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-4">
                {/* Search and Date Range Row */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      placeholder="Cari ID transaksi, nama, dll..."
                      value={filter.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 w-full"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Input
                        type="date"
                        value={filter.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="w-full sm:w-auto"
                      />
                    </div>
                    <span className="self-center text-gray-400 font-medium">-</span>
                    <div className="relative">
                      <Input
                        type="date"
                        value={filter.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="w-full sm:w-auto"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <MagnifyingGlassIcon className="w-5 h-5 mr-1" />
                      Cari
                    </Button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={filter.status || 'all'}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="pl-10 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={filter.payment_type || 'all'}
                      onChange={(e) => handleFilterChange('payment_type', e.target.value)}
                      className="pl-10 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                    >
                      {paymentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCardIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={filter.payment_method || 'all'}
                      onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                      className="pl-10 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                    >
                      {paymentMethodOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 shadow-sm"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        ID Transaksi
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tipe
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Komisi
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Nilai Komisi
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Metode
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-150" onClick={() => handleViewDetail(payment)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          #{payment.id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getPaymentTypeIcon(payment.payment_type)}
                            <span className="ml-2 text-sm text-gray-700 capitalize">
                              {getPaymentTypeLabel(payment.payment_type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          Rp {Number(payment.amount).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                          {payment.payment_type === 'appointment' && payment.appointment?.commission_percentage ? (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                              {payment.appointment.commission_percentage}%
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {payment.payment_type === 'appointment' && payment.appointment?.commission_amount ? (
                            `Rp ${Number(payment.appointment.commission_amount).toLocaleString('id-ID')}`
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                            getStatusColor(payment.status)
                          )}>
                            {getStatusLabel(payment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                          {payment.payment_method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(() => {
                            try {
                              const date = new Date(payment.created_at);
                              if (isNaN(date.getTime())) {
                                return '-';
                              }
                              return format(date, 'dd MMM yyyy', { locale: id });
                            } catch (e) {
                              return '-';
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          {payment.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprovePayment(payment.id);
                                }}
                                disabled={isProcessing}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Setujui
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectPayment(payment.id);
                                }}
                                disabled={isProcessing}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Tolak
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {payments.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Tidak ada transaksi ditemukan</h3>
                    <p className="text-gray-500 mt-1">Coba ubah filter pencarian Anda atau periksa kembali kata kunci</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        {showConfirmDialog && confirmAction && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
            onClick={(e) => e.target === e.currentTarget && handleCancelAction()}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">{confirmAction.title}</h3>
              <p className="text-gray-600 mb-6">{confirmAction.message}</p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCancelAction}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  Batal
                </Button>
                <Button
                  variant={confirmAction.action === 'approve' ? 'primary' : 'danger'}
                  onClick={handleConfirmAction}
                  disabled={isProcessing}
                  className={`transition-colors duration-200 ${confirmAction.action === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white flex items-center`}
                >
                  {isProcessing && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {confirmAction.action === 'approve' ? 'Setujui' : 'Tolak'}
                </Button>
              </div>
            </div>
          </div>
        )}

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
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedPayment && showDetailModal && (
          <PaymentDetailModal
            payment={selectedPayment}
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            onApprove={handleApprovePayment}
            onReject={handleRejectPayment}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TransactionsPage;
