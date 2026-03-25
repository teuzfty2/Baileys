"use client";

import { Router, Request, Response } from 'express';
import { BaileysManager } from '../../services/baileys';
import { mongoMiddleware } from '../../middleware/database';

const router = Router();

/**
 * @swagger
 * /groups/communities/create:
 *   post:
 *     summary: Cria uma nova comunidade e salva no MongoDB estruturado
 *     tags: [Communities]
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
 *             required: [userId, apiToken, name, description]
 *             properties:
 *               userId: { type: string }
 *               apiToken: { type: string }
 *               name: { type: string }
 *               description: { type: string }
 */
router.post('/create', mongoMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, apiToken, name, description } = req.body;
    const sock = await BaileysManager.getSession(apiToken);

    // 1. Cria a comunidade no WhatsApp
    const community = await (sock as any).communityCreate(name, description);

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

    tokenDoc.community.push({
      id: community.id,
      idCommunity: [
        {
          name: community.subject,
          active: true,
          groupsCommunity: []
        }
      ]
    });

    await req.mongoCollection.updateOne(
      { user_id: userId },
      { $set: { groupManagement: userDoc.groupManagement } },
      { upsert: true }
    );

    res.status(200).json({ success: true, data: community });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /groups/communities/link-groups:
 *   post:
 *     summary: Vincula grupos a uma comunidade e salva na estrutura JSON
 *     tags: [Communities]
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
 *             required: [userId, apiToken, communityId, groupIds]
 *             properties:
 *               userId: { type: string }
 *               apiToken: { type: string }
 *               communityId: { type: string }
 *               groupIds: { type: array, items: { type: string } }
 */
router.post('/link-groups', mongoMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, apiToken, communityId, groupIds } = req.body;
    const sock = await BaileysManager.getSession(apiToken);

    for (const groupId of groupIds) {
      await (sock as any).communityParticipantsUpdate(communityId, [groupId], 'add');
    }

    let userDoc = await req.mongoCollection.findOne({ user_id: userId });
    
    if (userDoc) {
      let tokenDoc = userDoc.groupManagement.find((t: any) => t.api_token === apiToken);
      if (tokenDoc) {
        let commDoc = tokenDoc.community.find((c: any) => c.id === communityId);
        
        if (commDoc && commDoc.idCommunity && commDoc.idCommunity.length > 0) {
          for (const groupId of groupIds) {
            try {
              const groupMeta = await sock.groupMetadata(groupId);
              let pictureUrl = "";
              try { pictureUrl = await sock.profilePictureUrl(groupId, 'image'); } catch(e){}

              const alreadyExists = commDoc.idCommunity[0].groupsCommunity.some((g: any) => g.id === groupId);
              
              if (!alreadyExists) {
                commDoc.idCommunity[0].groupsCommunity.push({
                  id: groupId,
                  name: groupMeta.subject,
                  picture: pictureUrl
                });
              }
            } catch (err) {
              console.log(`Erro ao buscar meta do grupo ${groupId}`, err);
            }
          }

          await req.mongoCollection.updateOne(
            { user_id: userId },
            { $set: { groupManagement: userDoc.groupManagement } }
          );
        }
      }
    }

    res.status(200).json({ success: true, message: "Grupos vinculados e salvos com sucesso." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;