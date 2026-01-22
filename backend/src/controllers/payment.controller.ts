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
import { User } from '../entities/User';
import { Payment } from '../entities/Payment';
import { AppDataSource } from '../config/ormconfig';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

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

/**
 * Upload payment proof file (multer)
 */
export const uploadPaymentProofFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { uploadPaymentProof } = require('../services/payment.service');

    // Generate public URL for the uploaded file
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    const fileUrl = `${baseUrl}/uploads/payment-proofs/${file.filename}`;

    console.log('📤 Uploading payment proof:', {
      paymentId: id,
      filename: file.filename,
      fileUrl
    });

    // Update payment with proof URL
    const payment = await uploadPaymentProof(id, fileUrl);

    console.log('✅ Payment proof uploaded successfully:', {
      paymentId: payment.id,
      status: payment.status,
      payment_proof_url: payment.payment_proof_url
    });

    return res.status(200).json({
      message: 'Payment proof uploaded successfully',
      data: {
        payment,
        file_url: fileUrl,
      },
    });
  } catch (err: any) {
    console.error('❌ Error uploadPaymentProofFile:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

/**
 * Upload payment proof (text-based URL)
 */
export const uploadProof = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { proof_url } = req.body;

    if (!proof_url) {
      return res.status(400).json({ message: 'proof_url is required' });
    }

    const { uploadPaymentProof } = await import('../services/payment.service');
    const payment = await uploadPaymentProof(id, proof_url);

    return res.json({
      message: 'Payment proof uploaded successfully',
      data: payment
    });
  } catch (error: any) {
    logger.error(`Error uploading payment proof: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * Verify payment (Admin only) - WITH NOTIFICATION
 */
export const verify = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user as User;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can verify payments' });
    }

    const { verifyPayment } = require('../services/payment.service');
    const payment = await verifyPayment(id, user.id);

    // Send notification to patient
    try {
      const { notificationService } = require('../services/notification.service');

      // Get patient ID from payment
      let patientId: string | undefined;
      if (payment.appointment && payment.appointment.patient) {
        patientId = payment.appointment.patient.id;
      } else if (payment.order && payment.order.patient) {
        patientId = payment.order.patient.id;
      }

      if (patientId) {
        const amount = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(payment.amount);

        await notificationService.createNotification(
          patientId,
          'Pembayaran Disetujui',
          `Pembayaran Anda sebesar ${amount} telah diverifikasi dan disetujui oleh admin.`,
          'payment',
          {
            payment_id: payment.id,
            appointment_id: payment.appointment_id,
            order_id: payment.order_id,
            amount: payment.amount
          }
        );

        console.log(`✅ Payment approval notification sent to patient: ${patientId}`);
      } else {
        console.warn('⚠️ Payment verified but no patient found for notification');
      }
    } catch (notifyErr) {
      console.error('❌ Failed to send payment approval notification:', notifyErr);
      // Don't fail the verification if notification fails
    }

    return res.json({
      message: 'Payment verified successfully',
      data: payment
    });
  } catch (error: any) {
    logger.error(`Error verifying payment: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * Reject payment (Admin only)
 */
export const reject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = (req as any).user as User;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can reject payments' });
    }

    const { rejectPayment } = require('../services/payment.service');
    const payment = await rejectPayment(id, user.id, reason || 'No reason provided');

    // Send notification to patient
    try {
      const { notificationService } = require('../services/notification.service');

      // Get patient ID from payment
      let patientId: string | undefined;
      // Check if relations exist; rejectPayment might return them, but verifyPayment logic suggests we can access them.
      // If rejectPayment uses getOne with relations, they are there.
      // To be safe, let's assume the shape matches verifyPayment's result or we might need to reload if missing.
      // For now, mirroring verify logic:
      if (payment.appointment && payment.appointment.patient) {
        patientId = payment.appointment.patient.id;
      } else if (payment.order && payment.order.patient) {
        patientId = payment.order.patient.id;
      }

      if (patientId) {
        const amount = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(payment.amount);

        await notificationService.createNotification(
          patientId,
          'Pembayaran Ditolak',
          `Pembayaran Anda sebesar ${amount} ditolak oleh admin. Alasan: ${reason || 'Tidak ada alasan'}`,
          'payment',
          {
            payment_id: payment.id,
            appointment_id: payment.appointment_id,
            order_id: payment.order_id,
            amount: payment.amount,
            status: 'rejected'
          }
        );

        console.log(`✅ Payment rejection notification sent to patient: ${patientId}`);
      } else {
        console.warn('⚠️ Payment rejected but no patient found for notification');
      }
    } catch (notifyErr) {
      console.error('❌ Failed to send payment rejection notification:', notifyErr);
      // Don't fail the rejection if notification fails
    }

    return res.json({
      message: 'Payment rejected successfully',
      data: payment
    });
  } catch (error: any) {
    logger.error(`Error rejecting payment: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * Get pending bank transfer payments (Admin only)
 */
export const getPending = async (req: Request, res: Response) => {
  try {
    console.log('📋 Getting pending bank transfer payments...');

    const { getPendingBankTransferPayments } = require('../services/payment.service');
    const payments = await getPendingBankTransferPayments();

    console.log(`✅ Found ${payments.length} pending payments`);

    return res.json({
      message: 'Success',
      data: payments
    });
  } catch (error: any) {
    console.error('❌ Error getting pending payments:', error);
    logger.error(`Error getting pending payments: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};
