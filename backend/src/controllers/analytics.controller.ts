import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User, UserRole } from '../entities/User';
import { Order } from '../entities/Order';
import { Appointment } from '../entities/Appointment';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const orderRepo = AppDataSource.getRepository(Order);

        const appointmentRepo = AppDataSource.getRepository(Appointment);

        const totalUsers = await userRepo.count();
        const totalOptometrists = await userRepo.count({
            where: { role: UserRole.Optometris }
        });
        const totalPatients = await userRepo.count({
            where: { role: UserRole.Pasien }
        });
        const totalOrders = await orderRepo.count();

        // Additional stats for full compliance
        const pendingOrders = await orderRepo.count({ where: { status: 'pending' } });

        // Revenue calculation (sum of total_amount for paid/delivered orders)
        const { sum } = await orderRepo
            .createQueryBuilder("order")
            .select("SUM(order.total_amount)", "sum")
            .where("order.payment_status = :status", { status: 'paid' })
            .getRawOne();
        const totalRevenue = parseFloat(sum || '0');

        const activeAppointments = await appointmentRepo.count({ where: { status: 'confirmed' } });

        const stats = {
            totalUsers,
            totalOptometrists,
            totalPatients,
            totalOrders,
            pendingOrders,
            totalRevenue,
            activeAppointments
        };

        return res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
