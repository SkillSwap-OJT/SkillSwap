import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  cancelRequest,
  createRequest,
  listMyRequests,
  respondToRequest,
} from '../controllers/request.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/', listMyRequests);
router.post('/', createRequest);
router.post('/:id/respond', respondToRequest);
router.post('/:id/cancel', cancelRequest);
export default router;
