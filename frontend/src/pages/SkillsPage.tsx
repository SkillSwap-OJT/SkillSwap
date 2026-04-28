import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileApi, SkillsApi } from '../api';
import type { Skill, SkillEntry } from '../types';

const SkillsPage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [uploadingSkillId, setUploadingSkillId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingUploadSkillId, setPendingUploadSkillId] = useState<string | null>(null);

  useEffect(() => {
    SkillsApi.list().then(setSkills).catch(() => {});
  }, []);

  const offeredIds = useMemo(
    () =>
      new Set(
        (user?.skillsOffered || []).map((s) =>
          typeof s.skill === 'string' ? s.skill : s.skill._id
        )
      ),
    [user]
  );
  const wantedIds = useMemo(
    () =>
      new Set(
        (user?.skillsWanted || []).map((s) =>
          typeof s.skill === 'string' ? s.skill : s.skill._id
        )
      ),
    [user]
  );
  const verifiedIds = useMemo(
    () =>
      new Set(
        (user?.skillsOffered || [])
          .filter((s) => s.verified)
          .map((s) => (typeof s.skill === 'string' ? s.skill : s.skill._id))
      ),
    [user]
  );

  const categories = useMemo(() => {
    const set = new Set(skills.map((s) => s.category));
    return ['all', ...Array.from(set)];
  }, [skills]);

  const filtered = filter === 'all' ? skills : skills.filter((s) => s.category === filter);

  const persist = async (nextOffered: SkillEntry[], nextWanted: SkillEntry[]) => {
    const offeredPayload = nextOffered.map((s) => ({
      skill: typeof s.skill === 'string' ? s.skill : s.skill._id,
      level: s.level,
    }));
    const wantedPayload = nextWanted.map((s) => ({
      skill: typeof s.skill === 'string' ? s.skill : s.skill._id,
      level: s.level,
    }));
    const u = await ProfileApi.setOnboarding({
      skillsOffered: offeredPayload,
      skillsWanted: wantedPayload,
    });
    setUser(u);
  };

  const toggleWanted = async (skillId: string) => {
    if (!user) return;
    setBusy(true);
    try {
      const isCurrentlyWanted = wantedIds.has(skillId);
      const nextWanted = isCurrentlyWanted
        ? user.skillsWanted.filter(
            (s) => (typeof s.skill === 'string' ? s.skill : s.skill._id) !== skillId
          )
        : [
            ...user.skillsWanted,
            { skill: skillId as any, level: 'beginner' as const, verified: false },
          ];
      
      const nextOffered = !isCurrentlyWanted
        ? user.skillsOffered.filter(
            (s) => (typeof s.skill === 'string' ? s.skill : s.skill._id) !== skillId
          )
        : user.skillsOffered;

      await persist(nextOffered, nextWanted);
    } finally {
      setBusy(false);
    }
  };

  const toggleOffered = async (skillId: string) => {
    if (!user) return;
    setBusy(true);
    try {
      const isCurrentlyOffered = offeredIds.has(skillId);
      const nextOffered = isCurrentlyOffered
        ? user.skillsOffered.filter(
            (s) => (typeof s.skill === 'string' ? s.skill : s.skill._id) !== skillId
          )
        : [
            ...user.skillsOffered,
            { skill: skillId as any, level: 'beginner' as const, verified: false },
          ];
          
      const nextWanted = !isCurrentlyOffered
        ? user.skillsWanted.filter(
            (s) => (typeof s.skill === 'string' ? s.skill : s.skill._id) !== skillId
          )
        : user.skillsWanted;

      await persist(nextOffered, nextWanted);
    } finally {
      setBusy(false);
    }
  };

  const openMaterialPicker = (skillId: string) => {
    setPendingUploadSkillId(skillId);
    fileInputRef.current?.click();
  };

  const handleMaterialUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !pendingUploadSkillId) return;

    setUploadingSkillId(pendingUploadSkillId);
    try {
      const updatedSkill = await SkillsApi.uploadMaterial(pendingUploadSkillId, file);
      setSkills((current) => current.map((skill) => (skill._id === updatedSkill._id ? updatedSkill : skill)));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to upload study material');
    } finally {
      setUploadingSkillId(null);
      setPendingUploadSkillId(null);
      event.target.value = '';
    }
  };

  if (!user) return null;

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: 4 }}>Skills & Verification Exams</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Pick the skills you want to teach or learn. To mentor, you must pass the verification exam.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {categories.map((c) => (
          <button
            key={c}
            className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleMaterialUpload}
      />

      <div className="grid-2">
        {filtered.map((s) => {
          const isOffered = offeredIds.has(s._id);
          const isWanted = wantedIds.has(s._id);
          const isVerified = verifiedIds.has(s._id);
          return (
            <div className="card" key={s._id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{s.name}</div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {s.category}
                  </div>
                  {s.description && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                      {s.description}
                    </div>
                  )}
                </div>
                {isVerified && <span className="badge badge-success">✓ Verified</span>}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                {user?.intent !== 'learner' && (
                  <button
                    className={`btn btn-sm ${isOffered ? 'btn-secondary' : 'btn-ghost'}`}
                    disabled={busy}
                    onClick={() => toggleOffered(s._id)}
                  >
                    🏫 {isOffered ? 'Teaching' : 'Teach this'}
                  </button>
                )}
                {user?.intent !== 'teacher' && (
                  <button
                    className={`btn btn-sm ${isWanted ? 'btn-secondary' : 'btn-ghost'}`}
                    disabled={busy}
                    onClick={() => toggleWanted(s._id)}
                  >
                    🎓 {isWanted ? 'Learning' : 'Want to learn'}
                  </button>
                )}
                {user?.intent !== 'learner' && isOffered && !isVerified && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/exam/${s._id}`)}
                  >
                    📝 Take Exam
                  </button>
                )}
                {user?.intent !== 'learner' && isVerified && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/exam/${s._id}`)}
                  >
                    Re-take
                  </button>
                )}
                {user?.intent !== 'learner' ? (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    disabled={uploadingSkillId === s._id}
                    onClick={() => openMaterialPicker(s._id)}
                  >
                    📄 {uploadingSkillId === s._id ? 'Uploading...' : s.studyMaterialUrl ? 'Replace Study Material' : 'Add Study Material'}
                  </button>
                ) : (s.studyMaterial || s.studyMaterialUrl) && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    onClick={() => {
                      if (s.studyMaterialUrl) {
                        window.open(s.studyMaterialUrl, '_blank', 'noopener,noreferrer');
                        return;
                      }
                      setSelectedSkill(s);
                    }}
                  >
                    📄 Study Material
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No skills in this category</div>
          </div>
        )}
      </div>

      {selectedSkill && (
        <div className="modal-overlay" onClick={() => setSelectedSkill(null)}>
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header">
              <div className="modal-title">Study Material: {selectedSkill.name}</div>
              <button className="modal-close" onClick={() => setSelectedSkill(null)}>×</button>
            </div>
            <div 
              style={{ marginTop: 16, lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: selectedSkill.studyMaterial || '' }}
            />
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setSelectedSkill(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsPage;
