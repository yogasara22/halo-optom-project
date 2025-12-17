import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { 
  createMedicalRecord, 
  getMedicalRecordsByPatient, 
  getMedicalRecordDetail 
} from '../controllers/medicalRecord.controller';

const router = Router();
// Buat catatan medis (hanya optometrist)
router.post('/', authMiddleware, createMedicalRecord);
// Ambil semua catatan medis pasien tertentu
router.get('/patient/:patient_id', authMiddleware, getMedicalRecordsByPatient);
// Ambil detail catatan medis berdasarkan ID
router.get('/:id', authMiddleware, getMedicalRecordDetail);

export default router;
