// src/services/appointment.service.ts
import { AppDataSource } from '../config/ormconfig';
import { Appointment } from '../entities/Appointment';
import { createVideoSdkRoom } from './videosdk.service';

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
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  let shouldCreateRoom = false;

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
  }

  // Update field yang dikirim
  Object.assign(appointment, payload);
  await appointmentRepo.save(appointment);

  // Buat room jika diperlukan
  if (shouldCreateRoom) {
    const room = await createVideoSdkRoom();
    appointment.video_room_id = room.roomId || room.id;
    await appointmentRepo.save(appointment);
  }

  return appointment;
}
