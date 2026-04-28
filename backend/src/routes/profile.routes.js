import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getMyProfile,
  getUserById,
  setOnboarding,
  updateMyProfile,
} from '../controllers/profile.controller.js';

const router = Router();

router.get('/me', requireAuth, getMyProfile);
router.patch('/me', requireAuth, updateMyProfile);
router.post('/onboarding', requireAuth, setOnboarding);
router.get('/users/:id', requireAuth, getUserById);

export default router;
