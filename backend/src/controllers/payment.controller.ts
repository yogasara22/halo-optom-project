// src/controllers/payment.controller.ts
import { Request, Response } from 'express';
import { updateAppointmentStatus } from '../services/appointment.service';
import {
  createPayment,
  getPaymentById,
  updatePayment,
  handleXenditWebhook,
  getAllPayments,
  getPaymentStats
} from '../services/payment.service';
import logger from '../utils/logger';

/**
 * Membuat payment baru
 */
export const create = async (req: Request, res: Response) => {
  try {
    const payment = await createPayment(req.body);
    return res.status(201).json(payment);
  } catch (error: any) {
    logger.error(`Error creating payment: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * Mendapatkan payment berdasarkan ID
 */
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await getPaymentById(id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment tidak ditemukan' });
    }
    
    return res.json(payment);
  } catch (error: any) {
    logger.error(`Error getting payment: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Update payment
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await updatePayment(id, req.body);
    return res.json(payment);
  } catch (error: any) {
    logger.error(`Error updating payment: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * Handle webhook dari Xendit
 */
export const xenditWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-callback-token'] as string;
    
    if (!signature) {
      return res.status(401).json({ message: 'Missing signature' });
    }
    
    // Mendapatkan raw body untuk verifikasi signature
    const rawBody = JSON.stringify(req.body);
    
    const result = await handleXenditWebhook(req.body, rawBody, signature);
    return res.json(result);
  } catch (error: any) {
    logger.error(`Error processing Xendit webhook: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * Mendapatkan semua payment dengan filter dan pagination
 */
export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Ekstrak filter dari query params
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.payment_type) filter.payment_type = req.query.payment_type;
    if (req.query.payment_method) filter.payment_method = req.query.payment_method;
    if (req.query.search) filter.search = req.query.search;
    if (req.query.startDate) filter.startDate = req.query.startDate;
    if (req.query.endDate) filter.endDate = req.query.endDate;
    
    const result = await getAllPayments(page, limit, filter);
    return res.json(result);
  } catch (error: any) {
    logger.error(`Error getting payments: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Mendapatkan statistik payment
 */
export const getStats = async (_req: Request, res: Response) => {
  try {
    const stats = await getPaymentStats();
    return res.json(stats);
  } catch (error: any) {
    logger.error(`Error getting payment stats: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Export laporan payment
 */
export const exportReport = async (req: Request, res: Response) => {
  try {
    // Ekstrak filter dari query params
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.payment_type) filter.payment_type = req.query.payment_type;
    if (req.query.payment_method) filter.payment_method = req.query.payment_method;
    if (req.query.startDate) filter.startDate = req.query.startDate;
    if (req.query.endDate) filter.endDate = req.query.endDate;
    
    // Dapatkan data payment berdasarkan filter
    const payments = await getAllPayments(1, 1000, filter); // Ambil maksimal 1000 data
    
    // Tentukan format berdasarkan query parameter
    const format = req.query.format as string || 'xlsx';
    
    if (format === 'csv') {
      // Export sebagai CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payment_report.csv');
      
      // Buat header CSV
      let csv = 'ID,External ID,Amount,Status,Payment Method,Payment Type,Created At\n';
      
      // Tambahkan data payment ke CSV
      payments.data.forEach(payment => {
        csv += `${payment.id},${payment.external_id || ''},${payment.amount},${payment.status},${payment.payment_method},${payment.payment_type},${payment.created_at}\n`;
      });
      
      return res.send(csv);
    } else {
      // Default: Export sebagai XLSX
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=payment_report.xlsx');
      
      // Implementasi export XLSX (contoh sederhana)
      // Buat header CSV sebagai fallback jika tidak ada library XLSX
      let csv = 'ID,External ID,Amount,Status,Payment Method,Payment Type,Created At\n';
      
      // Tambahkan data payment ke CSV
      payments.data.forEach(payment => {
        csv += `${payment.id},${payment.external_id || ''},${payment.amount},${payment.status},${payment.payment_method},${payment.payment_type},${payment.created_at}\n`;
      });
      
      return res.send(csv);
    }
  } catch (error: any) {
    logger.error(`Error exporting payment report: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};
