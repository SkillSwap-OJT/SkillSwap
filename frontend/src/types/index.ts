export interface Skill {
  _id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  keywords?: string[];
  studyMaterial?: string;
  studyMaterialUrl?: string;
}

export interface SkillEntry {
  skill: Skill | string;
  level: 'beginner' | 'intermediate' | 'advanced';
  verified: boolean;
  verifiedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  college?: string;
  intent?: 'learner' | 'teacher' | 'both';
  skillsOffered: SkillEntry[];
  skillsWanted: SkillEntry[];
  onboarded: boolean;
  averageRating: number;
  ratingsCount: number;
  createdAt?: string;
}

export interface ExamQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface Exam {
  id: string;
  skill: string;
  title: string;
  description?: string;
  passingScore: number;
  durationMinutes: number;
  questions: ExamQuestion[];
}

export interface ExamSubmitResult {
  score: number;
  passed: boolean;
  passingScore: number;
  correct: number;
  total: number;
  resultId: string;
  proctoringWarnings?: string[];
}

export interface MatchResult {
  user: User;
  score: number;
  teachesYou: string[];
  learnsFromYou: string[];
  twoWay: boolean;
}

export interface SwapRequest {
  _id: string;
  fromUser: User | { _id: string; name: string; avatarUrl?: string };
  toUser: User | { _id: string; name: string; avatarUrl?: string };
  offeredSkill?: Skill;
  requestedSkill: Skill;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  session?: string;
  createdAt: string;
}

export interface SessionParticipant {
  _id: string;
  name: string;
  avatarUrl?: string;
  averageRating?: number;
  intent?: 'learner' | 'teacher' | 'both';
}

export interface Session {
  _id: string;
  participants: SessionParticipant[];
  skillFromA: Skill;
  skillFromB: Skill;
  teacherUser: SessionParticipant;
  learnerUser: SessionParticipant;
  teacherSkill: Skill;
  learnerSkill?: Skill;
  status: 'active' | 'completed' | 'flagged' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  moderationStrikes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id?: string;
  _id?: string;
  sessionId?: string;
  session?: string;
  senderId?: string;
  sender?: string;
  text: string;
  flagged: boolean;
  moderation: { onTopic: boolean; score: number; reason: string };
  createdAt: string;
}

export interface Rating {
  _id: string;
  session: string;
  fromUser: { _id: string; name: string; avatarUrl?: string };
  toUser: string;
  score: number;
  comment?: string;
  createdAt: string;
}
