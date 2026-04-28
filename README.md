# SkillSwap — Verified Peer-to-Peer Skill Exchange

MERN + Socket.io implementation of the SkillSwap PRD: a peer learning platform where mentors must pass a verification exam before teaching, sessions run in real-time chat, and an AI-style moderator keeps conversations on-topic.

```
skillswap/
├── backend/    # Node.js + Express + MongoDB + Socket.io
└── frontend/   # React + Vite + TypeScript + Tailwind
```

## Prerequisites
- Node.js 18+
- MongoDB 6+ (local or Atlas)

## Backend

```bash
cd backend
cp .env.example .env       # edit MONGODB_URI / JWT_SECRET as needed
npm install
npm run seed               # seed skills + verification exams (one-time)
npm run dev                # starts on http://localhost:5000
```

Seeded skills: JavaScript, Python, React, Node.js, MongoDB, UI/UX Design — each with a 5-question verification exam.

### REST API (all under `/api`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | – | Create account |
| POST | `/auth/login` | – | Login, returns JWT |
| GET  | `/auth/me` | bearer | Current user |
| GET/PATCH | `/profile/me` | bearer | View / edit profile |
| POST | `/profile/onboarding` | bearer | Set offered + wanted skills |
| GET  | `/profile/users/:id` | bearer | Public profile |
| GET  | `/skills` | – | List skills (`?q=`, `?category=`) |
| GET  | `/exams/skill/:skillId` | bearer | Get exam (no answer key) |
| POST | `/exams/skill/:skillId/submit` | bearer | Submit answers; verifies skill on pass |
| GET  | `/exams/history` | bearer | My past attempts |
| GET  | `/match` | bearer | Ranked peer matches |
| POST | `/requests` | bearer | Send swap request |
| GET  | `/requests` | bearer | List my requests |
| POST | `/requests/:id/respond` | bearer | accept / reject |
| POST | `/requests/:id/cancel` | bearer | Cancel my outgoing request |
| GET  | `/sessions` | bearer | My sessions |
| GET  | `/sessions/:id` | bearer | One session |
| POST | `/sessions/:id/complete` | bearer | Mark complete |
| GET  | `/sessions/:id/messages` | bearer | Chat history |
| POST | `/ratings` | bearer | Rate completed session |
| GET  | `/ratings/user/:userId` | bearer | Ratings for a user |

### Socket.io events (`/socket.io`)
Authenticate with the JWT in `auth.token`.

- `session:join` `{ sessionId }` → joins room (participants only)
- `session:leave` `{ sessionId }`
- `message:send` `{ sessionId, text }` → broadcasts `message:new`; off-topic messages also emit `moderation:warning` to sender
- `typing` `{ sessionId, isTyping }` → broadcasts `typing` to peer
- `session:flagged` — emitted to room when 3 strikes are accumulated; chat is then locked

### Verified-mentor rule
A user can only offer a skill in a swap request if they have passed that skill's verification exam (`skillsOffered[i].verified === true`).

### AI moderation
`backend/src/services/moderation.service.js` implements a swappable moderator: token overlap with each session's two skills (name + keywords), an off-topic phrase blacklist, and a hard-flag list for harassment. Score < 0.35 (or any blacklist hit) → message is flagged, sender warned, session strike count incremented; 3 strikes → session status `flagged` and chat locked. Replace this module with an NLP API call without changing the socket layer.

## Frontend

```bash
cd frontend
cp .env.example .env       # optional; defaults work via Vite proxy
npm install
npm run dev                # starts on http://localhost:5173
```

Vite proxies `/api` and `/socket.io` to `http://localhost:5000`, so just run both.

### Pages
- `/login`, `/register`, `/onboarding` — auth + skill selection
- `/` — dashboard (stats, skills, recent sessions)
- `/skills` — pick what to teach/learn, take exams
- `/exam/:skillId` — timed verification exam
- `/match` — ranked peer matches, send swap request
- `/requests` — incoming/outgoing requests
- `/sessions` — list sessions
- `/session/:id` — real-time chat with AI moderation banner + end-and-rate flow
- `/profile`, `/user/:userId` — profile views

## Demo flow
1. Register two users (use two browser windows / incognito).
2. Each user picks the same skill in `Skills & Exams` → take and pass the exam.
3. From `Find Peers`, user A sends a swap request to user B.
4. User B accepts in `Requests` → both jump into the live session room.
5. Chat in real time. Try an off-topic message ("let's talk about movies") to see the moderator warning.
6. End the session and rate.

## Stack
- **Backend**: Express, Mongoose, Socket.io, JWT, bcryptjs, helmet, morgan, express-rate-limit
- **Frontend**: React 19, React Router 7, Vite 7, Tailwind 4, axios, socket.io-client
# SkillSwapRS
