# Stack: A Substack Clone (PERN)

A full-stack newsletter and publishing platform built with **PostgreSQL, Express, React (Vite) and Node.js**. Authors publish free or paid posts, readers subscribe, comment, like and message each other, with real-time notifications and 24-hour stories.

> Built with production-style code: raw SQL (no ORM), JWT access and refresh token rotation, httpOnly cookies, and a plain-CSS glassmorphism UI.

**Live demo**

| Part | URL |
|---|---|
| Frontend (Vercel) | https://stack-substack-c-lone.vercel.app |
| Backend (Render) | https://stack-o2o1.onrender.com |
| Health check | https://stack-o2o1.onrender.com/api/health |

> The backend runs on Render's free tier, so the first request after idle can take 30 to 60 seconds (cold start).

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Design decisions](#design-decisions)
- [Project structure](#project-structure)
- [Getting started (local)](#getting-started-local)
- [Environment variables](#environment-variables)
- [Database and migrations](#database-and-migrations)
- [API overview](#api-overview)
- [Authentication flow](#authentication-flow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Security notes](#security-notes)

---

## Features

**Authentication**
- Register, login, logout, `/auth/me`
- JWT access token (in memory) plus refresh token (httpOnly cookie) with rotation
- bcrypt password hashing, auto-generated unique usernames
- Password show/hide toggle, Caps Lock warning, client-side validation

**Publishing**
- Create, edit, delete posts with slug, cover image, excerpt
- Draft and publish states
- Free and paid posts with paywall gating
- Author dashboard with stats and status filters

**Social**
- Threaded comments (nested replies) and post likes (toggle)
- Free subscriptions and Razorpay paid subscriptions (webhook HMAC verification)
- Public author profiles with tabs: Activity, Posts, Replies, Likes, Subscriptions
  - Activity, Posts and Replies are public
  - Likes and Subscriptions are visible to logged-in users only

**Real-time (Socket.io)**
- Direct messaging with typing indicator and unread badges
- Live notifications with a dedicated `/notifications` page

**Discovery and media**
- Full-text search (PostgreSQL `tsvector` + GIN) for posts, plus user search
- Image upload via Multer and Cloudinary
- 24-hour stories, cleaned up by a `node-cron` job

**UI and UX**
- Glassmorphism theme with CSS variables (`theme.css`)
- Mobile-first layouts with an Instagram-style bottom navbar
- Skeleton loaders, animated logo loader, fade-in feed
- Keyboard-safe mobile chat layout (visualViewport)

---

## Tech stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL (Neon in production) |
| Backend | Node.js, Express, `pg` (node-postgres) |
| Auth | jsonwebtoken, bcryptjs, cookie-parser |
| Payments | Razorpay |
| Media | Multer, Cloudinary |
| Real-time | Socket.io |
| Jobs | node-cron |
| Hardening | helmet, cors, express-rate-limit, compression |
| Logging | winston, morgan |
| Frontend | React 18+, Vite, React Router |
| State | Redux Toolkit |
| HTTP | Axios (with refresh interceptor) |
| Styling | Plain CSS with CSS variables |
| Icons and toasts | lucide-react, react-hot-toast |

---

## Design decisions

These are intentional constraints of the project:

- **No ORM.** Raw `pg` with hand-written SQL only.
- **No Tailwind.** Plain CSS driven by tokens in `theme.css`.
- **No Docker.**
- **Plain `.sql` migrations** in `src/db/migrations/` with a custom runner and a `schema_migrations` table.
- **`protect` middleware sets `req.userId`** (a string). Controllers use `req.userId`, never `req.user.id`.
- **No pagination** on endpoints unless explicitly added later.
- **Access token is stored in memory only**, never in `localStorage`, to reduce XSS exposure.

---

## Project structure

```
Stack-Substack-CLone-/
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/            # env.js, db.js, razorpay.js, cloudinary
│       ├── controllers/
│       ├── routes/
│       ├── middlewares/       # authMiddleware (protect, optionalAuth), errorHandler, rateLimiter
│       ├── models/            # SQL queries per entity
│       ├── utils/             # ApiError, asyncHandler, tokenUtils
│       ├── socket/            # Socket.io setup and handlers
│       ├── services/          # notificationService, etc.
│       ├── jobs/              # cron jobs (story cleanup)
│       └── db/
│           └── migrations/    # 001_*.sql, 002_*.sql, ...
└── frontend/
    └── frontend/
        ├── index.html
        ├── vercel.json
        ├── package.json
        └── src/
            ├── api/           # axiosInstance.js
            ├── app/           # Redux store
            ├── components/
            ├── features/      # Redux slices and API modules (auth, posts, ...)
            ├── pages/         # Home, PostDetail, WritePost, Dashboard, AuthorProfile,
            │                  # Messages, NotificationsPage, Search, Authentication/
            ├── routes/        # ProtectedRoute
            ├── socket/        # socketClient.js (single shared client)
            └── styles/        # theme.css and per-page CSS
```

---

## Getting started (local)

### Prerequisites

- Node.js 20+ (tested on 22)
- PostgreSQL 14+ running locally
- A Cloudinary account (for image uploads)
- Razorpay test keys (optional, for paid subscriptions)

The commands below are for **Windows PowerShell**.

### 1. Clone

```powershell
git clone https://github.com/iamaniket-python/Stack-Substack-CLone-.git
cd Stack-Substack-CLone-
git checkout stack
```

### 2. Create the database

```powershell
psql -U postgres -c "CREATE DATABASE substack_clone;"
```

### 3. Backend

```powershell
cd backend
npm install
```

Create `backend/.env` (see [Environment variables](#environment-variables)), then:

```powershell
npm run migrate
npm run dev
```

The API runs on `http://localhost:5000`. Verify:

```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

### 4. Frontend

```powershell
cd ..\frontend\frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

### 5. Try it

Register a new account at `http://localhost:5173/register`, then log in.

---

## Environment variables

### Backend (`backend/.env`)

```dotenv
NODE_ENV=development
PORT=5000

# Option A: local development (individual vars)
DB_USER=postgres
DB_PASSWORD=your_local_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=substack_clone

# Option B: production (Neon). If set, this takes priority and SSL is enabled.
# DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require

JWT_ACCESS_SECRET=change_me_to_a_long_random_string
JWT_REFRESH_SECRET=change_me_to_another_long_random_string
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

CLIENT_URL=http://localhost:5173
COOKIE_NAME=substack_refresh_token

RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Notes:
- Set **either** `DATABASE_URL` **or** all five `DB_*` variables. The server refuses to start otherwise.
- Keep `NODE_ENV=development` locally. In production it must be `production`, because it switches cookies to `SameSite=None; Secure`.
- Never commit `.env`. Generate strong secrets, for example:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

### Frontend (`frontend/frontend/.env`)

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

In production (Vercel):

```dotenv
VITE_API_URL=https://<your-render-app>.onrender.com/api
VITE_SOCKET_URL=https://<your-render-app>.onrender.com
```

- `VITE_API_URL` needs the `/api` suffix (the axios instance also normalizes it).
- `VITE_SOCKET_URL` must **not** include `/api`.
- On Vercel, add these as **Config** (plain) variables, not Secret. `VITE_*` values are baked into the browser bundle at build time, and Secret-type variables may not be injected reliably.
- Changing an environment variable requires a **redeploy**.

---

## Database and migrations

Migrations are plain SQL files in `backend/src/db/migrations/`, applied in filename order by a custom runner. Applied files are recorded in the `schema_migrations` table.

```powershell
cd backend
npm run migrate
```

To run migrations against Neon without touching your local `.env`:

```powershell
$env:DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
npm run migrate
```

Core tables include: `users`, `refresh_tokens`, `posts`, `comments`, `likes`, `subscriptions`, `payments`, `notifications`, `conversations`, `messages`, `stories`, and `schema_migrations`.

Reset all data (destructive, use with care):

```sql
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
```

---

## API overview

All routes are prefixed with `/api`. Protected routes expect `Authorization: Bearer <accessToken>`.

| Prefix | Purpose | Notes |
|---|---|---|
| `/auth` | register, login, refresh, logout, me | refresh uses the httpOnly cookie |
| `/posts` | post CRUD, feed, by slug, mine | paywall gating on read |
| `/subscriptions` | subscribe, unsubscribe, status | free tier |
| `/payments` | create Razorpay order, verify, webhook | webhook verified via HMAC |
| `/comments` | list (threaded), create, delete | |
| `/likes` | toggle like | |
| `/users` | public profile, user search | |
| `/search` | full-text post search | tsvector + GIN |
| `/upload` | image upload | Multer to Cloudinary |
| `/notifications` | list, mark read | also pushed over Socket.io |
| `/messages` | conversations, messages | real-time via Socket.io |
| `/stories` | create, list active stories | expire after 24h |
| `/profile` | profile tabs data | see below |
| `/health` | liveness and DB check | runs `SELECT 1` |

**Profile endpoints**

| Endpoint | Access |
|---|---|
| `GET /profile/posts`, `/replies`, `/activity` | own data, login required |
| `GET /profile/:id/posts`, `/replies`, `/activity` | **public** (optional auth) |
| `GET /profile/likes`, `/subscriptions` | own data, login required |
| `GET /profile/:id/likes`, `/subscriptions` | login required |

Express route order matters: specific routes (`/posts/mine`, `/users/search`) must be declared **before** param routes (`/posts/:slug`, `/users/:id`).

### Socket.io events

| Event | Direction | Description |
|---|---|---|
| `conversation:join` | client to server | join a conversation room |
| `message:send` | client to server | send a message (with ack callback) |
| `message:new` | server to client | new message delivered |
| `typing` | both | typing indicator |

The client authenticates with `auth: { token }` using the access token.

---

## Authentication flow

1. **Login or register** returns an access token (kept in memory) and sets the refresh token as an httpOnly cookie named `substack_refresh_token`.
2. Every request carries `Authorization: Bearer <accessToken>`.
3. On a `401`, the axios interceptor calls `/auth/refresh` once, queues any parallel failed requests, then retries them with the new token.
4. Refresh tokens are **rotated**: the old one is revoked and a new pair is issued.
5. Login, register, refresh and logout are excluded from the refresh-retry logic so real errors (such as "Invalid credentials") are shown.
6. On page load the app calls `/auth/me` (with refresh fallback) to restore the session, showing an icon loader meanwhile.

**Cookies across domains:** in production the frontend (Vercel) and backend (Render) are different sites, so the cookie uses `SameSite=None; Secure=true`. Locally it uses `SameSite=Lax`. Browsers that block third-party cookies (for example Safari or Incognito) may break session restore. A Vercel rewrite that proxies `/api` to the backend is the long-term fix.

---

## Deployment

### 1. Database: Neon

1. Create a project at https://console.neon.tech (pick a region close to your backend).
2. Copy the **pooled** connection string.
3. Run migrations against it (see [Database and migrations](#database-and-migrations)).

### 2. Backend: Render

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment | Node |

Set these environment variables: `NODE_ENV=production`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`, `CLIENT_URL` (your exact Vercel URL, no trailing slash), `COOKIE_NAME`, Razorpay and Cloudinary keys.

After changing `CLIENT_URL`, trigger a manual deploy so CORS picks it up.

The app sets `trust proxy` (Render sits behind a reverse proxy) so rate limiting sees real client IPs.

**Keep-alive (free tier):** create a monitor at https://uptimerobot.com that hits `https://<your-app>.onrender.com/api/health` every 5 minutes. The endpoint runs `SELECT 1`, which also keeps Neon awake.

### 3. Frontend: Vercel

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `frontend/frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Production Branch | `stack` |

Add `VITE_API_URL` and `VITE_SOCKET_URL` (Config type), then deploy.

`vercel.json` (already in the repo) makes React Router work on refresh:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Roadmap

**Not built yet**
- [ ] Email flows (verification, password reset, notifications). `is_verified` column exists but is unused.
- [ ] Recurring billing. Currently a one-time Razorpay order, no auto-renew.
- [ ] Rich text editor with `sanitize-html` content sanitization (content is plain text today)
- [ ] Automated tests (everything so far is manually tested)

**Performance ideas**
- [ ] Cloudinary transforms (`f_auto,q_auto,w_800`) for feed images
- [ ] `React.lazy` code splitting per route
- [ ] Database indexes on `author_id`, `post_id`, `user_id`, `created_at`, and N+1 query review
- [ ] Move Render and Neon to the same region near your users (for example Singapore)

---

## Security notes

- Never commit `.env` files or paste secrets in issues, chats or screenshots. Rotate any key that has been exposed (Cloudinary API secret, database password, JWT secrets, Razorpay keys).
- Access tokens live in memory only. Refresh tokens are httpOnly cookies, hashed in the database and rotated on use.
- `helmet`, CORS with a single allowed origin plus credentials, and rate limiting are enabled.
- Razorpay webhooks are verified using HMAC on the raw request body.
- All SQL uses parameterized queries.

---

## Author

Built by **Aniket Shrivastava** as a full-stack learning and portfolio project.

## License

This project is for learning and portfolio purposes. Add a license of your choice (for example MIT) before reusing it publicly.
