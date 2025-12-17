import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Review } from '../entities/Review';
import { User, UserRole } from '../entities/User';

export const createReview = async (req: Request, res: Response) => {
  try {
    const { optometrist_id, rating, comment } = req.body;
    const patient = (req as any).user as User;

    if (patient.id === optometrist_id) {
      return res.status(400).json({ message: 'Anda tidak bisa mereview diri sendiri' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const optometrist = await userRepo.findOne({ where: { id: optometrist_id } });
    if (!optometrist) {
      return res.status(404).json({ message: 'Optometris tidak ditemukan' });
    }
    if (optometrist.role !== UserRole.Optometris) {
      return res.status(400).json({ message: 'Hanya optometris yang bisa direview' });
    }

    const reviewRepo = AppDataSource.getRepository(Review);

    // Cek apakah pasien sudah pernah mereview optometris ini
    let review = await reviewRepo.findOne({
      where: { patient: { id: patient.id }, optometrist: { id: optometrist_id } }
    });

    if (review) {
      // update review
      review.rating = rating;
      review.comment = comment;
    } else {
      // buat review baru
      review = reviewRepo.create({
        patient,
        optometrist,
        rating,
        comment
      });
    }

    await reviewRepo.save(review);
    return res.status(201).json({ data: review });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReviewsForOptometrist = async (req: Request, res: Response) => {
  try {
    const { optometrist_id } = req.params;

    if (!optometrist_id || optometrist_id === 'undefined') {
      return res.status(400).json({ message: 'Invalid optometrist ID' });
    }

    const reviews = await AppDataSource.getRepository(Review).find({
      where: { optometrist: { id: optometrist_id } },
      order: { created_at: 'DESC' },
      relations: ['patient', 'optometrist'] // Ensure relations are loaded
    });

    // Map patient to user for frontend compatibility if needed
    const data = reviews.map(r => ({
      ...r,
      user: r.patient // Alias patient to user
    }));

    return res.json({ data });
  } catch (err) {
    console.error('getReviewsForOptometrist error:', err);
    return res.status(500).json({ message: 'Internal server error', error: String(err) });
  }
};

export const getMyReviews = async (req: Request, res: Response) => {
  try {
    const patient = (req as any).user as User;

    const reviews = await AppDataSource.getRepository(Review).find({
      where: { patient: { id: patient.id } },
      order: { created_at: 'DESC' }
    });

    // Map patient to user
    const data = reviews.map(r => ({ ...r, user: r.patient }));
    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = (req as any).user as User;

    const reviewRepo = AppDataSource.getRepository(Review);
    const review = await reviewRepo.findOne({ where: { id } });

    if (!review) {
      return res.status(404).json({ message: 'Review tidak ditemukan' });
    }

    if (review.patient.id !== patient.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menghapus review ini' });
    }

    await reviewRepo.remove(review);
    return res.json({ message: 'Review berhasil dihapus' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
