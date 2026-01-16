// src/routes/appointment.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { createAppointment, getAppointments, getNextAppointment, updateAppointmentCommission, createAppointmentPayment, getConsultationDetails, getAppointmentById, updateAppointmentStatus, rescheduleAppointment } from '../controllers/appointment.controller';

const router = Router();

router.post('/', authMiddleware, createAppointment);
router.get('/', authMiddleware, getAppointments);
router.get('/next', authMiddleware, getNextAppointment);
router.post('/:id/payment', authMiddleware, createAppointmentPayment);
router.get('/:id/consultation', authMiddleware, getConsultationDetails);
router.patch('/:id/commission', authMiddleware, adminMiddleware, updateAppointmentCommission);
router.get('/:id', authMiddleware, getAppointmentById);
router.patch('/:id/status', authMiddleware, updateAppointmentStatus);
router.patch('/:id/reschedule', authMiddleware, rescheduleAppointment);

export default router;
