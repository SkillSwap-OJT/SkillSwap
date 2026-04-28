import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RatingApi, SessionApi } from '../api';
import { getSocket } from '../lib/socket';
import { getInitials } from '../utils/helpers';
import type { ChatMessage, Session } from '../types';

type SessionRole = 'teacher' | 'learner' | 'participant';

const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const SessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [peerTyping, setPeerTyping] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingDone, setRatingDone] = useState(false);
  const [role, setRole] = useState<SessionRole>('participant');
  const [peerOnline, setPeerOnline] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [peerScreenSharing, setPeerScreenSharing] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const partner = useMemo(
    () => session?.participants.find((participant) => participant._id !== user?.id),
    [session, user]
  );

  const isTeacher = role === 'teacher';
  const topic = session?.teacherSkill?.name || session?.skillFromB?.name || 'the selected topic';
  const learnerContext = session?.learnerSkill?.name || session?.skillFromA?.name || 'the learner skill';

  const attachLocalPreview = useCallback((stream: MediaStream | null) => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, []);

  const attachRemotePreview = useCallback((stream: MediaStream | null) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  }, []);

  const emitSignal = useCallback((type: string, payload: unknown) => {
    if (!id) return;
    getSocket().emit('webrtc:signal', { sessionId: id, type, payload });
  }, [id]);

  const stopScreenShare = useCallback(async () => {
    if (!screenStreamRef.current) return;
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    const sender = peerConnectionRef.current?.getSenders().find((item) => item.track?.kind === 'video');
    if (cameraTrack && sender) {
      await sender.replaceTrack(cameraTrack);
    }
    screenStreamRef.current.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;
    attachLocalPreview(localStreamRef.current);
    setScreenSharing(false);
    if (id) {
      getSocket().emit('session:screen-share', { sessionId: id, active: false });
    }
  }, [attachLocalPreview, id]);

  const ensureLocalMedia = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    if (!navigator.mediaDevices?.getUserMedia) {
      const message = window.isSecureContext
        ? 'Camera access is unavailable in this browser.'
        : 'Camera requires HTTPS or localhost. Reopen the session using the secure app URL.';
      setMediaError(message);
      throw new Error(message);
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setMediaReady(true);
      setMediaError('');
      setCameraEnabled(true);
      setMicEnabled(true);
      attachLocalPreview(stream);
      return stream;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Camera and microphone access failed';
      setMediaError(message);
      throw err;
    }
  }, [attachLocalPreview]);

  const cleanupPeerConnection = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    remoteStreamRef.current = null;
    attachRemotePreview(null);
  }, [attachRemotePreview]);

  const ensurePeerConnection = useCallback(async () => {
    if (peerConnectionRef.current) return peerConnectionRef.current;
    const stream = await ensureLocalMedia();
    const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);

    remoteStreamRef.current = new MediaStream();
    attachRemotePreview(remoteStreamRef.current);

    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    peerConnection.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        remoteStreamRef.current.addTrack(track);
      });
      attachRemotePreview(remoteStreamRef.current);
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        emitSignal('ice-candidate', event.candidate.toJSON());
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'connected') {
        setPeerOnline(true);
      }
      if (['disconnected', 'failed', 'closed'].includes(peerConnection.connectionState)) {
        setPeerOnline(false);
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [attachRemotePreview, emitSignal, ensureLocalMedia]);

  const createAndSendOffer = useCallback(async () => {
    const peerConnection = await ensurePeerConnection();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    emitSignal('offer', offer);
  }, [emitSignal, ensurePeerConnection]);

  const handleSignal = useCallback(async (type: string, payload: any) => {
    const peerConnection = await ensurePeerConnection();
    if (type === 'offer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(payload));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      emitSignal('answer', answer);
      return;
    }
    if (type === 'answer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(payload));
      return;
    }
    if (type === 'ice-candidate' && payload) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(payload));
      } catch {
        // Ignore candidates that arrive before remote description settles.
      }
    }
  }, [emitSignal, ensurePeerConnection]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    Promise.all([SessionApi.get(id), SessionApi.messages(id)])
      .then(([loadedSession, loadedMessages]) => {
        if (cancelled) return;
        setSession(loadedSession);
        setMessages(
          loadedMessages.map((message: any) => ({
            id: message._id,
            sessionId: loadedSession._id,
            senderId: message.sender,
            text: message.text,
            flagged: message.flagged,
            moderation: message.moderation,
            createdAt: message.createdAt,
          }))
        );
      })
      .catch((err) => setError(err.message || 'Failed to load session'));

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!session || typeof window === 'undefined' || !window.RTCPeerConnection) {
      return;
    }
    ensureLocalMedia().catch(() => {});
  }, [ensureLocalMedia, session]);

  useEffect(() => {
    if (!id || !session || !user) return;
    const socket = getSocket();

    socket.emit('session:join', { sessionId: id }, async (ack: any) => {
      if (!ack?.ok) {
        setError(ack?.error || 'Failed to join session');
        return;
      }
      setRole(ack.role || 'participant');
      setPeerOnline(Boolean(ack.peerPresent));
      if (ack.role === 'teacher' && ack.peerPresent) {
        try {
          await createAndSendOffer();
        } catch (err) {
          setMediaError(err instanceof Error ? err.message : 'Unable to start live call');
        }
      }
    });

    const onMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };
    const onAssistantMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      setAssistantBusy(false);
    };
    const onWarning = (payload: any) => {
      setWarning(payload.reason || 'Off-topic message detected');
      setTimeout(() => setWarning(null), 4500);
    };
    const onFlagged = () => {
      setSession((prev) => (prev ? { ...prev, status: 'flagged' } : prev));
    };
    const onTyping = ({ userId: typingUserId, isTyping }: { userId: string; isTyping: boolean }) => {
      if (typingUserId !== user.id) setPeerTyping(isTyping);
    };
    const onPeerJoined = async () => {
      setPeerOnline(true);
      if (isTeacher) {
        try {
          await createAndSendOffer();
        } catch (err) {
          setMediaError(err instanceof Error ? err.message : 'Unable to connect live call');
        }
      }
    };
    const onPeerLeft = () => {
      setPeerOnline(false);
      setPeerTyping(false);
      setPeerScreenSharing(false);
      cleanupPeerConnection();
    };
    const onSignal = async ({ fromUserId, type, payload }: any) => {
      if (fromUserId === user.id) return;
      try {
        await handleSignal(type, payload);
      } catch (err) {
        setMediaError(err instanceof Error ? err.message : 'Live connection failed');
      }
    };
    const onScreenShare = ({ userId: sharedBy, active }: { userId: string; active: boolean }) => {
      if (sharedBy !== user.id) {
        setPeerScreenSharing(active);
      }
    };

    socket.on('message:new', onMessage);
    socket.on('assistant:message', onAssistantMessage);
    socket.on('moderation:warning', onWarning);
    socket.on('session:flagged', onFlagged);
    socket.on('typing', onTyping);
    socket.on('session:peer-joined', onPeerJoined);
    socket.on('session:peer-left', onPeerLeft);
    socket.on('webrtc:signal', onSignal);
    socket.on('session:screen-share', onScreenShare);

    return () => {
      socket.emit('session:leave', { sessionId: id });
      socket.off('message:new', onMessage);
      socket.off('assistant:message', onAssistantMessage);
      socket.off('moderation:warning', onWarning);
      socket.off('session:flagged', onFlagged);
      socket.off('typing', onTyping);
      socket.off('session:peer-joined', onPeerJoined);
      socket.off('session:peer-left', onPeerLeft);
      socket.off('webrtc:signal', onSignal);
      socket.off('session:screen-share', onScreenShare);
      cleanupPeerConnection();
    };
  }, [cleanupPeerConnection, createAndSendOffer, handleSignal, id, isTeacher, session, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      cleanupPeerConnection();
    };
  }, [cleanupPeerConnection]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || !id) return;
    const socket = getSocket();
    socket.emit('message:send', { sessionId: id, text: trimmed }, (ack: any) => {
      if (!ack?.ok) setError(ack?.error || 'Failed to send');
    });
    setText('');
    socket.emit('typing', { sessionId: id, isTyping: false });
  };

  const handleType = (value: string) => {
    setText(value);
    if (!id) return;
    const socket = getSocket();
    socket.emit('typing', { sessionId: id, isTyping: true });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', { sessionId: id, isTyping: false });
    }, 1200);
  };

  const askAssistant = () => {
    const trimmed = assistantPrompt.trim();
    if (!trimmed || !id) return;
    setAssistantBusy(true);
    setAssistantPrompt('');
    getSocket().emit('assistant:ask', { sessionId: id, prompt: trimmed }, (ack: any) => {
      if (!ack?.ok) {
        setAssistantBusy(false);
        setError(ack?.error || 'Assistant is unavailable');
      }
    });
  };

  const completeSession = async () => {
    if (!id) return;
    const updatedSession = await SessionApi.complete(id);
    setSession(updatedSession);
    setShowRating(true);
  };

  const submitRating = async () => {
    if (!id) return;
    setSubmittingRating(true);
    try {
      await RatingApi.create({ sessionId: id, score: ratingScore, comment: ratingComment });
      setRatingDone(true);
      setShowRating(false);
    } catch (err: any) {
      setError(err.message || 'Rating failed');
    } finally {
      setSubmittingRating(false);
    }
  };

  const toggleTrack = (kind: 'audio' | 'video') => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
    const enabled = !(kind === 'audio' ? micEnabled : cameraEnabled);
    tracks.forEach((track) => {
      track.enabled = enabled;
    });
    if (kind === 'audio') setMicEnabled(enabled);
    else setCameraEnabled(enabled);
  };

  const startScreenShare = async () => {
    if (!id || !isTeacher) return;
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const displayTrack = displayStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current?.getSenders().find((item) => item.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(displayTrack);
      }
      screenStreamRef.current = displayStream;
      attachLocalPreview(displayStream);
      setScreenSharing(true);
      displayTrack.onended = () => {
        stopScreenShare().catch(() => {});
      };
      getSocket().emit('session:screen-share', { sessionId: id, active: true });
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'Screen share failed');
    }
  };

  if (!user) return null;
  if (!session) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span className="loading-text">{error || 'Loading session…'}</span>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="avatar avatar-md">
          <span>{getInitials(partner?.name || '?')}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700 }}>{partner?.name}</span>
            <span className={`badge badge-${session.status === 'active' ? 'success' : session.status === 'flagged' ? 'danger' : 'grey'}`}>
              {session.status}
            </span>
            <span className={`badge badge-${peerOnline ? 'success' : 'grey'}`}>
              {peerOnline ? 'peer online' : 'waiting for peer'}
            </span>
            <span className="badge badge-info">{isTeacher ? 'teacher' : 'learner'}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Teacher topic: {topic} · Learner context: {learnerContext}
          </div>
        </div>
        {session.status === 'active' && (
          <button className="btn btn-secondary btn-sm" onClick={completeSession}>
            ✓ End & Rate
          </button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/sessions')}>
          ← Back
        </button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>⚠️ {error}</div>}
      {warning && (
        <div className="alert alert-warning" style={{ marginBottom: 12 }}>
          AI moderator: {warning}
        </div>
      )}
      {mediaError && (
        <div className="alert alert-warning" style={{ marginBottom: 12 }}>
          Live media warning: {mediaError}
        </div>
      )}
      {session.status === 'flagged' && (
        <div className="alert alert-danger" style={{ marginBottom: 12 }}>
          Chat has been locked for repeated off-topic messages.
        </div>
      )}
      {ratingDone && (
        <div className="alert alert-success" style={{ marginBottom: 12 }}>
          Thanks for rating the session.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Your camera {screenSharing ? '(sharing screen)' : ''}
              </div>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', minHeight: 240, background: 'var(--bg-secondary)', borderRadius: 12, objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                {partner?.name || 'Peer'} {peerScreenSharing ? '(sharing screen)' : ''}
              </div>
              <video
                ref={remoteVideoRef}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={() => {
                  remoteVideoRef.current?.play().catch(() => {});
                }}
                style={{ width: '100%', minHeight: 240, background: 'var(--bg-secondary)', borderRadius: 12, objectFit: 'cover' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => toggleTrack('audio')} disabled={!mediaReady}>
                {micEnabled ? 'Mute Mic' : 'Unmute Mic'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => toggleTrack('video')} disabled={!mediaReady}>
                {cameraEnabled ? 'Turn Camera Off' : 'Turn Camera On'}
              </button>
              {isTeacher && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => (screenSharing ? stopScreenShare() : startScreenShare())}
                  disabled={!mediaReady}
                >
                  {screenSharing ? 'Stop Screen Share' : 'Share Screen'}
                </button>
              )}
              {!isTeacher && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  Screen sharing is enabled only for the teacher.
                </div>
              )}
            </div>
          </div>

          <div
            ref={scrollRef}
            className="card"
            style={{
              minHeight: 360,
              maxHeight: 420,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: 16,
            }}
          >
            {messages.length === 0 ? (
              <div className="empty-state" style={{ margin: 'auto' }}>
                <div className="empty-icon">💬</div>
                <div className="empty-title">Class chat is ready</div>
                <div className="empty-desc">Use this for lesson discussion and quick help from the assistant.</div>
              </div>
            ) : (
              messages.map((message, index) => {
                const senderId = (message as any).senderId || (message as any).sender;
                const mine = senderId === user.id;
                const assistant = senderId === 'assistant';
                return (
                  <div
                    key={(message as any).id || (message as any)._id || index}
                    style={{
                      alignSelf: assistant ? 'stretch' : mine ? 'flex-end' : 'flex-start',
                      maxWidth: assistant ? '100%' : '78%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: assistant ? 'rgba(99, 102, 241, 0.12)' : mine ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                      border: message.flagged ? '1px solid var(--danger)' : assistant ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                    }}
                  >
                    {assistant && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                        Session Assistant
                      </div>
                    )}
                    <div style={{ fontSize: '0.92rem', whiteSpace: 'pre-wrap' }}>{message.text}</div>
                    {message.flagged && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--danger)', marginTop: 4 }}>
                        flagged: {message.moderation?.reason}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {peerTyping && (
              <div style={{ alignSelf: 'flex-start', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {partner?.name} is typing…
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              placeholder={session.status === 'active' ? `Discuss ${topic}` : 'Session is closed'}
              value={text}
              disabled={session.status !== 'active'}
              onChange={(event) => handleType(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && send()}
            />
            <button className="btn btn-primary" disabled={!text.trim() || session.status !== 'active'} onClick={send}>
              Send
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>AI Class Assistant</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              Ask for a recap, examples, quiz questions, or the next teaching step for {topic}.
            </div>
            <textarea
              className="form-textarea"
              value={assistantPrompt}
              onChange={(event) => setAssistantPrompt(event.target.value)}
              placeholder={`Example: Give me a short recap of ${topic}`}
              rows={4}
            />
            <button
              className="btn btn-primary"
              style={{ marginTop: 12, width: '100%' }}
              disabled={!assistantPrompt.trim() || assistantBusy}
              onClick={askAssistant}
            >
              {assistantBusy ? 'Thinking…' : 'Ask Assistant'}
            </button>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Session Roles</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <strong>Teacher:</strong> {session.teacherUser?.name} teaching <strong>{session.teacherSkill?.name}</strong>
              </div>
              <div>
                <strong>Learner:</strong> {session.learnerUser?.name} learning <strong>{session.teacherSkill?.name}</strong>
              </div>
              <div>
                <strong>Learner brings:</strong> {session.learnerSkill?.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRating && (
        <div className="modal-overlay" onClick={() => setShowRating(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Rate {partner?.name}</div>
              <button className="modal-close" onClick={() => setShowRating(false)}>×</button>
            </div>
            <div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRatingScore(value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '2rem',
                      color: value <= ratingScore ? 'var(--warning)' : 'var(--text-muted)',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                className="form-textarea"
                placeholder="Optional comment"
                value={ratingComment}
                onChange={(event) => setRatingComment(event.target.value)}
                maxLength={500}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setShowRating(false)}>Skip</button>
              <button className="btn btn-primary" onClick={submitRating} disabled={submittingRating}>
                {submittingRating ? 'Submitting…' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionPage;
