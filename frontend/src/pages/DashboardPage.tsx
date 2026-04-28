import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ExamApi, RequestApi, SessionApi } from '../api';
import { getInitials, timeAgo } from '../utils/helpers';
import type { Session, SwapRequest } from '../types';

const StatCard = ({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number | string;
  label: string;
  color: string;
}) => (
  <div className="stat-card" style={{ borderTopColor: color }}>
    <div className="stat-icon">{icon}</div>
    <div>
      <div className="stat-value" style={{ color }}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [examPasses, setExamPasses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([SessionApi.list(), RequestApi.list(), ExamApi.history()])
      .then(([s, r, h]) => {
        setSessions(s);
        setRequests(r);
        setExamPasses(h.filter((x: any) => x.passed).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;
  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span className="loading-text">Loading dashboard…</span>
      </div>
    );

  const activeSessions = sessions.filter((s) => s.status === 'active').length;
  const completed = sessions.filter((s) => s.status === 'completed').length;
  const incomingPending = requests.filter(
    (r) => r.status === 'pending' && (r.toUser as any)?._id === user.id
  );
  const verifiedSkills = user.skillsOffered.filter((s) => s.verified).length;

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          {user.avatarUrl && (user.avatarUrl.startsWith('http') || user.avatarUrl.startsWith('data:')) ? (
            <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            <span>{getInitials(user.name)}</span>
          )}
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 4 }}>
            {user.createdAt && Date.now() - new Date(user.createdAt).getTime() < 1000 * 60 * 60 
              ? `Welcome, ${user.name.split(' ')[0]} 👋` 
              : `Welcome back, ${user.name.split(' ')[0]} 👋`}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {verifiedSkills > 0
              ? `${verifiedSkills} verified skill${verifiedSkills > 1 ? 's' : ''}`
              : 'Take a verification exam to start mentoring'}
            {user.averageRating > 0 && (
              <span style={{ marginLeft: 12 }}>★ {user.averageRating.toFixed(1)} ({user.ratingsCount})</span>
            )}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/match"><button className="btn btn-primary">🔍 Find Peers</button></Link>
          {incomingPending.length > 0 && (
            <Link to="/requests">
              <button className="btn btn-secondary">📨 Requests ({incomingPending.length})</button>
            </Link>
          )}
        </div>
      </div>

      {incomingPending.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          📨 You have <strong>{incomingPending.length}</strong> pending swap request
          {incomingPending.length > 1 ? 's' : ''}!
          <Link
            to="/requests"
            style={{
              marginLeft: 'auto',
              color: 'var(--info)',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Respond →
          </Link>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard icon="💬" value={activeSessions} label="Active Sessions" color="#6366f1" />
        <StatCard icon="✅" value={completed} label="Completed" color="var(--success)" />
        {user?.intent !== 'learner' && (
          <>
            <StatCard icon="📨" value={incomingPending.length} label="Incoming Requests" color="var(--danger)" />
            <StatCard icon="🏆" value={examPasses} label="Exams Passed" color="var(--warning)" />
          </>
        )}
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        {user?.intent !== 'learner' && (
          <div className="card">
            <div className="section-header">
              <div>
                <div className="section-title">Skills I Can Teach</div>
                <div className="section-subtitle">Verified by exam</div>
              </div>
              <Link to="/skills"><button className="btn btn-ghost btn-sm">Manage →</button></Link>
            </div>
            {user.skillsOffered.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.skillsOffered.map((s, idx) => {
                  const skill: any = s.skill;
                  return (
                    <span key={idx} className={`skill-tag ${s.verified ? 'verified' : ''}`}>
                      {s.verified ? '✓' : '⏳'} {typeof skill === 'string' ? skill : skill.name}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-icon">🎓</div>
                <div className="empty-title">No skills yet</div>
                <Link to="/skills" style={{ marginTop: 8 }}>
                  <button className="btn btn-secondary btn-sm">Take Exam</button>
                </Link>
              </div>
            )}
          </div>
        )}

        {user?.intent !== 'teacher' && (
          <div className="card">
            <div className="section-header">
              <div>
                <div className="section-title">Skills I Want to Learn</div>
                <div className="section-subtitle">My learning wishlist</div>
              </div>
              <Link to="/match"><button className="btn btn-ghost btn-sm">Find Peer →</button></Link>
            </div>
            {user.skillsWanted.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.skillsWanted.map((s, idx) => {
                  const skill: any = s.skill;
                  return (
                    <span key={idx} className="skill-tag">
                      🎯 {typeof skill === 'string' ? skill : skill.name}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-icon">📚</div>
                <div className="empty-title">No skills added yet</div>
                <Link to="/profile" style={{ marginTop: 8 }}>
                  <button className="btn btn-secondary btn-sm">Edit Profile</button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="section-title">Recent Sessions</div>
          </div>
          <Link to="/sessions"><button className="btn btn-ghost btn-sm">View All →</button></Link>
        </div>
        {sessions.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-title">No sessions yet</div>
              <div className="empty-desc">Find a verified peer to start a swap</div>
              <Link to="/match" style={{ marginTop: 12 }}>
                <button className="btn btn-primary">Find Peers</button>
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.slice(0, 5).map((s) => {
              const partner = s.participants.find((p) => p._id !== user.id);
              return (
                <div
                  key={s._id}
                  className="card"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
                  onClick={() => navigate(`/session/${s._id}`)}
                >
                  <div className="avatar avatar-md">
                    <span>{getInitials(partner?.name || '?')}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{partner?.name || 'Peer'}</span>
                      <span className={`badge badge-${s.status === 'active' ? 'success' : 'grey'}`}>
                        {s.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {(s.skillFromA as any)?.name} ↔ {(s.skillFromB as any)?.name}
                      <span style={{ marginLeft: 12 }}>{timeAgo(s.updatedAt)}</span>
                    </div>
                  </div>
                  {s.status === 'active' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/session/${s._id}`);
                      }}
                    >
                      Join →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
