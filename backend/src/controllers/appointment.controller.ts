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
      data = await appointmentRepo.find({ where: { patient: { id: user.id } } });
    } else if (user.role === 'optometris') {
      data = await appointmentRepo.find({ where: { optometrist: { id: user.id } } });
    } else {
      data = await appointmentRepo.find();
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
      list = await repo.find({ where: { patient: { id: user.id } } });
    } else if (user.role === 'optometris') {
      list = await repo.find({ where: { optometrist: { id: user.id } } });
    }

    const upcoming = list
      .filter(a => a.status !== 'cancelled' && a.status !== 'completed')
      .sort((a, b) => {
        const ad = new Date(`${a.date}T${a.start_time}`);
        const bd = new Date(`${b.date}T${b.start_time}`);
        return ad.getTime() - bd.getTime();
      });

    return res.json(upcoming[0] || null);
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

    appointment.status = status;
    await appointmentRepo.save(appointment);

    return res.json(appointment);
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

    return res.json(appointment);
  } catch (err) {
    console.error('Error rescheduleAppointment:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
