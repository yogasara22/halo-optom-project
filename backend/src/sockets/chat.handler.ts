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
  socket.on('sendMessage', (data: { roomId: string; message: string; from: string }) => {
    console.log(`Message in ${data.roomId} from ${data.from}: ${data.message}`);
    io.to(data.roomId).emit('newMessage', data);
  });

  // disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
}
