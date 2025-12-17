// src/routes/user.routes.ts
import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  verifyUser,
  toggleUserStatus,
  updateProfile,
  setupAdmin,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { updateAvatarAdmin, updateMyAvatar } from '../controllers/user.controller';

const router = Router();

// Multer storage config for avatars (persist outside src to align with static /uploads)
const avatarDir = path.resolve(__dirname, '../../uploads/avatars');
try { fs.mkdirSync(avatarDir, { recursive: true }); } catch {}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('File harus berupa gambar (png, jpg, jpeg, webp)'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * Admin routes
 */
router.get("/", authMiddleware, adminMiddleware, getAllUsers); // GET semua user
router.get("/:id", authMiddleware, adminMiddleware, getUserById); // GET user by ID
router.post("/", authMiddleware, adminMiddleware, createUser); // CREATE user
router.put("/:id", authMiddleware, adminMiddleware, updateUser); // UPDATE user by ID
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser); // DELETE user
router.patch("/:id/verify", authMiddleware, adminMiddleware, verifyUser); // VERIFY optometris
router.patch("/:id/toggle-status", authMiddleware, adminMiddleware, toggleUserStatus); // TOGGLE user status
router.post("/setup-admin", setupAdmin); // SETUP admin (hanya sekali)
router.post('/:id/avatar', authMiddleware, adminMiddleware, (req, res) => {
  upload.single('avatar')(req, res, (err: any) => {
    if (err) {
      const status = err?.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({ message: err.message || 'Gagal mengunggah file' });
    }
    return updateAvatarAdmin(req, res);
  });
});

/**
 * User routes (profil sendiri)
 */
router.put("/profile/update", authMiddleware, updateProfile); // UPDATE profil sendiri
router.post('/profile/avatar', authMiddleware, (req, res) => {
  upload.single('avatar')(req, res, (err: any) => {
    if (err) {
      const status = err?.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({ message: err.message || 'Gagal mengunggah file' });
    }
    return updateMyAvatar(req, res);
  });
});

export default router;
