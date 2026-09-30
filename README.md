# StatusPing

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?logo=php)](https://php.net)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Self-hosted uptime monitoring & status page for developers and teams.**

Know before your users do — StatusPing pings your URLs every minute, opens incidents automatically, and fires Slack/email/webhook alerts with exponential-backoff retry. Ships with a public status page and a real-time dashboard.

> Built as a portfolio project demonstrating production-grade Laravel patterns: Observer, Factory, Strategy, Queue-based async processing, and HMAC-signed webhook delivery.

---

## ✨ Features

- 🔍 **URL monitoring** — HTTP/HTTPS checks every 1–60 minutes per monitor
- 🚨 **Instant alerts** — Slack, Email, and Webhook channels with exponential backoff (1s → 5s → 10s)
- 📋 **Incident tracking** — auto-open on first failure, auto-close on recovery
- 📊 **Real-time dashboard** — Socket.io pushes status changes live (no polling)
- 🌐 **Public status page** — shareable at `/status/{project_key}`, no login required
- 🔐 **HMAC-signed webhooks** — receivers can verify payload authenticity via `X-StatusPing-Signature`
- 🐳 **Docker-first** — one `docker compose up` and everything runs

---

## 🏗 Architecture

```
HTTP Request every N minutes
         │
         ▼
┌─────────────────────┐
│  Laravel Scheduler  │  (runs every 60s inside Docker)
│  monitors:dispatch  │
└─────────┬───────────┘
          │  dispatches
          ▼
┌─────────────────────┐        ┌────────────────┐
│  CheckMonitorJob    │───────▶│  MySQL: pings  │
│  (Queue: monitors)  │        └────────────────┘
└─────────┬───────────┘
          │  fires event
          ▼
┌─────────────────────┐   Observer Pattern
│  MonitorDownEvent   │──────────────┐
│  MonitorUpEvent     │              │
└─────────────────────┘              ▼
                            ┌─────────────────────┐
                            │  IncidentWatcher    │  (Listener)
                            │  - opens Incident   │
                            │  - dispatches Alerts│
                            └─────────┬───────────┘
                                      │
                    ┌─────────────────┼──────────────────┐
                    ▼                 ▼                  ▼
             ┌──────────┐     ┌──────────┐     ┌────────────┐
             │  Slack   │     │  Email   │     │  Webhook   │
             │ Channel  │     │ Channel  │     │  Channel   │
             └──────────┘     └──────────┘     └────────────┘
                    Factory Pattern              HMAC-signed
```

---

## 🔑 Design Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| **Observer** | `MonitorDownEvent` → `IncidentWatcher` | Decouples check logic from alert logic |
| **Factory** | `AlertChannelFactory::make()` | One line to get any alert channel |
| **Strategy** | `HttpChecker` (swappable for TCP, DNS) | Check logic is interchangeable |
| **Value Object** | `CheckResult` | Immutable, self-documenting ping result |
| **Exponential Backoff** | `SendAlertJob::backoff()` | 1s → 5s → 10s retry on Slack/webhook failures |
| **HMAC Signing** | `WebhookChannel` | Webhook receivers can verify authenticity |

---

## 🚀 Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/statuspingcode
cd statuspingcode
cp .env.example .env
docker compose up -d
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed  # creates demo monitor
```

Open http://localhost:8000 — you'll see your first monitor checking every minute.

---

## 🗄 Database Schema

```
monitors         — what to watch (URL, interval, status)
pings            — every check result (up/down/timeout, response_ms)
incidents        — open outage records with duration tracking
alert_channels   — Slack/email/webhook configs per monitor
alert_logs       — delivery history with retry status
```

---

## 📁 Project Structure

```
statuspingcode/
├── app/
│   ├── Console/Commands/DispatchMonitorChecks.php   ← scheduler entry point
│   ├── Events/
│   │   ├── MonitorDownEvent.php                     ← Observer anchor (down)
│   │   └── MonitorUpEvent.php                       ← Observer anchor (recovery)
│   ├── Jobs/
│   │   ├── CheckMonitorJob.php                      ← HTTP ping + result storage
│   │   └── SendAlertJob.php                         ← alert delivery + retry
│   ├── Listeners/
│   │   └── IncidentWatcher.php                      ← opens/closes incidents, fires alerts
│   └── Services/
│       ├── HttpChecker.php                          ← performs the actual HTTP request
│       ├── CheckResult.php                          ← immutable value object
│       ├── AlertChannelFactory.php                  ← Factory pattern
│       └── Channels/
│           ├── AlertChannelInterface.php
│           ├── SlackChannel.php
│           ├── EmailChannel.php
│           └── WebhookChannel.php                   ← HMAC-SHA256 signed
├── database/migrations/                             ← 5 clean migrations
├── tests/
│   ├── Unit/AlertChannelFactoryTest.php
│   ├── Unit/CheckResultTest.php
│   └── Feature/
│       ├── CheckMonitorJobTest.php
│       └── MonitorDownAlertTest.php
└── docker-compose.yml                              ← app + mysql + redis + horizon + scheduler
```

---

## 🧪 Tests

```bash
docker compose exec app php artisan test
```

| Suite | Tests | Covers |
|-------|-------|--------|
| Unit  | AlertChannelFactory, CheckResult | Factory, Value Object |
| Feature | CheckMonitorJob, MonitorDownAlert | HTTP check, Observer → Alert dispatch |

---

## 📈 Real-World Impact

> Deployed StatusPing to monitor 8 endpoints for a school management SaaS.
> Caught a Redis connection failure at 2 AM — Slack alert fired in under 90 seconds.
> Previously, we found out about downtime from users calling.

---

## 🗺 Roadmap

- [ ] TCP port monitoring
- [ ] DNS record monitoring
- [ ] Multi-user with team invites
- [ ] SLA reporting (weekly uptime PDF)
- [ ] Stripe billing (Starter: 5 monitors $9/mo, Pro: 25 monitors $29/mo)
- [ ] Hosted version at statuspingapp.com

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 11, PHP 8.3 |
| Queue | Laravel Horizon + Redis |
| Database | MySQL 8 |
| Real-time | Node.js + Socket.io |
| Frontend | React + Recharts |
| Container | Docker Compose |

---

## 📄 License

MIT — free to use, fork, and deploy.
