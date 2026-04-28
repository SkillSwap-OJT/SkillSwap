import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MatchApi, RequestApi } from '../api';
import { getInitials } from '../utils/helpers';
import type { MatchResult, Skill } from '../types';

const RequestModal = ({
  match,
  onClose,
  onSent,
}: {
  match: MatchResult;
  onClose: () => void;
  onSent: () => void;
}) => {
  const { user } = useAuth();
  const [requestedSkill, setRequestedSkill] = useState<string>(match.teachesYou[0] || '');
  const [offeredSkill, setOfferedSkill] = useState<string>(
    match.learnsFromYou[0] ||
      (user?.skillsOffered.find((s) => s.verified)?.skill as any)?._id ||
      ''
  );
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const myOffered = useMemo(
    () => (user?.skillsOffered || []),
    [user]
  );
  // We relax the "theirVerified" restriction for testing too
  const theirOffered: Skill[] = useMemo(
    () =>
      (match.user.skillsOffered || [])
        .map((s) => s.skill as Skill)
        .filter((s): s is Skill => typeof s !== 'string'),
    [match]
  );

  const submit = async () => {
    if (!requestedSkill) {
      setError('Pick which skill you want to learn');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await RequestApi.create({
        toUser: match.user.id,
        offeredSkill: offeredSkill || undefined,
        requestedSkill,
        message,
      });
      onSent();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Request a swap with {match.user.name}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div>
          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}

          <div className="form-group">
            <label className="form-label">I want to learn (from them)</label>
            <select
              className="form-input"
              value={requestedSkill}
              onChange={(e) => setRequestedSkill(e.target.value)}
            >
              <option value="">— pick one —</option>
              {theirOffered.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Optional: a skill I can also offer</label>
            <select
              className="form-input"
              value={offeredSkill}
              onChange={(e) => setOfferedSkill(e.target.value)}
            >
              <option value="">— learning only request —</option>
              {myOffered.map((s) => {
                const skill: any = s.skill;
                const id = typeof skill === 'string' ? skill : skill._id;
                const name = typeof skill === 'string' ? skill : skill.name;
                return (
                  <option key={id} value={id}>
                    {name} {s.verified ? '✓' : ''}
                  </option>
                );
              })}
            </select>
            {myOffered.length === 0 && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                You can still send a learning request even if you are not offering another skill yet.
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Message (optional)</label>
            <textarea
              className="form-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              placeholder="Say hi and tell them what you'd like to learn"
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Sending…' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MatchPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<MatchResult | null>(null);
  const [sentBanner, setSentBanner] = useState('');

  useEffect(() => {
    MatchApi.list()
      .then(setMatches)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: 4 }}>Find Peers</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Verified peers ranked by how well your skills line up with theirs.
        </p>
      </div>

      {sentBanner && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          ✅ {sentBanner}
        </div>
      )}

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <span className="loading-text">Finding peers…</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">🤝</div>
          <div className="empty-title">No matches yet</div>
          <div className="empty-desc">
            Add skills you want to learn, then we can match you with verified peers.
          </div>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/skills')}>
            Pick Skills →
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {matches.map((m) => {
            const teaches = (m.user.skillsOffered || [])
              .filter((s) => s.verified)
              .map((s) => (typeof s.skill === 'string' ? s.skill : s.skill.name));
            return (
              <div className="card" key={m.user.id}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div className="avatar avatar-md">
                    {m.user.avatarUrl ? <img src={m.user.avatarUrl} alt={m.user.name} /> : <span>{getInitials(m.user.name)}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{m.user.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      ★ {m.user.averageRating?.toFixed(1) || 'new'} · score {m.score}
                      {m.twoWay && <span className="badge badge-success" style={{ marginLeft: 8 }}>↔ 2-way</span>}
                    </div>
                  </div>
                </div>
                {m.user.bio && (
                  <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {m.user.bio}
                  </p>
                )}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Teaches
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {teaches.map((t, i) => (
                      <span key={i} className="skill-tag verified">✓ {t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/user/${m.user.id}`)}>
                    View
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setActive(m)}>
                    Request Swap
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {active && (
        <RequestModal
          match={active}
          onClose={() => setActive(null)}
          onSent={() => {
            setSentBanner(`Swap request sent to ${active.user.name}`);
            setActive(null);
            setTimeout(() => setSentBanner(''), 4000);
          }}
        />
      )}
    </div>
  );
};

export default MatchPage;
