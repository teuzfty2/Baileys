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

    // 2. Manipula o MongoDB para a estrutura UsergroupManagement (Usando tipagem flexível temporária)
    let userDoc: any = await req.mongoCollection.findOne({ user_id: userId });
    
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

/**
 * @swagger
 * /groups/management/leave:
 *   post:
 *     summary: O número conectado sai de um grupo
 *     tags: [Groups Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [apiToken, groupId]
 *             properties:
 *               apiToken: { type: string }
 *               groupId: { type: string }
 */
router.post('/leave', async (req: Request, res: Response) => {
  try {
    const { apiToken, groupId } = req.body;
    const sock = await BaileysManager.getSession(apiToken);
    
    await sock.groupLeave(groupId);
    
    res.status(200).json({ success: true, message: "Saiu do grupo com sucesso." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /groups/management/delete:
 *   delete:
 *     summary: Exclui o grupo por completo (Remove todos os membros, sai do grupo e apaga do BD)
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
 *             required: [userId, apiToken, groupId]
 *             properties:
 *               userId: { type: string }
 *               apiToken: { type: string }
 *               groupId: { type: string }
 */
router.delete('/delete', mongoMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, apiToken, groupId } = req.body;
    const sock = await BaileysManager.getSession(apiToken);

    // 1. Busca todos os participantes do grupo
    const groupMeta = await sock.groupMetadata(groupId);
    const myJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';

    // Filtra para pegar todo mundo, MENOS o próprio bot/criador
    const participantsToRemove = groupMeta.participants
      .map(p => p.id)
      .filter(id => id !== myJid);

    // 2. Expulsa todos os membros (se houver alguém além do criador)
    if (participantsToRemove.length > 0) {
      await sock.groupParticipantsUpdate(groupId, participantsToRemove, 'remove');
    }

    // 3. O criador sai do grupo
    await sock.groupLeave(groupId);

    // 4. Comportamento no MongoDB: Remover da estrutura aninhada (Tratando possível null)
    let userDoc: any = await req.mongoCollection.findOne({ user_id: userId });
    
    if (userDoc && userDoc.groupManagement) {
      let tokenDoc = userDoc.groupManagement.find((t: any) => t.api_token === apiToken);
      if (tokenDoc) {
        // Remove do array principal de grupos
        tokenDoc.groups = tokenDoc.groups.filter((g: any) => g.id !== groupId);
        
        // Se o grupo estava em alguma comunidade, remove de lá também
        if (tokenDoc.community) {
          tokenDoc.community.forEach((comm: any) => {
            if (comm.idCommunity && comm.idCommunity.length > 0) {
              comm.idCommunity[0].groupsCommunity = comm.idCommunity[0].groupsCommunity.filter(
                (g: any) => g.id !== groupId
              );
            }
          });
        }

        // Salva a estrutura limpa de volta no banco
        await req.mongoCollection.updateOne(
          { user_id: userId },
          { $set: { groupManagement: userDoc.groupManagement } }
        );
      }
    }

    res.status(200).json({ 
      success: true, 
      message: "Grupo excluído por completo (Membros removidos, saiu do grupo e apagado do sistema)." 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;