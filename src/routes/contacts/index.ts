"use client";

import { Router, Request, Response } from 'express';
import { BaileysManager } from '../../services/baileys';

const router = Router();

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Lista todos os contatos e conversas recentes (Similar ao /chat/list)
 *     tags: [Contacts]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;
    const sock = await BaileysManager.getSession(sessionId as string);
    
    // Na Baileys, os contatos são sincronizados no início da conexão.
    // Estamos retornando os contatos conhecidos pela instância.
    const contacts = await sock.store?.contacts || {}; 
    
    // Formatando para um array amigável para o front
    const formattedContacts = Object.values(contacts).map((c: any) => ({
      id: c.id,
      name: c.name || c.notify || c.verifiedName || 'Desconhecido',
      pushname: c.notify,
      number: c.id.split('@')[0]
    }));

    res.status(200).json({ 
      success: true, 
      data: formattedContacts 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;