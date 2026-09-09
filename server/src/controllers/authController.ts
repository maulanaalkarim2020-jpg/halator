import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Affiliate } from '../models/Affiliate.js';
import { AuditHistory } from '../models/AuditHistory.js';
import { AuthRequest } from '../middleware/auth.js';
import { isDbConnected, localStore } from '../config/storageEngine.js';

const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'halator_secure_jwt_secret_key_2026_xyz987';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: expiresIn as any });
};

const generateAffiliateCode = (name: string): string => {
  const clean = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'HLT';
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${clean}${random}`;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, gender, businessName, businessAddress, referredBy } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Nama, email, dan kata sandi wajib diisi.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Kata sandi minimal 6 karakter.',
      });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    const affiliateCode = generateAffiliateCode(name);

    // MODE 1: Real MongoDB Connected
    if (isDbConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan login atau gunakan email lain.',
        });
        return;
      }

      const newUser = new User({
        name: name.trim(),
        email: cleanEmail,
        password,
        phone,
        gender,
        businessName,
        businessAddress,
        avatar,
        affiliateCode,
        referredBy,
        role: 'user',
        subscription: {
          plan: 'free',
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          limits: {
            auditsPerMonth: 5,
            auditsUsed: 0,
          },
        },
      });

      await newUser.save();

      try {
        await Affiliate.create({
          userId: newUser._id,
          code: affiliateCode,
          referrals: 0,
          earnings: 0,
          payoutHistory: [],
        });

        if (referredBy) {
          await Affiliate.findOneAndUpdate(
            { code: referredBy.toUpperCase().trim() },
            { $inc: { referrals: 1, earnings: 25000 } }
          );
        }
      } catch (affErr) {
        console.warn('[Affiliate Setup Warning]', affErr);
      }

      const token = generateToken(newUser._id.toString());

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil! Selamat datang di Halator.',
        data: {
          user: newUser,
          token,
        },
      });
      return;
    }

    // MODE 2: Local Storage Engine Fallback (When MongoDB is not connected yet)
    const existingLocal = localStore.findUserByEmail(cleanEmail);
    if (existingLocal) {
      res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan login atau gunakan email lain.',
      });
      return;
    }

    const createdUser = await localStore.createUser({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone,
      gender,
      businessName,
      businessAddress,
      avatar,
      affiliateCode,
      referredBy,
      role: 'user',
      subscription: {
        plan: 'free',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        limits: {
          auditsPerMonth: 5,
          auditsUsed: 0,
        },
      },
    });

    const token = generateToken(createdUser.id);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Selamat datang di Halator.',
      data: {
        user: createdUser,
        token,
      },
    });
  } catch (error: any) {
    console.error('[Register Error]', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat registrasi.',
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email dan kata sandi wajib diisi.',
      });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // MODE 1: Real MongoDB Connected
    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Email atau kata sandi yang Anda masukkan salah.',
        });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Email atau kata sandi yang Anda masukkan salah.',
        });
        return;
      }

      const token = generateToken(user._id.toString());

      res.status(200).json({
        success: true,
        message: 'Login berhasil.',
        data: {
          user,
          token,
        },
      });
      return;
    }

    // MODE 2: Local Storage Engine Fallback
    const localUser = localStore.findUserByEmail(cleanEmail);
    if (!localUser) {
      res.status(401).json({
        success: false,
        message: 'Email atau kata sandi yang Anda masukkan salah.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, localUser.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Email atau kata sandi yang Anda masukkan salah.',
      });
      return;
    }

    const token = generateToken(localUser.id);
    const { password: _, ...safeUser } = localUser;

    res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error: any) {
    console.error('[Login Error]', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat proses login.',
      error: error.message,
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profil.',
      error: error.message,
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terotentikasi.' });
      return;
    }

    const allowedFields = ['name', 'email', 'phone', 'gender', 'businessName', 'businessAddress', 'avatar'];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'email') {
          updates.email = req.body.email.trim().toLowerCase();
        } else if (typeof req.body[field] === 'string') {
          updates[field] = req.body[field].trim();
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    if (updates.email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(updates.email)) {
        res.status(400).json({
          success: false,
          message: 'Format email tidak valid.',
        });
        return;
      }
    }

    if (isDbConnected()) {
      if (updates.email) {
        const existing = await User.findOne({
          email: updates.email,
          _id: { $ne: req.user._id },
        });
        if (existing) {
          res.status(400).json({
            success: false,
            message: 'Email tersebut sudah digunakan oleh akun lain.',
          });
          return;
        }
      }

      // If name changed, update affiliate code too so MongoDB affiliates collection stays in sync!
      if (updates.name) {
        const initials = updates.name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'USER';
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        updates.affiliateCode = `${initials}${randomSuffix}`;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (updates.affiliateCode) {
        await Affiliate.findOneAndUpdate(
          { userId: req.user._id },
          { $set: { code: updates.affiliateCode } },
          { upsert: true }
        );
      }

      res.status(200).json({
        success: true,
        message: 'Profil berhasil diperbarui.',
        data: {
          user: updatedUser,
        },
      });
      return;
    }

    // Local Store update
    const users = localStore.getUsers();
    const currentId = (req.user as any).id || (req.user as any)._id;
    if (updates.email) {
      const existing = users.find(
        (u) => u.email.toLowerCase().trim() === updates.email && u.id !== currentId
      );
      if (existing) {
        res.status(400).json({
          success: false,
          message: 'Email tersebut sudah digunakan oleh akun lain.',
        });
        return;
      }
    }

    const idx = users.findIndex((u) => u.id === currentId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
      localStore.saveUsers(users);
      const { password: _, ...safeUser } = users[idx];
      res.status(200).json({
        success: true,
        message: 'Profil berhasil diperbarui.',
        data: { user: safeUser },
      });
      return;
    }

    res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil.',
      error: error.message,
    });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terotentikasi.' });
      return;
    }

    const userId = (req.user._id || req.user.id).toString();

    if (isDbConnected()) {
      // 1. Delete user record in MongoDB
      await User.findByIdAndDelete(req.user._id);

      // 2. Delete all audit history of this user in MongoDB
      await AuditHistory.deleteMany({ userId });

      // 3. Delete affiliate record in MongoDB
      await Affiliate.deleteMany({ userId: req.user._id });

      res.status(200).json({
        success: true,
        message: 'Akun dan seluruh data Anda di MongoDB berhasil dihapus permanen.',
      });
      return;
    }

    // Local Store fallback deletion
    const users = localStore.getUsers();
    localStore.saveUsers(users.filter((u) => u.id !== userId));

    const audits = localStore.getAudits();
    localStore.saveAudits(audits.filter((a) => a.userId !== userId));

    res.status(200).json({
      success: true,
      message: 'Akun dan seluruh data berhasil dihapus permanen.',
    });
  } catch (error: any) {
    console.error('[Delete Account Error]', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus akun dari server.',
      error: error.message,
    });
  }
};
