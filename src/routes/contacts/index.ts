"use client";

import { Router, Request, Response } from 'express';
import { BaileysManager } from '../../services/baileys';

const router = Router();

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Lista todos os contatos da agenda do WhatsApp
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
    
    // Na Baileys, os contatos ficam no store ou podem ser pegos da conexão
    // Nota: Pegar a lista completa pode demorar na primeira sincronização
    const contacts = await sock.store?.contacts || {}; 
    
    res.status(200).json({ 
      success: true, 
      data: Object.values(contacts) 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;