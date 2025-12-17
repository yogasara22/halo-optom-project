import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import {
  getAllMedicalRecords,
  downloadMedicalRecordsReport,
  downloadPatientMedicalRecordsReport,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecordStats
} from '../controllers/adminMedicalRecord.controller';

const router = Router();

// Semua route admin wajib pakai authMiddleware + adminMiddleware

// 1. Endpoint untuk Melihat Semua Rekam Medis
router.get('/medical-records', authMiddleware, adminMiddleware, getAllMedicalRecords);

// 2. Endpoint untuk Mengunduh Laporan Rekam Medis
router.get('/medical-records/report', authMiddleware, adminMiddleware, downloadMedicalRecordsReport);

// 3. Endpoint untuk Mengunduh Laporan Rekam Medis per Pasien
router.get('/medical-records/patient/:patient_id/report', authMiddleware, adminMiddleware, downloadPatientMedicalRecordsReport);

// 4. Endpoint untuk Mengedit Rekam Medis (opsional)
router.put('/medical-records/:id', authMiddleware, adminMiddleware, updateMedicalRecord);

// 5. Endpoint untuk Menghapus Rekam Medis (opsional)
router.delete('/medical-records/:id', authMiddleware, adminMiddleware, deleteMedicalRecord);

// 6. Endpoint untuk Mendapatkan Statistik Rekam Medis
router.get('/stats/medical-records', authMiddleware, adminMiddleware, getMedicalRecordStats);

export default router;