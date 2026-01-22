import api from '@/lib/api';
import { Payment, PaymentFilter, PaymentStats } from '@/types/payment';
import { PaginatedResponse } from '@/types';

export const getPayments = async (
  page: number = 1,
  limit: number = 10,
  filter?: PaymentFilter
): Promise<PaginatedResponse<Payment>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filter?.status && { status: filter.status }),
    ...(filter?.payment_type && { payment_type: filter.payment_type }),
    ...(filter?.payment_method && { payment_method: filter.payment_method }),
    ...(filter?.search && { search: filter.search }),
    ...(filter?.startDate && { startDate: filter.startDate }),
    ...(filter?.endDate && { endDate: filter.endDate }),
  });

  const response = await api.get<PaginatedResponse<Payment>>(`/payments?${params}`);
  return response.data;
};

export const getPaymentById = async (id: string): Promise<Payment> => {
  const response = await api.get<Payment>(`/payments/${id}`);
  return response.data;
};

export const updatePaymentStatus = async (id: string, status: string): Promise<Payment> => {
  const response = await api.put<Payment>(`/payments/${id}`, { status });
  return response.data;
};

export const getPaymentStats = async (): Promise<PaymentStats> => {
  const response = await api.get<PaymentStats>('/payments/stats');
  return response.data;
};

export const exportPaymentReport = async (filter?: PaymentFilter): Promise<Blob> => {
  const params = new URLSearchParams({
    ...(filter?.status && { status: filter.status }),
    ...(filter?.payment_type && { payment_type: filter.payment_type }),
    ...(filter?.payment_method && { payment_method: filter.payment_method }),
    ...(filter?.startDate && { startDate: filter.startDate }),
    ...(filter?.endDate && { endDate: filter.endDate }),
    ...(filter?.format && { format: filter.format }),
  });

  const response = await api.get(`/payments/export?${params}`, {
    responseType: 'blob',
  });

  return response.data;
};

/**
 * Upload payment proof for bank transfer
 */
export const uploadPaymentProof = async (paymentId: string, proofUrl: string) => {
  const response = await api.post(`/payments/${paymentId}/proof`, { proof_url: proofUrl });
  return response.data;
};

/**
 * Verify payment (Admin only)
 */
export const verifyPayment = async (paymentId: string) => {
  const response = await api.patch(`/payments/${paymentId}/verify`);
  return response.data;
};

/**
 * Reject payment (Admin only)
 */
export const rejectPayment = async (paymentId: string, reason: string) => {
  const response = await api.patch(`/payments/${paymentId}/reject`, { reason });
  return response.data;
};

/**
 * Get pending bank transfer payments (Admin only)
 */
export const getPendingPayments = async () => {
  const response = await api.get('/payments/pending');
  return response.data;
};
