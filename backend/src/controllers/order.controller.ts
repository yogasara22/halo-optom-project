import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Order } from '../entities/Order';
import { OrderItem } from '../entities/OrderItem';
import { Product } from '../entities/Product';
import { User } from '../entities/User';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, payment_data } = req.body; 
    // items = [{ product_id: string, quantity: number }]
    const user = (req as any).user as User;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items tidak boleh kosong' });
    }

    const productRepo = AppDataSource.getRepository(Product);

    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await productRepo.findOneBy({ id: item.product_id });
      if (!product) {
        return res.status(404).json({ message: `Produk dengan ID ${item.product_id} tidak ditemukan` });
      }

      const price = Number(product.price);
      const quantity = Number(item.quantity) || 1;
      total += price * quantity;

      const orderItem = new OrderItem();
      orderItem.product = product;
      orderItem.quantity = quantity;
      orderItem.price = price;
      orderItems.push(orderItem);
    }

    const orderRepo = AppDataSource.getRepository(Order);
    const order = orderRepo.create({
      patient: user,
      items: orderItems,
      total,
      payment_data,
      status: 'pending',
    });

    await orderRepo.save(order);

    return res.status(201).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const orderRepo = AppDataSource.getRepository(Order);

    let orders;
    if (user.role === 'admin') {
      orders = await orderRepo.find();
    } else {
      orders = await orderRepo.find({ where: { patient: { id: user.id } } });
    }

    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const orderRepo = AppDataSource.getRepository(Order);

    const order = await orderRepo.findOneBy({ id });
    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    order.status = status;
    await orderRepo.save(order);

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
