import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileApi, SkillsApi } from '../api';
import type { Skill } from '../types';

const OnboardingPage = () => {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [offered, setOffered] = useState<string[]>([]);
  const [wanted, setWanted] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    SkillsApi.list().then(setSkills).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setOffered(user.skillsOffered.map((s) => (typeof s.skill === 'string' ? s.skill : s.skill._id)));
      setWanted(user.skillsWanted.map((s) => (typeof s.skill === 'string' ? s.skill : s.skill._id)));
    }
  }, [user]);

  const grouped = useMemo(() => {
    const m: Record<string, Skill[]> = {};
    for (const s of skills) {
      const key = s.category || 'general';
      m[key] = m[key] || [];
      m[key].push(s);
    }
    return m;
  }, [skills]);

  const toggleOffered = (id: string) => {
    setOffered((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    if (!offered.includes(id)) setWanted((prev) => prev.filter((x) => x !== id));
  };

  const toggleWanted = (id: string) => {
    setWanted((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    if (!wanted.includes(id)) setOffered((prev) => prev.filter((x) => x !== id));
  };

  const saveBio = async () => {
    setSaving(true);
    setError('');
    try {
      const u = await ProfileApi.updateMe({ bio });
      setUser(u);
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    if (offered.length === 0 && wanted.length === 0) {
      setError('Pick at least one skill to teach or learn.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const u = await ProfileApi.setOnboarding({
        skillsOffered: offered.map((id) => ({ skill: id })),
        skillsWanted: wanted.map((id) => ({ skill: id })),
      });
      setUser(u);
      navigate('/skills');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 99,
                background: i <= step ? 'var(--text-primary)' : 'var(--bg-elevated)',
                transition: 'background 0.4s ease',
              }}
            />
          ))}
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚡</div>
            <h2 style={{ marginBottom: 8 }}>Welcome to SkillSwap, {user.name.split(' ')[0]}!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
              Let's set up your profile so we can match you with peers.
            </p>
            <div
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                marginBottom: 28,
                textAlign: 'left',
              }}
            >
              {[
                { icon: '✓', text: 'Pick skills you want to teach (you must pass an exam to mentor)' },
                { icon: '🔍', text: 'Pick skills you want to learn' },
                { icon: '💬', text: 'We\'ll match you with verified peers in real time' },
                { icon: '⭐', text: 'Rate sessions to build trust on the platform' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 0',
                    borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--bg-elevated)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.text}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(1)}>
              Get Started →
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ marginBottom: 8 }}>Tell us about yourself</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              A short bio helps peers decide if you're a good fit.
            </p>
            <div className="form-group">
              <label className="form-label">Short Bio</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: 120 }}
                placeholder="What are you learning, what do you build, what excites you?"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {bio.length}/500
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={saveBio} disabled={saving}>
                {saving ? 'Saving…' : 'Save & Continue →'}
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => setStep(2)}>Skip</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ marginBottom: 8 }}>Pick your skills</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
              Choose what you can teach and what you want to learn. You'll need to pass an exam before
              actually mentoring others.
            </p>

            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: 8,
                    letterSpacing: '0.05em',
                  }}
                >
                  {cat}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {list.map((s) => {
                    const isOffered = offered.includes(s._id);
                    const isWanted = wanted.includes(s._id);
                    return (
                      <div key={s._id} style={{ display: 'flex', gap: 4 }}>
                        {user?.intent !== 'learner' && (
                          <button
                            type="button"
                            className={`skill-tag ${isOffered ? 'verified' : ''}`}
                            style={{ cursor: 'pointer', border: isOffered ? undefined : '1px dashed var(--border-default)' }}
                            onClick={() => toggleOffered(s._id)}
                          >
                            🏫 {s.name}
                          </button>
                        )}
                        {user?.intent !== 'teacher' && (
                          <button
                            type="button"
                            className="skill-tag"
                            style={{
                              cursor: 'pointer',
                              background: isWanted ? 'var(--accent-dim)' : undefined,
                              border: isWanted ? undefined : '1px dashed var(--border-default)',
                            }}
                            onClick={() => toggleWanted(s._id)}
                          >
                            🎓 {s.name}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              🏫 = teach · 🎓 = learn. You can change this later.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-lg" onClick={() => setStep(1)}>← Back</button>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={finish}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Finish Setup →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
