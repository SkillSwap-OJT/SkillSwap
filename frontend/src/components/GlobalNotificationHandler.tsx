import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../lib/socket';
import type { Session } from '../types';

export default function GlobalNotificationHandler() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{
    id: string;
    message: string;
    cta?: string;
    onClick?: () => void;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const onNewRequest = (data: any) => {
      const fromName = data.request?.fromUser?.name || 'Someone';
      const reqSkill = data.request?.requestedSkill?.name || 'a skill';
      
      setNotification({
        id: Date.now().toString(),
        message: `${fromName} sent you a request to learn ${reqSkill}!`,
        cta: 'View',
        onClick: () => navigate('/requests'),
      });

      // auto dismiss after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    };

    const onRequestUpdated = (data: { status?: string; session?: Session }) => {
      if (data.status === 'accepted' && data.session) {
        const teacherName = data.session.teacherUser?.name || 'Teacher';
        setNotification({
          id: Date.now().toString(),
          message: `${teacherName} accepted the request. Your live session is ready.`,
          cta: 'Join',
          onClick: () => navigate(`/session/${data.session?._id}`),
        });
        setTimeout(() => setNotification(null), 6000);
        return;
      }

      if (data.status === 'rejected') {
        setNotification({
          id: Date.now().toString(),
          message: 'One of your swap requests was rejected.',
          cta: 'View',
          onClick: () => navigate('/requests'),
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      if (data.status === 'cancelled') {
        setNotification({
          id: Date.now().toString(),
          message: 'A swap request was cancelled.',
          cta: 'View',
          onClick: () => navigate('/requests'),
        });
        setTimeout(() => setNotification(null), 5000);
      }
    };

    socket.on('notification:request', onNewRequest);
    socket.on('notification:request-updated', onRequestUpdated);

    return () => {
      socket.off('notification:request', onNewRequest);
      socket.off('notification:request-updated', onRequestUpdated);
    };
  }, [navigate, user]);

  if (!notification) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        animation: 'slideIn 0.3s ease-out forwards',
      }}
    >
      <div style={{ fontSize: '1.5rem' }}>🔔</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          New Swap Request
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
          {notification.message}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setNotification(null);
            notification.onClick?.();
          }}
        >
          {notification.cta || 'View'}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setNotification(null)}
          style={{ padding: '0 8px' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
