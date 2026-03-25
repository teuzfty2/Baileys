"use client";

import { Router, Request, Response } from 'express';
import { BaileysManager } from '../../services/baileys';
import { mongoMiddleware } from '../../middleware/database';

const router = Router();

/**
 * @swagger
 * /groups/communities/create:
 *   post:
 *     summary: Cria uma nova comunidade e salva no MongoDB
 *     tags: [Communities]
 *     parameters:
 *       - in: header
 *         name: x-base
 *         schema: { type: string, default: "watools_db" }
 *       - in: header
 *         name: x-collection
 *         schema: { type: string, default: "platform_communities" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, name, description]
 *             properties:
 *               sessionId: { type: string }
 *               name: { type: string }
 *               description: { type: string }
 */
router.post('/create', mongoMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId, name, description } = req.body;
    const sock = await BaileysManager.getSession(sessionId);

    // 1. Cria a comunidade no WhatsApp
    // O Baileys usa o groupCreate com a flag isCommunity ou communityCreate dependendo da versão
    // Na versão 7.0.0-rc.9 usamos o communityCreate
    const community = await (sock as any).communityCreate(name, description);

    // 2. Salva no MongoDB
    await req.mongoCollection.insertOne({
      sessionId,
      communityId: community.id,
      name: community.subject,
      description,
      platformCreated: true,
      createdAt: new Date()
    });

    res.status(200).json({ success: true, data: community });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /groups/communities/link-groups:
 *   post:
 *     summary: Vincula grupos existentes a uma comunidade
 *     tags: [Communities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, communityId, groupIds]
 *             properties:
 *               sessionId: { type: string }
 *               communityId: { type: string }
 *               groupIds: { type: array, items: { type: string } }
 */
router.post('/link-groups', async (req: Request, res: Response) => {
  try {
    const { sessionId, communityId, groupIds } = req.body;
    const sock = await BaileysManager.getSession(sessionId);

    // No WhatsApp, vincular grupos a uma comunidade envolve atualizar os metadados do grupo
    // ou usar o método específico de participants update da comunidade para adicionar grupos.
    for (const groupId of groupIds) {
      await (sock as any).communityParticipantsUpdate(communityId, [groupId], 'add');
    }

    res.status(200).json({ success: true, message: "Grupos vinculados com sucesso." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;