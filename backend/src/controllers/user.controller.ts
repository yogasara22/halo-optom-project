// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User, UserRole } from '../entities/User';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

// 📌 GET all users (untuk dashboard admin)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find({
      order: { created_at: 'DESC' },
    });

    // Map backend fields to frontend expected format
    const mappedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar_url: user.avatar_url,
      bio: user.bio,
      experience: user.experience,
      certifications: user.certifications,
      rating: user.rating,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      address: user.address,
      str_number: user.str_number,
      chat_commission_percentage: user.chat_commission_percentage,
      video_commission_percentage: user.video_commission_percentage,
      isActive: user.is_verified, // Map is_verified to isActive for frontend
      createdAt: user.created_at, // Map created_at to createdAt for frontend
      updatedAt: user.updated_at, // Map updated_at to updatedAt for frontend
    }));

    return res.json(mappedUsers);
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 📌 GET user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Map backend fields to frontend expected format
    const mappedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar_url: user.avatar_url,
      bio: user.bio,
      experience: user.experience,
      certifications: user.certifications,
      rating: user.rating,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      address: user.address,
      str_number: user.str_number,
      chat_commission_percentage: user.chat_commission_percentage,
      video_commission_percentage: user.video_commission_percentage,
      isActive: user.is_verified, // Map is_verified to isActive for frontend
      createdAt: user.created_at, // Map created_at to createdAt for frontend
      updatedAt: user.updated_at, // Map updated_at to updatedAt for frontend
    };

    return res.json(mappedUser);
  } catch (err) {
    console.error('getUserById error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 📌 CREATE user (opsional dari admin)
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      date_of_birth,
      gender,
      address,
      avatar_url,
      bio,
      experience,
      certifications
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, role wajib diisi' });
    }

    if (![UserRole.Admin, UserRole.Pasien, UserRole.Optometris].includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = userRepo.create({
      name,
      email,
      password_hash,
      role,
      phone,
      date_of_birth: date_of_birth && date_of_birth.trim() !== '' ? date_of_birth : null,
      gender,
      address,
      avatar_url,
      bio,
      experience,
      certifications,
      is_verified: true, // Semua pengguna baru default aktif
    });

    await userRepo.save(user);

    // Map backend fields to frontend expected format
    const mappedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar_url: user.avatar_url,
      bio: user.bio,
      experience: user.experience,
      certifications: user.certifications,
      rating: user.rating,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      address: user.address,
      str_number: user.str_number,
      chat_commission_percentage: user.chat_commission_percentage,
      video_commission_percentage: user.video_commission_percentage,
      isActive: user.is_verified, // Map is_verified to isActive for frontend
      createdAt: user.created_at, // Map created_at to createdAt for frontend
      updatedAt: user.updated_at, // Map updated_at to updatedAt for frontend
    };

    return res.status(201).json(mappedUser);
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 📌 UPDATE user (edit data profil dari admin)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      role,
      is_verified,
      date_of_birth,
      gender,
      address,
      avatar_url,
      bio,
      experience,
      certifications,
    } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.role = role ?? user.role;
    user.is_verified = is_verified ?? user.is_verified;
    user.date_of_birth = date_of_birth && date_of_birth.trim() !== '' ? date_of_birth : (date_of_birth === '' ? null : user.date_of_birth);
    user.gender = gender ?? user.gender;
    user.address = address ?? user.address;
    user.avatar_url = avatar_url ?? user.avatar_url;
    user.bio = bio ?? user.bio;
    user.experience = experience ?? user.experience;
    user.certifications = certifications ?? user.certifications;
    user.chat_commission_percentage = req.body.chat_commission_percentage ?? user.chat_commission_percentage;
    user.video_commission_percentage = req.body.video_commission_percentage ?? user.video_commission_percentage;

    await userRepo.save(user);

    // Map backend fields to frontend expected format
    const mappedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar_url: user.avatar_url,
      bio: user.bio,
      experience: user.experience,
      certifications: user.certifications,
      rating: user.rating,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      address: user.address,
      str_number: user.str_number,
      chat_commission_percentage: user.chat_commission_percentage,
      video_commission_percentage: user.video_commission_percentage,
      isActive: user.is_verified, // Map is_verified to isActive for frontend
      createdAt: user.created_at, // Map created_at to createdAt for frontend
      updatedAt: user.updated_at, // Map updated_at to updatedAt for frontend
    };

    return res.json(mappedUser);
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 📌 DELETE user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await userRepo.remove(user);
    return res.json({ message: 'User berhasil dihapus', deleted_id: id });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 📌 VERIFY optometrist
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.is_verified = true;
    await userRepo.save(user);

    // Map backend fields to frontend expected format
    const mappedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar_url: user.avatar_url,
      bio: user.bio,
      experience: user.experience,
      certifications: user.certifications,
      rating: user.rating,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      address: user.address,
      str_number: user.str_number,
      chat_commission_percentage: user.chat_commission_percentage,
      video_commission_percentage: user.video_commission_percentage,
      isActive: user.is_verified, // Map is_verified to isActive for frontend
      createdAt: user.created_at, // Map created_at to createdAt for frontend
      updatedAt: user.updated_at, // Map updated_at to updatedAt for frontend
    };

    return res.json({
      message: 'User berhasil diverifikasi',
      user: mappedUser
    });
  } catch (err) {
    console.error('verifyUser error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 📌 TOGGLE user status (activate/deactivate)
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.is_verified = isActive;
    await userRepo.save(user);

    // Map backend fields to frontend expected format
    const mappedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar_url: user.avatar_url,
      bio: user.bio,
      experience: user.experience,
      certifications: user.certifications,
      rating: user.rating,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      address: user.address,
      str_number: user.str_number,
      chat_commission_percentage: user.chat_commission_percentage,
      video_commission_percentage: user.video_commission_percentage,
      isActive: user.is_verified, // Map is_verified to isActive for frontend
      createdAt: user.created_at, // Map created_at to createdAt for frontend
      updatedAt: user.updated_at, // Map updated_at to updatedAt for frontend
    };

    return res.json(mappedUser);
  } catch (err) {
    console.error('toggleUserStatus error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 📌 UPDATE profile (untuk pasien & optometris)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // ambil dari JWT middleware (pastikan sudah ada)
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      name,
      phone,
      date_of_birth,
      gender,
      address,
      avatar_url,
      bio,
      experience,
      certifications,
      str_number,
    } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // hanya field profil yang bisa diupdate
    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.date_of_birth = date_of_birth ?? user.date_of_birth;
    user.gender = gender ?? user.gender;
    user.address = address ?? user.address;
    user.avatar_url = avatar_url ?? user.avatar_url;

    // tambahan khusus optometris
    if (user.role === "optometris") {
      user.bio = bio ?? user.bio;
      user.experience = experience ?? user.experience;
      user.certifications = certifications ?? user.certifications;
      user.str_number = str_number ?? user.str_number;
    }

    await userRepo.save(user);
    return res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// create admin (hanya sekali)
export const setupAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, dan password wajib diisi' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = userRepo.create({
      name,
      email,
      password_hash,
      role: UserRole.Admin, // langsung admin
      is_verified: true,
    });

    await userRepo.save(user);

    // ⬅️ Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret', // ambil dari env
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Admin berhasil dibuat',
      user,
      token, // ⬅️ kirim token
    });
  } catch (err) {
    console.error('setupAdmin error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAvatarAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = (req as any).file as Express.Multer.File;
    if (!file) return res.status(400).json({ message: 'File avatar diperlukan' });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${file.filename}`;
    user.avatar_url = publicUrl;
    await userRepo.save(user);
    return res.json({ message: 'Avatar updated', avatar_url: publicUrl, user: { id: user.id, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error('updateAvatarAdmin error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMyAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const file = (req as any).file as Express.Multer.File;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!file) return res.status(400).json({ message: 'File avatar diperlukan' });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${file.filename}`;
    user.avatar_url = publicUrl;
    await userRepo.save(user);
    return res.json({ message: 'Avatar updated', avatar_url: publicUrl, user: { id: user.id, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error('updateMyAvatar error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
