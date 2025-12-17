// src/routes/videosdk.routes.ts
import { Router } from 'express';
import { createRoom, getJoinToken } from '../controllers/videosdk.controller';

const router = Router();

/**
 * @route POST /videosdk/room
 * @desc Create a new VideoSDK room
 */
router.post('/room', createRoom);

/**
 * @route GET /videosdk/token/:roomId/:participantId?
 * @desc Get join token for a specific room
 */
router.get('/token/:roomId/:participantId?', getJoinToken);

export default router;
