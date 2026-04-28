import { User } from '../models/User.js';

/**
 * Match algorithm:
 *  - Candidate must offer (verified) at least one of my wantedSkills.
 *  - Candidate must want at least one of my offeredSkills (verified or not).
 *  - Score: 2 points per two-way overlap + 1 per one-way + 0.2 * candidate.averageRating.
 *  - Excludes the requesting user.
 */
export async function findMatchesForUser(meId, { limit = 25 } = {}) {
  const me = await User.findById(meId)
    .populate('skillsOffered.skill')
    .populate('skillsWanted.skill');
  if (!me) return [];

  const myOffered = new Set(me.skillsOffered.map((s) => s.skill?._id?.toString()).filter(Boolean));
  const myWanted = new Set(me.skillsWanted.map((s) => s.skill?._id?.toString()).filter(Boolean));
  if (myWanted.size === 0) return [];

  const candidates = await User.find({
    _id: { $ne: me._id },
    onboarded: true,
    intent: { $in: ['teacher', 'both'] },
    'skillsOffered.skill': { $in: Array.from(myWanted) },
    'skillsOffered.verified': true,
  })
    .populate('skillsOffered.skill')
    .populate('skillsWanted.skill')
    .limit(200);

  const scored = [];
  for (const c of candidates) {
    if (isDummyCandidate(c.email)) continue;
    const cOfferedVerified = new Set(
      c.skillsOffered.filter((s) => s.verified).map((s) => s.skill?._id?.toString()).filter(Boolean)
    );
    const cWanted = new Set(c.skillsWanted.map((s) => s.skill?._id?.toString()).filter(Boolean));

    const teaches = [...cOfferedVerified].filter((id) => myWanted.has(id));
    const learns = [...myOffered].filter((id) => cWanted.has(id));

    if (teaches.length === 0) continue;

    const twoWay = teaches.length > 0 && learns.length > 0 ? 1 : 0;
    const oneWayLearning = teaches.length > 0 ? 1 : 0;
    const score =
      teaches.length * 2 +
      learns.length +
      twoWay +
      oneWayLearning +
      (c.averageRating || 0) * 0.2;

    scored.push({
      user: c.toPublicJSON(),
      score: Number(score.toFixed(3)),
      teachesYou: teaches,
      learnsFromYou: learns,
      twoWay: Boolean(twoWay),
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

function isDummyCandidate(email = '') {
  const normalized = String(email).toLowerCase();
  return [
    '@demo.com',
    'test1@example.com',
    'test3@skillswap.com',
    'test@skillswap.com',
    'skillswap@gmail.com',
    'aaaa@gmail.com',
  ].some((value) => normalized.includes(value));
}
