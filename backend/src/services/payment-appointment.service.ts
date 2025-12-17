import { verifyXenditSignature, parseXenditExternalId, mapXenditStatusToInternal } from '../utils/xendit';
import { updateAppointmentStatus } from './appointment.service';
import { createPayment, updatePayment, getPaymentByExternalId } from './payment.service';

interface XenditAppointmentWebhookPayload {
  id: string;
  external_id: string;
  user_id?: string;
  status: string;
  merchant_name?: string;
  amount: number;
  paid_amount?: number;
  bank_code?: string;
  paid_at?: string;
  payer_email?: string;
  description?: string;
  adjusted_received_amount?: number;
  fees_paid_amount?: number;
  updated?: string;
  created?: string;
  currency?: string;
  payment_method?: string;
  payment_channel?: string;
  payment_destination?: string;
}

export async function handleXenditAppointmentWebhook(
  payload: XenditAppointmentWebhookPayload,
  rawBody: string,
  signature: string
) {
  const {
    id,
    external_id,
    status,
    amount,
    paid_amount,
    paid_at,
  } = payload;

  // Verifikasi signature Xendit
  if (!verifyXenditSignature(rawBody, signature)) {
    throw new Error(`Invalid signature for external_id: ${external_id}`);
  }

  // Parse external_id untuk mendapatkan appointment ID
  const { type, id: appointmentId } = parseXenditExternalId(external_id);
  
  if (type !== 'appointment' || !appointmentId) {
    throw new Error(`Invalid external_id format: ${external_id}`);
  }
  
  // Cari payment berdasarkan external_id
  let payment = await getPaymentByExternalId(external_id);
  
  // Jika payment belum ada, buat baru
  if (!payment) {
    payment = await createPayment({
      payment_type: 'appointment',
      appointment_id: appointmentId,
      amount: Number(amount),
      payment_method: 'xendit',
      payment_id: id,
      external_id: external_id,
      payment_details: payload
    });
  }

  // Map status Xendit ke status internal
  const paymentStatus = mapXenditStatusToInternal(status);
  
  if (paymentStatus === 'paid') {
    // Update payment status
    await updatePayment(payment.id, {
      status: 'paid',
      payment_details: payload,
      paid_at: paid_at ? new Date(paid_at) : undefined
    });
    
    // Update status appointment
    await updateAppointmentStatus(appointmentId, { payment_status: paymentStatus });
  } else if (status.toLowerCase() === 'expired') {
    // Update payment status
    await updatePayment(payment.id, {
      status: 'expired',
      payment_details: payload
    });
    
    // Update status appointment
    await updateAppointmentStatus(appointmentId, { payment_status: 'unpaid' });
  } else if (['failed', 'cancelled'].includes(status.toLowerCase())) {
    // Update payment status
    await updatePayment(payment.id, {
      status: 'failed',
      payment_details: payload
    });
    
    // Update status appointment
    await updateAppointmentStatus(appointmentId, { payment_status: 'unpaid' });
  }

  return {
    message: 'Xendit webhook processed successfully',
    payment_id: payment.id,
    appointment_id: appointmentId,
    xendit_invoice_id: id,
    amount,
    paid_amount,
    paid_at,
    status: paymentStatus,
  };
}
