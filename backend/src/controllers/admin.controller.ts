import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User } from '../entities/User';
import { Order } from '../entities/Order';
import { Product } from '../entities/Product';
import { Schedule } from '../entities/Schedule';

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
    const [totalUsers, totalOrders, totalProducts, totalSchedules] =
      await Promise.all([
        AppDataSource.getRepository(User).count(),
        AppDataSource.getRepository(Order).count(),
        AppDataSource.getRepository(Product).count(),
        AppDataSource.getRepository(Schedule).count(),
      ]);

    return res.json({
      total_users: totalUsers,
      total_orders: totalOrders,
      total_products: totalProducts,
      total_schedules: totalSchedules
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
