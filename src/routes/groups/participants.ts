"use client";

import { Router, Request, Response } from 'express';
import { BaileysManager } from '../../services/baileys';

const router = Router();

/**
 * @swagger
 * /groups/participants/list:
 *   get:
 *     summary: Lista todos os participantes de um grupo específico
 *     tags: [Groups Participants]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *       - in: query
 *         name: groupId
 *         required: true
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId } = req.query;
    const sock = await BaileysManager.getSession(sessionId as string);
    
    // Busca os metadados do grupo que contém a lista de participantes
    const groupMetadata = await sock.groupMetadata(groupId as string);
    
    res.status(200).json({ 
      success: true, 
      data: groupMetadata.participants 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /groups/participants/update:
 *   post:
 *     summary: Adicionar, Remover, Promover ou Rebaixar participantes
 *     tags: [Groups Participants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, groupId, participants, action]
 *             properties:
 *               sessionId: { type: string }
 *               groupId: { type: string }
 *               participants: { type: array, items: { type: string } }
 *               action: { type: string, enum: [add, remove, promote, demote] }
 */
router.post('/update', async (req: Request, res: Response) => {
  try {
    const { sessionId, groupId, participants, action } = req.body;
    const sock = await BaileysManager.getSession(sessionId);
    const response = await sock.groupParticipantsUpdate(groupId, participants, action);
    res.status(200).json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;