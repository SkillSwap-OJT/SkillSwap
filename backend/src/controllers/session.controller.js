import { Session } from '../models/Session.js';
import { Message } from '../models/Message.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { forbidden, notFound } from '../utils/ApiError.js';

function isParticipant(session, userId) {
  return session.participants.some((participant) => {
    if (!participant) return false;
    if (typeof participant === 'string') return participant === userId;
    if (participant._id) return participant._id.toString() === userId;
    return participant.toString() === userId;
  });
}

export const listMySessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ participants: req.user.id })
    .populate('participants', 'name email avatarUrl averageRating')
    .populate('skillFromA')
    .populate('skillFromB')
    .populate('teacherUser', 'name email avatarUrl averageRating intent')
    .populate('learnerUser', 'name email avatarUrl averageRating intent')
    .populate('teacherSkill')
    .populate('learnerSkill')
    .sort({ updatedAt: -1 });
  res.json({ sessions });
});

export const getSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id)
    .populate('participants', 'name email avatarUrl averageRating')
    .populate('skillFromA')
    .populate('skillFromB')
    .populate('teacherUser', 'name email avatarUrl averageRating intent')
    .populate('learnerUser', 'name email avatarUrl averageRating intent')
    .populate('teacherSkill')
    .populate('learnerSkill');
  if (!session) throw notFound('Session not found');
  if (!isParticipant(session, req.user.id)) throw forbidden('Not a participant of this session');
  res.json({ session });
});

export const completeSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) throw notFound('Session not found');
  if (!isParticipant(session, req.user.id)) throw forbidden('Not a participant of this session');
  if (session.status === 'completed') return res.json({ session });
  session.status = 'completed';
  session.completedAt = new Date();
  await session.save();
  res.json({ session });
});

export const getMessages = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) throw notFound('Session not found');
  if (!isParticipant(session, req.user.id)) throw forbidden('Not a participant of this session');
  const messages = await Message.find({ session: session._id })
    .sort({ createdAt: 1 })
    .limit(500);
  res.json({ messages });
});
