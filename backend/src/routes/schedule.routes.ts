import { Router } from 'express';
import {
  createSchedule,
  bulkCreateSchedules,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule
} from '../controllers/schedule.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Semua route butuh autentikasi
router.use(authMiddleware);

// Create single schedule
router.post('/', createSchedule);

// Bulk create weekly schedules
router.post('/bulk', bulkCreateSchedules);

// Get schedules (dengan optional filter optometrist_id & day_of_week)
router.get('/', getSchedules);

// Get schedule by ID
router.get('/:id', getScheduleById);

// Update schedule by ID
router.put('/:id', updateSchedule);

// Delete schedule by ID
router.delete('/:id', deleteSchedule);

export default router;
