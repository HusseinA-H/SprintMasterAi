# SprintMasterAi
## Ship Features in 24 Hours

An AI-powered SaaS platform that transforms vague product goals into actionable, time-boxed 24-hour sprint plans using OpenAI, then helps teams execute them through a fast, immersive full-stack experience.

---

## Highlights

- AI Sprint Generation: convert plain-language goals into structured sprint plans with prioritized tasks and time estimates.
- Minimalist Dashboard: focused workflow to generate, track, and manage sprint execution without noise.
- 3D Interactive UI: modern visual layer powered by Three.js + Framer Motion for an elevated product feel.
- Full-stack Integration: Next.js frontend synchronized with Payload CMS backend, PostgreSQL persistence, and AI APIs.

---  

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, Tailwind CSS, Framer Motion, Three.js |
| Backend | Payload CMS, Node.js |
| Database | PostgreSQL |
| AI | OpenAI API |

---

## Architecture Flow

SprintMasterAi is built around a tight backend-frontend feedback loop:

1. User submits a high-level goal from the frontend.
2. Backend validates context, invokes OpenAI, and generates a structured 24-hour sprint.
3. Payload CMS persists sprint entities in PostgreSQL.
4. Frontend reacts immediately with updated sprint state, visual progress, and interactive task management.

This architecture keeps AI intelligence centralized in the backend while delivering a highly reactive user experience on the frontend.

---

## Local Setup

### 1. Clone

```bash
git clone https://github.com/HusseinIslamEagle/SprintMasterAi.git
cd SprintMasterAi
```

### 2. Backend Setup

```bash
cd backend
npm install
# configure .env (PostgreSQL, Payload, OpenAI keys)
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
# configure .env.local for frontend runtime values
npm run dev
```

### 4. Open App

- Frontend: `http://localhost:3000` (or configured Next.js port)
- Backend: Payload API/Admin on configured backend port

---

## Repository Structure

```text
SprintMasterAi/
  frontend/   # Next.js + Tailwind + Framer Motion + Three.js
  backend/    # Payload CMS + PostgreSQL + OpenAI integration
```

---

## Product Direction

SprintMasterAi is designed to reduce planning friction and increase shipping velocity by combining AI-driven sprint intelligence with a polished execution interface.