# Backend Integration TODO

Tasks to integrate the backend (BE-sprint-master-ai) with the frontend (FE-sprint-master-ai): Sprints, Tasks (two-way join), auth, and AI sprint generation.

---

## Phase 1: Data model & access

- [x] **1.1** Create access control helpers for sprints/tasks (own docs or admin)
- [x] **1.2** Create **Tasks** collection: `title`, `duration`, `completed`, `sprint` (relationship to `sprints`), optional `order`
- [x] **1.3** Create **Sprints** collection: `title`, `description`, `goal`, `status`, `estimatedHours`, `createdBy` (relationship to `users`), **join** field for related tasks (`collection: 'tasks'`, `on: 'sprint'`)
- [x] **1.4** Register Sprints and Tasks in `payload.config.ts`, run `pnpm run generate:types`

---

## Phase 2: AI sprint generation

- [x] **2.1** Add `openai` dependency to backend
- [x] **2.2** Create `POST /api/generate-sprint` endpoint: auth required, body `{ goal: string }`, call OpenAI, create Sprint + Task docs, return sprint with joined tasks
- [x] **2.3** Ensure `estimatedHours` is computed (hook or on create) from task durations

---

## Phase 3: API & frontend alignment

- [x] **3.1** CORS: allow frontend origin (e.g. `http://localhost:8080`) for `/api` — set `FRONTEND_ORIGIN` env or defaults to `http://localhost:8080`
- [ ] **3.2** (Optional) Users: add `roles` field if admin vs user is needed

---

## Progress

| Task   | Status    |
|--------|-----------|
| 1.1    | Done      |
| 1.2    | Done      |
| 1.3    | Done      |
| 1.4    | Done      |
| 2.1    | Done      |
| 2.2    | Done      |
| 2.3    | Done      |
| 3.1    | Done      |
| 3.2    | Optional  |

*Update checkboxes and table as tasks are completed.*
