# Change Request TODO

Backend: `BE-sprint-master-ai`  
Frontend: `FE-sprint-master-ai`

Update this checklist as tasks are completed. When a task is done:
- Mark it as `- [x]`
- Wrap the task name in strikethrough `~~like this~~`
- Add a short note under it with key files changed.

---

## 0) Meta

- [x] ~~Create and maintain this CHANGE_REQUEST_TODO.md checklist~~
  - Files: `docs/CHANGE_REQUEST_TODO.md`

---

## A) Backend (Payload Admin + Collections)

- [x] ~~A1) Users collection: profile + usage fields, sprintCount, sprints join, and hooks to maintain sprintCount~~
  - Files: `src/collections/Users.ts`, `src/collections/Sprints.ts`, `tests/helpers/seedUser.ts`
- [x] ~~A2) Users collection: firstName, lastName, subscription, sprintCount and sprints join + sprintCount hooks on sprint create/delete~~
  - Files: `src/collections/Users.ts`, `src/collections/Sprints.ts`, `tests/helpers/seedUser.ts`
- [x] ~~A3) Tasks collection: rename field `order` → `estimated` with backward compatibility~~
  - Files: `src/collections/Tasks.ts`, `src/endpoints/generateSprint.ts`
- [x] ~~A4) Confirm two-way linking (join) between Users ↔ Sprints ↔ Tasks~~
  - Files: `src/collections/Users.ts`, `src/collections/Sprints.ts`, `src/collections/Tasks.ts`
- [x] ~~A5) CORS sanity for auth (support 8080 & 5173 via FRONTEND_ORIGIN)~~
  - Files: `src/middleware.ts`, `.env.example`
- [x] ~~A6) Regenerate Payload types after schema changes~~
  - Files: `src/payload-types.ts`

---

## B) Frontend (Auth + Protected Routes)

- [x] ~~B1) Add VITE_API_URL to FE env example~~
  - Files: `../FE-sprint-master-ai/.env.example`
- [x] ~~B2) Create API client (`src/lib/api.ts`) with login/register/me/logout using Bearer/JWT token~~
  - Files: `../FE-sprint-master-ai/src/lib/api.ts`
- [x] ~~B3) Auth context (`src/auth/AuthContext.tsx`) with user/token/loading and persistence~~
  - Files: `../FE-sprint-master-ai/src/auth/AuthContext.tsx`
- [x] ~~B4) ProtectedRoute wrapper for protected routes~~
  - Files: `../FE-sprint-master-ai/src/auth/ProtectedRoute.tsx`
- [x] ~~B5) Login and Register pages with react-hook-form + zod~~
  - Files: `../FE-sprint-master-ai/src/pages/LoginPage.tsx`, `../FE-sprint-master-ai/src/pages/RegisterPage.tsx`
- [x] ~~B6) Router changes to add /login, /register and protect dashboard/sprints routes~~
  - Files: `../FE-sprint-master-ai/src/App.tsx`
- [x] ~~B7) Add Logout button in app chrome (dashboard/board/detail)~~
  - Files: `../FE-sprint-master-ai/src/pages/Dashboard.tsx`, `../FE-sprint-master-ai/src/pages/SprintsBoard.tsx`, `../FE-sprint-master-ai/src/pages/SprintDetail.tsx`
- [x] ~~B8) Landing “Get Started” respects auth state (to /login or /dashboard)~~
  - Files: `../FE-sprint-master-ai/src/pages/Index.tsx`

---

## C) Acceptance sanity

- [ ] C1) Manual sanity check: admin UX (Users, Sprints, Tasks) and API (generate-sprint, sprintCount updates)
- [ ] C2) Manual sanity check: frontend auth flow (register, login, protected routes, logout, Get Started behavior)

