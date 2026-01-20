import { AppDataSource } from '../config/ormconfig';
import { Notification, NotificationType } from '../entities/Notification';
import { User } from '../entities/User';

export class NotificationService {
    private notificationRepo = AppDataSource.getRepository(Notification);
    private userRepo = AppDataSource.getRepository(User);

    /**
     * Create a new notification
     */
    async createNotification(
        userId: string,
        title: string,
        body: string,
        type: NotificationType = 'general',
        meta: any = null
    ): Promise<Notification> {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        const notification = this.notificationRepo.create({
            user,
            title,
            body,
            type,
            meta,
            is_read: false,
        });

        const savedNotification = await this.notificationRepo.save(notification);

        // Emit socket event if GlobalSocketIO is available
        if (GlobalSocketIO) {
            GlobalSocketIO.to(userId).emit('new_notification', savedNotification);
        }

        return savedNotification;
    }

    /**
     * Get notifications for a user
     */
    async getUserNotifications(
        userId: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<{ data: Notification[]; total: number; unread: number }> {
        const [data, total] = await this.notificationRepo.findAndCount({
            where: { user: { id: userId } },
            order: { created_at: 'DESC' },
            take: limit,
            skip: offset,
        });

        const unread = await this.getUnreadCount(userId);

        return { data, total, unread };
    }

    /**
     * Get unread count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return await this.notificationRepo.count({
            where: {
                user: { id: userId },
                is_read: false,
            },
        });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(id: string, userId: string): Promise<void> {
        const notification = await this.notificationRepo.findOne({
            where: { id, user: { id: userId } },
        });

        if (notification) {
            notification.is_read = true;
            await this.notificationRepo.save(notification);
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepo.update(
            { user: { id: userId }, is_read: false },
            { is_read: true }
        );
    }
}

// Global variable to store Socket.IO instance
let GlobalSocketIO: any = null;

export const setSocketIO = (ioInstance: any) => {
    GlobalSocketIO = ioInstance;
};

export const notificationService = new NotificationService();
