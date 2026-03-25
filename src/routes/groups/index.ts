"use client";

import { Router } from 'express';
import managementRoutes from './management';
import participantsRoutes from './participants';
import settingsRoutes from './settings';
import invitesRoutes from './invites';

const router = Router();

router.use('/management', managementRoutes);
router.use('/participants', participantsRoutes);
router.use('/settings', settingsRoutes);
router.use('/invites', invitesRoutes);

export default router;