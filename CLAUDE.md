# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HutechC Demo — a full-stack Educational Management & Interview System. React 18 + TypeScript frontend with Express + SQLite backend.

## Development Commands

```bash
# Backend server (port 3000)
npm start

# Frontend dev server (port 5173, proxies /api to localhost:3000)
cd client && npm run dev

# Build frontend (outputs to /public/app)
cd client && npm run build

# Initialize database from schema
npm run init-db
```

No test framework is currently configured.

## Architecture

### Frontend (`client/src/`)

- **Bundler**: Vite 6 with Tailwind CSS 4 plugin
- **Routing**: React Router v7 with lazy-loaded routes (`routes.tsx`)
- **UI**: Mixed stack — shadcn/ui (Radix primitives in `components/ui/`) + Material-UI 7
- **Styling**: Tailwind CSS 4 as primary, Emotion for MUI components. Theme tokens defined as CSS variables in `styles/theme.css`
- **Icons**: Lucide React + MUI Icons
- **State**: React Context + localStorage. Zustand is installed but minimally used
- **Path alias**: `@/` maps to `client/src/`

### Page module pattern

Each feature lives in `pages/[feature]/` with:
- `[Feature]Page.tsx` — main page component
- `data.ts` — data fetching and localStorage logic
- `types.ts` — TypeScript interfaces
- Feature-specific sub-components

### Data fetching pattern

Pages follow a fallback chain: fetch from `/api/*` → fall back to localStorage → fall back to mock data.

### Backend (`server/`)

- **Framework**: Express 4 with CORS, 10MB JSON body limit
- **Database**: SQLite (better-sqlite3) with WAL mode, stored at `server/db/hutechc.db`
- **Schema**: 20+ tables defined in `server/db/schema.sql`
- **Generic CRUD**: `server/routes/generic.js` is a factory that creates standard REST endpoints for JSON blob tables — used by 11+ resources
- **File uploads**: Multer → AWS S3 (`server/routes/uploads.js`)
- **SPA fallback**: All `/app/*` requests serve `public/app/index.html`

### API conventions

- File uploads use FormData; everything else uses JSON
- Generic CRUD endpoints: GET `/api/:resource`, GET `/api/:resource/:id`, POST, PUT, DELETE
- Custom routes exist for interviews, worklogs, tesol, and uploads

## Key Config

- **Vite**: `base: '/app/'`, builds to `../public/app`, dev proxy `/api` → `localhost:3000`
- **TypeScript**: strict mode, target ES2020, `@/*` path alias
- **Environment**: AWS credentials + S3 bucket in `.env` (see `.env.example`)

## Conventions

- Toast notifications via Sonner (`toast.success()`, `toast.error()`)
- Export capabilities: Excel (xlsx), Word (docx), PNG (html-to-image)
- Drag-and-drop via react-dnd
- Dark mode support via next-themes + CSS variable theming
- Korean language UI — most labels and content are in Korean
