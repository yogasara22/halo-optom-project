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


export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const chatRepo = AppDataSource.getRepository(ChatMessage);

    // Count messages where 'to' is current user AND 'read_at' is null
    const count = await chatRepo.count({
      where: {
        to: { id: user.id },
        read_at: undefined // equivalent to IS NULL for nullable column check in FindOptions? 
        // TypeORM usually treats null/undefined carefully. 
        // Ideally IsNull() operator but clean syntax:
      } as any // bypass type check for simpler IsNull() alternative if needed, or query builder
    });

    // Better to use QueryBuilder for absolute certainty on "IS NULL"
    const unreadCount = await chatRepo.createQueryBuilder("chat")
      .where("chat.to_user_id = :userId", { userId: user.id })
      .andWhere("chat.read_at IS NULL")
      .getCount();

    return res.json({ count: unreadCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { room_id } = req.params;
    const user = (req as any).user as User;

    const chatRepo = AppDataSource.getRepository(ChatMessage);

    // Update all messages in this room sent TO me and read_at IS NULL
    await chatRepo.createQueryBuilder()
      .update(ChatMessage)
      .set({ read_at: new Date() })
      .where("room_id = :roomId", { roomId: room_id })
      .andWhere("to_user_id = :userId", { userId: user.id })
      .andWhere("read_at IS NULL")
      .execute();

    return res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
