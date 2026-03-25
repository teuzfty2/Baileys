/**
 * @description 
 * Exporta as rotas da API
**/

// Express
import { Router } from 'express';
import groupsRoutes from './groups';

//Inicia o Router
const router = Router();

// Rota de grupos
router.use('/groups', groupsRoutes);

export default router;