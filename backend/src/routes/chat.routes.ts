import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { sendMessage, getChatMessages, getUnreadCount, markAsRead } from '../controllers/chat.controller';

const router = Router();

// Kirim pesan ke room
router.post('/:room_id/message', authMiddleware, sendMessage);
// Ambil semua pesan di room
router.get('/:room_id/messages', authMiddleware, getChatMessages);

// Unread Messages Routes
router.get('/unread/count', authMiddleware, getUnreadCount);
router.post('/:room_id/read', authMiddleware, markAsRead);

export default router;
