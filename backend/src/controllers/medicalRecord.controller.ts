import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { MedicalRecord } from '../entities/MedicalRecord';
import { Appointment } from '../entities/Appointment';
import { User, UserRole } from '../entities/User';

export const createMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { appointment_id, diagnosis, prescription, notes, attachments } = req.body;
    const user = (req as any).user as User;

    if (user.role !== UserRole.Optometris) {
      return res.status(403).json({ message: 'Hanya optometris yang bisa membuat catatan medis' });
    }

    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const appointment = await appointmentRepo.findOne({
      where: { id: String(appointment_id) },
      relations: ['optometrist', 'patient']
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment tidak ditemukan' });
    }

    if (appointment.optometrist.id !== user.id) {
      return res.status(403).json({ message: 'Tidak bisa membuat catatan medis untuk pasien orang lain' });
    }

    // Cek apakah sudah ada record untuk appointment ini
    const medicalRecordRepo = AppDataSource.getRepository(MedicalRecord);
    const existing = await medicalRecordRepo.findOne({
      where: { appointment: { id: String(appointment_id) } }
    });
    if (existing) {
      return res.status(400).json({ message: 'Catatan medis untuk appointment ini sudah ada' });
    }

    const record = medicalRecordRepo.create({
      appointment,
      patient: appointment.patient,
      optometrist: appointment.optometrist,
      diagnosis,
      prescription,
      notes,
      attachments
    });

    await medicalRecordRepo.save(record);
    return res.status(201).json(record);
  } catch (err) {
    console.error('createMedicalRecord error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMedicalRecordsByPatient = async (req: Request, res: Response) => {
  try {
    const { patient_id } = req.params;
    const user = (req as any).user as User;

    if (user.role !== UserRole.Admin && user.id !== String(patient_id)) {
      return res.status(403).json({ message: 'Tidak diizinkan melihat catatan medis orang lain' });
    }

    const medicalRecordRepo = AppDataSource.getRepository(MedicalRecord);
    const records = await medicalRecordRepo.find({
      where: { patient: { id: String(patient_id) } },
      order: { created_at: 'DESC' }
    });

    return res.json(records);
  } catch (err) {
    console.error('getMedicalRecordsByPatient error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMedicalRecordDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user as User;

    const medicalRecordRepo = AppDataSource.getRepository(MedicalRecord);
    const record = await medicalRecordRepo.findOne({
      where: { id: String(id) }
    });

    if (!record) {
      return res.status(404).json({ message: 'Catatan medis tidak ditemukan' });
    }

    if (
      user.role !== UserRole.Admin &&
      user.id !== record.patient.id &&
      user.id !== record.optometrist.id
    ) {
      return res.status(403).json({ message: 'Tidak diizinkan melihat catatan medis ini' });
    }

    return res.json(record);
  } catch (err) {
    console.error('getMedicalRecordDetail error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
