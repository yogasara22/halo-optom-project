import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { ServicePricing } from '../entities/ServicePricing';

export const listPricing = async (_req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(ServicePricing);
    const data = await repo.find({ order: { updated_at: 'DESC' } });
    return res.json({ data });
  } catch (err) {
    console.error('listPricing error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPricing = async (req: Request, res: Response) => {
  try {
    const { type, method, base_price, is_active } = req.body;
    if (type === 'homecare') {
      return res.status(400).json({ message: 'Homecare dibayar langsung di luar platform. Admin tidak perlu setup harga.' });
    }
    const repo = AppDataSource.getRepository(ServicePricing);
    let existing = await repo.findOne({ where: { type, method } });
    if (existing) {
      existing.base_price = Number(base_price ?? existing.base_price);
      existing.is_active = is_active ?? existing.is_active;
      await repo.save(existing);
      return res.status(200).json({ message: 'Pricing updated', data: existing });
    }
    const p = repo.create({ type, method, base_price: Number(base_price || 0), is_active: is_active ?? true });
    await repo.save(p);
    return res.status(201).json({ message: 'Pricing created', data: p });
  } catch (err) {
    console.error('createPricing error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePricing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { base_price, is_active } = req.body;
    const repo = AppDataSource.getRepository(ServicePricing);
    const p = await repo.findOne({ where: { id } });
    if (!p) return res.status(404).json({ message: 'Pricing not found' });
    if (p.type === 'homecare') {
      return res.status(400).json({ message: 'Homecare dibayar langsung di luar platform. Admin tidak perlu setup harga.' });
    }
    p.base_price = base_price !== undefined ? Number(base_price) : p.base_price;
    p.is_active = is_active !== undefined ? Boolean(is_active) : p.is_active;
    await repo.save(p);
    return res.json({ message: 'Pricing updated', data: p });
  } catch (err) {
    console.error('updatePricing error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePricing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(ServicePricing);
    const p = await repo.findOne({ where: { id } });
    if (!p) return res.status(404).json({ message: 'Pricing not found' });
    await repo.remove(p);
    return res.json({ message: 'Pricing deleted' });
  } catch (err) {
    console.error('deletePricing error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const lookupPricing = async (req: Request, res: Response) => {
  try {
    const { type, method } = req.query as any;
    const repo = AppDataSource.getRepository(ServicePricing);
    const p = await repo.findOne({ where: { type, method, is_active: true } });
    if (!p) return res.status(404).json({ message: 'Pricing not found' });
    return res.json({ data: p });
  } catch (err) {
    console.error('lookupPricing error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
