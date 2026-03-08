# Backend–Frontend Integration Plan

This document re-analyzes the **frontend** (FE-sprint-master-ai) from an integration perspective and defines how the **backend** (BE-sprint-master-ai, Payload CMS 3 + Next.js + MongoDB) must be modified to support the same data model, operations, and AI sprint generation.

---

## Part 1: Frontend Re-Analysis (Integration View)

### 1.1 Data Models (Source of Truth for Backend)

The frontend defines these types in `src/lib/sprint-store.ts`. The backend must mirror them so the API responses match what the UI expects.

| Entity   | Field            | Type     | Notes |
|----------|------------------|----------|--------|
| **Subtask** | `id`           | string   | Required, unique per sprint |
|          | `title`          | string   | Task description |
|          | `duration`       | string   | e.g. `"2h"`, `"1.5h"` |
|          | `completed`      | boolean  | Default `false` |
| **Sprint**  | `id`           | string   | Required (Payload will use MongoDB `_id` or string id) |
|          | `title`          | string   | e.g. "Sprint: Add user auth..." |
|          | `description`    | string   | Summary of the sprint |
|          | `goal`           | string   | Original user goal (for regeneration / context) |
|          | `status`         | enum     | `'draft' \| 'generated' \| 'in-progress' \| 'done'` |
|          | `subtasks`       | array    | Array of Subtask objects |
|          | `createdAt`      | string   | ISO 8601 (e.g. `new Date().toISOString()`) |
|          | `estimatedHours` | number   | Sum of subtask durations (e.g. 12.5) |

**Status values:** The UI uses exactly: `draft`, `generated`, `in-progress`, `done`.

---

### 1.2 Operations the Frontend Performs

| Operation        | Where used        | Backend equivalent |
|------------------|-------------------|--------------------|
| **Generate sprint from goal** | Dashboard: user types goal → “Generate Sprint Plan” | Custom endpoint: `POST /api/generate-sprint` with `{ goal: string }` → returns full `Sprint` (with subtasks). Backend calls OpenAI and creates the sprint (and optionally saves it). |
| **Add sprint**    | Dashboard: after “generate”, add to list | `POST /api/sprints` with Sprint payload (or returned from generate and then `POST` to save). |
| **List sprints**  | Dashboard (recent 5), SprintsBoard (all, by status) | `GET /api/sprints` with optional `limit`, `sort`, `where` (e.g. by status). |
| **Get one sprint**| SprintDetail by `id` | `GET /api/sprints/:id`. |
| **Update sprint** | SprintDetail: title, description, status | `PATCH /api/sprints/:id` with partial Sprint. |
| **Update subtask**| SprintDetail: toggle completed, edit title/duration | `PATCH /api/sprints/:id` with updated `subtasks` array, or a dedicated subtask PATCH if you model subtasks separately. |
| **Delete sprint** | Store has `deleteSprint`; no UI button yet | `DELETE /api/sprints/:id`. |

The frontend currently uses **Zustand** and in-memory state. After integration it will use **TanStack Query** (already in the app) to call the backend REST API and optionally keep Zustand for client-only state (e.g. draft goal) if desired.

---

### 1.3 Authentication (Current vs Required)

- **Current frontend:** No auth. No login, no user context, no protected routes.
- **Backend:** Payload already has `Users` with `auth: true` (email + password).
- **For integration:** Sprints should be **per-user**. That implies:
  - **Login/register** in the frontend (e.g. call Payload `POST /api/users/login`, store JWT).
  - **Protected routes:** Dashboard, SprintsBoard, SprintDetail should require a valid JWT.
  - **API:** All sprint endpoints require authentication and must **scope by user** (only return/update/delete sprints owned by the logged-in user).

So the backend must:
- Keep/enhance **Users** (auth) and optionally add a `role` (e.g. `user`, `admin`) if needed.
- Add **Sprints** collection with a **relationship to Users** (e.g. `createdBy` or `user`).
- Enforce access control: create only as current user, read/update/delete only own sprints (or admin). Use Payload access control and, when using Local API with a user, set `overrideAccess: false`.

---

### 1.4 AI Flow (What the Backend Must Implement)

- **Input:** Single field: **goal** (string, free text).
- **Process:** Call **OpenAI** (or compatible API) to turn the goal into:
  - A sprint **title**
  - A sprint **description**
  - A list of **subtasks**, each with **title**, **duration** (e.g. `"2h"`), and **completed: false**
- **Output:** One **Sprint** object (with nested subtasks) that matches the frontend’s `Sprint` type. Optionally **persist** it in the DB and return the saved document (with `id`, `createdAt`), or return without saving and let the frontend call `POST /api/sprints` to save.

Recommended: **Custom endpoint** `POST /api/generate-sprint` that:
1. Validates the user is authenticated.
2. Accepts `{ goal: string }`.
3. Calls OpenAI to generate title, description, and subtasks (with durations).
4. Creates a Sprint document (with `createdBy: req.user.id`, `status: 'generated'`) and returns it (so the frontend gets one round-trip and a consistent shape).

---

## Part 2: How to Modify the Backend (BE-sprint-master-ai)

### 2.1 Backend Stack (Current)

- **Payload CMS 3** with Next.js App Router.
- **MongoDB** via `@payloadcms/db-mongodb`.
- **Collections:** Users (auth), Media (upload).
- **API:** Payload REST at `(payload)/api/[...slug]` → e.g. `/api/sprints`, `/api/users/login`, etc.

---

### 2.2 Step-by-Step Backend Changes

#### Step 1: Sprints collection

- **Slug:** `sprints`.
- **Fields:**  
  - `title` (text, required)  
  - `description` (text)  
  - `goal` (text, required for generation)  
  - `status` (select: `draft`, `generated`, `in-progress`, `done`, default `generated`)  
  - `subtasks` (array of objects):  
    - `id` (text, or generated in hook)  
    - `title` (text)  
    - `duration` (text, e.g. `"2h"`)  
    - `completed` (checkbox, default false)  
  - `estimatedHours` (number, can be computed in a hook from subtasks)  
  - `createdBy` (relationship to `users`, required)  
  - Timestamps: use Payload’s `timestamps: true` so you have `createdAt` / `updatedAt` (frontend uses `createdAt`).
- **Access control:**  
  - Create: authenticated user; set `createdBy` to `req.user.id` in a `beforeChange` hook if not sent.  
  - Read/Update/Delete: only documents where `createdBy` equals current user (or admin). Use Payload’s `access` with query constraints.
- **Admin:** Optional; you can show Sprints in Payload admin with `useAsTitle: 'title'` and default columns.

#### Step 2: Users collection (optional tweaks)

- Ensure **Users** has auth (already has). If you need roles later, add a `roles` field (select, hasMany, saveToJWT) and use it in access control.
- CORS: ensure your Next.js/Payload app allows requests from the Vite frontend origin (e.g. `http://localhost:8080`).

#### Step 3: Custom endpoint – “Generate sprint” (OpenAI)

- **Path:** e.g. `POST /api/generate-sprint` (implement as a Next.js Route Handler under `app/(payload)/api/` or a Payload custom endpoint that receives `{ goal: string }`).
- **Auth:** Require a valid Payload JWT (e.g. from `Authorization: Bearer <token>`). Get user via Payload’s auth or `getPayload()` and validate the request.
- **Logic:**  
  1. Parse body: `{ goal: string }`.  
  2. Call **OpenAI** (or compatible) with a prompt that asks for:  
     - One sprint title  
     - One short description  
     - A list of subtasks, each with `title` and `duration` (e.g. "2h").  
  3. Map the response into one **Sprint** object: `title`, `description`, `goal`, `status: 'generated'`, `subtasks` (each with `id`, `title`, `duration`, `completed: false`), `estimatedHours` (sum of parsed durations), `createdBy: req.user.id`.  
  4. Either:  
     - **Option A:** Save the sprint with `payload.create({ collection: 'sprints', data: sprint, req })` and return the created doc.  
     - **Option B:** Return the sprint without saving and let the frontend `POST /api/sprints` to save.  
- **Idempotency:** If you save in the endpoint, generate a proper `id` for each subtask (e.g. nanoid or MongoDB ObjectId string) before create.
- **Security:** Never expose the OpenAI API key to the frontend; keep it in backend env (e.g. `OPENAI_API_KEY`).

#### Step 4: OpenAI implementation details (backend)

- Install: `openai` (or `@openai/sdk`).  
- In the generate-sprint handler:  
  - Use a **system + user** prompt. System: “You are a sprint planner. Given a feature goal, output a 24h sprint with a title, description, and 5–8 subtasks. Each subtask has a title and duration in hours (e.g. 1.5h, 2h). Output JSON only.”  
  - User: the `goal` string.  
  - Parse the model’s JSON response and map to your Sprint + Subtask shape; validate and fallback on parse errors (e.g. return 502 or 400 with a clear message).  
- Optional: Store the raw goal and model response for debugging/analytics (e.g. in the Sprint document or a separate log).

#### Step 5: REST API usage from frontend

- **Base URL:** e.g. `import.meta.env.VITE_API_URL` (e.g. `http://localhost:3000`) so the frontend points to the Next.js app.  
- **Endpoints:**  
  - Auth: `POST /api/users/login` (Payload’s built-in), `POST /api/users` for register (if enabled).  
  - Sprints: `GET /api/sprints`, `GET /api/sprints/:id`, `POST /api/sprints`, `PATCH /api/sprints/:id`, `DELETE /api/sprints/:id`.  
- **Headers:** `Authorization: Bearer <jwt>`, `Content-Type: application/json`.  
- **CORS:** Configure Next.js or Payload to allow the frontend origin.

---

### 2.3 Summary: Backend Checklist

| # | Task | Description |
|---|------|-------------|
| 1 | **Sprints collection** | Add collection with title, description, goal, status, subtasks (array), estimatedHours, createdBy (relationship to users), timestamps. |
| 2 | **Access control** | Sprints: create with current user; read/update/delete only own (or admin). Use `overrideAccess: false` when calling Local API with user. |
| 3 | **Subtask id** | Ensure each subtask has a stable `id` (e.g. generated in beforeValidate/beforeChange). |
| 4 | **estimatedHours** | Compute in a hook from subtasks’ `duration` (parse "2h" → 2) and set on the sprint. |
| 5 | **Generate-sprint endpoint** | POST /api/generate-sprint, body `{ goal }`, auth required, call OpenAI, return (and optionally save) Sprint. |
| 6 | **OpenAI integration** | Prompt + JSON parsing; map to Sprint + subtasks; handle errors. |
| 7 | **CORS** | Allow frontend origin for /api. |
| 8 | **Users (optional)** | Add roles if you need admin vs user. |

---

### 2.4 Frontend Changes (High Level)

- **Env:** `VITE_API_URL` for backend base URL.  
- **Auth:** Login/register UI; store JWT (e.g. localStorage or cookie); send `Authorization: Bearer <token>` on all sprint and generate-sprint requests.  
- **Protected routes:** Redirect to login when not authenticated (Dashboard, Sprints, SprintDetail).  
- **Data layer:** Replace Zustand sprint state with TanStack Query:  
  - `useMutation` for generate (POST generate-sprint or POST sprints), create, update, delete.  
  - `useQuery` for list and get-by-id.  
- **Types:** Align with backend payloads; you can keep the same `Sprint` and `Subtask` interfaces if the API returns the same shape (including `createdAt` and `id`).  

This document focuses on **backend** modifications; the frontend wiring (auth, queries, mutations) can be implemented in a follow-up pass using this plan.
