# F1 Paddock — F1 Fan Hub (www.f1fanhub.net)

## Overview
A comprehensive Formula 1 fan website with news, standings, forum, polls, quiz, visual novel, auth, daily auto-publish, AdSense, and full Node.js SSR for Google indexing. White/red McLaren-inspired design, Oxanium font.

## Features
- **Dashboard** — Race countdown, points display, daily reward, Most Read widget, "On This Day in F1" historical fact widget
- **Search** — Full-text article search overlay (⌘K shortcut), live debounced results from `/api/search`
- **Breaking News Ticker** — Scrolling latest article headlines below the header (red bar)
- **Race Calendar** — `/calendar` page showing 2026 F1 season with season progress bar, upcoming/completed races, sprint badges, country flags
- **Newsletter** — Footer email subscription form, stored in `newsletter_subscribers` DB table
- **F1 Quiz** — 10 questions about F1 history. Earn points for correct answers
- **Race Forum** — Dedicated discussion threads per Grand Prix race
- **Articles** — Admin-publishable articles with comments, reading progress bar, view tracking
- **Leaderboard** — Top pilots ranked by lifetime points
- **Gina's Visual Novel** — Interactive story about rookie F1 driver Gina Voss
- **Standings** — Driver & Constructor standings for 2026 season
- **Admin Panel** — Create/edit/delete articles, approve submissions, trigger auto-publish. Access at /admin
- **Auto-Publish** — Daily scheduler 07:00 UTC generating 10 articles/day. Social posting to Discord/Facebook/Instagram
- **Daily Points** — Claim points every 24 hours
- **Live Viewer Counter** — SSE-based real-time connected viewer count in footer
- **RSS Feed / Sitemap / robots.txt** — Hardcoded to https://www.f1fanhub.net
- **Jobs Board** — F1 industry job listings
- **Submit Story** — Authenticated users can submit articles for admin approval

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
