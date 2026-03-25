"use client";

import { Router, Request, Response } from 'express';
import { mongoMiddleware } from '../../middleware/database';

const router = Router();

/**
 * @swagger
 * /auth/sessions/save:
 *   post:
 *     summary: Salva metadados de uma sessão no MongoDB (Exemplo)
 *     tags: [Auth & Database]
 *     parameters:
 *       - in: header
 *         name: x-base
 *         schema: { type: string, default: "watools_db" }
 *       - in: header
 *         name: x-collection
 *         schema: { type: string, default: "sessions_metadata" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [apiToken, userId]
 *             properties:
 *               apiToken: { type: string }
 *               userId: { type: string }
 *               status: { type: string, default: "active" }
 */
router.post('/save', mongoMiddleware, async (req: Request, res: Response) => {
  try {
    const { apiToken, userId, status = 'active' } = req.body;

    const result = await req.mongoCollection.updateOne(
      { apiToken },
      { 
        $set: { 
          userId, 
          status, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Sessão registrada no banco de dados.',
      db: req.targetDb,
      collection: req.targetCollection,
      data: result 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/sessions/list:
 *   get:
 *     summary: Lista sessões salvas no banco
 *     tags: [Auth & Database]
 *     parameters:
 *       - in: header
 *         name: x-base
 *         schema: { type: string, default: "watools_db" }
 *       - in: header
 *         name: x-collection
 *         schema: { type: string, default: "sessions_metadata" }
 */
router.get('/list', mongoMiddleware, async (req: Request, res: Response) => {
  try {
    const sessions = await req.mongoCollection.find({}).toArray();
    res.status(200).json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;