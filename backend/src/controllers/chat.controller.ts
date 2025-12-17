import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { ChatMessage } from '../entities/ChatMessage';
import { ChatRoom } from '../entities/ChatRoom';
import { User } from '../entities/User';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { room_id } = req.params;
    const { message, to_user_id, attachments } = req.body;
    const user = (req as any).user as User;

    if (!message) {
      return res.status(400).json({ message: 'Pesan tidak boleh kosong' });
    }

    const roomRepo = AppDataSource.getRepository(ChatRoom);
    const room = await roomRepo.findOne({
      where: { id: room_id },
      relations: ['participants'],
    });

    if (!room) {
      return res.status(404).json({ message: 'Room tidak ditemukan' });
    }

    // Pastikan pengirim adalah peserta room
    const isParticipant = room.participants.some(p => p.id === user.id);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Tidak diizinkan mengirim pesan di room ini' });
    }

    const chatRepo = AppDataSource.getRepository(ChatMessage);
    const chatMessage = chatRepo.create({
      room,
      from: user,
      to: to_user_id ? { id: to_user_id } as User : undefined,
      message,
      attachments
    });

    await chatRepo.save(chatMessage);
    return res.status(201).json(chatMessage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { room_id } = req.params;
    const user = (req as any).user as User;

    const roomRepo = AppDataSource.getRepository(ChatRoom);
    const room = await roomRepo.findOne({
      where: { id: room_id },
      relations: ['participants'],
    });

    if (!room) {
      return res.status(404).json({ message: 'Room tidak ditemukan' });
    }

    // Pastikan user adalah peserta room
    const isParticipant = room.participants.some(p => p.id === user.id);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Tidak diizinkan melihat pesan di room ini' });
    }

    const chatRepo = AppDataSource.getRepository(ChatMessage);
    const messages = await chatRepo.find({
      where: { room: { id: room_id } },
      relations: ['from', 'to'],
      order: { created_at: 'ASC' }
    });

    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

