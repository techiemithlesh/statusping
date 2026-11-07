# StatusPing 🟢

> Production-grade uptime monitoring system built with Laravel — queues, events, observer pattern, factory pattern, and real-time alerting.

![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?logo=laravel&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## What is StatusPing?

StatusPing monitors your websites and APIs every minute. When a site goes down, it opens an incident and fires alerts via Slack, email, or SMS — automatically, without polling the web server.

**Live demo:** `http://localhost:5173` (run locally with Docker — setup below)

---

## Architecture

```
Scheduler (every 1 min)
      ↓
DispatchMonitorChecks — dispatches one CheckMonitorJob per active monitor
      ↓
Redis Queue "monitors" (3 workers)
      ↓
CheckMonitorJob::handle()
   → CheckerFactory::make($monitor)   — HTTP / TCP / DNS checker
   → RetryDecorator                   — retries on transient failure
   → stores CheckResult (readonly DTO)
   → IncidentWatcher::evaluate()      — opens / closes incidents
        → if DOWN: dispatch SendAlertJob
              ↓
         Redis Queue "alerts" (5 workers)
              ↓
         AlertChannelFactory → Slack / Email / SMS
```

### Design patterns used

| Pattern | Where |
|---------|-------|
| Factory | `CheckerFactory`, `AlertChannelFactory` — swap checker/channel at runtime |
| Decorator | `RetryDecorator` — wraps any checker with retry logic |
| Observer | `UserObserver` — fires `UserRegistered` event on signup |
| Repository | Monitor queries abstracted away from controllers |
| DTO (readonly) | `CheckResult` — immutable ping result passed through the pipeline |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12, PHP 8.2 |
| Queue | Laravel Horizon + Redis |
| Auth | Laravel Sanctum (token-based) |
| Database | MySQL 8.0 + Eloquent ORM |
| Cache | Redis 7 |
| API Docs | Swagger / L5-Swagger |
| Frontend | React + Vite |
| DevOps | Docker Compose, Nginx |
| Mail | SMTP (Mailtrap for local) |

---

## Key Features

- **Monitors 1,000+ URLs per minute** using queued jobs — zero web server blocking
- **Incident lifecycle** — auto-open on consecutive failures, auto-close on recovery
- **Multi-channel alerts** — Slack, email, SMS via factory pattern (add new channels without changing core logic)
- **Role-based access** — `admin` and `user` roles with custom middleware
- **Welcome email on signup** — Observer → Event → Queued Listener chain
- **Full API** — RESTful endpoints with Sanctum token auth and Swagger docs
- **Retry logic** — `RetryDecorator` handles transient network failures before marking a site down

---

## Local Setup

**Requirements:** Docker Desktop

```bash
# 1. Clone
git clone https://github.com/techiemithlesh/statusping.git
cd statusping

# 2. Copy env
cp Backend/.env.example Backend/.env

# 3. Start all services
docker compose up -d

# 4. Install dependencies
docker exec statusping-backend-1 composer install

# 5. Generate key + migrate + seed
docker exec statusping-backend-1 php artisan key:generate
docker exec statusping-backend-1 php artisan migrate --seed
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/api/documentation |
| Adminer (DB) | http://localhost:8081 |
| Horizon (Queues) | http://localhost:8000/horizon |

---

## API Endpoints

### Auth (public)
```
POST   /api/login       — get Bearer token
POST   /api/register    — create account (triggers welcome email)
```

### Monitors (auth required — Bearer token)
```
GET    /api/monitors        — list all monitors
POST   /api/monitors        — create a monitor
GET    /api/monitors/{id}   — get one monitor
PUT    /api/monitors/{id}   — update
DELETE /api/monitors/{id}   — delete
```

### Me
```
GET    /api/me      — authenticated user
POST   /api/logout  — revoke token
```

Full interactive docs at `/api/documentation` (Swagger UI).

---

## Project Structure

```
Backend/
├── app/
│   ├── Console/Commands/      DispatchMonitorChecks.php
│   ├── Events/                UserRegistered.php
│   ├── Http/
│   │   ├── Controllers/       AuthController, MonitorController
│   │   └── Middleware/        RoleMiddleware.php
│   ├── Jobs/                  CheckMonitorJob.php, SendAlertJob.php
│   ├── Listeners/             SendWelcomeEmail.php
│   ├── Mail/                  WelcomeMail.php
│   ├── Models/                User, Monitor, Ping, Incident, AlertChannel
│   ├── Observers/             UserObserver.php
│   └── Services/
│       ├── Checkers/          HttpChecker, CheckerFactory, RetryDecorator
│       └── Alerts/            SlackChannel, AlertChannelFactory
├── database/
│   ├── migrations/
│   └── seeders/               1M pings seeded for realistic load testing
└── routes/
    └── api.php
```

---

## Database Schema

```
users           — id, name, email, password, role_id
roles           — id, name (admin | user)
monitors        — id, user_id, url, name, interval_seconds, is_active
pings           — id, monitor_id, status, response_time_ms, status_code, checked_at
incidents       — id, monitor_id, started_at, resolved_at, alert_sent
alert_channels  — id, monitor_id, type, config (JSON)
alert_logs      — id, incident_id, channel_type, sent_at, status
```

---

## Running Queue Workers

```bash
# All workers via Horizon
docker exec statusping-backend-1 php artisan horizon

# Or individually
docker exec statusping-backend-1 php artisan queue:work redis --queue=monitors --tries=3
docker exec statusping-backend-1 php artisan queue:work redis --queue=alerts --tries=3
```

---

## Seed Data

The seeder creates:
- 2 roles (admin, user)
- 1 test user
- 1,000 monitors
- 1,000,000 pings (6 months of realistic data — 85% up, 10% down, 5% timeout)

```bash
docker exec statusping-backend-1 php artisan migrate:fresh --seed
```

---

## Author

**Mithlesh Patel** — Backend Engineer (PHP / Laravel)
- GitHub: [@techiemithlesh](https://github.com/techiemithlesh)
- Email: techie.mithlesh@gmail.com

---

*Built as a portfolio project to demonstrate production Laravel patterns — queues, events, observer, factory, decorator, Sanctum auth, and Docker-based deployment.*