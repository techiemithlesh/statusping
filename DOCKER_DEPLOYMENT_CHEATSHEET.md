# 🐳 Docker & Deployment Cheatsheet

---

## 📦 DOCKER BASICS

### Images
```bash
# Build image
docker build -t myapp:1.0 .
docker build -f Dockerfile.prod -t myapp:prod .

# List images
docker images
docker images --filter "dangling=true"

# Pull/Push
docker pull nginx:latest
docker push myregistry/myapp:1.0

# Remove images
docker rmi myapp:1.0
docker rmi $(docker images -q)  # Remove all

# Tag image
docker tag myapp:latest myregistry/myapp:1.0
```

### Containers
```bash
# Run container
docker run -d --name myapp -p 8080:3000 myapp:1.0
docker run -it ubuntu bash               # Interactive
docker run --rm myapp:1.0                # Auto-remove on exit

# List containers
docker ps                   # Running only
docker ps -a               # All containers
docker ps -q               # Only IDs

# Stop/Start/Remove
docker stop myapp
docker start myapp
docker restart myapp
docker rm myapp
docker rm $(docker ps -aq) # Remove all

# View logs
docker logs myapp
docker logs -f myapp       # Follow logs
docker logs --tail 50 myapp
docker logs --since 1h myapp
```

---

## 🔗 DOCKER COMPOSE

### Essential Commands
```bash
# Start services
docker compose up                    # Foreground
docker compose up -d                 # Background
docker compose up --pull always      # Update images first
docker compose up --build            # Rebuild images

# Stop services
docker compose down                  # Stop & remove containers
docker compose down -v               # Also remove volumes
docker compose stop                  # Stop (keep containers)
docker compose start                 # Resume stopped services

# View status
docker compose ps
docker compose logs
docker compose logs -f service_name
docker compose logs --tail 50 service_name

# Execute commands
docker compose exec myapp bash       # Shell in running container
docker compose exec myapp npm test

# Scale services
docker compose up -d --scale web=3   # Run 3 instances
```

### Compose File Example
```yaml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    volumes:
      - ./src:/app/src        # Development
    depends_on:
      db:
        condition: service_healthy
    
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db_data:
```

---

## 🏗️ DOCKERFILE BEST PRACTICES

### Multi-Stage Build (Go)
```dockerfile
# Build stage
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o app .

# Runtime stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/app .
EXPOSE 8080
CMD ["./app"]
```

### Node.js Production
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

USER node

EXPOSE 3000
CMD ["npm", "start"]
```

### Python
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["gunicorn", "app:app"]
```

### Key Practices
```dockerfile
# ✅ DO
FROM alpine:latest           # Minimal base image
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/cache/apt/*  # Chain & cleanup
COPY --chown=app:app . .    # Set ownership
USER app                     # Don't run as root
HEALTHCHECK --interval=30s \
  CMD curl -f http://localhost/ || exit 1

# ❌ DON'T
FROM ubuntu:latest           # Too large
RUN apt-get update
RUN apt-get install curl     # Separate layers
COPY . .
# Runs as root by default
```

---

## 🔒 SECURITY & OPTIMIZATION

### Image Optimization
```bash
# Multi-stage build
docker build --target runtime -t myapp:prod .

# Build cache
docker build --no-cache -t myapp:latest .

# Squash layers (experimental)
docker build --squash -t myapp:latest .

# Scan for vulnerabilities
docker scan myapp:latest
docker scout cves myapp:latest
```

### .dockerignore
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.DS_Store
dist
build
coverage
```

### Secrets Management
```bash
# Environment variables (not secrets!)
docker run -e DB_PASSWORD=secret myapp

# Environment file
docker run --env-file .env myapp

# Compose env file
# .env file
DB_PASSWORD=secret
API_KEY=key123

# docker-compose.yml
environment:
  - DB_PASSWORD=${DB_PASSWORD}

# Docker secrets (Swarm/K8s)
echo "secret_value" | docker secret create my_secret -
docker service create --secret my_secret myapp
```

### Network Security
```bash
# Create custom network
docker network create mynet
docker run --network mynet myapp

# Restrict ports
docker run -p 127.0.0.1:8080:3000 myapp  # Localhost only

# View network
docker network inspect mynet
```

---

## 📊 MONITORING & DEBUGGING

### Resource Usage
```bash
# Container stats
docker stats                 # Live view
docker stats --no-stream     # One snapshot
docker stats myapp           # Single container

# Check memory/CPU
docker inspect myapp | grep -A 20 HostConfig

# Disk usage
docker system df
docker system df -v
```

### Logs
```bash
# Timestamps
docker logs -t myapp

# Filter by time
docker logs --since 2h myapp
docker logs --until 30m ago myapp

# JSON logs
docker logs --follow myapp

# Save logs
docker logs myapp > logs.txt 2>&1
```

### Inspect/Debug
```bash
# Container details
docker inspect myapp
docker inspect myapp | grep IPAddress
docker inspect myapp | grep Env

# Port mappings
docker port myapp

# Top processes
docker top myapp

# Diff (changes)
docker diff myapp
```

---

## 🚀 DEPLOYMENT STRATEGIES

### Blue-Green Deployment
```bash
# Run new version (green)
docker compose up -d app-green

# Test green version
curl localhost:9001

# Switch traffic
docker compose down app-blue
docker compose up -d app-green

# Or use Nginx reverse proxy to toggle
```

### Canary Deployment
```yaml
version: '3.9'
services:
  app-stable:
    image: myapp:1.0
    ports:
      - "8080:3000"
    deploy:
      replicas: 3

  app-canary:
    image: myapp:1.1
    ports:
      - "8081:3000"
    deploy:
      replicas: 1

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
    depends_on:
      - app-stable
      - app-canary
```

### Rolling Update
```bash
# Compose with restart policy
services:
  app:
    restart_policy:
      condition: on-failure
      delay: 5s
      max_attempts: 3

# Gradual restart
for i in {1..3}; do
  docker compose up -d --no-deps --build app
  sleep 30
done
```

---

## 🔄 CI/CD INTEGRATION

### GitHub Actions
```yaml
name: Build & Deploy
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build image
        run: |
          docker build -t myapp:${{ github.sha }} .
          docker tag myapp:${{ github.sha }} myapp:latest
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | \
            docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push myapp:${{ github.sha }}
      
      - name: Deploy
        run: |
          ssh user@server 'cd /app && \
            docker pull myapp:latest && \
            docker compose up -d'
```

### GitLab CI
```yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - docker compose pull
    - docker compose up -d
  only:
    - main
```

---

## 🌐 PRODUCTION DEPLOYMENT

### Server Setup
```bash
# SSH to server
ssh user@server

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone repo
git clone https://github.com/user/repo.git
cd repo

# Set environment
cp .env.example .env
# Edit .env with secrets
```

### Health Checks
```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Logging & Monitoring
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    
    # Or use Docker logging drivers
    # driver: "awslogs"
    # driver: "splunk"
```

### Backup Strategy
```bash
# Backup volumes
docker run --rm -v myapp_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/data-backup.tar.gz -C /data .

# Backup database
docker compose exec db pg_dump -U user dbname > backup.sql

# Restore
docker compose exec -T db psql -U user dbname < backup.sql
```

---

## 📋 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Container won't start | `docker logs <container>` check for errors |
| Port already in use | `docker port <container>` or change mapping |
| Out of disk space | `docker system prune -a --volumes` |
| High memory usage | `docker stats` find culprit, increase limit |
| Container networking | Check `docker network inspect` settings |
| Permissions denied | Add user to docker group or use `sudo` |
| Image pull fails | Check credentials, registry URL, network |
| Build fails | `docker build --progress=plain` for verbose |

---

## 🎯 QUICK REFERENCE

### Essential Flags
```bash
-d              # Detached (background)
-it             # Interactive + TTY
-p HOST:CONT    # Port mapping
-e VAR=value    # Environment variable
-v HOST:CONT    # Volume mount
--name          # Container name
--rm            # Auto-remove on exit
-f              # Follow/force
--network       # Custom network
--restart       # Restart policy (always, unless-stopped)
```

### Common Patterns
```bash
# Development watch mode
docker compose watch

# Run one-off command
docker compose run --rm app npm test

# Interactive shell
docker compose exec app bash

# Force recreate
docker compose up -d --force-recreate

# Rebuild without cache
docker compose build --no-cache

# Clean everything
docker system prune -a --volumes
```

---

**Last Updated:** Oct 2026 | Docker v27+ | Compose v2.20+
