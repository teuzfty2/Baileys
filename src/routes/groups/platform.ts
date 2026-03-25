"use client";

import { Router, Request, Response } from 'express';
import { mongoMiddleware } from '../../middleware/database';

const router = Router();

/**
 * @swagger
 * /groups/platform/list:
 *   get:
 *     summary: Lista grupos criados especificamente pela plataforma (Consulta MongoDB)
 *     tags: [Groups Management]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *       - in: header
 *         name: x-base
 *         schema: { type: string, default: "watools_db" }
 *       - in: header
 *         name: x-collection
 *         schema: { type: string, default: "platform_groups" }
 */
router.get('/list', mongoMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;
    
    // Filtra no banco apenas os grupos dessa sessão
    const groups = await req.mongoCollection
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: groups });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;