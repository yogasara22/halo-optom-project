import { Router } from 'express';
import { getReports, generateReport, downloadReport, previewReport } from '../controllers/reports.controller';
import { authMiddleware, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();

// Get list of recent reports
router.get(
    '/',
    authMiddleware,
    authorize([UserRole.Admin]),
    getReports
);

// Generate a new report (creates record)
router.post(
    '/generate',
    authMiddleware,
    authorize([UserRole.Admin]),
    generateReport
);

// Download a report as CSV (streams file)
router.get(
    '/download/:id',
    authMiddleware,
    authorize([UserRole.Admin]),
    downloadReport
);

// Preview report data
router.get(
    '/preview/:id',
    authMiddleware,
    authorize([UserRole.Admin]),
    previewReport
);

export default router;
