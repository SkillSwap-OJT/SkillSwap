import { SwapRequest } from '../models/SwapRequest.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, forbidden, notFound } from '../utils/ApiError.js';

export const createRequest = asyncHandler(async (req, res) => {
  const { toUser, offeredSkill, requestedSkill, message } = req.body || {};
  if (!toUser || !requestedSkill) {
    throw badRequest('toUser and requestedSkill are required');
  }
  if (toUser === req.user.id) throw badRequest("You can't send a request to yourself");

  const me = await User.findById(req.user.id);
  if (!me) throw notFound('User not found');

  const recipient = await User.findById(toUser);
  if (!recipient) throw notFound('Recipient not found');
  if (!['teacher', 'both'].includes(recipient.intent)) {
    throw badRequest('Recipient must be available as a teacher');
  }
  const recOffered = recipient.skillsOffered.find(
    (s) => s.skill.toString() === requestedSkill && s.verified
  );
  if (!recOffered) {
    throw badRequest('Recipient does not offer the requested skill (verified)');
  }

  let selectedOfferedSkill = null;
  if (offeredSkill) {
    const offered = me.skillsOffered.find((s) => s.skill.toString() === offeredSkill);
    if (!offered) {
      throw forbidden('You must offer this skill to include it in the request');
    }
    selectedOfferedSkill = offeredSkill;
  }

  const reqDoc = await SwapRequest.create({
    fromUser: req.user.id,
    toUser,
    offeredSkill: selectedOfferedSkill,
    requestedSkill,
    message: message || '',
  });

  const reqDocPopulated = await SwapRequest.findById(reqDoc._id)
    .populate('fromUser', 'name email avatarUrl')
    .populate('toUser', 'name email avatarUrl')
    .populate('offeredSkill', 'name')
    .populate('requestedSkill', 'name');

  const io = req.app.get('io');
  if (io) {
    io.to(`user:${toUser}`).emit('notification:request', { request: reqDocPopulated });
  }

  res.status(201).json({ request: reqDocPopulated });
});

export const listMyRequests = asyncHandler(async (req, res) => {
  const direction = req.query.direction; // 'incoming' | 'outgoing' | undefined
  const filter = {};
  if (direction === 'incoming') filter.toUser = req.user.id;
  else if (direction === 'outgoing') filter.fromUser = req.user.id;
  else filter.$or = [{ toUser: req.user.id }, { fromUser: req.user.id }];

  const requests = await SwapRequest.find(filter)
    .populate('fromUser', 'name email avatarUrl averageRating')
    .populate('toUser', 'name email avatarUrl averageRating')
    .populate('offeredSkill')
    .populate('requestedSkill')
    .sort({ createdAt: -1 });
  res.json({ requests });
});

export const respondToRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body || {}; // 'accept' | 'reject'
  if (!['accept', 'reject'].includes(action)) throw badRequest('action must be accept or reject');

  const reqDoc = await SwapRequest.findById(id);
  if (!reqDoc) throw notFound('Request not found');
  if (reqDoc.toUser.toString() !== req.user.id) throw forbidden('Not the recipient of this request');
  if (reqDoc.status !== 'pending') throw badRequest('Request already resolved');

  if (action === 'reject') {
    reqDoc.status = 'rejected';
    await reqDoc.save();
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${reqDoc.fromUser.toString()}`).emit('notification:request-updated', {
        requestId: reqDoc._id.toString(),
        status: 'rejected',
      });
    }
    return res.json({ request: reqDoc });
  }

  // accept → create a session
  const session = await Session.create({
    participants: [reqDoc.fromUser, reqDoc.toUser],
    skillFromA: reqDoc.offeredSkill || reqDoc.requestedSkill,
    skillFromB: reqDoc.requestedSkill,
    teacherUser: reqDoc.toUser,
    learnerUser: reqDoc.fromUser,
    teacherSkill: reqDoc.requestedSkill,
    learnerSkill: reqDoc.offeredSkill || undefined,
    swapRequest: reqDoc._id,
    status: 'active',
  });
  reqDoc.status = 'accepted';
  reqDoc.session = session._id;
  await reqDoc.save();

  const populatedSession = await Session.findById(session._id)
    .populate('participants', 'name email avatarUrl averageRating intent')
    .populate('skillFromA')
    .populate('skillFromB')
    .populate('teacherUser', 'name email avatarUrl averageRating intent')
    .populate('learnerUser', 'name email avatarUrl averageRating intent')
    .populate('teacherSkill')
    .populate('learnerSkill');

  const io = req.app.get('io');
  if (io) {
    const payload = {
      requestId: reqDoc._id.toString(),
      status: 'accepted',
      session: populatedSession,
    };
    io.to(`user:${reqDoc.fromUser.toString()}`).emit('notification:request-updated', payload);
    io.to(`user:${reqDoc.toUser.toString()}`).emit('notification:request-updated', payload);
  }

  res.json({ request: reqDoc, session: populatedSession });
});

export const cancelRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reqDoc = await SwapRequest.findById(id);
  if (!reqDoc) throw notFound('Request not found');
  if (reqDoc.fromUser.toString() !== req.user.id) throw forbidden('Not your request');
  if (reqDoc.status !== 'pending') throw badRequest('Cannot cancel a resolved request');
  reqDoc.status = 'cancelled';
  await reqDoc.save();
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${reqDoc.toUser.toString()}`).emit('notification:request-updated', {
      requestId: reqDoc._id.toString(),
      status: 'cancelled',
    });
  }
  res.json({ request: reqDoc });
});
