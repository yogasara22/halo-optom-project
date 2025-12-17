import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User, UserRole } from '../entities/User';
import { Schedule } from '../entities/Schedule';
import { Review } from '../entities/Review';

const mapSchedule = (s: Schedule) => ({
  day: s.day_of_week,
  time: `${s.start_time?.slice(0, 5)} - ${s.end_time?.slice(0, 5)}`,
});

export const getOptometrists = async (_req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const schedRepo = AppDataSource.getRepository(Schedule);
    const optometrists = await userRepo.find({ where: { role: UserRole.Optometris, is_verified: true } });

    const results = await Promise.all(optometrists.map(async (u) => {
      const schedules = await schedRepo.find({ where: { optometrist: { id: u.id }, is_active: true } });
      return {
        id: u.id,
        name: u.name,
        photo: u.avatar_url,
        rating: u.rating || 0,
        experience: u.experience || '',
        schedule: schedules.map(mapSchedule),
        specialization: undefined,
        education: undefined,
        about: u.bio || '',
        price: undefined,
      };
    }));

    return res.json({ data: results });
  } catch (err) {
    console.error('getOptometrists error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOptometristById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepo = AppDataSource.getRepository(User);
    const schedRepo = AppDataSource.getRepository(Schedule);
    const u = await userRepo.findOne({ where: { id, role: UserRole.Optometris } });
    if (!u) return res.status(404).json({ message: 'Optometris tidak ditemukan' });
    const reviews = await AppDataSource.getRepository(Review).find({ where: { optometrist: { id } } });
    const calculatedRating = reviews.length > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : 0;

    const schedules = await schedRepo.find({ where: { optometrist: { id }, is_active: true } });

    const result = {
      id: u.id,
      name: u.name,
      photo: u.avatar_url,
      rating: calculatedRating, // Use calculated rating
      experience: u.experience || '',
      schedule: schedules.map(mapSchedule),
      specialization: undefined,
      education: undefined,
      about: u.bio || '',
      bio: u.bio || '',
      certifications: u.certifications || '',
      str_number: u.str_number || '',
      price: undefined,
    };
    return res.json({ data: result });
  } catch (err) {
    console.error('getOptometristById error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFeaturedOptometrists = async (_req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const schedRepo = AppDataSource.getRepository(Schedule);
    const optometrists = await userRepo.find({ where: { role: UserRole.Optometris, is_verified: true } });
    const sorted = optometrists.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
    const results = await Promise.all(sorted.map(async (u) => {
      const schedules = await schedRepo.find({ where: { optometrist: { id: u.id }, is_active: true } });
      return {
        id: u.id,
        name: u.name,
        photo: u.avatar_url,
        rating: u.rating || 0,
        experience: u.experience || '',
        schedule: schedules.map(mapSchedule),
      };
    }));
    return res.json({ data: results });
  } catch (err) {
    console.error('getFeaturedOptometrists error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const toDay = (date: string) => {
  const d = new Date(date);
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()] as any;
};

export const getAvailableSchedules = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query as any;
    const schedRepo = AppDataSource.getRepository(Schedule);
    const day = date ? toDay(String(date)) : undefined;
    const where: any = { optometrist: { id }, is_active: true };
    if (day) where.day_of_week = day;
    const schedules = await schedRepo.find({ where });
    const data = schedules.map(s => ({ time: `${s.start_time?.slice(0, 5)} - ${s.end_time?.slice(0, 5)}`, available: true }));
    return res.json({ data });
  } catch (err) {
    console.error('getAvailableSchedules error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

