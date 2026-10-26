# StatusPing Frontend (React)

React + Vite single-page app for StatusPing. It talks only to the Laravel API under `/api/v1`.

## Setup

From the repository root, start the full development stack:

```bash
cp Backend/.env.example Backend/.env  # first run only, if the file is missing
docker compose up --build -d
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate
```

Open http://localhost:8080. Vite serves the frontend behind Nginx and proxies `/api`
requests to Laravel, so no CORS configuration is needed.

You can also run just the frontend at http://localhost:5173:

```bash
docker compose up -d frontend
```

Or just the backend API and queue worker at http://localhost:8000; Compose starts its
database and Redis dependencies automatically:

```bash
docker compose up -d backend queue
```

The frontend-only selection serves the UI; API calls work when a backend is also running.
For a backend elsewhere, point `VITE_API_TARGET` in the root `.env` at an API host reachable
from the frontend container, then recreate the frontend.

To run Vite directly on your host instead, install dependencies with `npm ci` and run
`npm run dev` from this directory. Set `VITE_API_TARGET` to the Laravel HTTP API URL.

## Pages and the APIs they call

| Page | Route | API calls |
|---|---|---|
| Marketing landing page | `/` | None |
| Monitors | `/dashboard` | `GET /monitors`, `POST /monitors`, `POST /monitors/{id}/check`, `PATCH /monitors/{id}/pause`, `PATCH /monitors/{id}/resume`, `GET /dashboard/summary` (optional) |
| Monitor detail | `/monitors/:id` | `GET`, `PUT`, `DELETE /monitors/{id}`, `GET /monitors/{id}/uptime`, `GET /monitors/{id}/pings?per_page=24`, `GET /monitors/{id}/incidents`, `GET /alert-channels`, `POST /monitors/{id}/alert-channels` |
| Incidents | `/incidents` | `GET /incidents?status=ongoing\|resolved`, `GET /incidents/{id}` |
| Alert channels | `/alert-channels` | `GET`, `POST /alert-channels`, `DELETE /alert-channels/{id}`, `POST /alert-channels/{id}/test` |
| Public status page | `/status/:slug` | `GET /status/{slug}` (no login) |
| Login / registration | `/login`, `/register` | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout` |
| Password recovery | `/forgot-password`, `/reset-password` | `POST /auth/forgot-password`, `POST /auth/reset-password` |

All paths are relative to `/api/v1`.

**Endpoints you have not built yet do not crash the app.** Each section shows a yellow note like
`GET /api/v1/monitors/1/pings returned 404. Either this endpoint is not built yet...`.
Build the endpoint, refresh, and the section fills in.

## Expected JSON (Laravel API Resources)

The app unwraps `{ "data": ... }` automatically. Field names are mapped in
`src/api/normalize.js`. If your Resource uses different keys, change them **there only**.

```jsonc
// MonitorResource
{ "id": 1, "name": "Main Website", "url": "https://example.com",
  "status": "up", "is_active": true, "interval_seconds": 60,
  "uptime_24h": 99.92, "last_response_ms": 312,
  "alert_channels": [ { "id": 1, "name": "Ops email", "type": "email" } ] }

// PingResource
{ "id": 10, "status": "up", "status_code": 200, "response_time_ms": 214, "checked_at": "2026-10-16T09:22:00Z" }

// IncidentResource
{ "id": 31, "monitor_id": 2, "monitor": { "id": 2, "name": "Customer API" },
  "status": "ongoing", "cause": "HTTP 503", "started_at": "...", "ended_at": null }

// AlertChannelResource
{ "id": 1, "type": "email", "name": "Ops email", "target": "ops@example.com" }

// GET /monitors/{id}/uptime
{ "data": { "uptime_percentage": 99.92 } }

// GET /status/{slug}
{ "data": { "page": "Example Co",
  "services": [ { "name": "Main Website", "status": "up", "uptime_90d": 99.9, "history": ["up","up","down"] } ] } }

// POST /auth/login
{ "token": "1|abc...", "user": { "id": 1, "name": "..." } }
```

Status codes the UI expects: `201` on create, `202` on "Check now", `204` on delete, `422` with
`{ "errors": { "field": ["message"] } }` on validation errors (shown under each input).

## Authentication

The frontend stores the API token in `localStorage` and sends it as a bearer token on API requests.
Dashboard, monitor, incident, and alert-channel routes redirect to `/login` unless a token exists.
The landing page and public status pages remain accessible without signing in.

The UI expects the Laravel API to implement the listed authentication endpoints and return a token
from login and registration. Password recovery expects a reset URL with `token` and `email` query
parameters. Authentication endpoints are frontend contracts only; implement them in Laravel.
The backend currently exposes the monitor resource routes, so other screens will show the API
response until their corresponding endpoints are implemented.

## Production build

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

The production image builds the Vite app and serves `dist/` from Nginx. It also serves
SPA routes from `index.html` and forwards `/api` requests to the Laravel PHP-FPM service.
Configure the root `.env` as described in [`DOCKER_DEPLOYMENT_CHEATSHEET.md`](../DOCKER_DEPLOYMENT_CHEATSHEET.md)
before starting the production stack. Run Laravel migrations after startup:

```bash
docker compose -f ../docker-compose.prod.yml exec backend php artisan migrate --force
```

## Project structure

```
src/
├── api/
│   ├── client.js       fetch wrapper, token, error messages
│   └── normalize.js    API JSON -> UI shape (edit keys here)
├── components/         Layout, Toast, StatusPill, ResponseChart...
├── lib/format.js       %, ms, dates, durations
├── pages/              one file per screen, API list at the top of each
├── App.jsx             routes
└── styles.css          light + dark theme
```
