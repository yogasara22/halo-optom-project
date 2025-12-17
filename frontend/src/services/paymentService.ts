import api from '@/lib/api';
import { Payment, PaymentStats, PaymentFilter, PaymentStatus } from '@/types/payment';

// Mendapatkan semua payment
export const getAllPayments = async (filter?: PaymentFilter): Promise<Payment[]> => {
  try {
    const params = filter ? { ...filter } : {};
    const response = await api.get<Payment[]>('/payments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all payments:', error);
    throw error;
  }
};

// Mendapatkan statistik payment
export const getPaymentStats = async (filter?: PaymentFilter): Promise<PaymentStats> => {
  try {
    const params = filter ? { ...filter } : {};
    const response = await api.get<PaymentStats>('/payments/stats', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    throw error;
  }
};

// Mendapatkan detail payment berdasarkan ID
export const getPaymentById = async (paymentId: string): Promise<Payment> => {
  try {
    const response = await api.get<Payment>(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment with ID ${paymentId}:`, error);
    throw error;
  }
};

// Update status payment
export const updatePaymentStatus = async (paymentId: string, status: PaymentStatus): Promise<Payment> => {
  try {
    const response = await api.patch<Payment>(`/payments/${paymentId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating payment status for ID ${paymentId}:`, error);
    throw error;
  }
};

// Mendapatkan payment berdasarkan order ID
export const getPaymentByOrderId = async (orderId: string): Promise<Payment> => {
  try {
    const response = await api.get<Payment>(`/payments/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment for order ID ${orderId}:`, error);
    throw error;
  }
};

// Mendapatkan payment berdasarkan appointment ID
export const getPaymentByAppointmentId = async (appointmentId: string): Promise<Payment> => {
  try {
    const response = await api.get<Payment>(`/payments/appointment/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment for appointment ID ${appointmentId}:`, error);
    throw error;
  }
};

// Export payment data ke format CSV atau Excel
export const exportPayments = async (filter?: PaymentFilter): Promise<Blob> => {
  try {
    const params = filter ? { ...filter } : {};
    const response = await api.get('/payments/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting payments:', error);
    throw error;
  }
};