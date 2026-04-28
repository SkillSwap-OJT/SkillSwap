import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ExamApi } from '../api';
import type { Exam, ExamSubmitResult } from '../types';

const ExamPage = () => {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamSubmitResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [proctorWarnings, setProctorWarnings] = useState<string[]>([]);
  const [visibilityChanges, setVisibilityChanges] = useState(0);
  const [cameraSupported, setCameraSupported] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!skillId) return;
    ExamApi.forSkill(skillId)
      .then((e) => {
        setExam(e);
        setSecondsLeft(e.durationMinutes * 60);
      })
      .catch((err) => setError(err.message || 'Failed to load exam'));
  }, [skillId]);

  useEffect(() => {
    let active = true;
    const mediaDevices = navigator.mediaDevices;

    if (!mediaDevices?.getUserMedia) {
      setCameraSupported(false);
      setCameraReady(false);
      setError(
        window.isSecureContext
          ? 'Camera access is unavailable in this browser.'
          : 'Camera proctoring needs a secure page. Open the exam on the same laptop using localhost.'
      );
      return;
    }

    mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        setCameraReady(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        const [track] = stream.getVideoTracks();
        if (track) {
          track.onended = () => {
            setCameraReady(false);
            setProctorWarnings((prev) => [...prev, 'Camera stream was interrupted during the exam.']);
          };
        }
      })
      .catch(() => {
        setCameraReady(false);
        setError('Camera access is required for teacher verification exams');
      });

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setVisibilityChanges((count) => count + 1);
        setProctorWarnings((prev) => [...prev, 'Exam tab lost focus. Stay on the exam screen.']);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, result]);

  const handleSubmit = async () => {
    if (!exam || !skillId || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const arr = exam.questions.map((_, idx) => answers[idx] ?? -1);
      const r = await ExamApi.submit(skillId, arr, {
        cameraActive: cameraReady && Boolean(streamRef.current?.getVideoTracks()[0]),
        warnings: proctorWarnings,
        visibilityChanges,
      });
      setResult(r);
      await refreshUser();
    } catch (e: any) {
      setError(e.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !exam) {
    return (
      <div className="page">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-ghost" onClick={() => navigate('/skills')}>
          ← Back to Skills
        </button>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span className="loading-text">Loading exam…</span>
      </div>
    );
  }

  if (result) {
    return (
      <div className="page" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>{result.passed ? '🎉' : '📚'}</div>
          <h2 style={{ marginBottom: 8 }}>
            {result.passed ? 'You passed!' : 'Not quite — keep going'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            You scored <strong>{result.score}%</strong> ({result.correct}/{result.total}). Passing
            score is {result.passingScore}%.
          </p>
          {!!result.proctoringWarnings?.length && (
            <div className="alert alert-warning" style={{ marginBottom: 24 }}>
              Proctoring notices: {result.proctoringWarnings.join(' ')}
            </div>
          )}
          <div style={{ height: 10, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden', marginBottom: 24 }}>
            <div
              style={{
                width: `${result.score}%`,
                height: '100%',
                background: result.passed ? 'var(--success)' : 'var(--danger)',
              }}
            />
          </div>
          {result.passed ? (
            <p style={{ marginBottom: 24 }}>
              ✅ This skill is now <strong>verified</strong> on your profile. You can mentor others
              in it.
            </p>
          ) : (
            <p style={{ marginBottom: 24 }}>You can re-take this exam any time from the Skills page.</p>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/skills')}>
              ← Back to Skills
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/match')}>
              Find Peers →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const minutes = Math.floor((secondsLeft ?? 0) / 60);
  const seconds = (secondsLeft ?? 0) % 60;
  const allAnswered = exam.questions.every((_, i) => answers[i] !== undefined);

  return (
    <div className="page" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 4 }}>{exam.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {exam.questions.length} questions · pass at {exam.passingScore}%
          </p>
        </div>
        <div className="badge badge-info" style={{ fontSize: '1rem', padding: '8px 14px' }}>
          ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 220, flex: '0 0 220px' }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', borderRadius: 12, background: 'var(--bg-secondary)' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>AI Proctoring</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
              Keep your camera on and stay on this exam tab for the full verification test.
            </div>
            {!cameraSupported && (
              <div className="alert alert-warning" style={{ marginBottom: 8 }}>
                This browser session cannot access the camera on the current URL. You can still take the exam now, but the attempt will be marked with a proctoring warning. For full camera proctoring, open the app on the teacher laptop using `http://localhost:5174/`.
              </div>
            )}
            <div className={`badge badge-${cameraReady ? 'success' : 'danger'}`} style={{ marginBottom: 8 }}>
              {cameraReady ? 'Camera active' : 'Camera required'}
            </div>
            {proctorWarnings.length > 0 && (
              <div className="alert alert-warning" style={{ marginTop: 8 }}>
                {proctorWarnings[proctorWarnings.length - 1]}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {exam.questions.map((q, qi) => (
          <div className="card" key={q.id}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              {qi + 1}. {q.text}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background:
                      answers[qi] === oi ? 'var(--bg-elevated)' : 'var(--bg-input)',
                    border: `1px solid ${answers[qi] === oi ? 'var(--border-strong)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name={`q-${qi}`}
                    checked={answers[qi] === oi}
                    onChange={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/skills')}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          disabled={submitting || !allAnswered}
          onClick={handleSubmit}
        >
          {submitting ? 'Grading…' : 'Submit Exam'}
        </button>
      </div>
    </div>
  );
};

export default ExamPage;
