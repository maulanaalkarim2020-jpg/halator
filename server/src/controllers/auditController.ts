import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { AuditHistory } from '../models/AuditHistory.js';
import { User } from '../models/User.js';
import { isDbConnected, localStore } from '../config/storageEngine.js';

export const getAudits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terotentikasi.' });
      return;
    }

    const { type, limit = 50, page = 1 } = req.query;
    const userId = (req.user._id || req.user.id).toString();

    if (isDbConnected()) {
      const filter: Record<string, any> = { userId };
      if (type && ['product', 'process', 'transaction'].includes(type as string)) {
        filter.type = type;
      }
      const skip = (Number(page) - 1) * Number(limit);
      const [items, total] = await Promise.all([
        AuditHistory.find(filter).sort({ timestamp: -1 }).skip(skip).limit(Number(limit)),
        AuditHistory.countDocuments(filter),
      ]);
      res.status(200).json({
        success: true,
        data: { items, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
      });
      return;
    }

    // LocalStore fallback
    let allAudits = localStore.getAudits().filter((a) => a.userId === userId);
    if (type && ['product', 'process', 'transaction'].includes(type as string)) {
      allAudits = allAudits.filter((a) => a.type === type);
    }
    const total = allAudits.length;
    const skip = (Number(page) - 1) * Number(limit);
    const items = allAudits.slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      data: { items, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat audit.',
      error: error.message,
    });
  }
};

export const createAudit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terotentikasi.' });
      return;
    }

    const { type, input, output } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    if (!type || !input || !output) {
      res.status(400).json({
        success: false,
        message: 'Tipe audit, data masukan, dan hasil audit wajib diisi.',
      });
      return;
    }

    const limits = req.user.subscription?.limits || { auditsPerMonth: 5, auditsUsed: 0 };
    if (limits.auditsUsed >= limits.auditsPerMonth && req.user.subscription?.plan === 'free') {
      res.status(403).json({
        success: false,
        message: 'Batas kuota audit bulanan Anda telah tercapai. Tingkatkan paket langganan Anda ke Pro untuk audit tanpa batas.',
        code: 'LIMIT_REACHED',
      });
      return;
    }

    if (isDbConnected()) {
      const auditItem = new AuditHistory({
        userId,
        type,
        input,
        output,
        timestamp: new Date(),
      });
      await auditItem.save();
      await User.findByIdAndUpdate(userId, {
        $inc: { 'subscription.limits.auditsUsed': 1 },
      });
      res.status(201).json({
        success: true,
        message: 'Hasil audit berhasil disimpan.',
        data: { audit: auditItem },
      });
      return;
    }

    // LocalStore fallback
    const auditItem = localStore.createAudit({
      userId,
      type,
      input,
      output,
    });

    res.status(201).json({
      success: true,
      message: 'Hasil audit berhasil disimpan.',
      data: { audit: auditItem },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan riwayat audit.',
      error: error.message,
    });
  }
};

export const deleteAudit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terotentikasi.' });
      return;
    }

    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    if (isDbConnected()) {
      const deleted = await AuditHistory.findOneAndDelete({ _id: id, userId });
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Data riwayat audit tidak ditemukan atau Anda tidak memiliki akses.',
        });
        return;
      }
      res.status(200).json({ success: true, message: 'Riwayat audit berhasil dihapus.' });
      return;
    }

    const audits = localStore.getAudits();
    const filtered = audits.filter((a) => !(a.id === id && a.userId === userId));
    if (filtered.length === audits.length) {
      res.status(404).json({
        success: false,
        message: 'Data riwayat audit tidak ditemukan atau Anda tidak memiliki akses.',
      });
      return;
    }
    localStore.saveAudits(filtered);
    res.status(200).json({ success: true, message: 'Riwayat audit berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data audit.',
      error: error.message,
    });
  }
};

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terotentikasi.' });
      return;
    }

    const userId = (req.user._id || req.user.id).toString();

    if (isDbConnected()) {
      const [total, productCount, processCount, transactionCount] = await Promise.all([
        AuditHistory.countDocuments({ userId }),
        AuditHistory.countDocuments({ userId, type: 'product' }),
        AuditHistory.countDocuments({ userId, type: 'process' }),
        AuditHistory.countDocuments({ userId, type: 'transaction' }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          total,
          byType: { product: productCount, process: processCount, transaction: transactionCount },
          quota: req.user.subscription?.limits || { auditsPerMonth: 5, auditsUsed: 0 },
          plan: req.user.subscription?.plan || 'free',
        },
      });
      return;
    }

    const userAudits = localStore.getAudits().filter((a) => a.userId === userId);
    res.status(200).json({
      success: true,
      data: {
        total: userAudits.length,
        byType: {
          product: userAudits.filter((a) => a.type === 'product').length,
          process: userAudits.filter((a) => a.type === 'process').length,
          transaction: userAudits.filter((a) => a.type === 'transaction').length,
        },
        quota: req.user.subscription?.limits || { auditsPerMonth: 5, auditsUsed: 0 },
        plan: req.user.subscription?.plan || 'free',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data statistik.',
      error: error.message,
    });
  }
};
