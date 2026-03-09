# F1 Paddock — Formula 1 Stats & Social App

## Overview
A mobile-first Formula 1 statistics and social app with a cartoony "Hades"-inspired aesthetic, F1 red color scheme.

## Features
- **Dashboard** — Race countdown, points display, daily reward, quick actions
- **F1 Quiz** — 20 questions about F1 history and 2025 season. Earn points for correct answers
- **Race Forum** — Dedicated discussion threads for all 23 2025 F1 Grand Prix races
- **Articles** — Admin-publishable articles with comments, readable by all users
- **Leaderboard** — Top pilots ranked by lifetime points (quiz scores + daily rewards)
- **Aria's Visual Novel** — Dating sim story about rookie F1 driver Aria Voss. 5 chapters, spend points to unlock better choices, dress her up with outfit items
- **Admin Panel** — Admins can create/edit/delete articles. Access at /admin
- **Daily Points** — Claim 5,000 points every 24 hours

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Drizzle ORM)
- **Auth**: Replit Auth (OIDC)
- **Routing**: wouter

## Database Tables
- `users` + `sessions` — Replit Auth
- `user_profile` — Points, admin status, daily claim tracking
- `races` — 2025 F1 calendar (23 races seeded)
- `quiz_questions` — 20 F1 trivia questions seeded
- `quiz_attempts` — User quiz history
- `forum_posts` + `forum_comments` — Race discussion threads
- `articles` + `article_comments` — Admin articles
- `novel_progress` — Visual novel save data (chapter, scene, outfit, affection)

## Key Architecture
- Mobile-first layout (max-width: 448px) centered on desktop
- Bottom navigation bar (Home, Quiz, Forum, Aria, Leaderboard)
- Top header with points balance and avatar
- Font: Oxanium (font-racing class) for headings/labels, Open Sans for body
- Red/dark theme inspired by F1 branding and Hades game art style

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection
- `SESSION_SECRET` — Express session secret
- `REPL_ID` — Required for Replit Auth OIDC

## Admin Setup
1. Log in with your Replit account
2. Go to /admin — it will show your User ID
3. Use the database or API to set `is_admin = true` in `user_profile` for your user ID
4. Alternatively: use the `/api/admin/set-role` endpoint (requires existing admin)

## File Structure
```
client/src/
  pages/
    Landing.tsx      — Login page for unauthenticated users
    Dashboard.tsx    — Main hub with race calendar and quick actions
    QuizPage.tsx     — Interactive 10-question F1 quiz
    ForumPage.tsx    — Race selection + discussion threads
    ArticlesPage.tsx — Article list
    ArticleDetailPage.tsx — Full article with comments
    LeaderboardPage.tsx   — Points leaderboard with podium
    NovelPage.tsx    — Aria's visual novel (story, dress-up, chapters)
    AdminPage.tsx    — Article management for admins
  components/
    AppLayout.tsx    — Main layout with header + bottom nav
  data/
    novelStory.ts    — Story chapters, scenes, choices, outfit data
  hooks/
    use-auth.ts      — Auth state hook
server/
  index.ts           — Express entry point
  routes.ts          — All API routes
  storage.ts         — Database operations (IStorage)
  seed.ts            — Initial data seeding
  db.ts              — Drizzle database connection
  replit_integrations/auth/ — Replit OIDC auth module
shared/
  schema.ts          — All Drizzle table definitions + Zod schemas
  models/auth.ts     — Users and sessions tables (Replit Auth)
```
