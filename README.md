# SprintMasterAi

Monorepo for SprintMasterAi frontend and backend.

## Repository Structure

```text
SprintMasterAi/
  FE-sprint-master-ai/  # React + Vite + React Router frontend
  BE-sprint-master-ai/  # Backend services
```

## Frontend (FE-sprint-master-ai)

### Stack

- React 18
- Vite 5
- React Router 6
- TypeScript

### Local Development

```bash
cd FE-sprint-master-ai
npm install
npm run dev
```

### Quality Checks

```bash
cd FE-sprint-master-ai
npm run test
npm run build
```

## Vercel Deployment for SPA Routing

If you deploy the frontend on Vercel and refresh on routes like `/login` or `/register`, Vercel must rewrite all unmatched paths to the SPA entry.

### Required Vercel Project Settings

- Root Directory: `FE-sprint-master-ai`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### Required File

`FE-sprint-master-ai/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index"
    }
  ]
}
```

This ensures direct visits and refreshes on nested routes are served by `index.html`, then React Router handles the route client-side.
