import { findMatchesForUser } from '../services/matching.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMatches = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '25', 10), 100);
  const matches = await findMatchesForUser(req.user.id, { limit });
  res.json({ matches });
});
