import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { badRequest, conflict, unauthorized } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, college, intent } = req.body || {};
  if (!name || !email || !password) throw badRequest('name, email, password are required');
  if (password.length < 6) throw badRequest('Password must be at least 6 characters');

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw conflict('Email already registered');

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ 
    name, 
    email: email.toLowerCase(), 
    passwordHash,
    college: college || '',
    intent: intent || 'both'
  });

  const token = signToken({ sub: user._id.toString(), email: user.email });
  res.status(201).json({ token, user: user.toPublicJSON() });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw badRequest('email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw unauthorized('Invalid credentials');

  const ok = await user.comparePassword(password);
  if (!ok) throw unauthorized('Invalid credentials');

  const token = signToken({ sub: user._id.toString(), email: user.email });
  res.json({ token, user: user.toPublicJSON() });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('skillsOffered.skill')
    .populate('skillsWanted.skill');
  if (!user) throw unauthorized('User not found');
  res.json({ user: user.toPublicJSON() });
});
