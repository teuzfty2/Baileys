"use client";

import { Router, Request, Response } from 'express';
import { BaileysManager } from '../../services/baileys';

const router = Router();

/**
 * @swagger
 * /groups/management/create:
 *   post:
 *     summary: Criação completa de grupo
 *     tags: [Groups Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, name, participants]
 *             properties:
 *               sessionId: { type: string }
 *               name: { type: string }
 *               participants: { type: array, items: { type: string } }
 *               image: { type: string }
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { sessionId, name, participants, image } = req.body;
    const sock = await BaileysManager.getSession(sessionId);
    const group = await sock.groupCreate(name, participants);
    
    if (image) {
      await sock.updateProfilePicture(group.id, { url: image });
    }
    
    res.status(200).json({ success: true, data: group });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /groups/management/list:
 *   get:
 *     summary: Lista todos os grupos do usuário
 *     tags: [Groups Management]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;
    const sock = await BaileysManager.getSession(sessionId as string);
    const groups = await sock.groupFetchAllParticipating();
    res.status(200).json({ success: true, data: Object.values(groups) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;