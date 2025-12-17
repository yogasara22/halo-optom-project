// src/controllers/videosdk.controller.ts
import { Request, Response } from 'express';
import { 
  createVideoSdkRoom, 
  generateJoinRoomToken 
} from '../services/videosdk.service';

export const createRoom = async (req: Request, res: Response) => {
  try {
    const room = await createVideoSdkRoom();
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat room' });
  }
};

export const getJoinToken = (req: Request, res: Response) => {
  try {
    const { roomId, participantId } = req.params;
    const token = generateJoinRoomToken(roomId, participantId);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat token join' });
  }
};
