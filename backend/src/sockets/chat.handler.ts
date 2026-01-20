// src/sockets/chat.handler.ts
import { Server, Socket } from 'socket.io';

export default function chatHandler(io: Server, socket: Socket) {
  console.log('User connected:', socket.id);

  // join room
  socket.on('joinRoom', (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // handle chat message
  socket.on('sendMessage', async (data: { roomId: string; message: string; from: string }) => {
    console.log('=== SEND MESSAGE EVENT RECEIVED ===');
    console.log('Raw data:', JSON.stringify(data, null, 2));

    try {
      const { roomId, message } = data;

      // Use authenticated user from socket instead of trusting client-provided ID
      const authenticatedUser = (socket as any).user;
      if (!authenticatedUser || !authenticatedUser.id) {
        console.error('❌ No authenticated user found on socket');
        return;
      }

      const userId = authenticatedUser.id;
      console.log(`Processing message in room ${roomId} from authenticated user ${userId} (${authenticatedUser.name})`);

      // Lazy load dependencies to ensure DataSource is ready
      const { AppDataSource } = require('../config/ormconfig');
      const { ChatMessage } = require('../entities/ChatMessage');
      const { ChatRoom } = require('../entities/ChatRoom');
      const { User } = require('../entities/User');

      console.log('DataSource initialized:', AppDataSource.isInitialized);

      const roomRepo = AppDataSource.getRepository(ChatRoom);
      const userRepo = AppDataSource.getRepository(User);
      const chatRepo = AppDataSource.getRepository(ChatMessage);

      console.log('Finding room:', roomId);
      const room = await roomRepo.findOne({
        where: { id: roomId },
        relations: ['participants']
      });
      console.log('Room found:', !!room, room ? `with ${room.participants.length} participants` : '');

      console.log('Finding sender:', userId);
      const sender = await userRepo.findOne({ where: { id: userId } });
      console.log('Sender found:', !!sender, sender ? sender.name : '');

      if (room && sender) {
        // Identify recipient (the other participant)
        const recipient = room.participants.find((p: any) => p.id !== sender.id);
        console.log('Recipient found:', !!recipient, recipient ? recipient.name : 'none');

        console.log('Creating chat message entity...');
        const newChat = chatRepo.create({
          room: room,
          from: sender,
          to: recipient,
          message: message
        });
        console.log('Chat message created, attempting to save...');

        const savedChat = await chatRepo.save(newChat);
        console.log('✓ Chat message SAVED successfully! ID:', savedChat.id);

        // Construct the payload to match ChatMessage interface on frontend
        const payload = {
          id: savedChat.id,
          room_id: room.id,
          from: {
            id: sender.id,
            name: sender.name,
            avatar_url: sender.avatar_url,
            role: sender.role
          },
          to: recipient ? {
            id: recipient.id,
            name: recipient.name,
            role: recipient.role
          } : undefined,
          message: savedChat.message,
          created_at: savedChat.created_at.toISOString(),
          updated_at: savedChat.updated_at.toISOString()
        };

        console.log('Emitting newMessage to room:', roomId);
        io.to(roomId).emit('newMessage', payload);
        console.log('✓ Message emitted successfully');
      } else {
        console.error('❌ Room or Sender not found - room:', !!room, 'sender:', !!sender);
      }
    } catch (err) {
      console.error('❌ ERROR handling sendMessage socket event:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    }
  });

  // disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
}
