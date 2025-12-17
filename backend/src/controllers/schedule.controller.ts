import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Schedule } from '../entities/Schedule';
import { User, UserRole } from '../entities/User';

// Fungsi helper untuk cek overlap
const isScheduleOverlap = (
  existingSchedules: Schedule[],
  day_of_week: string,
  start_time: string,
  end_time: string,
  excludeId?: string
) => {
  return existingSchedules.some((existing) => {
    if (existing.day_of_week !== day_of_week) return false;
    if (excludeId && existing.id === excludeId) return false;

    return (
      start_time < existing.end_time &&
      end_time > existing.start_time
    );
  });
};

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const { optometrist_id, day_of_week, start_time, end_time, is_active } = req.body;
    const user = (req as any).user as User;

    // Tentukan optometrist yang akan dibuatkan jadwal
    let targetOptometrist: User;
    
    if (user.role === UserRole.Admin) {
      // Admin bisa membuat jadwal untuk optometris lain
      if (!optometrist_id) {
        return res.status(400).json({ message: 'optometrist_id harus diisi untuk admin' });
      }
      
      const userRepo = AppDataSource.getRepository(User);
      const optometrist = await userRepo.findOne({
        where: { id: optometrist_id, role: UserRole.Optometris }
      });
      
      if (!optometrist) {
        return res.status(404).json({ message: 'Optometris tidak ditemukan' });
      }
      
      targetOptometrist = optometrist;
    } else if (user.role === UserRole.Optometris) {
      // Optometris hanya bisa membuat jadwal untuk dirinya sendiri
      targetOptometrist = user;
    } else {
      return res.status(403).json({ message: 'Hanya admin dan optometris yang bisa membuat jadwal' });
    }

    if (start_time >= end_time) {
      return res.status(400).json({ message: 'Jam mulai harus lebih awal dari jam selesai' });
    }

    const scheduleRepo = AppDataSource.getRepository(Schedule);

    const existingSchedules = await scheduleRepo.find({
      where: { optometrist: { id: targetOptometrist.id } }
    });

    if (isScheduleOverlap(existingSchedules, day_of_week, start_time, end_time)) {
      return res.status(400).json({
        message: `Jadwal untuk ${day_of_week} ${start_time} - ${end_time} bentrok dengan jadwal yang sudah ada`
      });
    }

    const schedule = scheduleRepo.create({
      day_of_week,
      start_time,
      end_time,
      is_active: is_active ?? true,
      optometrist: targetOptometrist
    });

    await scheduleRepo.save(schedule);

    return res.status(201).json(schedule);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const { optometrist_id, day_of_week } = req.query;
    const scheduleRepo = AppDataSource.getRepository(Schedule);

    const whereClause: any = {};
    if (optometrist_id) whereClause.optometrist = { id: optometrist_id };
    if (day_of_week) whereClause.day_of_week = day_of_week;

    const schedules = await scheduleRepo.find({
      where: whereClause,
      relations: ['optometrist']
    });

    return res.json(schedules);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const scheduleRepo = AppDataSource.getRepository(Schedule);

    const schedule = await scheduleRepo.findOne({
      where: { id },
      relations: ['optometrist']
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }

    return res.json(schedule);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { day_of_week, start_time, end_time, is_active } = req.body;
    const { id } = req.params;
    const user = (req as any).user as User;

    const scheduleRepo = AppDataSource.getRepository(Schedule);
    const schedule = await scheduleRepo.findOne({
      where: { id: id },
      relations: ['optometrist']
    });

    if (!schedule) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    
    // Admin dapat mengubah jadwal siapa saja, optometris hanya bisa mengubah jadwal sendiri
    if (user.role !== UserRole.Admin && schedule.optometrist.id !== user.id) {
      return res.status(403).json({ message: 'Tidak bisa mengubah jadwal orang lain' });
    }

    const newStart = start_time ?? schedule.start_time;
    const newEnd = end_time ?? schedule.end_time;
    const newDay = day_of_week ?? schedule.day_of_week;

    if (newStart >= newEnd) {
      return res.status(400).json({ message: 'Jam mulai harus lebih awal dari jam selesai' });
    }

    const existingSchedules = await scheduleRepo.find({
      where: { optometrist: { id: schedule.optometrist.id } }
    });

    if (isScheduleOverlap(existingSchedules, newDay, newStart, newEnd, schedule.id)) {
      return res.status(400).json({
        message: `Jadwal untuk ${newDay} ${newStart} - ${newEnd} bentrok dengan jadwal yang sudah ada`
      });
    }

    schedule.day_of_week = newDay;
    schedule.start_time = newStart;
    schedule.end_time = newEnd;
    schedule.is_active = is_active ?? schedule.is_active;

    await scheduleRepo.save(schedule);

    return res.json(schedule);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user as User;

    const scheduleRepo = AppDataSource.getRepository(Schedule);
    const schedule = await scheduleRepo.findOne({
      where: { id },
      relations: ['optometrist']
    });

    if (!schedule) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    
    // Admin dapat menghapus jadwal siapa saja, optometris hanya bisa menghapus jadwal sendiri
    if (user.role !== UserRole.Admin && schedule.optometrist.id !== user.id) {
      return res.status(403).json({ message: 'Tidak bisa menghapus jadwal orang lain' });
    }

    await scheduleRepo.remove(schedule);
    return res.json({ message: 'Jadwal berhasil dihapus' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const bulkCreateSchedules = async (req: Request, res: Response) => {
  try {
    const { optometrist_id, schedules } = req.body;
    const user = (req as any).user as User;

    // Tentukan optometrist yang akan dibuatkan jadwal
    let targetOptometrist: User;
    
    if (user.role === UserRole.Admin) {
      // Admin bisa membuat jadwal untuk optometris lain
      if (!optometrist_id) {
        return res.status(400).json({ message: 'optometrist_id harus diisi untuk admin' });
      }
      
      const userRepo = AppDataSource.getRepository(User);
      const optometrist = await userRepo.findOne({
        where: { id: optometrist_id, role: UserRole.Optometris }
      });
      
      if (!optometrist) {
        return res.status(404).json({ message: 'Optometris tidak ditemukan' });
      }
      
      targetOptometrist = optometrist;
    } else if (user.role === UserRole.Optometris) {
      // Optometris hanya bisa membuat jadwal untuk dirinya sendiri
      targetOptometrist = user;
    } else {
      return res.status(403).json({ message: 'Hanya admin dan optometris yang bisa membuat jadwal' });
    }

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ message: 'Data schedules tidak valid' });
    }

    const scheduleRepo = AppDataSource.getRepository(Schedule);
    const existingSchedules = await scheduleRepo.find({
      where: { optometrist: { id: targetOptometrist.id } }
    });

    for (const newItem of schedules) {
      const { day_of_week, start_time, end_time } = newItem;

      if (start_time >= end_time) {
        return res.status(400).json({
          message: `Jam mulai harus lebih awal dari jam selesai: ${day_of_week} ${start_time} - ${end_time}`
        });
      }

      if (isScheduleOverlap(existingSchedules, day_of_week, start_time, end_time)) {
        return res.status(400).json({
          message: `Jadwal untuk ${day_of_week} ${start_time} - ${end_time} bentrok dengan jadwal yang sudah ada`
        });
      }
    }

    const newSchedules = schedules.map((item) =>
      scheduleRepo.create({
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
        is_active: item.is_active ?? true,
        optometrist: targetOptometrist
      })
    );

    await scheduleRepo.save(newSchedules);

    return res.status(201).json({
      message: 'Jadwal mingguan berhasil dibuat',
      schedules: newSchedules
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
