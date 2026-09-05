# novacore-tailorsof — Frontend

Next.js 16 frontend for the TailorSoft application.  
Talks exclusively to the **backend** REST API — no database access here.  
Deploy independently from the backend (Vercel, Netlify, Railway, etc.).

---

## Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Framework   | Next.js 16 (App Router, Server Components)    |
| Styling     | Tailwind CSS v4 + shadcn/ui                   |
| Auth        | JWT stored in httpOnly cookie (`ts_session`)  |
| Forms       | React Hook Form + Zod                         |
| State       | Server Actions + `router.refresh()`           |

---

## Project structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (fonts, Toaster)
│   │   ├── page.tsx                      # → redirects to /dashboard
│   │   ├── not-found.tsx
│   │   ├── (auth)/login/page.tsx         # Sign-in page
│   │   └── (admin)/                      # Protected shell (requires auth)
│   │       ├── layout.tsx                # Reads session, renders AppShell
│   │       ├── dashboard/page.tsx
│   │       └── clients/
│   │           ├── page.tsx              # Client list
│   │           ├── new/page.tsx          # Add-client wizard
│   │           └── [id]/
│   │               ├── page.tsx          # Client detail
│   │               └── edit/page.tsx     # Edit client
│   ├── middleware.ts                     # JWT session gate for all routes
│   ├── components/
│   │   ├── auth/                         # LoginForm
│   │   ├── layout/                       # AppShell, Sidebar, PageHeader
│   │   ├── dashboard/                    # StatCards, UpcomingDeliveries
│   │   ├── clients/                      # All client UI components
│   │   ├── wizard/                       # 4-step add-client wizard
│   │   └── ui/                           # shadcn primitives (add via CLI)
│   ├── hooks/
│   │   └── use-debounce.ts
│   └── lib/
│       ├── types.ts                      # Shared domain types (mirrors backend)
│       ├── constants.ts                  # Labels, enums, page size
│       ├── money.ts                      # Rupee ↔ paise helpers
│       ├── utils.ts                      # cn() tailwind merge
│       ├── session.ts                    # JWT cookie helpers (server-side)
│       ├── validators/                   # Zod schemas (client.ts, auth.ts)
│       ├── api/                          # Typed fetch wrappers for each endpoint
│       │   ├── client.ts                 # Core apiFetch() with Bearer auth
│       │   ├── auth.ts
│       │   ├── clients.ts
│       │   ├── orders.ts
│       │   ├── payments.ts
│       │   └── dashboard.ts
│       └── actions/                      # Next.js Server Actions
│           ├── auth.actions.ts           # doLogin / doLogout
│           ├── clients.actions.ts
│           ├── orders.actions.ts
│           └── payments.actions.ts
├── .env.example
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

---

## Quick start (local)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Copy env and fill in values
cp .env.example .env
# Set NEXT_PUBLIC_API_URL to the running backend (default: http://localhost:3001)
# Set AUTH_SECRET to the SAME value as the backend's AUTH_SECRET

# 3. Start the dev server
npm run dev
# → http://localhost:3000
```

> The backend must be running before the frontend — it handles all data.

---

## Environment variables

| Variable              | Default                    | Description                                                     |
|-----------------------|----------------------------|-----------------------------------------------------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001`    | Base URL of the backend API (no trailing slash)                 |
| `AUTH_SECRET`         | hard-coded fallback        | **Must match** the backend `AUTH_SECRET` — used to verify JWTs |

---

## How authentication works

1. User submits the login form → `doLogin` Server Action calls `POST /api/auth/login` on the backend.
2. Backend returns a signed JWT.
3. The Server Action stores the JWT in an `httpOnly` cookie (`ts_session`).
4. `src/middleware.ts` verifies the cookie on every request — redirects to `/login` if missing/invalid.
5. Server Components and Server Actions read the cookie and forward the JWT as a `Bearer` token to the backend.
6. `doLogout` deletes the cookie and redirects to `/login`.

---

## Adding shadcn components

The `src/components/ui/` directory is populated via the shadcn CLI:

```bash
npx shadcn@latest add button card input label ...
```

Run this after `npm install`. The components.json from the original project can guide which components are needed.

---

## Production deployment

1. Set `NODE_ENV=production` and both env vars on your host.
2. Run `npm run build` — outputs a `standalone` Next.js bundle.
3. Start with `npm start`.
4. Point `NEXT_PUBLIC_API_URL` to your deployed backend domain.

> **CORS**: Update `FRONTEND_URL` in the backend `.env` to match the deployed frontend domain.
