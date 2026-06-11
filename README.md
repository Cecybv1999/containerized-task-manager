# Task Manager — Containerized Microservices

A production-grade 3-tier application demonstrating Docker containerization, service orchestration with Docker Compose, CI/CD with GitHub Actions, health checks, and logging.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend  │────▶│   Backend    │────▶│  PostgreSQL  │
│  React/Nginx│     │ Node.js API  │     │   Database   │
│  Port 3000  │     │  Port 3001   │     │  Port 5432   │
└─────────────┘     └──────────────┘     └──────────────┘
```

### Services

| Service | Image | Description |
|---------|-------|-------------|
| `frontend` | `node:20-alpine` → `nginx:1.25-alpine` | React SPA, multi-stage build |
| `backend` | `node:20-alpine` | Express REST API with pg driver |
| `postgres` | `postgres:16-alpine` | Persistent relational database |

## Quick Start

### Prerequisites
- Docker Desktop 24+ (with Compose v2)
- Git

### Run locally

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/containerizedmicroservices.git
cd containerizedmicroservices

# Copy environment file
cp .env.example .env

# Build and start all services
docker compose up --build

# Access the app
open http://localhost:3000          # Task Manager UI
```

### Production (no dev hot-reload)

```bash
docker compose -f docker-compose.yml up --build -d
```

### Stop everything

```bash
docker compose down          # stops containers
docker compose down -v       # stops + removes volumes (wipes DB)
```

## API Reference

Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tasks` | List tasks (query: `completed`, `priority`, `limit`, `offset`) |
| `GET` | `/tasks/:id` | Get single task |
| `POST` | `/tasks` | Create task |
| `PATCH` | `/tasks/:id` | Update task fields |
| `DELETE` | `/tasks/:id` | Delete task |
| `GET` | `/health` | Health check (DB connectivity) |

### Example: Create a task

```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Deploy to production", "priority": "high"}'
```

## Key Docker Concepts Demonstrated

### Multi-stage builds
Each Dockerfile uses staged builds to keep production images lean:
- `deps` stage installs only production dependencies
- `builder` stage compiles the frontend
- `production` stage copies only the compiled artifacts

### Health checks
Every service defines a `HEALTHCHECK` instruction and Docker Compose uses `condition: service_healthy` to ensure dependent services only start once dependencies are ready.

### Restart policies
All services use `restart: unless-stopped` so containers recover from crashes automatically.

### Network isolation
Two isolated bridge networks limit blast radius:
- `backend-net` — PostgreSQL ↔ API
- `frontend-net` — API ↔ Nginx proxy

### Persistent volumes
Named volumes (`postgres_data`) survive container restarts without bind-mounting host directories.

### Non-root user
The backend production image creates and runs as a dedicated `appuser` account.

## CI/CD Pipeline

`.github/workflows/ci-cd.yml` runs on every push:

1. **Test** — spins up a real PostgreSQL service container and runs the API test suite
2. **Build & Push** — builds multi-arch images and pushes to GitHub Container Registry (GHCR)
3. **Security scan** — runs Trivy against the production image and uploads SARIF results to GitHub Security

## Service Dependencies

```
frontend  →  backend  →  postgres
```
