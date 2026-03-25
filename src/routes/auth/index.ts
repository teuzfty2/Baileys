"use client";

import { Router } from 'express';
import sessionRoutes from './sessions';

const router = Router();

router.use('/sessions', sessionRoutes);

export default router;