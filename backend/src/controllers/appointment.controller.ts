// src/controllers/appointment.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Appointment } from '../entities/Appointment';
import { User } from '../entities/User';

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { optometrist_id, type, method, date, start_time, location } = req.body;
    const appointmentRepo = AppDataSource.getRepository(Appointment);

    const patient = (req as any).user as User;

    const optometrist = await AppDataSource.getRepository(User).findOneBy({ id: optometrist_id });
    if (!optometrist) {
      return res.status(404).json({ message: 'Optometris tidak ditemukan' });
    }

    const defaultCommission =
      method === 'chat'
        ? optometrist.chat_commission_percentage || 0
        : method === 'video'
          ? optometrist.video_commission_percentage || 0
          : 0;

    // Tentukan harga berdasarkan ServicePricing (hanya untuk Online)
    let resolvedType: any = type === 'homecare' ? 'homecare' : 'online';
    let basePrice: number | undefined = undefined;
    if (resolvedType === 'online') {
      try {
        const pricingRepo = AppDataSource.getRepository(require('../entities/ServicePricing').ServicePricing);
        const pricing = await pricingRepo.findOne({ where: { type: 'online', method } });
        basePrice = pricing ? Number(pricing.base_price) : undefined;
      } catch { }
    }

    const appointment = appointmentRepo.create({
      patient,
      optometrist,
      type: resolvedType,
      method: resolvedType === 'homecare' ? undefined : method,
      date,
      start_time,
      location,
      price: basePrice,
      status: 'pending',
      payment_status: 'unpaid',
      commission_percentage: defaultCommission,
    });

    await appointmentRepo.save(appointment);

    // Catatan:
    // Di sini bisa langsung generate external_id untuk Xendit (optional)
    // lalu kirimkan ke frontend supaya user bisa bayar.
    // Payment webhook akan update status & bikin VideoSDK room otomatis.

    return res.status(201).json({
      message: 'Appointment berhasil dibuat. Silakan lanjutkan pembayaran.',
      appointment,
    });
  } catch (err) {
    console.error('Error createAppointment:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const appointmentRepo = AppDataSource.getRepository(Appointment);

    let data;
    if (user.role === 'pasien') {
      data = await appointmentRepo.find({
        where: { patient: { id: user.id } },
        relations: ['patient', 'optometrist', 'payment'] // Explicitly load relations to ensure avatar_url is included
      });
    } else if (user.role === 'optometris') {
      data = await appointmentRepo.find({
        where: { optometrist: { id: user.id } },
        relations: ['patient', 'optometrist', 'payment']
      });
    } else {
      data = await appointmentRepo.find({
        relations: ['patient', 'optometrist', 'payment']
      });
    }

    return res.json(data);
  } catch (err) {
    console.error('Error getAppointments:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNextAppointment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const repo = AppDataSource.getRepository(Appointment);

    let list: Appointment[] = [];
    if (user.role === 'pasien') {
      list = await repo.find({
        where: { patient: { id: user.id } },
        relations: ['patient', 'optometrist', 'payment']
      });
    } else if (user.role === 'optometris') {
      list = await repo.find({
        where: { optometrist: { id: user.id } },
        relations: ['patient', 'optometrist', 'payment']
      });
    }

    // Filter untuk menghilangkan appointment yang cancelled, completed, atau payment unpaid
    const upcoming = list
      .filter(a => {
        // Exclude cancelled, completed, and pending
        if (a.status === 'cancelled' || a.status === 'completed' || a.status === 'pending') {
          return false;
        }

        // Only show confirmed or ongoing
        if (a.status !== 'confirmed' && a.status !== 'ongoing') {
          return false;
        }

        // Only show paid appointments (payment successful)
        // Unpaid appointments should not show until payment is completed
        const paymentStatus = a.payment_status as string;
        if (paymentStatus !== 'paid') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const ad = new Date(`${a.date}T${a.start_time}`);
        const bd = new Date(`${b.date}T${b.start_time}`);
        return ad.getTime() - bd.getTime();
      });


    const nextAppointment = upcoming[0] || null;

    // Add chat room_id if it's a chat appointment
    if (nextAppointment && nextAppointment.method === 'chat' && nextAppointment.chat_room_id) {
      const response: any = {
        ...nextAppointment,
        chat: {
          room_id: nextAppointment.chat_room_id
        }
      };
      return res.json(response);
    }

    return res.json(nextAppointment);
  } catch (err) {
    console.error('Error getNextAppointment:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAppointmentCommission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { commission_percentage } = req.body as { commission_percentage: number };

    const repo = AppDataSource.getRepository(Appointment);
    const appointment = await repo.findOne({ where: { id } });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment tidak ditemukan' });
    }

    appointment.commission_percentage = Number(commission_percentage || 0);

    // Jika payment sudah paid, lakukan recalculation
    if (appointment.payment_status === 'paid') {
      const basePrice = Number(appointment.price || 0);
      const percentage = Number(appointment.commission_percentage || 0);
      appointment.commission_amount = basePrice > 0 && percentage > 0
        ? Number(((basePrice * percentage) / 100).toFixed(2)) as any
        : undefined;
      appointment.commission_calculated_at = appointment.commission_amount ? new Date() : undefined;
    }

    await repo.save(appointment);
    return res.json({ message: 'Komisi appointment diperbarui', appointment });
  } catch (err: any) {
    console.error('Error updateAppointmentCommission:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

export const createAppointmentPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { createAppointmentPaymentInvoice } = require('../services/appointment.service');

    const result = await createAppointmentPaymentInvoice(id);

    return res.status(200).json({
      message: 'Payment invoice created successfully',
      data: result,
    });
  } catch (err: any) {
    console.error('Error createAppointmentPayment:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

export const createAppointmentBankTransferPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // appointment_id
    const repo = AppDataSource.getRepository(Appointment);

    // Find appointment
    const appointment = await repo.findOne({
      where: { id },
      relations: ['patient', 'optometrist']
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Import createBankTransferPayment from payment service
    const paymentService = require('../services/payment.service');

    // Create bank transfer payment
    const payment = await paymentService.createBankTransferPayment({
      payment_type: 'appointment',
      appointment_id: id,
      amount: appointment.price,
    });

    return res.status(200).json({
      message: 'Bank transfer payment created successfully',
      data: payment,
    });
  } catch (err: any) {
    console.error('Error createAppointmentBankTransferPayment:', err);
    return res.status(500).json({
      message: err.message || 'Internal server error',
      error: err.toString()
    });
  }
};
export const getConsultationDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user as User;

    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const appointment = await appointmentRepo.findOne({
      where: { id },
      relations: ['patient', 'optometrist'],
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment tidak ditemukan' });
    }

    // Validate user is participant
    if (appointment.patient.id !== user.id && appointment.optometrist.id !== user.id) {
      return res.status(403).json({ message: 'Tidak diizinkan mengakses konsultasi ini' });
    }

    // Check payment status
    if (appointment.payment_status !== 'paid') {
      return res.status(403).json({ message: 'Appointment belum dibayar' });
    }

    const response: any = {
      appointment_id: appointment.id,
      type: appointment.type,
      method: appointment.method,
      status: appointment.status,
      patient: {
        id: appointment.patient.id,
        name: appointment.patient.name,
        avatar_url: appointment.patient.avatar_url,
      },
      optometrist: {
        id: appointment.optometrist.id,
        name: appointment.optometrist.name,
        avatar_url: appointment.optometrist.avatar_url,
      },
      date: appointment.date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
    };

    // Add video details if video consultation
    if (appointment.method === 'video' && appointment.video_room_id) {
      const { generateJoinRoomToken } = require('../services/videosdk.service');
      const token = generateJoinRoomToken(appointment.video_room_id, user.id);

      response.video = {
        room_id: appointment.video_room_id,
        token,
      };
    }

    // Add chat details if chat consultation
    if (appointment.method === 'chat' && appointment.chat_room_id) {
      response.chat = {
        room_id: appointment.chat_room_id,
      };
    }

    return res.json(response);
  } catch (err: any) {
    console.error('Error getConsultationDetails:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};



export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user as User;

    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const appointment = await appointmentRepo.findOne({
      where: { id },
      relations: ['patient', 'optometrist'],
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment tidak ditemukan' });
    }

    // Access control
    if (user.role !== 'admin' && appointment.patient.id !== user.id && appointment.optometrist.id !== user.id) {
      return res.status(403).json({ message: 'Tidak diizinkan mengakses data ini' });
    }

    return res.json(appointment);
  } catch (err) {
    console.error('Error getAppointmentById:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user as User;

    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const appointment = await appointmentRepo.findOne({
      where: { id },
      relations: ['optometrist'],
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment tidak ditemukan' });
    }

    // Only optometrist (or admin) can accept/reject
    if (user.role !== 'admin' && appointment.optometrist.id !== user.id) {
      return res.status(403).json({ message: 'Hanya optometris yang dapat mengubah status appointment' });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    await appointmentRepo.save(appointment);

    // Send notification to patient
    if (status !== oldStatus) {
      try {
        const { notificationService } = require('../services/notification.service');
        let title = '';
        let message = '';

        switch (status) {
          case 'confirmed':
            title = 'Janji Temu Disetujui';
            message = `Janji temu Anda dengan Dr. ${appointment.optometrist.name} telah disetujui.`;
            break;
          case 'completed':
            title = 'Konsultasi Selesai';
            message = `Konsultasi Anda dengan Dr. ${appointment.optometrist.name} telah selesai.`;
            break;
          case 'cancelled':
            title = 'Janji Temu Dibatalkan';
            message = `Janji temu Anda dengan Dr. ${appointment.optometrist.name} telah dibatalkan.`;
            break;
        }

        if (title && message) {
          // We need patient ID, but relation might not be loaded in previous query
          // Fetch complete appointment with patient
          const fullAppointment = await appointmentRepo.findOne({
            where: { id },
            relations: ['patient']
          });

          if (fullAppointment && fullAppointment.patient) {
            await notificationService.createNotification(
              fullAppointment.patient.id,
              title,
              message,
              'appointment',
              { appointment_id: appointment.id }
            );
          }
        }
      } catch (notifyErr) {
        console.error('Failed to send status update notification:', notifyErr);
      }
    }
  } catch (err) {
    console.error('Error updateAppointmentStatus:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const rescheduleAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, start_time } = req.body;
    const user = (req as any).user as User;
    const { notificationService } = require('../services/notification.service');

    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const appointment = await appointmentRepo.findOne({
      where: { id },
      relations: ['optometrist', 'patient'],
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment tidak ditemukan' });
    }

    // Only optometrist (or admin) can reschedule for now (simplification)
    if (user.role !== 'admin' && appointment.optometrist.id !== user.id) {
      return res.status(403).json({ message: 'Hanya optometris yang dapat menjadwalkan ulang' });
    }

    appointment.date = date;
    appointment.start_time = start_time;
    // Reset status to confirmed if it was something else? Or keep as is.
    // Usually rescheduling might require re-confirmation, but for simplicity let's just save.

    await appointmentRepo.save(appointment);

    // Notify Patient
    try {
      const formattedDate = new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      await notificationService.createNotification(
        appointment.patient.id,
        'Jadwal Janji Temu Berubah',
        `Janji temu Anda telah dijadwalkan ulang oleh optometris menjadi ${formattedDate} pukul ${start_time.slice(0, 5)} WIB.`,
        'appointment',
        { appointment_id: appointment.id }
      );
    } catch (notifyErr) {
      console.error('Failed to send notification:', notifyErr);
    }

    return res.json(appointment);
  } catch (err) {
    console.error('Error rescheduleAppointment:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Complete a consultation (optometrist only)
 * Updates appointment status to 'completed'
 */
export const completeConsultation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user as User;

    // Only optometrists can complete consultations
    if (user.role !== 'optometris') {
      return res.status(403).json({ message: 'Hanya optometris yang dapat mengakhiri konsultasi' });
    }

    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const appointment = await appointmentRepo.findOne({
      where: { id },
      relations: ['optometrist', 'patient'],
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment tidak ditemukan' });
    }

    // Verify optometrist owns this appointment
    if (appointment.optometrist.id !== user.id) {
      return res.status(403).json({ message: 'Anda  tidak dapat mengakhiri konsultasi ini' });
    }

    // Check if appointment is in appropriate status
    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Konsultasi sudah selesai' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Konsultasi sudah dibatalkan' });
    }

    // Update status to completed
    appointment.status = 'completed';
    await appointmentRepo.save(appointment);

    // Commission is now added immediately when payment is paid (in updateAppointmentStatus)
    // So we don't need to add it here again to avoid double crediting.

    return res.json({
      message: 'Konsultasi berhasil diakhiri',
      appointment: {
        id: appointment.id,
        status: appointment.status,
        patient: {
          id: appointment.patient.id,
          name: appointment.patient.name,
        },
      },
    });
  } catch (err) {
    console.error('Error completeConsultation:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


