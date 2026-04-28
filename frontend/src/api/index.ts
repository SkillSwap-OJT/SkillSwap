import { api } from './client';
import type {
  ChatMessage,
  Exam,
  ExamSubmitResult,
  MatchResult,
  Rating,
  Session,
  Skill,
  SwapRequest,
  User,
} from '../types';

// ── Auth ─────────────────────────────────────────────────────────────────────
export const AuthApi = {
  register: async (input: { name: string; email: string; password: string; college?: string; intent?: string }) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/register', input);
    return data;
  },
  login: async (input: { email: string; password: string }) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/login', input);
    return data;
  },
  me: async () => {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data.user;
  },
};

// ── Profile ──────────────────────────────────────────────────────────────────
export const ProfileApi = {
  getMe: async () => (await api.get<{ user: User }>('/profile/me')).data.user,
  updateMe: async (patch: { name?: string; bio?: string; avatarUrl?: string; intent?: string }) =>
    (await api.patch<{ user: User }>('/profile/me', patch)).data.user,
  setOnboarding: async (input: {
    skillsOffered: { skill: string; level?: string }[];
    skillsWanted: { skill: string; level?: string }[];
  }) => (await api.post<{ user: User }>('/profile/onboarding', input)).data.user,
  getUser: async (id: string) => (await api.get<{ user: User }>(`/profile/users/${id}`)).data.user,
};

// ── Skills ───────────────────────────────────────────────────────────────────
export const SkillsApi = {
  list: async (params?: { q?: string; category?: string }) =>
    (await api.get<{ skills: Skill[] }>('/skills', { params })).data.skills,
  get: async (id: string) => (await api.get<{ skill: Skill }>(`/skills/${id}`)).data.skill,
  uploadMaterial: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return (await api.post<{ skill: Skill }>(`/skills/${id}/material`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data.skill;
  },
};

// ── Exams ────────────────────────────────────────────────────────────────────
export const ExamApi = {
  forSkill: async (skillId: string) =>
    (await api.get<{ exam: Exam }>(`/exams/skill/${skillId}`)).data.exam,
  submit: async (
    skillId: string,
    answers: number[],
    proctoring?: { cameraActive: boolean; warnings: string[]; visibilityChanges: number }
  ) => (await api.post<ExamSubmitResult>(`/exams/skill/${skillId}/submit`, { answers, proctoring })).data,
  history: async () =>
    (await api.get<{ results: any[] }>('/exams/history')).data.results,
};

// ── Matching ─────────────────────────────────────────────────────────────────
export const MatchApi = {
  list: async (limit = 25) =>
    (await api.get<{ matches: MatchResult[] }>('/match', { params: { limit } })).data.matches,
};

// ── Swap requests ────────────────────────────────────────────────────────────
export const RequestApi = {
  create: async (input: {
    toUser: string;
    offeredSkill?: string;
    requestedSkill: string;
    message?: string;
  }) => (await api.post<{ request: SwapRequest }>('/requests', input)).data.request,
  list: async (direction?: 'incoming' | 'outgoing') =>
    (await api.get<{ requests: SwapRequest[] }>('/requests', { params: { direction } })).data
      .requests,
  respond: async (id: string, action: 'accept' | 'reject') =>
    (await api.post<{ request: SwapRequest; session?: Session }>(`/requests/${id}/respond`, {
      action,
    })).data,
  cancel: async (id: string) =>
    (await api.post<{ request: SwapRequest }>(`/requests/${id}/cancel`)).data.request,
};

// ── Sessions ─────────────────────────────────────────────────────────────────
export const SessionApi = {
  list: async () => (await api.get<{ sessions: Session[] }>('/sessions')).data.sessions,
  get: async (id: string) => (await api.get<{ session: Session }>(`/sessions/${id}`)).data.session,
  complete: async (id: string) =>
    (await api.post<{ session: Session }>(`/sessions/${id}/complete`)).data.session,
  messages: async (id: string) =>
    (await api.get<{ messages: ChatMessage[] }>(`/sessions/${id}/messages`)).data.messages,
};

// ── Ratings ──────────────────────────────────────────────────────────────────
export const RatingApi = {
  create: async (input: { sessionId: string; score: number; comment?: string }) =>
    (await api.post<{ rating: Rating }>('/ratings', input)).data.rating,
  forUser: async (userId: string) =>
    (await api.get<{ ratings: Rating[] }>(`/ratings/user/${userId}`)).data.ratings,
};
