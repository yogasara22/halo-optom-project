// src/routes/appointment.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { createAppointment, getAppointments, getNextAppointment, updateAppointmentCommission } from '../controllers/appointment.controller';

const router = Router();

router.post('/', authMiddleware, createAppointment);
router.get('/', authMiddleware, getAppointments);
router.get('/next', authMiddleware, getNextAppointment);
router.patch('/:id/commission', authMiddleware, adminMiddleware, updateAppointmentCommission);

export default router;
