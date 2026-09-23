# Hireflow

Hireflow is an AI-native job application tracker. Paste a job description and your resume and it scores your skill match, lists matched and missing skills, writes a tailored resume and cover letter, and lets you track every application on a Kanban board (Applied → Interview → Offer / Rejected) with analytics on your search over time.

## Tech stack

- Next.js (App Router), plain JavaScript
- Tailwind CSS + shadcn/ui-style components (Radix UI)
- Google Gemini (model set via `AI_MODEL`)
- Supabase (Postgres, Auth, Row Level Security)
- dnd-kit (drag and drop), Recharts (charts), Zustand (state), pdf-parse (PDF text extraction)

## Setup

1. Clone the repo and run `npm install`.
2. Copy `.env.local.example` to `.env.local` and fill in the values (Supabase URL/keys from Project Settings > API, Gemini key from https://aistudio.google.com/app/apikey).
3. Open the Supabase SQL editor and run `supabase/schema.sql`.
4. Run `npm run dev` and open http://localhost:3000.

## How to use

1. Sign up, then save your base resume on the **Resume** page (optional but speeds things up).
2. Go to **Analyze**, paste (or upload) a job description and your resume, and click **Analyze**. Edit the tailored resume / cover letter, then **Save to applications**.
3. Drag cards across the **Applications** board as you progress, and watch the **Dashboard** for score trends and the skills you keep missing.

## Architecture

The browser posts the job description and resume to `POST /api/analyze`. The route checks the Supabase session, validates and sanitizes the input, and builds a prompt (`lib/ai/prompts.js`) for Gemini (`lib/ai/gemini.js`). The raw model text is stripped of markdown fences and parsed defensively (`lib/ai/parser.js`), falling back to an empty analysis shell so the UI never crashes. The result lands in a Zustand store, which the analyze components render; saving writes it to Supabase through `/api/applications`, where RLS keeps each user's rows private. Resume and job description text are never logged.

Note: the dashboard lives at `/dashboard` because `/` redirects to `/analyze` or `/login`.

Built with the free tier of Gemini, Supabase and Vercel.
