import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getUserNotifications, markAsRead } from '../controllers/notification.controller';

const router = Router();

router.get('/', authMiddleware, getUserNotifications);
router.patch('/:id/read', authMiddleware, markAsRead);

export default router;
