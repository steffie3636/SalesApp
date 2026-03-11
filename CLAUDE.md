# CLAUDE.md — SalesApp (Sales Arena)

This file provides guidance for AI assistants working with this codebase.

## Project Overview

Sales Arena is a **gamification platform for sales teams**. It tracks individual KPIs (revenue, new customers, new customer revenue), calculates points and levels, displays leaderboards, and awards badges. The UI is in **German (de-CH Swiss format)**.

The stack is a React SPA (no backend server) — all data is stored in and served from **Supabase** (PostgreSQL + Auth).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18.2, React Router v6 |
| Build | Vite 5.1 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Deployment | Vercel (SPA rewrites) |
| Language | Plain JavaScript (no TypeScript) |
| Styling | Custom CSS design system (`globals.css`) |
| Fonts | DM Sans (UI), DM Mono (numbers) |

No CSS framework (no Tailwind, Bootstrap). No state-management library (no Redux, Zustand) — only React Context API.

---

## Directory Structure

```
SalesApp/
├── src/
│   ├── main.jsx              # React entry — mounts with AuthProvider + ToastProvider
│   ├── App.jsx               # BrowserRouter, layout, all route definitions
│   ├── components/           # Reusable UI components
│   │   ├── Avatar.jsx
│   │   ├── AvatarPicker.jsx
│   │   ├── BadgeDisplay.jsx
│   │   ├── Confetti.jsx
│   │   ├── Field.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── Modal.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── RankBadge.jsx
│   │   ├── StatCard.jsx
│   │   └── Toast.jsx
│   ├── context/
│   │   ├── AuthContext.jsx   # Auth state, profile, role (admin/player)
│   │   └── ToastContext.jsx  # Global toast notifications
│   ├── lib/
│   │   ├── supabase.js       # Supabase client (uses VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
│   │   ├── useData.js        # All custom data-fetching hooks
│   │   ├── points.js         # Points & level calculation logic
│   │   ├── format.js         # Swiss number/currency/date formatting
│   │   └── avatars.js        # Avatar emoji list + color utilities
│   ├── pages/
│   │   ├── Leaderboard.jsx
│   │   ├── Achievements.jsx
│   │   ├── Profile.jsx
│   │   ├── GoalsDashboard.jsx
│   │   ├── Challenges.jsx
│   │   ├── ChallengeEventDetail.jsx
│   │   └── admin/
│   │       ├── PlayerManagement.jsx
│   │       ├── BadgeManagement.jsx
│   │       ├── ChallengeManagement.jsx
│   │       └── GoalsManagement.jsx
│   └── styles/
│       └── globals.css       # Full design system (CSS variables, utility classes, all component styles)
├── supabase/
│   ├── schema.sql            # Authoritative DB schema (run this to recreate the DB)
│   ├── migrations/
│   │   └── 001_event_participations.sql
│   └── seed.sql              # Sample data for development
├── index.html                # Single HTML shell
├── vite.config.js
├── vercel.json               # SPA rewrite: all routes → /
├── .env.example              # Template — copy to .env.local for local dev
├── README.md                 # German-language user docs
└── SPEC.md                   # Detailed technical specification
```

---

## Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Create local environment file
cp .env.example .env.local
# Then fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Start development server (hot reload on http://localhost:5173)
npm run dev

# 4. Build for production
npm run build

# 5. Preview the production build locally
npm run preview
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (e.g., `https://xxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |

Both variables are required. Vite exposes them to the browser via the `VITE_` prefix.

---

## Routing

All routes are defined in `src/App.jsx`. Authentication gates the entire app — unauthenticated users see `LoginScreen` only.

| Route | Component | Access |
|-------|-----------|--------|
| `/` | `Leaderboard` | All users |
| `/challenges` | `Challenges` | All users |
| `/challenges/:id` | `ChallengeEventDetail` | All users |
| `/achievements` | `Achievements` | All users |
| `/goals` | `GoalsDashboard` | All users |
| `/profile` | `Profile` | All users |
| `/admin/players` | `PlayerManagement` | Admin only |
| `/admin/challenges` | `ChallengeManagement` | Admin only |
| `/admin/badges` | `BadgeManagement` | Admin only |
| `/admin/goals` | `GoalsManagement` | Admin only |

Admin routes are only rendered when `profile.role === 'admin'`. Non-admins attempting to access them land on `Leaderboard` via the catch-all redirect.

---

## Authentication & Authorization

Handled entirely by Supabase Auth and `src/context/AuthContext.jsx`.

- **Login:** Email + password via `supabase.auth.signInWithPassword()`
- **Session persistence:** Supabase handles JWT refresh automatically
- **Roles:** Stored in the `profiles` table (`role: 'admin' | 'player'`)
- **Profile auto-creation:** A Supabase database trigger (`handle_new_user`) creates a `profiles` row on every new `auth.users` signup
- **Checking admin:** Use the `useAuth()` hook → `profile.role === 'admin'`
- **Row Level Security (RLS):** Enabled on all tables. DB function `is_admin()` is used in policies

```jsx
// Example usage
import { useAuth } from '../context/AuthContext';

const { user, profile, loading } = useAuth();
const isAdmin = profile?.role === 'admin';
```

---

## Database Schema

The full schema is in `supabase/schema.sql`. Key tables:

| Table | Purpose |
|-------|---------|
| `profiles` | One per auth user; stores `role` and `player_id` FK |
| `players` | Sales team members with KPIs (`revenue`, `new_customers`, `be_neukunden`, `points`, `level`) |
| `badges` | Achievement badges (emoji + optional base64 image + color) |
| `player_badges` | Many-to-many junction; unique per (player, badge) |
| `challenges` | Goals/challenges; `challenge_type` is `'standard'` or `'event'` |
| `event_participations` | Tracks which players attended which events |
| `annual_goals` | Team-level yearly KPI targets (one row per year) |
| `monthly_actuals` | Per-player, per-month KPI data; unique on (player_id, year, month) |
| `activity_log` | Immutable history of KPI changes |

### Key DB Triggers

- `handle_new_user()` — creates `profiles` row on `auth.users` insert
- `update_updated_at()` — keeps `monthly_actuals.updated_at` current
- `sync_event_challenge_points()` — auto-awards/revokes `reward_points` on event participation insert/delete

---

## Gamification Logic

All calculation logic lives in `src/lib/points.js`.

### Points Formula

```
points = (BE_Total × 0.02) + (Anz_Neukunden × 150) + (BE_Neukunden × 0.02)
```

Where:
- `BE_Total` — total revenue (Betriebsertrag)
- `Anz_Neukunden` — number of new customers
- `BE_Neukunden` — revenue from new customers

### Level Formula

```
level = max(1, floor(points / 1000) + 1)
```

### Rank Badges

Top 3 on the leaderboard receive Gold / Silver / Bronze rank badges (`src/components/RankBadge.jsx`).

---

## Data Fetching

All Supabase queries are in `src/lib/useData.js` as custom React hooks. Hooks use `useState` + `useEffect` + `useCallback` internally. There is no React Query or SWR.

```jsx
// Example
import { usePlayers, useBadges, useAnnualGoals } from '../lib/useData';

const { players, loading, error, refetch } = usePlayers();
```

Always call `refetch()` after mutations to keep UI in sync.

---

## Styling Conventions

- **Single global stylesheet:** `src/styles/globals.css` — do not create separate `.css` files per component
- **CSS variables** are defined at `:root` — use them for all colors, spacing, radius, shadows, transitions
- **Class naming:** kebab-case, grouped by component (e.g., `app-layout`, `app-sidebar`, `nav-item`)
- **No inline styles** unless dynamically computed (e.g., avatar background gradients)
- **Responsive breakpoints:**
  - `> 1024px` — full sidebar layout
  - `769–1024px` — condensed grid
  - `≤ 768px` — mobile stacked layout

### Key CSS Variables

```css
--primary         /* brand blue */
--primary-dark    /* hover state */
--surface         /* card background */
--surface-hover   /* card hover */
--background      /* page background */
--text-primary    /* main text */
--text-secondary  /* muted text */
--border          /* border color */
--radius          /* base border radius */
--radius-lg       /* large border radius */
```

### Animations

| Name | Usage |
|------|-------|
| `fadeInUp` | Page entry animations (0.5s) |
| `fadeIn` | Modals, toasts (0.3s) |
| `slideInRight` | Sidebar elements |
| `stagger` | Staggered list item appearance |

---

## Number & Currency Formatting

Swiss German format is used throughout. Always use the utilities in `src/lib/format.js`:

```js
import { formatCHF, formatNumber, formatPercent } from '../lib/format';

formatCHF(1234567)   // → "CHF 1'234'567"
formatNumber(9876)   // → "9'876"
formatPercent(0.853) // → "85.3%"
```

Never use raw `.toLocaleString()` or `Intl` directly in components.

---

## Code Conventions

- **Components:** PascalCase filenames and function names
- **Hooks/utilities:** camelCase filenames and function names
- **Constants:** SCREAMING_SNAKE_CASE (e.g., `SORT_OPTIONS`, `AVATAR_COLORS`)
- **No TypeScript** — plain JavaScript throughout
- **No class components** — only functional components with hooks
- **Error handling:** try/catch in async operations; show errors via `useToast()`

```jsx
// Toast notification pattern
import { useToast } from '../context/ToastContext';

const { showToast } = useToast();

try {
  await supabase.from('players').update(...);
  showToast('Gespeichert!', 'success');
} catch (err) {
  console.error(err);
  showToast('Fehler beim Speichern', 'error');
}
```

---

## Testing

There is currently **no automated test suite**. Testing is done manually by running the dev server (`npm run dev`) and verifying in the browser.

If adding tests, Vitest (already compatible with the Vite setup) is the recommended choice. React Testing Library would pair well for component tests.

---

## Deployment

The app deploys to **Vercel**. The `vercel.json` rewrites all routes to `/` to support client-side routing.

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project environment variables. No build command override is needed — Vercel auto-detects Vite.

---

## Key Files Quick Reference

| File | What it does |
|------|-------------|
| `src/main.jsx` | Mounts React app with providers |
| `src/App.jsx` | Layout, sidebar navigation, all routes |
| `src/context/AuthContext.jsx` | Auth state, profile, role management |
| `src/context/ToastContext.jsx` | Global toast notification system |
| `src/lib/supabase.js` | Supabase client singleton |
| `src/lib/useData.js` | All data-fetching hooks |
| `src/lib/points.js` | Points & level calculation |
| `src/lib/format.js` | Swiss number/CHF formatting |
| `src/lib/avatars.js` | Avatar emoji list + gradient colors |
| `src/styles/globals.css` | Entire design system |
| `supabase/schema.sql` | Authoritative database schema |
| `SPEC.md` | Full technical specification |
