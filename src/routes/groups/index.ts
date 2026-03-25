"use client";

import { Router } from 'express';
import managementRoutes from './management';
import participantsRoutes from './participants';
import settingsRoutes from './settings';
import invitesRoutes from './invites';
import platformRoutes from './platform'; // Nova importação

const router = Router();

router.use('/management', managementRoutes);
router.use('/participants', participantsRoutes);
router.use('/settings', settingsRoutes);
router.use('/invites', invitesRoutes);
router.use('/platform', platformRoutes); // Nova rota

export default router;