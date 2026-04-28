import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', college: '', email: '', password: '', confirm: '', intent: 'both' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.college, form.intent);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <span style={{ fontSize: '1.5rem', marginRight: 8 }}>⚡</span>SkillSwap
        </div>
        <p className="auth-subtitle">Create your account and start swapping skills</p>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">College (Optional)</label>
              <input
                className="form-input"
                type="text"
                name="college"
                placeholder="Polaris School Of Technology"
                value={form.college}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type="password"
                name="confirm"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 32 }}>
            <label className="form-label">I WANT TO...</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                    border: `1px solid ${form.intent === opt.id ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: form.intent === opt.id ? 'var(--bg-elevated)' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="intent"
                    value={opt.id}
                    checked={form.intent === opt.id}
                    onChange={handleChange}
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
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />{' '}
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
