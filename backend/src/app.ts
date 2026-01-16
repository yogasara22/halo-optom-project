import express from 'express';
import { sanitizeResponse } from "./middlewares/sanitizeResponse";
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import 'reflect-metadata';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import adminMedicalRecordRoutes from './routes/adminMedicalRecord.routes';
import appointmentRoutes from './routes/appointment.routes';
import scheduleRoutes from './routes/schedule.routes';
import videoSdkRoutes from './routes/videosdk.routes';
import medicalRecordRoutes from './routes/medicalRecord.routes';
import chatRoutes from './routes/chat.routes';
import notificationRoutes from './routes/notification.routes';
import reviewRoutes from './routes/review.routes';
import productRoutes from './routes/product.routes';
import optometristRoutes from './routes/optometrist.routes';
import orderRoutes from './routes/order.routes';
import servicePricingRoutes from './routes/servicePricing.routes';
import paymentOrderRoutes from './routes/payment-order.routes';
import paymentAppointmentRoutes from './routes/payment-appoinment.routes';
import paymentRoutes from './routes/payment.routes';
import analyticsRoutes from './routes/analytics.routes';
import reportsRoutes from './routes/reports.routes';


// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files (multiple fallbacks to ensure cross-env paths)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use('/uploads', express.static(path.resolve(__dirname, './uploads')));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// 🔒 Middleware global sebelum routes
app.use(sanitizeResponse);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminMedicalRecordRoutes); // Tambahkan rute admin medical records
app.use('/api/schedules', scheduleRoutes);
app.use('/api/videosdk', videoSdkRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients/appointments', appointmentRoutes);
app.use('/api/medicalRecords', medicalRecordRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/products', productRoutes);
app.use('/api/optometrists', optometristRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', servicePricingRoutes);
app.use('/api/payments-appointment', paymentAppointmentRoutes);
app.use('/api/payments-order', paymentOrderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);

// Simple test route
app.get('/', (_req, res) => {
  res.json({ message: 'API is running 🚀' });
});

export default app;
