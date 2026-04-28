import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  completeSession,
  getMessages,
  getSession,
  listMySessions,
} from '../controllers/session.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/', listMySessions);
router.get('/:id', getSession);
router.post('/:id/complete', completeSession);
router.get('/:id/messages', getMessages);
export default router;
