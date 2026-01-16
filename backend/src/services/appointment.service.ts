// src/services/appointment.service.ts
import { AppDataSource } from '../config/ormconfig';
import { Appointment } from '../entities/Appointment';
import { createVideoSdkRoom } from './videosdk.service';
import { Invoice } from '../config/xendit';
import logger from '../utils/logger';

interface UpdateAppointmentStatusPayload {
  status?: Appointment['status'];
  payment_status?: Appointment['payment_status'];
}

export async function updateAppointmentStatus(
  appointmentId: string,
  payload: UpdateAppointmentStatusPayload
) {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const appointment = await appointmentRepo.findOne({
    where: { id: appointmentId },
    relations: ['patient', 'optometrist'],
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  let shouldCreateRoom = false;
  let shouldCreateChatRoom = false;

  // Cek perubahan payment_status
  if (
    payload.payment_status &&
    payload.payment_status === 'paid' &&
    appointment.payment_status !== 'paid'
  ) {
    // Hitung komisi optometris untuk appointment konsultasi
    const basePrice = Number(appointment.price || 0);
    const percentage = Number(appointment.commission_percentage || 0);
    if (basePrice > 0 && percentage > 0) {
      const amount = Number(((basePrice * percentage) / 100).toFixed(2));
      appointment.commission_amount = amount as any;
      appointment.commission_calculated_at = new Date();
    }
    // Jika metode video → bikin room
    if (appointment.method === 'video' && !appointment.video_room_id) {
      shouldCreateRoom = true;
    }
    // Jika metode chat → bikin chat room
    if (appointment.method === 'chat' && !appointment.chat_room_id) {
      shouldCreateChatRoom = true;
    }
  }

  // Update field yang dikirim
  Object.assign(appointment, payload);
  await appointmentRepo.save(appointment);

  // Buat video room jika diperlukan
  if (shouldCreateRoom) {
    const room = await createVideoSdkRoom();
    appointment.video_room_id = room.roomId || room.id;
    await appointmentRepo.save(appointment);
  }

  // Buat chat room jika diperlukan
  if (shouldCreateChatRoom) {
    const chatRoomId = await createAppointmentChatRoom(appointmentId);
    appointment.chat_room_id = chatRoomId;
    await appointmentRepo.save(appointment);
  }

  return appointment;
}

/**
 * Generate external_id untuk Xendit invoice
 */
export function generateAppointmentExternalId(appointmentId: string): string {
  return `appointment-${appointmentId}`;
}

/**
 * Create chat room untuk appointment
 */
export async function createAppointmentChatRoom(appointmentId: string): Promise<string> {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const appointment = await appointmentRepo.findOne({
    where: { id: appointmentId },
    relations: ['patient', 'optometrist'],
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (!appointment.patient || !appointment.optometrist) {
    throw new Error('Appointment must have both patient and optometrist');
  }

  // Create chat room
  const ChatRoom = require('../entities/ChatRoom').ChatRoom;
  const chatRoomRepo = AppDataSource.getRepository(ChatRoom);

  const chatRoom = chatRoomRepo.create({
    appointment_id: appointmentId,
    participants: [appointment.patient, appointment.optometrist],
  });

  await chatRoomRepo.save(chatRoom);
  logger.info(`Chat room created for appointment ${appointmentId}: ${chatRoom.id}`);

  return chatRoom.id;
}

/**
 * Create Xendit payment invoice untuk appointment
 */
export async function createAppointmentPaymentInvoice(appointmentId: string) {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const appointment = await appointmentRepo.findOne({
    where: { id: appointmentId },
    relations: ['patient', 'optometrist'],
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (!appointment.price || Number(appointment.price) <= 0) {
    throw new Error('Appointment price is not set');
  }

  // Generate external_id
  const externalId = generateAppointmentExternalId(appointmentId);

  // Buat invoice description
  let description = `Pembayaran ${appointment.type === 'homecare' ? 'Homecare' : 'Konsultasi Online'}`;
  if (appointment.method) {
    description += ` (${appointment.method === 'video' ? 'Video' : 'Chat'})`;
  }
  description += ` - ${appointment.optometrist?.name || 'Optometrist'}`;

  try {
    // Note: Xendit Invoice callback URL dikonfigurasi di Xendit Dashboard, bukan di API call
    // Pastikan webhook URL sudah diset di https://dashboard.xendit.co/settings/notifications
    const callbackUrl = process.env.XENDIT_CALLBACK_URL ||
      `${process.env.API_BASE_URL || 'http://localhost:4000'}/api/payments/xendit/callback`;

    logger.info(`Creating Xendit invoice for appointment ${appointmentId}`);
    logger.info(`Expected webhook callback URL: ${callbackUrl}`);
    logger.info(`Make sure this URL is configured in Xendit Dashboard > Settings > Webhooks`);

    // Create Xendit invoice
    const xenditInvoice = await Invoice.createInvoice({
      data: {
        externalId,
        amount: Number(appointment.price),
        payerEmail: appointment.patient?.email || 'patient@halooptom.com',
        description,
        invoiceDuration: 86400, // 24 jam
        currency: 'IDR',
        reminderTime: 1,
        successRedirectUrl: process.env.PAYMENT_SUCCESS_URL || 'halooptom://payment/success',
        failureRedirectUrl: process.env.PAYMENT_FAILURE_URL || 'halooptom://payment/failed',
      }
    });

    logger.info(`Xendit invoice created for appointment ${appointmentId}: ${xenditInvoice.id}`);

    return {
      invoice_id: xenditInvoice.id,
      external_id: externalId,
      invoice_url: xenditInvoice.invoiceUrl,
      expiry_date: xenditInvoice.expiryDate,
      amount: xenditInvoice.amount,
      status: xenditInvoice.status,
      appointment,
    };
  } catch (error: any) {
    logger.error(`Error creating Xendit invoice for appointment ${appointmentId}:`, error);
    throw new Error(`Failed to create payment invoice: ${error.message}`);
  }
}
