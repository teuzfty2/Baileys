"use client";

import { Router } from 'express';
import groupsRoutes from './groups';
import contactsRoutes from './contacts';
import authRoutes from './auth';

const router = Router();

// Novas rotas de autenticação e gestão de banco
router.use('/auth', authRoutes);

// Rota de grupos organizada por sub-pastas
router.use('/groups', groupsRoutes);

// Rota de contatos
router.use('/contacts', contactsRoutes);

export default router;