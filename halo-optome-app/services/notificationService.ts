import api from '../lib/api';

export interface ApiNotification {
    id: string;
    title: string;
    body: string;
    type: 'appointment' | 'payment' | 'promo' | 'general';
    is_read: boolean;
    created_at: string;
    meta?: any;
}

class NotificationService {
    async getNotifications(): Promise<ApiNotification[]> {
        try {
            const res = await api.get('/notifications');
            return res.data.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    async getUnreadCount(): Promise<number> {
        try {
            const res = await api.get('/notifications/unread-count');
            return res.data.count || 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    }

    async markAsRead(id: string): Promise<void> {
        await api.patch(`/notifications/${id}/read`);
    }

    async markAllAsRead(): Promise<void> {
        await api.patch('/notifications/read-all');
    }
}

export const notificationService = new NotificationService();
export default notificationService;
