import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Message } from '../models/Message.js';
import { Session } from '../models/Session.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { forbidden, notFound } from '../utils/ApiError.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/session/:sessionId',
  asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.sessionId);
    if (!session) throw notFound('Session not found');
    if (!session.participants.some((p) => p.toString() === req.user.id)) {
      throw forbidden('Not a participant');
    }
    const messages = await Message.find({ session: session._id })
      .sort({ createdAt: 1 })
      .limit(500);
    res.json({ messages });
  })
);

export default router;
