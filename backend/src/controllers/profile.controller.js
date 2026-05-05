import { User } from '../models/User.js';
import { Skill } from '../models/Skill.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, notFound } from '../utils/ApiError.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('skillsOffered.skill')
    .populate('skillsWanted.skill');
  if (!user) throw notFound('User not found');
  res.json({ user: user.toPublicJSON() });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, bio, avatarUrl, intent } = req.body || {};
  const user = await User.findById(req.user.id);
  if (!user) throw notFound('User not found');
  if (typeof name === 'string' && name.trim()) user.name = name.trim();
  if (typeof bio === 'string') user.bio = bio;
  if (typeof avatarUrl === 'string') user.avatarUrl = avatarUrl;
  if (intent && ['learner', 'teacher', 'both'].includes(intent)) user.intent = intent;
  await user.save();
  await user.populate('skillsOffered.skill');
  await user.populate('skillsWanted.skill');
  res.json({ user: user.toPublicJSON() });
});

async function resolveSkillEntries(items, label) {
  if (!Array.isArray(items)) throw badRequest(`${label} must be an array`);
  const result = [];
  for (const item of items) {
    if (!item || !item.skill) throw badRequest(`${label}: each item needs a skill id`);
    const skill = await Skill.findById(item.skill);
    if (!skill) throw badRequest(`${label}: unknown skill ${item.skill}`);
    result.push({
      skill: skill._id,
      level: ['beginner', 'intermediate', 'advanced'].includes(item.level) ? item.level : 'beginner',
      verified: false,
    });
  }
  return result;
}

export const setOnboarding = asyncHandler(async (req, res) => {
  const { skillsOffered = [], skillsWanted = [] } = req.body || {};
  const user = await User.findById(req.user.id);
  if (!user) throw notFound('User not found');

  const offered = await resolveSkillEntries(skillsOffered, 'skillsOffered');
  const wanted = await resolveSkillEntries(skillsWanted, 'skillsWanted');

  // Preserve verification flags for skills already verified.
  const prevVerified = new Map(
    user.skillsOffered.filter((s) => s.verified).map((s) => [s.skill.toString(), s])
  );
  for (const entry of offered) {
    const prev = prevVerified.get(entry.skill.toString());
    if (prev) {
      entry.verified = true;
      entry.verifiedAt = prev.verifiedAt;
    }
  }

  user.skillsOffered = offered;
  user.skillsWanted = wanted;
  user.onboarded = true;
  await user.save();

  await user.populate('skillsOffered.skill');
  await user.populate('skillsWanted.skill');
  res.json({ user: user.toPublicJSON() });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('skillsOffered.skill')
    .populate('skillsWanted.skill');
  if (!user) throw notFound('User not found');
  res.json({ user: user.toPublicJSON() });
});
