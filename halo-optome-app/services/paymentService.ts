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

/**
 * Create bank transfer payment for appointment
 */
export const createBankTransferPayment = async (appointmentId: string): Promise<any> => {
    try {
        const response = await api.post(`/appointments/${appointmentId}/payment/bank-transfer`);
        return response.data.data;
    } catch (error: any) {
        console.error('Error creating bank transfer payment:', error);
        throw error.response?.data?.message ? new Error(error.response.data.message) : error;
    }
};

/**
 * Upload payment proof for bank transfer
 */
export const uploadPaymentProof = async (paymentId: string, imageUri: string) => {
    try {
        // Create form data
        const formData = new FormData();

        // Get file extension
        const uriParts = imageUri.split('.');
        const fileExtension = uriParts[uriParts.length - 1];

        // Append file to form data
        formData.append('proof_image', {
            uri: imageUri,
            name: `payment-proof-${Date.now()}.${fileExtension}`,
            type: `image/${fileExtension}`,
        } as any);

        const response = await api.post(`/payments/${paymentId}/proof-file`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error: any) {
        console.error('Error uploading payment proof:', error);
        throw error.response?.data?.message ? new Error(error.response.data.message) : error;
    }
};

/**
 * Get payment by ID with full details
 */
export const getPaymentById = async (paymentId: string): Promise<any> => {
    try {
        const response = await api.get(`/payments/${paymentId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error getting payment:', error);
        throw error.response?.data?.message ? new Error(error.response.data.message) : error;
    }
};

export default {
    createPaymentInvoice,
    getPaymentStatus,
    createBankTransferPayment,
    uploadPaymentProof,
    getPaymentById,
};

