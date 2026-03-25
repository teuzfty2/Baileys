"use client";

import { Router } from 'express';
import managementRoutes from './management';
import participantsRoutes from './participants';
import settingsRoutes from './settings';
import invitesRoutes from './invites';
import platformRoutes from './platform';
import communityRoutes from './communities'; // Nova importação

const router = Router();

router.use('/management', managementRoutes);
router.use('/participants', participantsRoutes);
router.use('/settings', settingsRoutes);
router.use('/invites', invitesRoutes);
router.use('/platform', platformRoutes);
router.use('/communities', communityRoutes); // Nova rota

export default router;