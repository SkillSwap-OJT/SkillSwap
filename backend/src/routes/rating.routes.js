import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createRating, ratingsForUser } from '../controllers/rating.controller.js';

const router = Router();
router.use(requireAuth);
router.post('/', createRating);
router.get('/user/:userId', ratingsForUser);
export default router;
