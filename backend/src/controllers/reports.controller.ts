import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Report } from '../entities/Report';
import { User, UserRole } from '../entities/User';
import { Order } from '../entities/Order';
import { Appointment } from '../entities/Appointment';
import { Review } from '../entities/Review';
import ExcelJS from 'exceljs';

export const getReports = async (req: Request, res: Response) => {
    try {
        const reportRepo = AppDataSource.getRepository(Report);
        const reports = await reportRepo.find({
            order: { generated_at: 'DESC' }
        });

        // Map to frontend interface
        const mappedReports = reports.map(r => ({
            id: r.id,
            type: r.type,
            title: r.title,
            description: r.description,
            generatedAt: r.generated_at,
            status: r.status,
            downloadUrl: `/api/analytics/export?type=${r.type}&period=${r.metadata?.period || '30'}&reportId=${r.id}`, // Reuse export route or new download route? Plan said download/:id
            // actually if we implement downloadReport separately:
            // downloadUrl: `/api/reports/download/${r.id}`,
            recordCount: r.record_count
        }));

        // Adjust downloadUrl to match the plan
        const finalReports = mappedReports.map(r => ({
            ...r,
            downloadUrl: `/api/reports/download/${r.id}`
        }));

        return res.json(finalReports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return res.status(500).json({ message: 'Error fetching reports' });
    }
};

export const generateReport = async (req: Request, res: Response) => {
    try {
        const { type, period = '30' } = req.body;
        const reportRepo = AppDataSource.getRepository(Report);

        // Logic to count records based on type
        let recordCount = 0;
        const days = parseInt(period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        if (type === 'users') {
            const repo = AppDataSource.getRepository(User);
            recordCount = await repo.count({ where: { role: UserRole.Pasien } }); // Estimate or exact?
            // Actually let's count created_at >= startDate if we want "Registration Report"
            // or maybe all users? "User Registration Report" usually implies all or recent.
            // Let's assume all for now or filter by date? The FilterOptions in frontend has dateFrom/dateTo.
            // But simple generation just passes 'period'.
            // Let's count *new* users in period.
            recordCount = await repo.createQueryBuilder("user")
                .where("user.created_at >= :startDate", { startDate })
                .getCount();

        } else if (type === 'orders') {
            const repo = AppDataSource.getRepository(Order);
            recordCount = await repo.createQueryBuilder("order")
                .where("order.created_at >= :startDate", { startDate })
                .getCount();
        } else if (type === 'appointments') {
            const repo = AppDataSource.getRepository(Appointment);
            recordCount = await repo.createQueryBuilder("appointment")
                .where("appointment.created_at >= :startDate", { startDate })
                .getCount();
        } else if (type === 'revenue') {
            // Revenue report might list transactions
            const orderRepo = AppDataSource.getRepository(Order);
            const apptRepo = AppDataSource.getRepository(Appointment);
            const orders = await orderRepo.createQueryBuilder("order")
                .where("order.created_at >= :startDate", { startDate })
                .andWhere("order.status IN (:...statuses)", { statuses: ['paid', 'shipped', 'delivered'] })
                .getCount();
            const appts = await apptRepo.createQueryBuilder("appointment")
                .where("appointment.created_at >= :startDate", { startDate })
                .andWhere("appointment.payment_status = 'paid'")
                .getCount();
            recordCount = orders + appts;
        } else if (type === 'reviews') {
            const repo = AppDataSource.getRepository(Review);
            recordCount = await repo.createQueryBuilder("review")
                .where("review.created_at >= :startDate", { startDate })
                .getCount();
        }

        const newReport = reportRepo.create({
            type,
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
            description: `Generated ${type} report for last ${period} days`,
            status: 'completed',
            metadata: { period },
            record_count: recordCount
        });

        await reportRepo.save(newReport);

        // Return mapped
        return res.json({
            id: newReport.id,
            type: newReport.type,
            title: newReport.title,
            description: newReport.description,
            generatedAt: newReport.generated_at,
            status: newReport.status,
            downloadUrl: `/api/reports/download/${newReport.id}`,
            recordCount: newReport.record_count
        });

    } catch (error) {
        console.error('Error generating report:', error);
        return res.status(500).json({ message: 'Error generating report' });
    }
};

const getReportData = async (type: string, startDate: Date) => {
    let data: any[] = [];
    let columns: any[] = [];

    if (type === 'users') {
        const repo = AppDataSource.getRepository(User);
        const users = await repo.createQueryBuilder("user")
            .where("user.created_at >= :startDate", { startDate })
            .orderBy("user.created_at", "DESC")
            .getMany();

        columns = [
            { header: 'ID', key: 'id', width: 36 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Role', key: 'role', width: 15 },
            { header: 'Phone', key: 'phone', width: 20 },
            { header: 'Registered At', key: 'created_at', width: 25 }
        ];

        data = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone,
            created_at: u.created_at
        }));

    } else if (type === 'orders') {
        const repo = AppDataSource.getRepository(Order);
        const orders = await repo.createQueryBuilder("order")
            .leftJoinAndSelect("order.patient", "patient")
            .where("order.created_at >= :startDate", { startDate })
            .orderBy("order.created_at", "DESC")
            .getMany();

        columns = [
            { header: 'Order ID', key: 'id', width: 36 },
            { header: 'Patient Name', key: 'patient', width: 30 },
            { header: 'Total Amount', key: 'total', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Date', key: 'created_at', width: 25 }
        ];

        data = orders.map(o => ({
            id: o.id,
            patient: o.patient?.name || 'N/A',
            total: o.total,
            status: o.status,
            created_at: o.created_at
        }));

    } else if (type === 'appointments') {
        const repo = AppDataSource.getRepository(Appointment);
        const appts = await repo.createQueryBuilder("appointment")
            .leftJoinAndSelect("appointment.patient", "patient")
            .leftJoinAndSelect("appointment.optometrist", "optometrist")
            .where("appointment.created_at >= :startDate", { startDate })
            .orderBy("appointment.created_at", "DESC")
            .getMany();

        columns = [
            { header: 'Appointment ID', key: 'id', width: 36 },
            { header: 'Patient', key: 'patient', width: 30 },
            { header: 'Optometrist', key: 'optometrist', width: 30 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Date', key: 'date', width: 25 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Payment', key: 'payment_status', width: 15 },
            { header: 'Price', key: 'price', width: 15 }
        ];

        data = appts.map(a => ({
            id: a.id,
            patient: a.patient?.name || 'N/A',
            optometrist: a.optometrist?.name || 'N/A',
            type: a.type,
            date: a.date,
            status: a.status,
            payment_status: a.payment_status,
            price: a.price
        }));

    } else if (type === 'revenue') {
        const orderRepo = AppDataSource.getRepository(Order);
        const apptRepo = AppDataSource.getRepository(Appointment);

        const orders = await orderRepo.createQueryBuilder("order")
            .where("order.created_at >= :startDate", { startDate })
            .andWhere("order.status IN (:...statuses)", { statuses: ['paid', 'shipped', 'delivered'] })
            .getMany();

        const appts = await apptRepo.createQueryBuilder("appointment")
            .where("appointment.created_at >= :startDate", { startDate })
            .andWhere("appointment.payment_status = 'paid'")
            .getMany();

        columns = [
            { header: 'Date', key: 'date', width: 25 },
            { header: 'Source', key: 'source', width: 15 },
            { header: 'Amount', key: 'amount', width: 20 },
            { header: 'Reference ID', key: 'details', width: 36 }
        ];

        data = [
            ...orders.map(o => ({ date: o.created_at, source: 'Order', amount: o.total, details: o.id })),
            ...appts.map(a => ({ date: a.created_at, source: 'Appointment', amount: a.price, details: a.id }))
        ];

        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } else if (type === 'reviews') {
        const repo = AppDataSource.getRepository(Review);
        const reviews = await repo.createQueryBuilder("review")
            .leftJoinAndSelect("review.patient", "patient")
            .leftJoinAndSelect("review.optometrist", "optometrist")
            .where("review.created_at >= :startDate", { startDate })
            .orderBy("review.created_at", "DESC")
            .getMany();

        columns = [
            { header: 'Review ID', key: 'id', width: 36 },
            { header: 'Patient', key: 'patient', width: 30 },
            { header: 'Optometrist', key: 'optometrist', width: 30 },
            { header: 'Rating', key: 'rating', width: 10 },
            { header: 'Comment', key: 'comment', width: 50 },
            { header: 'Date', key: 'created_at', width: 25 }
        ];

        data = reviews.map(r => ({
            id: r.id,
            patient: r.patient?.name || 'Anonymous',
            optometrist: r.optometrist?.name || 'N/A',
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at
        }));
    }

    return { data, columns };
};

export const downloadReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const reportRepo = AppDataSource.getRepository(Report);
        const report = await reportRepo.findOne({ where: { id } });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const { type, metadata } = report;
        const period = metadata?.period || '30';
        const days = parseInt(period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, columns } = await getReportData(type, startDate);

        // Generate Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(report.title || 'Report');

        worksheet.columns = columns;
        data.forEach(row => worksheet.addRow(row));

        // Style header
        worksheet.getRow(1).font = { bold: true };

        const filename = `${type}_report_${period}days_${new Date().toISOString().split('T')[0]}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        await workbook.xlsx.write(res);
        return res.end();

    } catch (error) {
        console.error('Error downloading report:', error);
        return res.status(500).json({ message: 'Error downloading report' });
    }
};

export const previewReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const reportRepo = AppDataSource.getRepository(Report);
        const report = await reportRepo.findOne({ where: { id } });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const { type, metadata } = report;
        const period = metadata?.period || '30';
        const days = parseInt(period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, columns } = await getReportData(type, startDate);

        // Return top 10 rows
        return res.json({
            columns: columns,
            data: data.slice(0, 10),
            totalRecords: data.length
        });

    } catch (error) {
        console.error('Error previewing report:', error);
        return res.status(500).json({ message: 'Error previewing report' });
    }
};
