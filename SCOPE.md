# Hireflow – scope.md

> **AI-native job application tracker** — paste a job description and your resume, get skill match scoring, a tailored resume, a cover letter, and a Kanban board to manage every application from Applied → Interview → Offer.

---

## 1. Project Overview

### Goal
Build a full-stack AI-native web app that helps job seekers:
1. Analyze job descriptions and extract required skills
2. Match those skills against their resume and score the gap
3. Auto-generate a tailored resume and cover letter
4. Track all applications on a Kanban board
5. View analytics on their job search over time

### Free Tech Stack

| Layer | Choice | Why Free |
|---|---|---|
| Frontend | Next.js 15 (App Router) | Open source |
| Styling | Tailwind CSS + shadcn/ui | Open source |
| AI/LLM | Google Gemini 1.5 Flash | Free tier (15 RPM, 1M TPM) |
| Embeddings | Transformers.js | Runs in Node, zero cost |
| Database | Supabase (Postgres + pgvector) | Free tier (500 MB) |
| Auth | Supabase Auth | Included in free tier |
| File storage | Supabase Storage | 1 GB free |
| Hosting | Vercel | Free hobby tier |
| Drag & Drop | dnd-kit | Open source |
| PDF parsing | pdf-parse (Node) | Open source |
| Charts | Recharts | Open source |

**Model swap config** — keep model name in one env var `AI_MODEL=gemini-1.5-flash` so you can switch to Groq or OpenRouter without refactoring.

---

## 2. Folder Structure

```
hireflow/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── signup/page.jsx
│   ├── (dashboard)/
│   │   ├── layout.jsx            # Sidebar + top nav
│   │   ├── page.jsx              # Dashboard home / analytics
│   │   ├── analyze/page.jsx      # Paste JD + resume → AI analysis
│   │   ├── applications/
│   │   │   ├── page.jsx          # Kanban board
│   │   │   └── [id]/page.jsx     # Single application detail
│   │   └── resume/page.jsx       # Manage base resume
│   └── api/
│       ├── analyze/route.js      # POST: JD + resume → analysis
│       ├── generate/
│       │   ├── resume/route.js   # POST: generate tailored resume
│       │   └── cover-letter/route.js
│       ├── applications/
│       │   ├── route.js          # GET list, POST create
│       │   └── [id]/
│       │       ├── route.js      # GET, PATCH, DELETE
│       │       └── status/route.js # PATCH: move Kanban stage
│       └── upload/route.js       # POST: parse uploaded PDF resume
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── analyze/
│   │   ├── JDInput.jsx           # Textarea for job description
│   │   ├── ResumeInput.jsx       # Paste or upload resume
│   │   ├── SkillMatchCard.jsx    # Score ring + matched/missing chips
│   │   ├── MissingSkillsList.jsx
│   │   ├── TailoredResumePreview.jsx
│   │   └── CoverLetterPreview.jsx
│   ├── kanban/
│   │   ├── KanbanBoard.jsx       # dnd-kit board
│   │   ├── KanbanColumn.jsx      # Applied / Interview / Offer / Rejected
│   │   └── ApplicationCard.jsx   # Draggable card
│   ├── dashboard/
│   │   ├── StatsBar.jsx          # Total applied, interviews, offers
│   │   ├── ScoreTrendChart.jsx   # Recharts line chart
│   │   └── SkillGapChart.jsx     # Most missing skills bar chart
│   └── shared/
│       ├── Sidebar.jsx
│       ├── TopNav.jsx
│       └── CopyButton.jsx
├── lib/
│   ├── ai/
│   │   ├── gemini.js             # Gemini client singleton
│   │   ├── prompts.js            # All prompt templates
│   │   └── parser.js             # Parse structured JSON from AI response
│   ├── pdf.js                    # pdf-parse wrapper
│   ├── supabase/
│   │   ├── client.js             # Browser client
│   │   └── server.js             # Server client (RSC / API routes)
│   └── utils.js
├── hooks/
│   ├── useAnalysis.js
│   ├── useApplications.js
│   └── useKanban.js
├── store/
│   └── analysisStore.js          # Zustand store for in-progress analysis
├── middleware.js                  # Supabase auth session refresh
├── .env.local.example
└── SCOPE.md
```

---

## 3. Phase 1 – AI Analysis Engine

### 3.1 User Flow
1. User visits `/analyze`
2. Pastes job description text (or uploads a JD PDF)
3. Pastes resume text (or uploads resume PDF)
4. Clicks **Analyze**
5. App streams back:
   - Required skills list (hard + soft)
   - Match score (0–100%)
   - Matched skills (green chips)
   - Missing skills (red chips)
   - Tailored resume
   - Cover letter

### 3.2 API Route: `POST /api/analyze`

```js
// app/api/analyze/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { analyzePrompt } from '@/lib/ai/prompts';

export async function POST(req) {
  const { jobDescription, resumeText } = await req.json();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent(analyzePrompt(jobDescription, resumeText));
  const text = result.response.text();

  // Strip markdown fences, parse JSON
  const json = JSON.parse(text.replace(/```json|```/g, '').trim());
  return Response.json(json);
}
```

### 3.3 Prompt Design (`lib/ai/prompts.js`)

```js
export const analyzePrompt = (jd, resume) => `
You are an expert recruiter and resume coach.

JOB DESCRIPTION:
${jd}

CANDIDATE RESUME:
${resume}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact shape:
{
  "jobTitle": "string",
  "company": "string or null",
  "requiredSkills": { "hard": ["string"], "soft": ["string"] },
  "matchedSkills": ["string"],
  "missingSkills": ["string"],
  "matchScore": number (0-100),
  "matchSummary": "2-sentence honest assessment",
  "tailoredResume": "full resume text rewritten to match the JD keywords",
  "coverLetter": "tailored cover letter text, 3 paragraphs"
}
`;
```

### 3.4 PDF Upload Flow (`POST /api/upload`)
- Accept `multipart/form-data`
- Parse with `pdf-parse`
- Return extracted plain text
- Client sets that text into the resume textarea automatically

### 3.5 Skill Match UI (`SkillMatchCard`)
- Circular score ring (SVG, CSS animated)
- Green chips = matched skills
- Red chips = missing skills
- "Add to applications" button → saves to Supabase and routes to Kanban

---

## 4. Phase 2 – Kanban Board

### 4.1 Columns
| Column | Meaning |
|---|---|
| Applied | Submitted but no response |
| Interview | Phone screen / technical / final |
| Offer | Received an offer |
| Rejected | Closed / no offer |

### 4.2 Drag-and-Drop with dnd-kit

```js
// components/kanban/KanbanBoard.jsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

// On drag end → call PATCH /api/applications/[id]/status
const handleDragEnd = async ({ active, over }) => {
  if (!over || active.id === over.id) return;
  const newStatus = over.id; // column id = status string
  await fetch(`/api/applications/${active.id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus }),
  });
  mutate(); // re-fetch from Supabase
};
```

### 4.3 Application Card Data
Each card shows:
- Company name + job title
- Match score badge (color-coded: red < 50, yellow 50–75, green > 75)
- Date applied
- Next action reminder (optional date field)
- Click to expand → full analysis, tailored resume, cover letter

### 4.4 Quick Actions on Card
- Copy cover letter
- Download tailored resume as `.txt`
- Add interview date
- Mark rejected

---

## 5. Phase 3 – Dashboard Analytics

### 5.1 Stats Bar
- Total applications this month
- Average match score
- Interview rate (interviews / applied × 100)
- Offer rate

### 5.2 Charts (Recharts)

**Score Trend** — line chart of match score over time as user applies to jobs.

**Stage Funnel** — bar chart: Applied → Interview → Offer counts.

**Missing Skills Word Cloud** — simple frequency table: which skills appear most often in missing skills lists across all applications. Tells user what to learn next.

```js
// lib/utils.js
export const getMissingSkillFrequency = (applications) => {
  const freq = {};
  for (const app of applications) {
    for (const skill of app.missing_skills ?? []) {
      freq[skill] = (freq[skill] ?? 0) + 1;
    }
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
};
```

---

## 6. Database Schema (Supabase)

### Table: `profiles`
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  base_resume text,          -- user's master resume text
  created_at timestamptz default now()
);
```

### Table: `applications`
```sql
create table applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  job_title text not null,
  company text,
  job_description text not null,
  resume_used text,
  status text default 'applied'
    check (status in ('applied','interview','offer','rejected')),
  match_score integer,
  matched_skills text[],
  missing_skills text[],
  match_summary text,
  tailored_resume text,
  cover_letter text,
  applied_date date default current_date,
  next_action_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Table: `skill_tags` (optional, for search)
```sql
create table skill_tags (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references applications(id) on delete cascade,
  skill text not null,
  type text check (type in ('matched','missing'))
);
```

### Row Level Security (RLS)
```sql
-- Enable RLS
alter table applications enable row level security;
alter table profiles enable row level security;

-- Users can only see their own rows
create policy "Own applications only"
  on applications for all
  using (auth.uid() = user_id);

create policy "Own profile only"
  on profiles for all
  using (auth.uid() = id);
```

### Supabase trigger: auto-update `updated_at`
```sql
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger set_updated_at
before update on applications
for each row execute function update_updated_at();
```

---

## 7. API Routes Reference

| Method | Route | Body | Returns |
|---|---|---|---|
| POST | `/api/upload` | `FormData { file }` | `{ text: string }` |
| POST | `/api/analyze` | `{ jobDescription, resumeText }` | Full analysis JSON |
| POST | `/api/generate/resume` | `{ analysisId, jobDescription, resumeText }` | `{ tailoredResume }` |
| POST | `/api/generate/cover-letter` | `{ analysisId, jobDescription, resumeText }` | `{ coverLetter }` |
| GET | `/api/applications` | — | `Application[]` |
| POST | `/api/applications` | `Application data` | `Application` |
| GET | `/api/applications/[id]` | — | `Application` |
| PATCH | `/api/applications/[id]` | `Partial<Application>` | `Application` |
| DELETE | `/api/applications/[id]` | — | `{ success: true }` |
| PATCH | `/api/applications/[id]/status` | `{ status }` | `{ status }` |

---

## 8. UI Component Tree

```
app/
├── (auth)
│   └── LoginPage → <AuthForm />
└── (dashboard)
    ├── Layout → <Sidebar /> + <TopNav />
    ├── DashboardPage
    │   ├── <StatsBar />             ← 4 stat cards
    │   ├── <ScoreTrendChart />      ← Recharts LineChart
    │   ├── <StageFunnelChart />     ← Recharts BarChart
    │   └── <TopMissingSkills />     ← sorted list
    ├── AnalyzePage
    │   ├── <JDInput />              ← textarea + PDF upload
    │   ├── <ResumeInput />          ← textarea + PDF upload
    │   ├── <AnalyzeButton />        ← triggers POST /api/analyze
    │   └── <AnalysisResults />
    │       ├── <SkillMatchCard />   ← score ring
    │       ├── <SkillChips />       ← matched (green) + missing (red)
    │       ├── <TailoredResumePreview /> ← textarea, editable
    │       ├── <CoverLetterPreview />    ← textarea, editable
    │       └── <SaveToKanbanButton />
    └── ApplicationsPage
        └── <KanbanBoard />
            ├── <KanbanColumn status="applied" />
            │   └── <ApplicationCard /> (draggable)
            ├── <KanbanColumn status="interview" />
            ├── <KanbanColumn status="offer" />
            └── <KanbanColumn status="rejected" />
```

**State management** — Zustand for in-flight analysis state (avoids prop drilling across analyze page). Supabase real-time subscriptions for Kanban (card moves reflect instantly if user has two tabs open).

---

## 9. Claude Code – Step-by-Step Development Workflow

Follow these steps in order inside Claude Code.

### Step 1 – Scaffold the project
```bash
npx create-next-app@latest hireflow --js --tailwind --eslint --app --src-dir no
cd hireflow
npx shadcn@latest init
npx shadcn@latest add button card badge textarea input tabs dialog
npm install @google/generative-ai @supabase/supabase-js @supabase/ssr
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install recharts zustand pdf-parse
```

### Step 2 – Set up Supabase
1. Create a free project at supabase.com
2. Run the SQL from Section 6 in the Supabase SQL editor
3. Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Step 3 – Environment variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key   # server-only
GEMINI_API_KEY=your_gemini_key
AI_MODEL=gemini-1.5-flash
```

### Step 4 – Auth (in order)
1. `lib/supabase/client.js` — browser Supabase client
2. `lib/supabase/server.js` — server Supabase client for API routes
3. `middleware.js` — refresh session on every request
4. `app/(auth)/login/page.jsx` and `signup/page.jsx`
5. Test: sign up, log in, log out

### Step 5 – AI layer
1. `lib/ai/prompts.js` — all prompt strings
2. `lib/ai/gemini.js` — Gemini client singleton
3. `lib/ai/parser.js` — safe JSON parse helper with fallback
4. `app/api/upload/route.js` — PDF → text
5. `app/api/analyze/route.js` — full analysis
6. Test each route with Postman or curl before building UI

### Step 6 – Analyze page UI
1. `app/(dashboard)/analyze/page.jsx`
2. `components/analyze/JDInput.jsx`
3. `components/analyze/ResumeInput.jsx`
4. `components/analyze/SkillMatchCard.jsx`
5. `components/analyze/TailoredResumePreview.jsx`
6. `components/analyze/CoverLetterPreview.jsx`
7. `store/analysisStore.js` — Zustand

### Step 7 – Save to database
1. `app/api/applications/route.js` (GET, POST)
2. `app/api/applications/[id]/route.js` (GET, PATCH, DELETE)
3. `app/api/applications/[id]/status/route.js` (PATCH)
4. `hooks/useApplications.js`

### Step 8 – Kanban board
1. `app/(dashboard)/applications/page.jsx`
2. `components/kanban/KanbanBoard.jsx`
3. `components/kanban/KanbanColumn.jsx`
4. `components/kanban/ApplicationCard.jsx`
5. `hooks/useKanban.js`
6. Test drag and drop, test status PATCH

### Step 9 – Dashboard analytics
1. `app/(dashboard)/page.jsx`
2. `components/dashboard/StatsBar.jsx`
3. `components/dashboard/ScoreTrendChart.jsx`
4. `components/dashboard/StageFunnelChart.jsx`
5. `components/dashboard/TopMissingSkills.jsx`

### Step 10 – Polish and deploy
1. Loading skeletons on every data-fetching component
2. Error boundaries on AI routes
3. Mobile responsive pass (Kanban scrolls horizontally on mobile)
4. `vercel deploy` — connect GitHub repo in Vercel dashboard
5. Add env vars in Vercel project settings

---

## 10. Deployment & Environment Setup

### Vercel (free hobby)
- Connect GitHub repo → auto-deploy on push to `main`
- Add all `.env.local` vars to Vercel project settings under **Environment Variables**
- Preview deployments auto-created for every PR

### Supabase free tier limits
| Resource | Free Limit |
|---|---|
| Database | 500 MB |
| Storage | 1 GB |
| Auth users | 50,000 |
| API requests | 500K / month |
| Realtime | 200 concurrent connections |

### Gemini free tier limits
| Metric | Free Limit |
|---|---|
| Requests per minute | 15 RPM |
| Tokens per minute | 1,000,000 |
| Tokens per day | 1,500,000 |

The 15 RPM limit means one analyze call per 4 seconds. Add a client-side debounce and a server-side in-memory rate limit per user (one request per 5 seconds) to stay safe.

---

## 11. Gaps Filled — Edge Cases & Hardening

### Input validation
- Max JD length: 10,000 characters (trim + warn if over)
- Max resume length: 8,000 characters
- Sanitize inputs — strip `<script>` tags before sending to AI
- Validate that JD field is not empty before calling API

### AI response safety
```js
// lib/ai/parser.js
export const safeParseAnalysis = (raw) => {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Return a safe empty shell so UI doesn't crash
    return {
      jobTitle: 'Unknown', company: null,
      requiredSkills: { hard: [], soft: [] },
      matchedSkills: [], missingSkills: [],
      matchScore: 0, matchSummary: 'Analysis failed. Please try again.',
      tailoredResume: '', coverLetter: ''
    };
  }
};
```

### Rate limit handling (client)
- Show a spinner with "Analyzing… (this takes ~5s)"
- Disable the Analyze button while in-flight
- On 429 from Gemini: show toast "Too many requests — please wait 10 seconds"

### Empty resume edge case
- If user has a saved base resume in their profile, auto-fill the resume textarea on page load
- If no resume, show a prompt: "Save your base resume in Profile to speed up future analyses"

### Long tailored resume
- Tailored resume can be 1,000–2,000 tokens. If Gemini truncates it, add `"continue":"true"` handling with a follow-up API call that appends the rest.

### Offline / network errors
- Wrap all `fetch` calls in try/catch
- Show a retry button on failure, never a blank screen

### Privacy
- Resume text is stored in Supabase only for the authenticated user (RLS enforced)
- Do not log resume or JD text in Vercel logs — add `sensitive: true` headers or strip from Vercel log drain
- Add a **Delete account** button that runs `supabase.auth.admin.deleteUser(id)` + cascades all rows via FK `on delete cascade`

### Accessibility
- All interactive elements have `aria-label`
- Kanban columns have `role="list"` and cards have `role="listitem"`
- Score ring SVG has `aria-label="Match score: 72%"`
- Color-coded chips also use icons (not color alone) for colorblind users

### Mobile Kanban
- On screens < 768px, Kanban renders as a tab switcher (one column at a time) instead of horizontal scroll — avoids layout breaking on small screens

### PDF parse failure
- If `pdf-parse` fails (scanned image PDF with no text layer), return a 422 with: `{ error: "Could not extract text from this PDF. Please paste your resume as text instead." }`

---

*Build in this order: Auth → AI layer → Analyze page → Save to DB → Kanban → Dashboard. Ship a working v1 after Step 8.*
