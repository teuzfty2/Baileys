"use client";

import { Router, Request, Response } from 'express';
import { BaileysManager } from '../services/baileys';

const router = Router();

/**
 * @swagger
 * /groups/create:
 *   post:
 *     summary: Cria um novo grupo no WhatsApp
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
 *                 description: Lista de JIDs dos participantes (ex. 5511999999999@s.whatsapp.net)
 *     responses:
 *       200:
 *         description: Grupo criado com sucesso
 *       400:
 *         description: Erro na requisição
 *       500:
 *         description: Erro interno
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { sessionId, name, participants } = req.body;

    if (!sessionId || !name || !participants || !Array.isArray(participants)) {
      res.status(400).json({ error: 'Parâmetros inválidos. Certifique-se de enviar sessionId, name e participants (array).' });
      return;
    }

    const sock = await BaileysManager.getSession(sessionId);

    // No Baileys, criar grupo é simples:
    const group = await sock.groupCreate(name, participants);

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