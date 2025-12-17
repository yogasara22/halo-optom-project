import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Notification, NotificationType } from '../entities/Notification';
import { User } from '../entities/User';

/**
 * Membuat notifikasi untuk user tertentu
 */
export const createNotification = async (
  userId: string, // UUID string
  title: string,
  body: string,
  type?: NotificationType,
  meta?: any
) => {
  try {
    const notificationRepo = AppDataSource.getRepository(Notification);
    const notification = notificationRepo.create({
      user: { id: userId } as User,
      title,
      body,
      type,
      meta,
      is_read: false
    });
    await notificationRepo.save(notification);
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
};

/**
 * Mengambil semua notifikasi milik user yang login
 */
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    if (!user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const notificationRepo = AppDataSource.getRepository(Notification);
    const notifications = await notificationRepo.find({
      where: { user: { id: user.id } },
      order: { created_at: 'DESC' }
    });

    return res.json(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Menandai notifikasi sebagai sudah dibaca
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // UUID string
    const user = (req as any).user as User;
    if (!user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const notificationRepo = AppDataSource.getRepository(Notification);
    const notification = await notificationRepo.findOne({
      where: { id, user: { id: user.id } }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }

    notification.is_read = true;
    await notificationRepo.save(notification);

    return res.json({ message: 'Notifikasi ditandai sebagai sudah dibaca' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
