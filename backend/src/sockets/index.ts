// src/sockets/index.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import * as jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';
import chatHandler from './chat.handler';
import { AppDataSource } from '../config/ormconfig';
import { User } from '../entities/User';

type SocketServer = Server;

export function initSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: '*' },
    // pingInterval / pingTimeout bisa di-tune di production
  });

  // Optional: enable Redis adapter if REDIS url set in env
  const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
  if (process.env.REDIS_URL || (process.env.REDIS_HOST && process.env.REDIS_PORT)) {
    try {
      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();
      // connect clients (optional) — handled lazily by adapter in some versions
      Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log('Socket.IO redis adapter connected');
      }).catch((err) => {
        console.warn('Redis adapter init failed:', err);
      });
    } catch (err) {
      console.warn('Redis adapter skipped:', err);
    }
  }

  // Middleware: authenticate socket via JWT
  io.use(async (socket, next) => {
    try {
      // token can be sent via handshake.auth or handshake.headers.authorization
      const authToken =
        // @ts-ignore
        socket.handshake?.auth?.token ||
        // @ts-ignore
        socket.handshake?.headers?.authorization ||
        null;

      if (!authToken) {
        return next(new Error('Authentication error: token required'));
      }

      // token might be "Bearer <token>"
      const token = (authToken as string).replace(/^Bearer\s/i, '').trim();
      if (!token) return next(new Error('Authentication error: token malformed'));

      const secret = process.env.JWT_SECRET;
      if (!secret) return next(new Error('Server config error: JWT_SECRET not set'));

      // verify token (payload shape depends on your sign)
      const payload: any = jwt.verify(token, secret as jwt.Secret);

      // optionally, fetch user from DB to ensure still valid
      if (!AppDataSource.isInitialized) {
        // If DB not initialized yet, allow connection with token payload only
        (socket as any).user = payload;
        return next();
      }

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({ id: payload.id });
      if (!user) {
        return next(new Error('Authentication error: user not found'));
      }

      // attach user to socket
      (socket as any).user = {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      };

      next();
    } catch (err: any) {
      console.error('Socket auth error:', err?.message ?? err);
      return next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, user: ${(socket as any).user?.id ?? 'anonymous'}`);

    // mount chat handler (separated)
    chatHandler(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
