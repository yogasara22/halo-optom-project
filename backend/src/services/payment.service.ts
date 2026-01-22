import { AppDataSource } from '../config/ormconfig';
import { Payment, PaymentStatus, PaymentType } from '../entities/Payment';
import { Order } from '../entities/Order';
import { Appointment } from '../entities/Appointment';
import { verifyXenditSignature, parseXenditExternalId } from '../utils/xendit';
import { updateOrderStatus } from './order.service';
import { updateAppointmentStatus } from './appointment.service';

// Interface untuk payload webhook dari Xendit
interface XenditWebhookPayload {
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

// Interface untuk membuat payment baru
interface CreatePaymentData {
  payment_type: PaymentType;
  order_id?: string;
  appointment_id?: string;
  amount: number;
  payment_method?: 'xendit' | 'manual' | 'other';
  payment_id?: string;
  external_id?: string;
  payment_details?: any;
}

// Interface untuk update payment
interface UpdatePaymentData {
  status?: PaymentStatus;
  payment_id?: string;
  payment_details?: any;
  paid_at?: Date;
}

// Interface untuk create bank transfer payment
interface CreateBankTransferPaymentDto {
  payment_type: 'order' | 'appointment';
  order_id?: string;
  appointment_id?: string;
  amount: number;
}

/**
 * Membuat payment baru
 */
export const createPayment = async (data: CreatePaymentData): Promise<Payment> => {
  const paymentRepo = AppDataSource.getRepository(Payment);

  // Validasi data
  if (data.payment_type === 'order' && !data.order_id) {
    throw new Error('order_id diperlukan untuk payment_type order');
  }

  if (data.payment_type === 'appointment' && !data.appointment_id) {
    throw new Error('appointment_id diperlukan untuk payment_type appointment');
  }

  // Buat payment baru
  const payment = paymentRepo.create({
    payment_type: data.payment_type,
    order_id: data.order_id,
    appointment_id: data.appointment_id,
    amount: data.amount,
    payment_method: data.payment_method || 'xendit',
    payment_id: data.payment_id,
    external_id: data.external_id,
    payment_details: data.payment_details,
    status: 'pending'
  });

  // Simpan payment
  await paymentRepo.save(payment);

  return payment;
};

/**
 * Mendapatkan payment berdasarkan ID
 */
export const getPaymentById = async (id: string): Promise<Payment | null> => {
  const paymentRepo = AppDataSource.getRepository(Payment);
  return paymentRepo.findOne({
    where: { id },
    relations: ['order', 'appointment']
  });
};



/**
 * Mendapatkan semua payment dengan filter dan pagination
 */
export const getAllPayments = async (page: number = 1, limit: number = 10, filter?: any): Promise<{ data: Payment[], total: number, totalPages: number }> => {
  const paymentRepo = AppDataSource.getRepository(Payment);

  // Buat query builder
  const queryBuilder = paymentRepo.createQueryBuilder('payment')
    .leftJoinAndSelect('payment.order', 'order')
    .leftJoinAndSelect('payment.appointment', 'appointment');

  // Terapkan filter jika ada
  if (filter) {
    if (filter.status) {
      queryBuilder.andWhere('payment.status = :status', { status: filter.status });
    }

    if (filter.payment_type) {
      queryBuilder.andWhere('payment.payment_type = :paymentType', { paymentType: filter.payment_type });
    }

    if (filter.payment_method) {
      queryBuilder.andWhere('payment.payment_method = :paymentMethod', { paymentMethod: filter.payment_method });
    }

    if (filter.search) {
      queryBuilder.andWhere(
        '(payment.id LIKE :search OR payment.external_id LIKE :search OR payment.payment_id LIKE :search)',
        { search: `%${filter.search}%` }
      );
    }

    if (filter.startDate && filter.endDate) {
      queryBuilder.andWhere(
        'payment.created_at BETWEEN :startDate AND :endDate',
        { startDate: filter.startDate, endDate: filter.endDate }
      );
    }
  }

  // Hitung total
  const total = await queryBuilder.getCount();

  // Terapkan pagination
  const payments = await queryBuilder
    .orderBy('payment.created_at', 'DESC')
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();

  return {
    data: payments,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Mendapatkan statistik payment
 */
export const getPaymentStats = async (): Promise<any> => {
  const paymentRepo = AppDataSource.getRepository(Payment);

  // Total transaksi
  const totalPayments = await paymentRepo.count();

  // Total pendapatan
  const totalRevenueResult = await paymentRepo
    .createQueryBuilder('payment')
    .where('payment.status = :status', { status: 'paid' })
    .select('SUM(payment.amount)', 'total')
    .getRawOne();
  const totalAmount = Number(totalRevenueResult?.total || 0);

  // Transaksi berdasarkan status
  const statusStats = await paymentRepo
    .createQueryBuilder('payment')
    .select('payment.status', 'status')
    .addSelect('COUNT(payment.id)', 'count')
    .addSelect('SUM(payment.amount)', 'amount')
    .groupBy('payment.status')
    .getRawMany();

  // Pendapatan bulan ini
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthlyRevenueResult = await paymentRepo
    .createQueryBuilder('payment')
    .where('payment.status = :status', { status: 'paid' })
    .andWhere('payment.paid_at >= :startDate', { startDate: firstDayOfMonth })
    .select('SUM(payment.amount)', 'total')
    .getRawOne();
  const monthlyRevenue = Number(monthlyRevenueResult?.total || 0);

  // Transaksi berdasarkan tipe
  const typeStats = await paymentRepo
    .createQueryBuilder('payment')
    .select('payment.payment_type', 'type')
    .addSelect('COUNT(payment.id)', 'count')
    .groupBy('payment.payment_type')
    .getRawMany();

  // Transaksi berdasarkan metode pembayaran
  const methodStats = await paymentRepo
    .createQueryBuilder('payment')
    .select('payment.payment_method', 'method')
    .addSelect('COUNT(payment.id)', 'count')
    .groupBy('payment.payment_method')
    .getRawMany();

  // Mendapatkan jumlah dan total amount untuk status pending
  const pendingStats = statusStats.find(stat => stat.status === 'pending') || { count: 0, amount: 0 };
  const pendingPayments = Number(pendingStats.count || 0);
  const pendingAmount = Number(pendingStats.amount || 0);

  // Mendapatkan jumlah dan total amount untuk status paid
  const paidStats = statusStats.find(stat => stat.status === 'paid') || { count: 0, amount: 0 };
  const paidPayments = Number(paidStats.count || 0);
  const paidAmount = Number(paidStats.amount || 0);

  // Mendapatkan jumlah untuk status failed
  const failedStats = statusStats.find(stat => stat.status === 'failed') || { count: 0 };
  const failedPayments = Number(failedStats.count || 0);

  return {
    totalPayments,
    totalAmount,
    pendingPayments,
    pendingAmount,
    paidPayments,
    paidAmount,
    failedPayments,
    monthlyRevenue,
    // Data tambahan untuk keperluan lain
    statusStats,
    typeStats,
    methodStats
  };
};

/**
 * Mendapatkan payment berdasarkan external_id
 */
export const getPaymentByExternalId = async (external_id: string): Promise<Payment | null> => {
  const paymentRepo = AppDataSource.getRepository(Payment);
  return paymentRepo.findOne({
    where: { external_id },
    relations: ['order', 'appointment']
  });
};

/**
 * Reject payment (Admin only)
 */
export const rejectPayment = async (
  paymentId: string,
  adminId: string,
  reason: string
): Promise<Payment> => {
  const paymentRepo = AppDataSource.getRepository(Payment);
  const appointmentRepo = AppDataSource.getRepository(Appointment);

  const payment = await paymentRepo.findOne({
    where: { id: paymentId },
    relations: ['appointment', 'order']
  });

  if (!payment) {
    throw new Error('Payment tidak ditemukan');
  }

  if (payment.status !== 'waiting_verification') {
    throw new Error('Payment tidak dalam status menunggu verifikasi');
  }

  // Update payment status menjadi rejected
  payment.status = 'rejected';
  payment.verified_by_id = adminId;
  payment.verified_at = new Date();
  payment.rejection_reason = reason;

  await paymentRepo.save(payment);

  // Cancel associated appointment if exists
  if (payment.appointment) {
    payment.appointment.status = 'cancelled';
    payment.appointment.payment_status = 'unpaid';
    await appointmentRepo.save(payment.appointment);
  }

  // Update order status if exists
  if (payment.order) {
    await updateOrderStatus(payment.order_id!, { status: 'cancelled' });
  }

  return payment;
};

/**
 * Update status payment
 */
export const updatePayment = async (id: string, data: UpdatePaymentData): Promise<Payment> => {
  const paymentRepo = AppDataSource.getRepository(Payment);
  const payment = await paymentRepo.findOneBy({ id });

  if (!payment) {
    throw new Error('Payment tidak ditemukan');
  }

  // Update payment
  Object.assign(payment, data);
  await paymentRepo.save(payment);

  // Jika status berubah menjadi paid, update status order/appointment
  if (data.status === 'paid') {
    if (payment.payment_type === 'order' && payment.order_id) {
      await updateOrderStatus(payment.order_id, { status: 'paid' });
    } else if (payment.payment_type === 'appointment' && payment.appointment_id) {
      await updateAppointmentStatus(payment.appointment_id, { payment_status: 'paid' });
    }
  }

  return payment;
};

/**
 * Handle webhook dari Xendit
 */
export const handleXenditWebhook = async (
  payload: XenditWebhookPayload,
  rawBody: string,
  signature: string
) => {
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

  // Parse external_id untuk mendapatkan tipe dan ID
  const { type, id: entityId } = parseXenditExternalId(external_id);

  if (!type || !entityId) {
    throw new Error(`Invalid external_id format: ${external_id}`);
  }

  // Cari payment berdasarkan external_id
  let payment = await getPaymentByExternalId(external_id);

  // Jika payment belum ada, buat baru
  if (!payment) {
    const paymentType: PaymentType = type === 'order' ? 'order' : 'appointment';

    payment = await createPayment({
      payment_type: paymentType,
      order_id: type === 'order' ? entityId : undefined,
      appointment_id: type === 'appointment' ? entityId : undefined,
      amount: Number(amount),
      payment_method: 'xendit',
      payment_id: id,
      external_id: external_id,
      payment_details: payload
    });
  }

  // Map status Xendit ke status internal
  let paymentStatus: PaymentStatus = 'pending';

  if (status.toLowerCase() === 'paid') {
    paymentStatus = 'paid';
  } else if (status.toLowerCase() === 'expired') {
    paymentStatus = 'expired';
  } else if (['failed', 'cancelled'].includes(status.toLowerCase())) {
    paymentStatus = 'failed';
  }

  // Update payment
  await updatePayment(payment.id, {
    status: paymentStatus,
    payment_details: payload,
    paid_at: paid_at ? new Date(paid_at) : undefined
  });

  return {
    message: 'Xendit webhook processed successfully',
    payment_id: payment.id,
    entity_id: entityId,
    entity_type: type,
    payment_status: paymentStatus,
    xendit_invoice_id: id,
    amount,
    paid_amount,
    paid_at,
  };
};

/**
 * Create bank transfer payment
 */
export const createBankTransferPayment = async (data: CreateBankTransferPaymentDto) => {
  const paymentRepo = AppDataSource.getRepository(Payment);
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const orderRepo = AppDataSource.getRepository(Order);

  let appointment = null;
  let order = null;

  // Find appointment or order
  if (data.appointment_id) {
    appointment = await appointmentRepo.findOne({ where: { id: data.appointment_id } });
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Check for existing payments for this appointment
    const existingPayments = await paymentRepo.find({
      where: { appointment_id: data.appointment_id },
    });

    // Cancel any rejected or expired payments
    for (const existingPayment of existingPayments) {
      if (existingPayment.status === 'rejected' || existingPayment.status === 'expired') {
        await paymentRepo.remove(existingPayment);
      } else if (existingPayment.status === 'pending' || existingPayment.status === 'waiting_verification') {
        // If there's a pending payment, don't create a new one
        throw new Error('There is already a pending payment for this appointment');
      }
    }
  }

  if (data.order_id) {
    order = await orderRepo.findOne({ where: { id: data.order_id } });
    if (!order) {
      throw new Error('Order not found');
    }

    // Similar check for orders
    const existingPayments = await paymentRepo.find({
      where: { order_id: data.order_id },
    });

    for (const existingPayment of existingPayments) {
      if (existingPayment.status === 'rejected' || existingPayment.status === 'expired') {
        await paymentRepo.remove(existingPayment);
      } else if (existingPayment.status === 'pending' || existingPayment.status === 'waiting_verification') {
        throw new Error('There is already a pending payment for this order');
      }
    }
  }

  // Calculate deadline (24 hours from now)
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 24);

  // Generate 3-digit unique code (1-999)
  const uniqueCode = Math.floor(Math.random() * 999) + 1;
  const originalAmount = Number(data.amount);
  const totalAmount = originalAmount + uniqueCode;

  // Create payment
  const payment = paymentRepo.create({
    payment_type: data.payment_type,
    payment_method: 'bank_transfer',
    amount: totalAmount,
    status: 'pending',
    payment_deadline: deadline,
    appointment_id: data.appointment_id,
    order_id: data.order_id,
    payment_details: {
      original_amount: originalAmount,
      unique_code: uniqueCode
    }
  });

  await paymentRepo.save(payment);

  // Update appointment/order payment status
  if (appointment) {
    // Keep payment_status as unpaid until payment is verified
    appointment.payment_status = 'unpaid';
    appointment.status = 'pending';
    await appointmentRepo.save(appointment);
  }

  return payment;
};

/**
 * Upload payment proof for bank transfer
 */
export const uploadPaymentProof = async (paymentId: string, proofUrl: string): Promise<Payment> => {
  const paymentRepo = AppDataSource.getRepository(Payment);
  const payment = await paymentRepo.findOneBy({ id: paymentId });

  if (!payment) {
    throw new Error('Payment tidak ditemukan');
  }

  if (payment.payment_method !== 'bank_transfer') {
    throw new Error('Upload bukti pembayaran hanya untuk metode bank transfer');
  }

  // Check if deadline has passed
  if (payment.payment_deadline && new Date() > payment.payment_deadline) {
    throw new Error('Payment sudah expired');
  }

  // Update payment dengan bukti pembayaran
  payment.payment_proof_url = proofUrl;
  payment.status = 'waiting_verification';

  await paymentRepo.save(payment);

  return payment;
};

/**
 * Verify payment (Admin only)
 */
export const verifyPayment = async (
  paymentId: string,
  adminId: string
): Promise<Payment> => {
  const paymentRepo = AppDataSource.getRepository(Payment);
  const appointmentRepo = AppDataSource.getRepository(Appointment);

  const payment = await paymentRepo.findOne({
    where: { id: paymentId },
    relations: ['appointment', 'order', 'appointment.patient', 'order.patient']
  });

  if (!payment) {
    throw new Error('Payment tidak ditemukan');
  }

  if (payment.status !== 'waiting_verification') {
    throw new Error('Payment tidak dalam status menunggu verifikasi');
  }

  // Update payment status menjadi verified/paid
  payment.status = 'paid';
  payment.verified_by_id = adminId;
  payment.verified_at = new Date();
  payment.paid_at = new Date();

  await paymentRepo.save(payment);

  // Update associated appointment if exists
  if (payment.appointment) {
    // Gunakan updateAppointmentStatus agar logic komisi berjalan
    await updateAppointmentStatus(payment.appointment.id, {
      payment_status: 'paid'
    });
  }

  // Update order status if exists
  if (payment.order) {
    await updateOrderStatus(payment.order_id!, { status: 'paid' });
  }

  return payment;
};

/**
 * Get pending bank transfer payments (Admin only)
 */
export const getPendingBankTransferPayments = async (): Promise<Payment[]> => {
  const paymentRepo = AppDataSource.getRepository(Payment);

  const payments = await paymentRepo.find({
    where: {
      payment_method: 'bank_transfer',
      status: 'waiting_verification'
    },
    relations: ['appointment', 'order', 'appointment.patient', 'appointment.optometrist'],
    order: {
      created_at: 'DESC'
    }
  });

  return payments;
};