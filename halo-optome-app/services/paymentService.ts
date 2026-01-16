import api from '../lib/api';

export interface PaymentInvoice {
    invoice_id: string;
    external_id: string;
    invoice_url: string;
    expiry_date: string;
    amount: number;
    status: string;
    appointment: any;
}

export interface PaymentInvoiceResponse {
    message: string;
    data: PaymentInvoice;
}

/**
 * Create payment invoice for appointment
 */
export const createPaymentInvoice = async (appointmentId: string): Promise<PaymentInvoice> => {
    try {
        const response = await api.post(`/appointments/${appointmentId}/payment`);
        return response.data.data;
    } catch (error: any) {
        console.error('Error creating payment invoice:', error);
        throw error.response?.data?.message ? new Error(error.response.data.message) : error;
    }
};

/**
 * Get payment status by appointment ID
 */
export const getPaymentStatus = async (appointmentId: string): Promise<any> => {
    try {
        const response = await api.get(`/payments?appointment_id=${appointmentId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error getting payment status:', error);
        throw error.response?.data?.message ? new Error(error.response.data.message) : error;
    }
};

export default {
    createPaymentInvoice,
    getPaymentStatus,
};
