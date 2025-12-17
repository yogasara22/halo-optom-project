import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/User';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user as User;

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa mengakses.' });
  }

  next();
};
