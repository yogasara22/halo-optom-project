import { verifyXenditSignature, parseXenditExternalId, mapXenditStatusToInternal } from '../utils/xendit';
import { updateOrderStatus } from './order.service';
import { OrderStatus } from '../entities/Order';
import { createPayment, updatePayment, getPaymentByExternalId } from './payment.service';

interface XenditOrderWebhookPayload {
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

export async function handleXenditOrderWebhook(
  payload: XenditOrderWebhookPayload,
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

  // Parse external_id untuk mendapatkan order ID
  const { type, id: orderId } = parseXenditExternalId(external_id);
  
  if (type !== 'order' || !orderId) {
    throw new Error(`Invalid external_id format: ${external_id}`);
  }
  
  // Cari payment berdasarkan external_id
  let payment = await getPaymentByExternalId(external_id);
  
  // Jika payment belum ada, buat baru
  if (!payment) {
    payment = await createPayment({
      payment_type: 'order',
      order_id: orderId,
      amount: Number(amount),
      payment_method: 'xendit',
      payment_id: id,
      external_id: external_id,
      payment_details: payload
    });
  }

  // Map status Xendit ke OrderStatus
  let orderStatus: OrderStatus = 'pending';
  const paymentStatus = mapXenditStatusToInternal(status);
  
  if (paymentStatus === 'paid') {
    orderStatus = 'paid';
    
    // Update payment status
    await updatePayment(payment.id, {
      status: 'paid',
      payment_details: payload,
      paid_at: paid_at ? new Date(paid_at) : undefined
    });
    
    // Update status order
    await updateOrderStatus(orderId, { status: orderStatus });
  } else if (status.toLowerCase() === 'expired') {
    // Update payment status
    await updatePayment(payment.id, {
      status: 'expired',
      payment_details: payload
    });
  } else if (['failed', 'cancelled'].includes(status.toLowerCase())) {
    // Update payment status
    await updatePayment(payment.id, {
      status: 'failed',
      payment_details: payload
    });
  }

  return {
    message: 'Xendit webhook processed successfully',
    payment_id: payment.id,
    order_id: orderId,
    xendit_invoice_id: id,
    amount,
    paid_amount,
    paid_at,
    status: orderStatus,
  };
}
