import { API_BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConsultationDetails {
    appointment_id: string;
    type: 'online' | 'homecare';
    method?: 'chat' | 'video';
    status: string;
    patient: {
        id: string;
        name: string;
        avatar_url?: string;
    };
    optometrist: {
        id: string;
        name: string;
        avatar_url?: string;
    };
    video?: {
        room_id: string;
        token: string;
    };
    chat?: {
        room_id: string;
    };
    date: string;
    start_time: string;
    end_time?: string;
}

export interface ChatMessage {
    id: string;
    room_id: string;
    from: {
        id: string;
        name: string;
        avatar_url?: string;
        role?: string;
    };
    to?: {
        id: string;
        name: string;
        role?: string;
    };
    message: string;
    attachments?: any[];
    created_at: string;
    updated_at: string;
}

/**
 * Get consultation details (chat room, video room, tokens)
 */
export const getConsultationDetails = async (appointmentId: string): Promise<ConsultationDetails> => {
    try {
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
            throw new Error('Token tidak ditemukan. Silakan login kembali.');
        }

        const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/consultation`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal mendapatkan detail konsultasi');
        }

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error('Error getting consultation details:', error);
        throw error;
    }
};

/**
 * Get chat messages for a room
 */
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
    try {
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
            throw new Error('Token tidak ditemukan. Silakan login kembali.');
        }

        const response = await fetch(`${API_BASE_URL}/chats/${roomId}/messages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal mendapatkan pesan chat');
        }

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error('Error getting chat messages:', error);
        throw error;
    }
};

/**
 * Send chat message
 */
export const sendChatMessage = async (roomId: string, message: string): Promise<ChatMessage> => {
    try {
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
            throw new Error('Token tidak ditemukan. Silakan login kembali.');
        }

        const response = await fetch(`${API_BASE_URL}/chats/${roomId}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal mengirim pesan');
        }

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error('Error sending chat message:', error);
        throw error;
    }
};

export default {
    getConsultationDetails,
    getChatMessages,
    sendChatMessage,
};
