import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Affiliate } from '../models/Affiliate.js';

export const getAffiliateData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terotentikasi.' });
      return;
    }

    let affiliate = await Affiliate.findOne({ userId: req.user._id });

    if (!affiliate) {
      affiliate = await Affiliate.create({
        userId: req.user._id,
        code: req.user.affiliateCode || 'HLT' + Math.floor(1000 + Math.random() * 9000),
        referrals: 0,
        earnings: 0,
        payoutHistory: [],
      });
    }

    res.status(200).json({
      success: true,
      data: {
        affiliate,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data afiliasi.',
      error: error.message,
    });
  }
};

export const requestPayout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terotentikasi.' });
      return;
    }

    const { amount } = req.body;
    const payoutAmount = Number(amount);

    if (!payoutAmount || payoutAmount < 50000) {
      res.status(400).json({
        success: false,
        message: 'Minimal penarikan komisi adalah Rp 50.000.',
      });
      return;
    }

    const affiliate = await Affiliate.findOne({ userId: req.user._id });

    if (!affiliate || affiliate.earnings < payoutAmount) {
      res.status(400).json({
        success: false,
        message: 'Saldo komisi Anda tidak mencukupi untuk penarikan ini.',
      });
      return;
    }

    affiliate.earnings -= payoutAmount;
    affiliate.payoutHistory.unshift({
      date: new Date(),
      amount: payoutAmount,
      status: 'Pending',
      referenceId: `WD-${Date.now()}`,
    });

    await affiliate.save();

    res.status(200).json({
      success: true,
      message: 'Permintaan penarikan berhasil diajukan dan sedang diproses.',
      data: {
        affiliate,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gagal memproses penarikan komisi.',
      error: error.message,
    });
  }
};
