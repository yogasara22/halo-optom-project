// src/services/order.service.ts
import { AppDataSource } from '../config/ormconfig';
import { Order, OrderStatus } from '../entities/Order';

export type UpdateOrderStatusPayload = {
  status: OrderStatus;
};

export const updateOrderStatus = async (orderId: string, payload: UpdateOrderStatusPayload) => {
  const orderRepo = AppDataSource.getRepository(Order);
  const order = await orderRepo.findOneBy({ id: orderId });

  if (!order) {
    throw new Error('Order tidak ditemukan');
  }

  order.status = payload.status;
  await orderRepo.save(order);

  return order;
};
