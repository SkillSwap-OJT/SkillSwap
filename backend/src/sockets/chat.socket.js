import { verifyToken } from '../middleware/auth.js';
import { Session } from '../models/Session.js';
import { Message } from '../models/Message.js';
import { ModerationLog } from '../models/ModerationLog.js';
import { User } from '../models/User.js';
import { moderateMessage } from '../services/moderation.service.js';
import { buildAssistantReply } from '../services/session-assistant.service.js';

const FLAG_THRESHOLD = 3;

export function registerChatSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Missing auth token'));
    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.sub;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('session:join', async ({ sessionId }, ack) => {
      try {
        const session = await loadSession(sessionId);
        if (!session) return ack?.({ ok: false, error: 'Session not found' });
        if (!isParticipant(session, socket.userId)) return ack?.({ ok: false, error: 'Not a participant' });
        const peerCount = io.sockets.adapter.rooms.get(roomFor(sessionId))?.size || 0;
        socket.join(roomFor(sessionId));
        socket.data.sessionId = sessionId;
        socket.data.skillA = session.skillFromA;
        socket.data.skillB = session.skillFromB;
        ack?.({
          ok: true,
          peerPresent: peerCount > 0,
          role: getRole(session, socket.userId),
          teacherUserId: session.teacherUser?.toString?.() || session.teacherUser,
          learnerUserId: session.learnerUser?.toString?.() || session.learnerUser,
        });
        socket.to(roomFor(sessionId)).emit('session:peer-joined', { userId: socket.userId });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('session:leave', ({ sessionId }) => {
      if (!sessionId) return;
      socket.leave(roomFor(sessionId));
      socket.to(roomFor(sessionId)).emit('session:peer-left', { userId: socket.userId });
    });

    socket.on('message:send', async ({ sessionId, text }, ack) => {
      try {
        if (!sessionId || !text || typeof text !== 'string') {
          return ack?.({ ok: false, error: 'sessionId and text required' });
        }
        if (text.length > 2000) return ack?.({ ok: false, error: 'Message too long' });

        const session = await loadSession(sessionId);
        if (!session) return ack?.({ ok: false, error: 'Session not found' });
        if (!isParticipant(session, socket.userId)) return ack?.({ ok: false, error: 'Not a participant' });
        if (session.status !== 'active') {
          return ack?.({ ok: false, error: 'Session is not active' });
        }

        const moderation = moderateMessage(text, {
          skillA: session.skillFromA,
          skillB: session.skillFromB,
        });

        const message = await Message.create({
          session: session._id,
          sender: socket.userId,
          text,
          flagged: !moderation.onTopic,
          moderation,
        });

        await ModerationLog.create({
          session: session._id,
          user: socket.userId,
          message: message._id,
          text,
          onTopic: moderation.onTopic,
          score: moderation.score,
          reason: moderation.reason,
        });

        // Broadcast the message to room participants.
        io.to(roomFor(sessionId)).emit('message:new', {
          id: message._id.toString(),
          sessionId,
          senderId: socket.userId,
          text,
          flagged: message.flagged,
          moderation,
          createdAt: message.createdAt,
        });

        if (!moderation.onTopic) {
          // Private warning to sender + escalate strikes.
          socket.emit('moderation:warning', {
            messageId: message._id.toString(),
            reason: moderation.reason,
            score: moderation.score,
          });

          session.moderationStrikes = (session.moderationStrikes || 0) + 1;
          await session.save();
          await User.findByIdAndUpdate(socket.userId, { $inc: { moderationStrikes: 1 } });

          if (session.moderationStrikes >= FLAG_THRESHOLD) {
            session.status = 'flagged';
            await session.save();
            io.to(roomFor(sessionId)).emit('session:flagged', {
              sessionId,
              strikes: session.moderationStrikes,
            });
          }
        }

        ack?.({ ok: true, id: message._id.toString(), moderation });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('typing', ({ sessionId, isTyping }) => {
      if (!sessionId) return;
      socket.to(roomFor(sessionId)).emit('typing', {
        userId: socket.userId,
        isTyping: Boolean(isTyping),
      });
    });

    socket.on('webrtc:signal', async ({ sessionId, type, payload }, ack) => {
      try {
        const session = await loadSession(sessionId);
        if (!session) return ack?.({ ok: false, error: 'Session not found' });
        if (!isParticipant(session, socket.userId)) return ack?.({ ok: false, error: 'Not a participant' });

        socket.to(roomFor(sessionId)).emit('webrtc:signal', {
          sessionId,
          fromUserId: socket.userId,
          type,
          payload,
        });
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('session:screen-share', async ({ sessionId, active }, ack) => {
      try {
        const session = await loadSession(sessionId);
        if (!session) return ack?.({ ok: false, error: 'Session not found' });
        if (!isParticipant(session, socket.userId)) return ack?.({ ok: false, error: 'Not a participant' });
        if (session.teacherUser.toString() !== socket.userId) {
          return ack?.({ ok: false, error: 'Only the teacher can share screen' });
        }

        io.to(roomFor(sessionId)).emit('session:screen-share', {
          sessionId,
          userId: socket.userId,
          active: Boolean(active),
        });
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('assistant:ask', async ({ sessionId, prompt }, ack) => {
      try {
        if (!sessionId || !prompt || typeof prompt !== 'string') {
          return ack?.({ ok: false, error: 'sessionId and prompt are required' });
        }
        const session = await loadSession(sessionId);
        if (!session) return ack?.({ ok: false, error: 'Session not found' });
        if (!isParticipant(session, socket.userId)) return ack?.({ ok: false, error: 'Not a participant' });

        const recentMessages = await Message.find({ session: sessionId }).sort({ createdAt: -1 }).limit(8);
        const reply = buildAssistantReply({
          prompt,
          teacherSkill: session.teacherSkill,
          learnerSkill: session.learnerSkill,
          recentMessages: recentMessages.reverse().map((message) => message.text),
        });

        const payload = {
          id: `assistant-${Date.now()}`,
          sessionId,
          senderId: 'assistant',
          text: reply,
          flagged: false,
          moderation: { onTopic: true, score: 1, reason: '' },
          createdAt: new Date().toISOString(),
        };
        io.to(roomFor(sessionId)).emit('assistant:message', payload);
        ack?.({ ok: true, message: payload });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('disconnect', () => {
      const sessionId = socket.data?.sessionId;
      if (sessionId) {
        socket.to(roomFor(sessionId)).emit('session:peer-left', { userId: socket.userId });
      }
    });
  });
}

function roomFor(sessionId) {
  return `session:${sessionId}`;
}

async function loadSession(sessionId) {
  return Session.findById(sessionId)
    .populate('skillFromA')
    .populate('skillFromB')
    .populate('teacherSkill')
    .populate('learnerSkill');
}

function isParticipant(session, userId) {
  return session.participants.some((participant) => {
    if (!participant) return false;
    if (typeof participant === 'string') return participant === userId;
    if (participant._id) return participant._id.toString() === userId;
    return participant.toString() === userId;
  });
}

function getRole(session, userId) {
  if (session.teacherUser?.toString() === userId) return 'teacher';
  if (session.learnerUser?.toString() === userId) return 'learner';
  return 'participant';
}
