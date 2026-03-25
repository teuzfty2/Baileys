"use client";

import { Router } from 'express';
import groupsRoutes from './groups';
import contactsRoutes from './contacts';

const router = Router();

// Rota de grupos organizada por sub-pastas
router.use('/groups', groupsRoutes);

// Rota de contatos
router.use('/contacts', contactsRoutes);

export default router;