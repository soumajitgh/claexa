# Claexa — Technical Overview

> Last updated: 2025-12-25

This README is a complete technical overview of the Claexa workspace.
It covers architecture, runtime components, configuration, APIs, data flow, deployment, and operational concerns.

---

## 1) What This Project Is

Claexa is an education-focused platform that lets authenticated users generate and manage question papers (and related educational content) via AI.

The workspace contains three primary runtime systems:

- **AI Service (Python, gRPC)**: Generates question papers (and supports health/reflection; image generation is present in the bridge proto).
- **Application Server (NestJS, REST)**: Main backend API for auth, organizations, media, billing/credits/usage tracking, question paper CRUD, exports, and AI generation orchestration.
- **Web App (React + Vite, PWA)**: UI for users to login, generate question papers, manage their papers, and use a studio-like editor.

And one supporting toolbox:

- **Utility Scripts (Python)**: PDF/document indexing pipeline using Gemini + Pinecone + S3.

### 1.1 Repository Layout

- [ai-service/](ai-service/README.md)
- [app-server/](app-server/README.md)
- [web-app/](web-app/README.md)
- [utility-scripts/](utility-scripts/README.md)

---

## 2) High-Level Architecture

### 2.1 Diagrams (link placeholders)

- Architecture diagram: [REPLACE_WITH_LINK](REPLACE_WITH_LINK)
- Generate-with-AI sequence diagram: [REPLACE_WITH_LINK](REPLACE_WITH_LINK)

Suggested diagram content:

- Web App → App Server (REST + Firebase Bearer Auth)
- App Server → AI Service (gRPC)
- App Server → Postgres (TypeORM)
- App Server → Object Storage (S3 / S3Ninja)
- Utility Scripts → Gemini / Pinecone / S3

### 2.2 Runtime Components

#### A) Web App (React + Vite)

- Framework: React (via Vite)
- Auth: Firebase client SDK; token is attached to API requests as `Authorization: Bearer <idToken>`
- Networking: Axios client with interceptors and token refresh behavior
- Routes include:

  - Dashboard
  - Question paper generation
  - Question paper studio/editor
  - Account/org management
  - Legal pages

- PWA: Non-intrusive offline caching and silent updates (see web app README)

#### B) App Server (NestJS)

- Framework: NestJS with Swagger at `/docs`
- Auth: Firebase token guard on protected endpoints
- DB: PostgreSQL via TypeORM
- Storage: S3-compatible storage (real S3 in prod; S3Ninja in dev/test)
- AI integration: gRPC client module (`AiBridgeModule`) calling the AI Service
- Observability: PostHog events for product analytics
- Usage/Credits: Credit system and usage tracking for AI features

#### C) AI Service (Python, gRPC)

- Protocol: gRPC (async server, reflection enabled)
- Default port: `8080`
- Health: gRPC health service + helper script
- Observability: Logfire instrumentation (PydanticAI + HTTPX)
- Responsibilities:

  - Question paper generation: `claexa.ai.QuestionPaperService/Generate`
  - Health check: `claexa.ai.HealthService/Check`

#### D) Utility Scripts (Python)

- Batch pipeline for document ingestion:

  - PDF processing → summary via Gemini → embeddings → Pinecone → upload PDFs to S3

---

## 3) End-to-End Request Flow (Question Paper Generation)

### 3.1 Primary Flow (Generate With AI)

1. User logs in via Firebase in the Web App.
2. Web App calls App Server REST endpoint:

   - `POST /question-papers/generate-with-ai`

3. App Server validates:

   - Firebase auth
   - Authorization policy (CASL-based authorization in server)
   - Usage / credit availability (pre-check)

4. App Server maps the REST payload into the gRPC request schema.
5. App Server calls AI Service gRPC:

   - `claexa.ai.QuestionPaperService/Generate`

6. AI Service generates a structured question paper response.
7. App Server maps AI response → entities → persists to Postgres.
8. App Server calculates image count, re-validates credits with context, records usage.
9. Web App receives `{ id }`, then fetches full paper details by id.

---

## 4) API Surface

### 4.1 App Server (REST)

Swagger UI is exposed at:

- `GET /docs`

Key endpoints (high-level):

- `GET /health` → includes `ai_available` (gRPC health check via bridge)
- `GET /question-papers` → list
- `GET /question-papers/:id` → fetch
- `POST /question-papers` → create blank
- `PATCH /question-papers/:id` → command-router update system
- `DELETE /question-papers/:id` → delete
- `POST /question-papers/generate-with-ai` → generate using AI

Auth:

- All question paper endpoints are guarded by Firebase token guard.

### 4.2 AI Service (gRPC)

Proto package: `claexa.ai`

Core RPCs:

- `QuestionPaperService.Generate(QuestionPaperGenerateRequest) -> QuestionPaperGenerateResponse`
- `HealthService.Check(HealthCheckRequest) -> HealthCheckResponse`

gRPC server details:

- Reflection enabled
- Max send/receive message length: 64MB

---

## 5) Data Model Overview (Conceptual)

> This is a conceptual model derived from server behavior. Exact DB schema lives under the app server entities/migrations.

- **User**: authenticated via Firebase; used for authorization and usage charging
- **QuestionPaper**: has metadata + ordered questions
- **Question**: text + marks + options + optional sub-questions + optional images
- **Media**: stored in S3/S3-compatible storage; referenced by IDs (question images)
- **Usage/Credits**: tracks feature usage and charges

---

## 6) Configuration & Environment Variables

### 6.1 Web App (Vite)

Required:

- `VITE_API_BASE_URL` (defaults to `http://localhost:3000` if not set)
- `VITE_FIREBASE_CONFIG_JSON` (JSON string)

Optional:

- `VITE_PUBLIC_POSTHOG_KEY`
- `VITE_PUBLIC_POSTHOG_HOST`

### 6.2 App Server (NestJS)

Validated via Joi schema in [app-server/src/environment.schema.ts](app-server/src/environment.schema.ts)

Common:

- `NODE_ENV` (`development|staging|production`)
- `PORT` (default `3000`)

Database:

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`

AI Service:

- `AI_SERVICE_URL` (gRPC endpoint used by `Transport.GRPC`)
- `AI_SERVICE_TLS` (boolean)

S3 (required in production):

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`

Payments:

- `CASHFREE_APP_ID`
- `CASHFREE_SECRET_KEY`

Analytics (required in production):

- `POSTHOG_API_KEY`
- `POSTHOG_HOST_URL`

Credits:

- `INITIAL_CREDIT_AMOUNT` (default `100`)
- `CREDIT_THRESHOLD` (default `50`)

### 6.3 AI Service (Python)

From [ai-service/src/config.py](ai-service/src/config.py) and [ai-service/env.example.txt](ai-service/env.example.txt)

- `ENV` (`development|staging|production`)
- `PORT` (default `8080`)

Keys:

- `OPENROUTER_API_KEY` (required by config)
- `GOOGLE_API_KEY` / `GEMINI_API_KEY` (Gemini)
- `GCP_SERVICE_ACCOUNT_JSON` (optional)

AWS:

- `AWS_ACCESS_KEY_ID` (required)
- `AWS_SECRET_ACCESS_KEY` (required)
- `AWS_REGION`
- `AWS_S3_BUCKET_NAME` (required)

Pinecone:

- `PINECONE_API_KEY` (optional)
- `PINECONE_INDEX_NAME` (optional)

---

## 7) Local Development

### 7.1 Start AI Service

From `ai-service/`:

- Install deps: `uv sync`
- Compile protos: `bash scripts/compile_protos.sh`
- Run server: `uv run python -m src.grpc_server`

Health check helper:

- `uv run python scripts/grpc_healthcheck.py` (uses `GRPC_HEALTH_ADDR`, default `localhost:8080`)

### 7.2 Start App Server

From `app-server/`:

- Install deps: `pnpm install`
- Start dev DB + S3 emulator:

  - `pnpm run docker:dev:up`

- Run server:

  - `pnpm run start:dev`

Swagger:

- `http://localhost:3000/docs`

### 7.3 Start Web App

From `web-app/`:

- Install deps: `pnpm install`
- Start dev server:

  - `pnpm run dev`

---

## 8) Deployment

### 8.1 AI Service

- Dockerized Python gRPC service.
- Default port: `8080`
- Notes:

  - The `ai-service/README.md` references a sandbox container approach requiring Docker socket access; ensure the deployment environment supports that if you’re using sandboxed execution.

### 8.2 App Server

- Includes `cloudbuild.yaml` for GCP Cloud Build → Cloud Run deployment.
- Compose files exist for dev/test (Postgres + S3Ninja; test also builds app container).

### 8.3 Web App

- Vite build output; includes PWA assets and Nginx config.
- Suitable for static hosting/CDN.

---

## 9) Security & Compliance Notes

- Authentication is via Firebase ID tokens.
- App Server enforces authorization with an ability/policy system.
- AI Service exposes gRPC reflection; disable reflection in strict production environments if not needed.
- Secrets:

  - `.env` files must not be committed.
  - Prefer managed secrets in production (Cloud Run, Railway, etc.).

---

## 10) Observability

- App Server emits PostHog events (e.g., created/updated/generated question papers).
- AI Service instruments PydanticAI + HTTPX via Logfire.

---

## 11) Demo Video (link placeholder)

- Demo video: [REPLACE_WITH_LINK](REPLACE_WITH_LINK)

Suggested (GitHub-friendly) embed pattern:

```md
[![Claexa Demo](REPLACE_THUMBNAIL_IMAGE_URL)](REPLACE_WITH_LINK)
```

---

## 12) Screenshots (link placeholders)

- Login: [REPLACE_WITH_LINK](REPLACE_WITH_LINK)
- Dashboard: [REPLACE_WITH_LINK](REPLACE_WITH_LINK)
- Question Paper Generate: [REPLACE_WITH_LINK](REPLACE_WITH_LINK)
- Studio Editor: [REPLACE_WITH_LINK](REPLACE_WITH_LINK)

---

## 13) Appendices

### A) gRPC Schemas

- AI Service proto: [ai-service/proto/ai_service.proto](ai-service/proto/ai_service.proto)
- App Server bridge proto: [app-server/src/libs/ai-bridge/proto/claexa_ai.proto](app-server/src/libs/ai-bridge/proto/claexa_ai.proto)

Notes:

- Both define `QuestionPaperService` + `HealthService`.
- The bridge proto also defines `ImageService`.

### B) Common Ports

- Web App (Vite dev): `5173` (default)
- App Server: `3000` (default)
- AI Service: `8080` (default)
- Postgres (dev): `5432`
- Postgres (test): `5433`
- S3Ninja (dev): `9444` → maps to `9000` inside container
- S3Ninja (test): `9445`
