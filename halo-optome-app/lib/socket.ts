import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket: Socket | null = null;

/**
 * Initialize Socket.IO connection
 */
export const initializeSocket = async (): Promise<Socket> => {
    if (socket && socket.connected) {
        return socket;
    }

    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
        throw new Error('Token tidak ditemukan');
    }

    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
    socket = io(baseUrl, {
        auth: {
            token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = (): Socket | null => {
    return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/**
 * Join chat room
 */
export const joinChatRoom = (roomId: string) => {
    if (socket) {
        socket.emit('joinRoom', roomId);
        console.log('Joined chat room:', roomId);
    } else {
        console.error('Socket not connected');
    }
};

/**
 * Leave chat room
 */
export const leaveChatRoom = (roomId: string) => {
    if (socket) {
        socket.emit('leaveRoom', roomId);
        console.log('Left chat room:', roomId);
    }
};

/**
 * Send chat message via socket
 */
export const sendSocketMessage = (roomId: string, message: string, from: string) => {
    if (socket) {
        socket.emit('sendMessage', {
            roomId: roomId,
            message,
            from
        });
    } else {
        console.error('Socket not connected');
        throw new Error('Socket  tidak terhubung');
    }
};

/**
 * Send typing indicator
 */
export const sendTypingIndicator = (roomId: string, isTyping: boolean) => {
    if (socket) {
        socket.emit('typing', {
            room_id: roomId,
            is_typing: isTyping,
        });
    }
};

export default {
    initializeSocket,
    getSocket,
    disconnectSocket,
    joinChatRoom,
    leaveChatRoom,
    sendSocketMessage,
    sendTypingIndicator,
};
