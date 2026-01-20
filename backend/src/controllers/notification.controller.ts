import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const customReq = req as any;
    const userId = customReq.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const offset = (page - 1) * limit;
    const result = await notificationService.getUserNotifications(userId, limit, offset);

    return res.json({
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        total_pages: Math.ceil(result.total / limit),
        unread_count: result.unread
      }
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const customReq = req as any;
    const userId = customReq.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const count = await notificationService.getUnreadCount(userId);

    return res.json({ count });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const customReq = req as any;
    const userId = customReq.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await notificationService.markAsRead(id, userId);

    return res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const customReq = req as any;
    const userId = customReq.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await notificationService.markAllAsRead(userId);

    return res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Error marking all as read:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};
