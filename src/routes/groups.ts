"use client";

import { Router, Request, Response } from 'express';
import { BaileysManager } from '../services/baileys';

const router = Router();

/**
 * @swagger
 * /groups/create:
 *   post:
 *     summary: Cria um novo grupo no WhatsApp com nome, participantes e foto opcional
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - name
 *               - participants
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: ID da sessão conectada
 *               name:
 *                 type: string
 *                 description: Nome do grupo a ser criado
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de JIDs (ex. 5511999999999@s.whatsapp.net)
 *               image:
 *                 type: string
 *                 description: URL da imagem ou Base64 para o ícone do grupo (opcional)
 *     responses:
 *       200:
 *         description: Grupo criado com sucesso
 *       400:
 *         description: Erro na requisição
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { sessionId, name, participants, image } = req.body;

    if (!sessionId || !name || !participants || !Array.isArray(participants)) {
      res.status(400).json({ error: 'Parâmetros inválidos. Informe sessionId, name e participants.' });
      return;
    }

    const sock = await BaileysManager.getSession(sessionId);

    // 1. Cria o grupo com nome e participantes
    const group = await sock.groupCreate(name, participants);

    // 2. Se enviou imagem, atualiza o ícone do grupo
    if (image && group.id) {
      try {
        // O Baileys aceita URL ou Buffer
        await sock.updateProfilePicture(group.id, { url: image });
      } catch (imgError) {
        console.warn('Grupo criado, mas erro ao definir imagem:', imgError);
        // Não barramos a resposta de sucesso pois o grupo foi criado
      }
    }

    res.status(200).json({
      success: true,
      message: 'Grupo criado com sucesso!',
      data: group
    });
  } catch (error: any) {
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({ 
      error: 'Erro ao criar o grupo no WhatsApp',
      details: error.message 
    });
  }
});

export default router;