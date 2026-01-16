import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User, UserRole } from '../entities/User';
import { Order } from '../entities/Order';
import { Appointment } from '../entities/Appointment';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        console.log('[Analytics] Fetching dashboard stats...');
        const userRepo = AppDataSource.getRepository(User);
        const orderRepo = AppDataSource.getRepository(Order);
        const appointmentRepo = AppDataSource.getRepository(Appointment);

        const totalUsers = await userRepo.count();
        const totalOptometrists = await userRepo.count({ where: { role: UserRole.Optometris } });
        const totalPatients = await userRepo.count({ where: { role: UserRole.Pasien } });
        const totalOrders = await orderRepo.count();

        // Pending orders
        const pendingOrders = await orderRepo.count({ where: { status: 'pending' } });

        // Active appointments (confirmed or ongoing)
        const activeAppointments = await appointmentRepo.createQueryBuilder("appointment")
            .where("appointment.status IN (:...statuses)", { statuses: ['confirmed', 'ongoing'] })
            .getCount();

        // Revenue calculation (Orders)
        const orderRevenueResult = await orderRepo
            .createQueryBuilder("order")
            .select("SUM(order.total)", "orderSum")
            .where("order.status IN (:...statuses)", { statuses: ['paid', 'shipped', 'delivered'] })
            .getRawOne();

        // Revenue calculation (Appointments)
        const apptRevenueResult = await appointmentRepo
            .createQueryBuilder("appointment")
            .select("SUM(appointment.price)", "appointmentSum")
            .where("appointment.payment_status = :status", { status: 'paid' })
            .getRawOne();

        const totalOrderRevenue = parseFloat(orderRevenueResult?.orderSum || '0');
        const totalAppointmentRevenue = parseFloat(apptRevenueResult?.appointmentSum || '0');
        const totalRevenue = totalOrderRevenue + totalAppointmentRevenue;

        const stats = {
            totalUsers,
            totalOptometrists,
            totalPatients,
            totalOrders,
            pendingOrders,
            totalRevenue,
            activeAppointments
        };

        console.log('[Analytics] Stats fetched successfully:', stats);
        return res.json(stats);
    } catch (error) {
        console.error('[Analytics] Error fetching dashboard stats:', error);
        return res.status(500).json({ message: 'Internal server error', error: String(error) });
    }
};

export const getRevenueAnalytics = async (req: Request, res: Response) => {
    try {
        const { period = '30', type = 'daily' } = req.query;
        console.log(`[Analytics] Fetching revenue analytics. Period: ${period}, Type: ${type}`);

        const days = parseInt(period as string) || 30;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Previous period for growth calculation
        const prevEndDate = new Date(startDate);
        const prevStartDate = new Date(prevEndDate);
        prevStartDate.setDate(prevStartDate.getDate() - days);

        const orderRepo = AppDataSource.getRepository(Order);
        const appointmentRepo = AppDataSource.getRepository(Appointment);

        // --- Current Period Data ---

        // Fetch Orders
        const orders = await orderRepo.createQueryBuilder("order")
            .where("order.created_at >= :startDate", { startDate })
            .andWhere("order.created_at <= :endDate", { endDate })
            .andWhere("order.status IN (:...statuses)", { statuses: ['paid', 'shipped', 'delivered'] })
            .orderBy("order.created_at", "ASC")
            .getMany();

        // Fetch Appointments
        const appointments = await appointmentRepo.createQueryBuilder("appointment")
            .where("appointment.created_at >= :startDate", { startDate })
            .andWhere("appointment.created_at <= :endDate", { endDate })
            .andWhere("appointment.payment_status = :status", { status: 'paid' })
            .orderBy("appointment.created_at", "ASC")
            .getMany();

        // --- Previous Period Data (for growth rate) ---

        const prevOrderResult = await orderRepo.createQueryBuilder("order")
            .select("SUM(order.total)", "prevOrderSum")
            .where("order.created_at >= :prevStartDate", { prevStartDate })
            .andWhere("order.created_at < :startDate", { startDate })
            .andWhere("order.status IN (:...statuses)", { statuses: ['paid', 'shipped', 'delivered'] })
            .getRawOne();

        const prevApptResult = await appointmentRepo.createQueryBuilder("appointment")
            .select("SUM(appointment.price)", "prevApptSum")
            .where("appointment.created_at >= :prevStartDate", { prevStartDate })
            .andWhere("appointment.created_at < :startDate", { startDate })
            .andWhere("appointment.payment_status = :status", { status: 'paid' })
            .getRawOne();

        const prevTotalRevenue = parseFloat(prevOrderResult?.prevOrderSum || '0') + parseFloat(prevApptResult?.prevApptSum || '0');


        // --- Aggregation ---

        const orderRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        const appointmentRevenue = appointments.reduce((sum, appt) => sum + Number(appt.price || 0), 0);
        const totalRevenue = orderRevenue + appointmentRevenue;
        const totalTransactions = orders.length + appointments.length;
        const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

        // Growth Rate
        let growthRate = 0;
        if (prevTotalRevenue > 0) {
            growthRate = ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100;
        } else if (totalRevenue > 0) {
            growthRate = 100;
        }

        // By Source
        const bySource = [
            { source: 'appointments', revenue: appointmentRevenue, transactions: appointments.length },
            { source: 'orders', revenue: orderRevenue, transactions: orders.length }
        ];

        // Timeline (Daily)
        const timelineMap = new Map<string, { revenue: number; transactions: number }>();

        // Initialize timeline with 0s
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            timelineMap.set(dateStr, { revenue: 0, transactions: 0 });
        }

        // Fill orders
        orders.forEach(order => {
            try {
                const dateStr = new Date(order.created_at).toISOString().split('T')[0];
                if (timelineMap.has(dateStr)) {
                    const curr = timelineMap.get(dateStr)!;
                    curr.revenue += Number(order.total || 0);
                    curr.transactions += 1;
                }
            } catch (e) { console.warn('Error parsing order date:', e); }
        });

        // Fill appointments
        appointments.forEach(appt => {
            try {
                const dateStr = new Date(appt.created_at).toISOString().split('T')[0];
                if (timelineMap.has(dateStr)) {
                    const curr = timelineMap.get(dateStr)!;
                    curr.revenue += Number(appt.price || 0);
                    curr.transactions += 1;
                }
            } catch (e) { console.warn('Error parsing appointment date:', e); }
        });

        const timeline = Array.from(timelineMap.entries()).map(([period, data]) => ({
            period,
            revenue: data.revenue,
            transactions: data.transactions
        }));

        const result = {
            timeline,
            bySource,
            summary: {
                totalRevenue,
                totalTransactions,
                averageTransaction,
                growthRate
            }
        };

        console.log('[Analytics] Revenue analytics generated successfully.');
        return res.json(result);

    } catch (error) {
        console.error('[Analytics] Error fetching revenue analytics:', error);
        return res.status(500).json({ message: 'Error fetching revenue analytics', error: String(error) });
    }
};
