import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env';
import { UserRole } from '../types';

let io: Server | null = null;

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: UserRole;
  departmentId?: string;
}

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
  });

  // Socket Authentication Middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: UserRole; departmentId?: string };
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      socket.departmentId = decoded.departmentId;
      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      
      if (socket.userRole) {
        socket.join(`role:${socket.userRole}`);
      }

      if (socket.departmentId) {
        socket.join(`department:${socket.departmentId}`);
      }
    }

    socket.join('public:city_feed');

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function emitToUser(userId: string | object, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId.toString()}`).emit(event, data);
}

export function emitToRole(role: string, event: string, data: any) {
  if (!io) return;
  io.to(`role:${role}`).emit(event, data);
}

export function emitToDepartment(deptId: string | object, event: string, data: any) {
  if (!io) return;
  io.to(`department:${deptId.toString()}`).emit(event, data);
}

export function emitToCityFeed(event: string, data: any) {
  if (!io) return;
  io.to('public:city_feed').emit(event, data);
}
