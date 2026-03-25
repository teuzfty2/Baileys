"use client";

import { Router, Request, Response } from 'express';
import { BaileysManager } from '../../services/baileys';

const router = Router();

/**
 * @swagger
 * /groups/settings/update:
 *   patch:
 *     summary: Atualiza configurações do grupo (Trancas)
 *     tags: [Groups Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [apiToken, groupId, setting]
 *             properties:
 *               apiToken: { type: string }
 *               groupId: { type: string }
 *               setting: { type: string, enum: [announcement, not_announcement, locked, unlocked, membership_approval_mode, not_membership_approval_mode] }
 */
router.patch('/update', async (req: Request, res: Response) => {
  try {
    const { apiToken, groupId, setting } = req.body;
    const sock = await BaileysManager.getSession(apiToken);
    await sock.groupSettingUpdate(groupId, setting as any);
    res.status(200).json({ success: true, message: `Configuração ${setting} aplicada.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;