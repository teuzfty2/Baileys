"use client";

import { Router, Request, Response } from 'express';
import { BaileysManager } from '../../services/baileys';
import { mongoMiddleware } from '../../middleware/database';

const router = Router();

/**
 * @swagger
 * /groups/management/create:
 *   post:
 *     summary: Criação de grupo e salvamento no MongoDB
 *     tags: [Groups Management]
 *     parameters:
 *       - in: header
 *         name: x-base
 *         schema: { type: string, default: "watools_db" }
 *       - in: header
 *         name: x-collection
 *         schema: { type: string, default: "platform_groups" }
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
 */
router.post('/create', mongoMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId, name, participants, image } = req.body;
    
    // 1. Cria no WhatsApp via Baileys
    const sock = await BaileysManager.getSession(sessionId);
    const group = await sock.groupCreate(name, participants);
    
    if (image) {
      await sock.updateProfilePicture(group.id, { url: image });
    }

    // 2. Salva no MongoDB para controle da plataforma
    await req.mongoCollection.insertOne({
      sessionId,
      groupId: group.id,
      name: group.subject,
      platformCreated: true,
      createdAt: new Date(),
      participantsCount: participants.length + 1 // + o criador
    });
    
    res.status(200).json({ success: true, data: group });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /groups/management/list:
 *   get:
 *     summary: Lista todos os grupos do WhatsApp (Baileys)
 *     tags: [Groups Management]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
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