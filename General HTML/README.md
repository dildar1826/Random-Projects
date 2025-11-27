## Chat Room – Realtime Supabase Chat

Discord-inspired, dark themed chat experience built with Next.js 14 (App Router), React, Supabase, Tailwind CSS (v4) and deployment-ready for Vercel.  
Features live group chat, 24-hour session resets, role-based admin dashboard, and persistent chat history storage.

### Key Features
- Email-free username/password auth backed by Supabase `users` table and secure JWT cookies.
- Realtime streaming messages (Supabase Realtime) with Discord-like UI/UX.
- Automatic daily session rotation: messages archived into `chat_history`, table cleared, fresh session bootstrapped.
- Admin dashboard for user management, chat history auditing, and instant reset controls.
- Responsive layout with sidebar history, countdown timer, and protected routes enforced via middleware.

---

## 1. Environment Setup
Create `/home/dildar/agents/web/chat-room/.env.local` (already added) and populate:

```
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-for-server-routes>
AUTH_SECRET=<strong-random-secret-for-jwt-cookies>
```

`SUPABASE_SERVICE_ROLE_KEY` is used only on the server for admin actions; omit it locally if Row Level Security is disabled for the referenced tables.

Install dependencies (network access required):

```bash
npm install
```

---

## 2. Supabase Schema
Run the following SQL in the Supabase SQL editor:

```sql
create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  password text not null, -- bcrypt hash
  "isAdmin" boolean not null default false
);

create table if not exists public.sessions (
  id uuid primary key,
  date date not null,
  start_time timestamptz not null
);

create table if not exists public.messages (
  id uuid primary key,
  sender_id uuid references public.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  session_id uuid references public.sessions(id) on delete cascade
);

create table if not exists public.chat_history (
  id uuid primary key,
  session_id uuid references public.sessions(id),
  saved_data jsonb not null
);

-- Optional: enable realtime on messages & sessions tables
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.sessions;
```

Seed at least one admin user (store bcrypt hashed passwords).

---

## 3. Development & Deployment

```bash
# start dev server
npm run dev

# lint
npm run lint

# production build / start
npm run build
npm start
```

Deploy on Vercel by connecting the repo, configuring the same environment variables, and running the default Next.js build. Edge-friendly middleware protects `/chat` and `/admin`.

---

## 4. Application Structure

```
src/
 ├─ app/
 │   ├─ page.tsx             # Login (users + admin toggle)
 │   ├─ chat/page.tsx        # Realtime chat experience
 │   ├─ admin/page.tsx       # Protected admin dashboard
 │   └─ api/...              # Auth, messages, admin tools, session state
 ├─ components/              # UI building blocks (sidebar, timer, lists)
 └─ lib/                     # Supabase clients, auth helpers, session manager
```

The 24-hour reset pipeline lives in `src/lib/sessionManager.ts` and is invoked on login, message writes, admin resets, and any request for chat state. When a session expires (≥24h or date rollover), all messages are archived into `chat_history` with structured JSON, the `messages` table is wiped for that session, and a fresh session is created for the new day.

---

## 5. Admin Workflow
- **View users:** `/admin` → “Registered Users”
- **Remove user:** Click *Remove* next to any non-admin row (self-deletion blocked).
- **Force reset:** *Reset Chat Now* triggers immediate archive + new session.
- **Inspect history:** Scroll the “Chat History” panel; entries include archive timestamps and message totals.

---

## 6. Notes & Testing
- Realtime listeners rely on Supabase publications for `messages` and `sessions`.
- Authentication uses bcrypt hashes stored in `users.password`; make sure to hash before inserting into Supabase.
- Clipboard export of historical sessions is available via the sidebar history list (copies transcript on click).
- If `npm install` fails in your environment, double-check outbound network/proxy access and retry; all dependencies are declared in `package.json`.

Happy chatting! 🎧
