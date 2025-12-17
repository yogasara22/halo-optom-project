import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Payment, PaymentStatus } from '@/types/payment';
import Button from '@/components/ui/Button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CreditCardIcon,
  CalendarIcon,
  ShoppingBagIcon,
  UserIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface PaymentDetailModalProps {
  payment: Payment;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  payment,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'paid':
        return 'Sudah Dibayar';
      case 'failed':
        return 'Gagal';
      case 'expired':
        return 'Kadaluarsa';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'order':
        return 'Order Produk';
      case 'appointment':
        return 'Appointment';
      default:
        return type;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detail Transaksi #{payment.id.slice(-8)}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getPaymentTypeIcon(payment.payment_type)}
              <span
                className={clsx(
                  'ml-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full',
                  'bg-blue-100 text-blue-800'
                )}
              >
                {getPaymentTypeLabel(payment.payment_type)}
              </span>
            </div>
            <div className="flex items-center">
              {getStatusIcon(payment.status)}
              <span
                className={clsx(
                  'ml-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full',
                  getStatusColor(payment.status)
                )}
              >
                {getStatusLabel(payment.status)}
              </span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">ID Transaksi:</span>
              <span className="font-medium">{payment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Jumlah:</span>
              <span className="font-medium">Rp {payment.amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Metode Pembayaran:</span>
              <span className="font-medium">
                {payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID Pembayaran:</span>
              <span className="font-medium">{payment.payment_id || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID Eksternal:</span>
              <span className="font-medium">{payment.external_id || '-'}</span>
            </div>
            {payment.payment_type === 'order' && (
              <div className="flex justify-between">
                <span className="text-gray-600">ID Order:</span>
                <span className="font-medium">{payment.order_id || '-'}</span>
              </div>
            )}
            {payment.payment_type === 'appointment' && (
              <div className="flex justify-between">
                <span className="text-gray-600">ID Appointment:</span>
                <span className="font-medium">{payment.appointment_id || '-'}</span>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tanggal Dibuat:</span>
              <span className="font-medium">{formatDate(payment.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tanggal Dibayar:</span>
              <span className="font-medium">{formatDate(payment.paid_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Terakhir Diupdate:</span>
              <span className="font-medium">{formatDate(payment.updated_at)}</span>
            </div>
          </div>

          {/* Payment Details */}
          {payment.payment_details && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Detail Pembayaran</h3>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(JSON.parse(payment.payment_details), null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              Tutup
            </Button>
            
            {payment.status === 'pending' && (
              <>
                <Button
                  variant="danger"
                  onClick={() => {
                    onReject(payment.id);
                    onClose();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 flex items-center"
                >
                  <XCircleIcon className="w-4 h-4 mr-2" />
                  Tolak Pembayaran
                </Button>
                <Button
                  onClick={() => {
                    onApprove(payment.id);
                    onClose();
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 flex items-center"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Setujui Pembayaran
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailModal;