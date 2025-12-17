export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled' | 'all';
export type PaymentMethod = 'xendit' | 'manual' | 'other' | 'all';
export type PaymentType = 'order' | 'appointment' | 'all';

export interface Payment {
  id: string;
  payment_type: PaymentType;
  order_id?: string;
  appointment_id?: string;
  amount: number;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_id?: string;
  external_id?: string;
  payment_details?: any;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  order?: any; // Simplified for frontend
  appointment?: any; // Simplified for frontend
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  totalRevenue?: number; // Tambahan untuk kompatibilitas dengan backend
  pendingPayments: number;
  pendingAmount: number;
  paidPayments: number;
  paidAmount: number;
  failedPayments: number;
  monthlyRevenue: number;
}

export interface PaymentFilter {
  startDate?: string;
  endDate?: string;
  status?: PaymentStatus;
  payment_type?: PaymentType;
  payment_method?: PaymentMethod;
  search?: string;
  format?: 'csv' | 'xlsx';
}