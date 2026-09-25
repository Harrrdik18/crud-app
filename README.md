# JobHunt OS

> **A builder's note.** I built it as I would continue it. You said you didn't want a normal
> app, so I added AI — and I honestly think this has a real use case. This isn't a CRUD demo
> with a fresh coat of paint: it's the tool I'd actually keep using through a job search, and
> the code is written the way I'd keep maintaining it.

**JobHunt OS** is a full-stack command center for people who are actively job hunting.
Applications, interviews, follow-ups, resumes, and offer/pipeline analytics live in one place —
and every job description can be analysed against your real resume to show what you match and
where you're short.

- **Repo:** https://github.com/Harrrdik18/crud-app
- **Built by:** [Hardik Patel](https://github.com/Harrrdik18) · [LinkedIn](https://www.linkedin.com/in/harrrdik18) · [Email](mailto:patelhardik999666@gmail.com)

---

## Why this exists

Job seekers currently juggle a spreadsheet, five browser tabs, a calendar, and a doc full of
half-written follow-up notes. The information they need most — *"which of my applications is
going cold?"*, *"what does this job actually require?"*, *"am I even a fit?"* — is trapped across
all of them.

JobHunt OS answers those questions from data the user already entered. No generic advice, no
invented metrics: every number on the dashboard is computed from the user's own rows.

---

## Features

| Area | What it does |
| --- | --- |
| **Auth** | Register/login with Argon2-style hardened hashing (scrypt via `node:crypto`), server-side sessions stored as hashed tokens, sliding renewal, logout everywhere, password change. |
| **Applications** | Full CRUD: create, read, update, delete, list with filters/search/sort, plus a status-driven kanban pipeline (Saved → Applied → Screening → Interview → Offer → Rejected → Withdrawn). |
| **Status history** | Every pipeline move is appended to `status_history`, so the pipeline is auditable, not just the current state. |
| **Interviews** | CRUD tied to an application: type, schedule, duration, interviewer, result, feedback. |
| **Follow-ups** | CRUD reminders with due dates and pending/done/skipped states — surfaced on the dashboard so nothing rots. |
| **Resume / profile** | Single source of truth: skills, experience, education, projects. Everything downstream (matching, analysis) reads from it. |
| **Job Match (AI)** | Paste a job description → structured extraction (required/preferred skills, technologies, responsibilities, experience) + a profile-vs-job match with matching skills, gaps, and an experience assessment. |
| **Analytics** | Funnel conversion, response rate, interview conversion, source effectiveness, weekly application volume. |
| **Accessibility** | Semantic landmarks, `aria-current` navigation, labelled dialogs, visible focus states, keyboard-operable kanban, dark mode. |

### The AI part (and why it's not a gimmick)

`src/lib/analyzer.ts` scores a job description against the user's resume. It runs in two modes:

1. **Offline / heuristic (default).** Deterministic tokenisation, skill-set intersection,
   weighted coverage. Works with no API key, no network, no cost — and it's unit tested.
2. **AI-refined (optional).** If `AI_API_KEY` is set, `src/lib/ai.ts` calls an
   OpenAI-compatible chat endpoint with `response_format: json_object`, validates the payload
   against a Zod schema, and falls back to the heuristic if the call fails or returns junk.

Every analysis stores `method` (`heuristic` | `ai`) and a `disclaimer`, so the UI can always be
honest about where a number came from. Results are cached by `source_text_hash`, so re-analysing
the same posting is free.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router, Server Components, Server Actions, `src/proxy.ts`) |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS v4** + hand-rolled shadcn-style components in `src/components/ui` |
| Database | **PostgreSQL** via **Drizzle ORM** (typed schema, migrations in `drizzle/migrations`) |
| Validation | **Zod** on every Server Action boundary |
| Auth | Custom session auth — HMAC-signed cookie holding a random token, SHA-256-hashed at rest |
| AI | OpenAI-compatible chat completions (`gpt-4o-mini`), optional |
| Testing | **Vitest** (unit) + integration suite against a real Postgres |
| CI | **GitHub Actions** — typecheck, lint, unit tests, then integration tests against Postgres 16 |

### Project structure

```
src/
  proxy.ts              # auth guard + CSP/security headers (Next 16 proxy convention)
  app/
    (marketing)/        # public landing, features, privacy  — server-rendered
    (auth)/             # login, register
    (app)/              # authenticated product: dashboard, applications, interviews,
                        # follow-ups, analytics, resume, job match, profile
    actions/            # Server Actions — the only mutation entry points
  components/           # ui/ (primitives), layout/, domain components
  services/             # data access + business rules (pure, unit-testable, DB injectable)
  lib/                  # auth, crypto, session, rate-limit, validation, analyzer, ai
  db/                   # drizzle client + schema
test/                   # integration tests (real Postgres)
```

**Data flow:** Route (Server Component) → `services/*` (authorization + rules) → Drizzle →
Postgres. Mutations go through Server Actions → Zod → service → DB, then `revalidatePath`.
Nothing reaches the DB from a component, and every service scopes queries by `userId` — a user
can never read or mutate another user's rows even if they guess a UUID.

---

## Getting started

```bash
git clone https://github.com/Harrrdik18/crud-app.git
cd crud-app
npm install
cp .env.example .env        # then fill in the values
npm run db:migrate          # drizzle-kit migrate
npm run dev                 # http://localhost:3000
```

### Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Signs session cookies — `openssl rand -base64 32` |
| `AI_API_KEY` | Optional. Leave empty → offline heuristic mode |
| `NEXT_PUBLIC_APP_URL` | Canonical URL for metadata |

### Scripts

```bash
npm run dev                 # dev server
npm run build && npm start  # production
npm run lint                # eslint
npx tsc --noEmit            # typecheck
npm test                    # unit tests (vitest)
npm run test:integration    # needs TEST_DATABASE_URL
```

---

## Testing

**64 test cases** across two tiers:

- **Unit** (`src/**/*.test.ts`): analyzer scoring, crypto, rate limiter, Zod schemas, utils —
  no I/O, runs in milliseconds.
- **Integration** (`test/*.test.ts`): real Postgres (service container in CI), covering
  auth/session lifecycle, application CRUD + authorization, interviews, follow-ups, and
  dashboard aggregation. Services take an injectable `db`, so tests use a seeded database and
  truncate between cases.

CI runs typecheck + lint + unit tests on every push/PR, then integration tests against a
`postgres:16-alpine` service container.

---

## Security

| Threat | Mitigation |
| --- | --- |
| Credential theft | Passwords hashed with a memory-hard KDF (`scrypt`, per-user salt, tuned cost) |
| Session theft | Cookie is `httpOnly` + `secure` + `sameSite=lax`; DB stores only the SHA-256 of the token, so a DB leak doesn't yield live sessions |
| XSS | Per-request CSP nonce with `strict-dynamic`, `frame-ancestors 'none'`, output is React-escaped |
| CSRF | Server Actions origin check + `sameSite=lax` cookie + `form-action 'self'` |
| SQL injection | Parameterised queries through Drizzle — no string-built SQL |
| IDOR | Every service query filters by `userId`; ownership is checked before update/delete |
| Brute force | In-memory sliding-window rate limiter on login/register (`src/lib/rate-limit.ts`) |
| Clickjacking / MIME sniffing | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` |
| Transport | HSTS with preload in production |
| Spoofed client IPs | `x-forwarded-for` is parsed right-to-left and validated before use |

**Contingency:** if `AUTH_SECRET` rotates, existing cookies fail signature verification and
users are cleanly redirected to `/login` — no half-authenticated state. If the AI provider is
down, analysis silently degrades to the heuristic path and still returns a result. If Postgres
is unavailable, actions return a typed error and the UI shows a retry state rather than a stack
trace.

---

## Performance

- **SSR/SSG split:** marketing pages are statically renderable; authenticated pages stream from
  the server with the session read memoized per request (`React.cache`).
- **Server Components by default** — client bundles only what needs interactivity (forms,
  kanban, charts).
- **Query shaping:** list queries select only the columns the view renders; composite indexes on
  `(user_id, status)`, `(user_id, scheduled_at)`, `(user_id, due_at)`.
- **Caching:** analysis results keyed by source hash; `revalidatePath` after mutations so reads
  stay fresh without a client refetch storm.
- **No client waterfall:** mutations are single Server Action round-trips with optimistic UI
  where it matters.

---

## Real-world considerations

- **Scalability:** stateless app servers (sessions live in Postgres), so horizontal scaling is a
  config change. The one in-process dependency — the rate limiter — is documented as
  single-instance; swap it for Redis before running multiple replicas.
- **Data safety:** FK cascades are explicit per relation; deleting a user removes their rows,
  deleting an application keeps a record where history matters.
- **Honest metrics:** if the dataset is too small to be meaningful, the dashboard says so
  instead of rendering a misleading chart.
- **Accessibility:** tested with keyboard-only navigation and screen-reader landmarks.
- **Extensibility:** services are dependency-injected, so adding a Postgres read replica,
  background job queue, or a different AI provider is a localized change.

---

## Roadmap

- Email/calendar sync for applications and interviews
- Team/shared pipelines (coach + candidate)
- PWA with offline capture of a job posting
- Provider-agnostic AI layer (OpenAI / Groq / Gemini) behind the existing interface
- Row-level encryption for stored job descriptions

---

## Submission

| Item | Value |
| --- | --- |
| Repository | https://github.com/Harrrdik18/crud-app |
| Live deployment | _(Vercel — see README badge/URL once connected)_ |
| Author | Hardik Patel — [GitHub](https://github.com/Harrrdik18) · [LinkedIn](https://www.linkedin.com/in/harrrdik18) |
| CI/CD | `.github/workflows/ci.yml` → push to `main` → Vercel preview/production deploy |

**GitHub repository description** (About → Description):

```
Full-stack job-search command center — Next.js 16 + TypeScript + PostgreSQL + AI-assisted job/resume matching. Auth, RBAC-style scoping, kanban pipeline, analytics, tests, CI.
```

---

MIT © Hardik Patel
