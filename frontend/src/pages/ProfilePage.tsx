import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileApi, RatingApi } from '../api';
import { getInitials, timeAgo } from '../utils/helpers';
import type { Rating } from '../types';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [intent, setIntent] = useState<'learner' | 'teacher' | 'both'>('both');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setIntent(user.intent || 'both');
      RatingApi.forUser(user.id).then(setRatings).catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  const save = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const u = await ProfileApi.updateMe({ name, bio, avatarUrl, intent });
      setUser(u);
      setShowRoleSelector(false);
      setSuccess('Profile updated');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: 16 }}>My Profile</h1>

      {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>⚠️ {error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 12 }}>✅ {success}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) ? (
              <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <span>{getInitials(name)}</span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user.email}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ★ {user.averageRating?.toFixed(1) || 'new'} ({user.ratingsCount} ratings)
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Display Name</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Avatar URL (optional)</label>
          <input
            className="form-input"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea
            className="form-textarea"
            style={{ minHeight: 100 }}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
          />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            {bio.length}/500
          </div>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-header">
          <div className="section-title">My Role</div>
          {!showRoleSelector && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (window.confirm("Are you sure you want to change your account role? This will change the features available to you.")) {
                  setShowRoleSelector(true);
                }
              }}
            >
              Change Role
            </button>
          )}
        </div>
        
        {!showRoleSelector ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.5rem' }}>
              {intent === 'learner' ? '🧗' : intent === 'teacher' ? '🏫' : '⚡'}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {intent === 'learner' ? 'Only Learner' : intent === 'teacher' ? 'Only Teacher' : 'Both (Teacher & Learner)'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {intent === 'learner' ? 'You are only browsing and requesting to learn skills.' : intent === 'teacher' ? 'You are only verifying and offering skills to teach.' : 'You are participating in both learning and teaching.'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {[
              { id: 'learner', icon: '🧗', title: 'Only Learner', desc: 'I want to learn skills from others' },
              { id: 'teacher', icon: '🏫', title: 'Only Teacher', desc: 'I want to teach skills to others' },
              { id: 'both', icon: '⚡', title: 'Both', desc: 'I want to learn and teach' },
            ].map((opt) => (
              <label
                key={opt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px',
                  border: `1px solid ${intent === opt.id ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: intent === opt.id ? 'var(--bg-elevated)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="radio"
                  name="intent"
                  value={opt.id}
                  checked={intent === opt.id}
                  onChange={(e) => setIntent(e.target.value as any)}
                  style={{ accentColor: 'var(--text-primary)', width: 18, height: 18 }}
                />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {opt.icon} {opt.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {opt.desc}
                  </div>
                </div>
              </label>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Confirm Change'}
              </button>
              <button className="btn btn-ghost" onClick={() => {
                setShowRoleSelector(false);
                setIntent(user.intent || 'both');
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-header">
          <div className="section-title">My Skills</div>
          <Link to="/skills"><button className="btn btn-ghost btn-sm">Manage →</button></Link>
        </div>
        <div style={{ marginBottom: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Teaching ({user.skillsOffered.length})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {user.skillsOffered.length > 0 ? (
            user.skillsOffered.map((s, i) => {
              const skill: any = s.skill;
              return (
                <span key={i} className={`skill-tag ${s.verified ? 'verified' : ''}`}>
                  {s.verified ? '✓' : '⏳'} {typeof skill === 'string' ? skill : skill.name}
                </span>
              );
            })
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No skills yet</span>
          )}
        </div>
        <div style={{ marginBottom: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Learning ({user.skillsWanted.length})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {user.skillsWanted.length > 0 ? (
            user.skillsWanted.map((s, i) => {
              const skill: any = s.skill;
              return (
                <span key={i} className="skill-tag">
                  📌 {typeof skill === 'string' ? skill : skill.name}
                </span>
              );
            })
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No skills yet</span>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          What others say
        </div>
        {ratings.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No ratings yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ratings.map((r) => (
              <div key={r._id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong>{r.fromUser.name}</strong>
                  <span style={{ color: 'var(--warning)' }}>{'★'.repeat(r.score)}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {timeAgo(r.createdAt)}
                  </span>
                </div>
                {r.comment && <div style={{ fontSize: '0.85rem', marginTop: 4 }}>{r.comment}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
