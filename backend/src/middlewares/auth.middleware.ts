import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User } from '../entities/User';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token format' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: payload.id });
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Alias untuk konsistensi dengan nama yang digunakan di routes
// Alias untuk konsistensi dengan nama yang digunakan di routes
export const authenticateToken = authMiddleware;

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient rights' });
    }
    next();
  };
};

// Admin middleware - checks if user is admin
export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

