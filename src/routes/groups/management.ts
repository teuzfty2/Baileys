"use client";

import { Router, Request, Response } from 'express';
import { BaileysManager } from '../../services/baileys';
import { mongoMiddleware } from '../../middleware/database';

const router = Router();

/**
 * @swagger
 * /groups/management/create:
 *   post:
 *     summary: Criação de grupo e salvamento no MongoDB com estrutura aninhada
 *     tags: [Groups Management]
 *     parameters:
 *       - in: header
 *         name: x-base
 *         schema: { type: string, default: "watools_db" }
 *       - in: header
 *         name: x-collection
 *         schema: { type: string, default: "user_management" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, apiToken, name, participants]
 *             properties:
 *               userId: { type: string }
 *               apiToken: { type: string }
 *               name: { type: string }
 *               description: { type: string }
 *               image: { type: string }
 *               participants: { type: array, items: { type: string } }
 */
router.post('/create', mongoMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, apiToken, name, participants, image, description } = req.body;
    
    // 1. Cria no WhatsApp via Baileys usando o apiToken
    const sock = await BaileysManager.getSession(apiToken);
    const group = await sock.groupCreate(name, participants);
    
    if (image) {
      try { await sock.updateProfilePicture(group.id, { url: image }); } catch (e) {}
    }
    if (description) {
      try { await sock.groupUpdateDescription(group.id, description); } catch (e) {}
    }

    // 2. Manipula o MongoDB para a estrutura UsergroupManagement
    let userDoc = await req.mongoCollection.findOne({ user_id: userId });
    
    if (!userDoc) {
      userDoc = { user_id: userId, groupManagement: [] };
    }

    let tokenDoc = userDoc.groupManagement.find((t: any) => t.api_token === apiToken);
    if (!tokenDoc) {
      tokenDoc = { api_token: apiToken, groups: [], community: [] };
      userDoc.groupManagement.push(tokenDoc);
    }

    // Adiciona o novo grupo na estrutura
    tokenDoc.groups.push({
      id: group.id,
      name: group.subject,
      picture: image || "",
      description: description || "",
      admins: [sock.user?.id?.split(':')[0] + '@s.whatsapp.net', ...participants]
    });

    // Salva no banco de dados
    await req.mongoCollection.updateOne(
      { user_id: userId },
      { $set: { groupManagement: userDoc.groupManagement } },
      { upsert: true }
    );
    
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
 *         name: apiToken
 *         required: true
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { apiToken } = req.query;
    const sock = await BaileysManager.getSession(apiToken as string);
    const groups = await sock.groupFetchAllParticipating();
    res.status(200).json({ success: true, data: Object.values(groups) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;