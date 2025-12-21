import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User, UserRole } from '../entities/User';
import { Order } from '../entities/Order';
import { Product } from '../entities/Product';
import { Schedule } from '../entities/Schedule';
import { Appointment } from '../entities/Appointment';

export const getAllUsers = async (_: Request, res: Response) => {
  try {
    const users = await AppDataSource.getRepository(User).find({
      order: { created_at: 'DESC' }
    });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } }); // pakai string, bukan Number

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    await userRepo.remove(user);
    return res.json({ message: 'User berhasil dihapus', deleted_id: id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDashboardStats = async (_: Request, res: Response) => {
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

    // Additional stats
    const pendingOrders = await orderRepo.count({ where: { status: 'pending' } });

    // Revenue calculation
    const { sum } = await orderRepo
      .createQueryBuilder("o")
      .select("SUM(o.total)", "sum")
      .where("o.status = :status", { status: 'paid' })
      .getRawOne();
    const totalRevenue = parseFloat(sum || '0');

    const activeAppointments = await appointmentRepo.count({ where: { status: 'confirmed' } });

    return res.json({
      totalUsers,
      totalOptometrists,
      totalPatients,
      totalOrders,
      pendingOrders,
      totalRevenue,
      activeAppointments
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
