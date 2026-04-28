import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProfileApi, RatingApi } from '../api';
import { getInitials, timeAgo } from '../utils/helpers';
import type { Rating, User } from '../types';

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    Promise.all([ProfileApi.getUser(userId), RatingApi.forUser(userId)])
      .then(([u, r]) => {
        setUser(u);
        setRatings(r);
      })
      .catch((e) => setError(e.message || 'Failed to load profile'));
  }, [userId]);

  if (error) {
    return (
      <div className="page">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-ghost" onClick={() => navigate('/match')}>← Back</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 720, margin: '0 auto' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Back
      </button>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {user.avatarUrl && (user.avatarUrl.startsWith('http') || user.avatarUrl.startsWith('data:')) ? (
              <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <span>{getInitials(user.name)}</span>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 4 }}>{user.name}</h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ★ {user.averageRating?.toFixed(1) || 'new'} · {user.ratingsCount} ratings
            </div>
          </div>
        </div>
        {user.bio && <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{user.bio}</p>}

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Teaches</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {user.skillsOffered.filter((s) => s.verified).length === 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No verified skills</span>
            )}
            {user.skillsOffered.filter((s) => s.verified).map((s, i) => {
              const skill: any = s.skill;
              return (
                <span key={i} className="skill-tag verified">
                  ✓ {typeof skill === 'string' ? skill : skill.name}
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Learning</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {user.skillsWanted.length === 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>—</span>
            )}
            {user.skillsWanted.map((s, i) => {
              const skill: any = s.skill;
              return (
                <span key={i} className="skill-tag">
                  📌 {typeof skill === 'string' ? skill : skill.name}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          Ratings
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

export default UserProfilePage;
