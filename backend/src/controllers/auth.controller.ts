// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User, UserRole } from '../entities/User';
import * as bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } }); // lebih fleksibel

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const JWT_SECRET = process.env.JWT_SECRET as Secret;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const expiresIn: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN || '7d') as any;
    const payload = { id: user.id, role: user.role };

    // cast ke jwt.Secret untuk kepastian tipe
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);

    const userSafe = {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      avatar_url: user.avatar_url ?? null,
    };

    return res.json({ token, user: userSafe });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
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
      str_number
    } = req.body ?? {};

    // Validasi data dasar
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, dan role wajib diisi' });
    }

    // Role hanya boleh pasien atau optometris
    if (![UserRole.Pasien, UserRole.Optometris].includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid, hanya pasien atau optometris' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Buat user baru
    const user = userRepo.create({
      name,
      email,
      password_hash,
      role,
      phone,
      date_of_birth,
      gender,
      address,
      str_number,
      is_verified: role === UserRole.Pasien ? true : false // pasien langsung aktif, optometris tunggu verifikasi admin
    });

    await userRepo.save(user);

    // Buat JWT
    const JWT_SECRET = process.env.JWT_SECRET as Secret;
    const expiresIn: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN || '7d') as any;
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    // Response
    const userSafe = {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      avatar_url: user.avatar_url ?? null
    };

    return res.status(201).json({ token, user: userSafe });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const verify = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userSafe = {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      avatar_url: user.avatar_url ?? null,
      is_verified: user.is_verified
    };

    return res.json({ user: userSafe });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};