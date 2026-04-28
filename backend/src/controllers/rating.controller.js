import { Rating } from '../models/Rating.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/ApiError.js';

export const createRating = asyncHandler(async (req, res) => {
  const { sessionId, score, comment } = req.body || {};
  if (!sessionId || !score) throw badRequest('sessionId and score are required');
  const num = Number(score);
  if (!(num >= 1 && num <= 5)) throw badRequest('score must be 1–5');

  const session = await Session.findById(sessionId);
  if (!session) throw notFound('Session not found');
  if (session.status !== 'completed') throw badRequest('Session is not completed yet');

  if (!session.participants.some((p) => p.toString() === req.user.id)) {
    throw forbidden('Not a participant');
  }
  const otherId = session.participants.find((p) => p.toString() !== req.user.id);
  if (!otherId) throw badRequest('Cannot rate a solo session');

  const existing = await Rating.findOne({ session: session._id, fromUser: req.user.id });
  if (existing) throw conflict('You already rated this session');

  const rating = await Rating.create({
    session: session._id,
    fromUser: req.user.id,
    toUser: otherId,
    score: num,
    comment: typeof comment === 'string' ? comment : '',
  });

  // Recompute user average.
  const ratings = await Rating.find({ toUser: otherId });
  const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
  await User.findByIdAndUpdate(otherId, {
    averageRating: Number(avg.toFixed(2)),
    ratingsCount: ratings.length,
  });

  res.status(201).json({ rating });
});

export const ratingsForUser = asyncHandler(async (req, res) => {
  const ratings = await Rating.find({ toUser: req.params.userId })
    .populate('fromUser', 'name avatarUrl')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ ratings });
});
