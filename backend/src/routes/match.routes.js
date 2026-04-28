import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMatches } from '../controllers/match.controller.js';

const router = Router();
router.get('/', requireAuth, getMatches);
export default router;
