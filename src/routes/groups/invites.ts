"use client";

import { Router, Request, Response } from 'express';
import { BaileysManager } from '../../services/baileys';

const router = Router();

/**
 * @swagger
 * /groups/invites/link:
 *   get:
 *     summary: Gera o link de convite do grupo
 *     tags: [Groups Invites]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *       - in: query
 *         name: groupId
 *         required: true
 */
router.get('/link', async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId } = req.query;
    const sock = await BaileysManager.getSession(sessionId as string);
    const code = await sock.groupInviteCode(groupId as string);
    res.status(200).json({ success: true, link: `https://chat.whatsapp.com/${code}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;