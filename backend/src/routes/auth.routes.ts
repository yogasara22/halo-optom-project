// src/routes/auth.routes.ts
import { Router } from 'express';
import { login, register, verify } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/verify', authenticateToken, verify);

export default router;
