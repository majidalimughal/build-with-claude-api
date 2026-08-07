# build-with-claude-api

NestJS monorepo for AI conversations over Anthropic (and future providers). HTTP clients talk to a thin API gateway; business logic runs in a conversation microservice; provider adapters talk to external AI APIs via RabbitMQ only.

## Architecture

```
HTTP Client
    │
    ▼
api-gateway (HTTP + SSE)
    │ RabbitMQ
    ▼
conversation-service (business logic, Postgres, Redis, provider factory)
    │ RabbitMQ
    ▼
anthropic-service (API key + SDK only, no DB)
    │
    ▼
Anthropic API
```

| Service | Transport | Responsibility |
|---------|-----------|----------------|
| `apps/api-gateway` | HTTP, hybrid RMQ for SSE | Public REST/SSE endpoints |
| `apps/conversation-service` | RabbitMQ | Sessions, audit log, cache, provider factory |
| `apps/anthropic-service` | RabbitMQ only | Thin Anthropic adapter |
| `libs/shared` | — | DTOs, enums, RMQ patterns |
| `libs/database` | — | TypeORM entities and module |

Future providers (e.g. OpenAI) add a new adapter app plus a factory branch in `conversation-service`. The gateway API stays the same.

## Project structure

```
apps/
  api-gateway/           # HTTP entry point
  conversation-service/  # Business logic + Postgres + Redis
  anthropic-service/     # Dumb AI adapter
libs/
  shared/                # Shared contracts
  database/              # TypeORM entities
docker-compose.yml       # Postgres, RabbitMQ, Redis
.env                     # Local configuration (not committed with secrets)
```

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Anthropic API key

## Setup

```bash
npm install
```

Create or edit `.env` at the repo root (see table below). Do not commit secrets.

| Variable | Description |
|----------|-------------|
| `PORT` | Gateway HTTP port (default `3000`) |
| `RABBITMQ_URL` | AMQP connection string |
| `RABBITMQ_QUEUE_*` | Queue names for each service |
| `POSTGRES_*` | Postgres connection (conversation-service) |
| `REDIS_HOST` / `REDIS_PORT` | Redis cache (host port `6380` maps to container `6379`) |
| `ANTHROPIC_API_KEY` | Anthropic key (anthropic-service only) |
| `ANTHROPIC_DEFAULT_MODEL` | Default model (currently `claude-haiku-4-5`) |
| `TYPEORM_SYNC` | `true` in dev to auto-create schema |

## Infrastructure

```bash
npm run docker:up
```

| Service | Host port | Notes |
|---------|-----------|-------|
| Postgres | `5432` | DB `ai_platform`, user/password `app` |
| RabbitMQ | `5672` | AMQP |
| RabbitMQ UI | `15672` | http://localhost:15672 (guest/guest) |
| Redis | `6380` | Mapped from container `6379` |

If RabbitMQ fails to bind ports, stop conflicting containers and run:

```bash
docker compose up -d --force-recreate rabbitmq
```

## Run services

Start infrastructure first, then each app in its own terminal:

```bash
npm run docker:up
npm run start:dev:anthropic
npm run start:dev:conversation
npm run start:dev:gateway
```

Production builds:

```bash
npm run build
npm run start:prod:anthropic
npm run start:prod:conversation
npm run start:prod:gateway
```

## HTTP API

Base URL: `http://localhost:3000`

### Health

```http
GET /health
```

### Stateless conversations

One-shot or custom message arrays without session persistence.

```http
POST /conversations
Content-Type: application/json

{
  "provider": "anthropic",
  "messageType": "one_shot",
  "messages": [{ "role": "user", "content": "Hello" }]
}
```

```http
POST /conversations/stream
Content-Type: application/json
Accept: text/event-stream

{
  "provider": "anthropic",
  "messageType": "stream",
  "messages": [{ "role": "user", "content": "Hello" }]
}
```

`messageType`: `one_shot` | `conversation` | `stream`

### Session-based multi-turn chat

History is stored in Postgres per session.

```http
POST /sessions
Content-Type: application/json

{ "provider": "anthropic", "title": "My chat", "model": "claude-haiku-4-5" }
```

```http
POST /sessions/:id/messages
Content-Type: application/json

{ "content": "Hello" }
```

```http
POST /sessions/:id/messages/stream
Content-Type: application/json

{ "content": "Tell me a short story" }
```

```http
GET /sessions/:id/messages
```

Session chat loads full history from the database, appends the user turn, calls the provider via the factory, and saves the assistant reply. Streamed turns persist the full assistant message when the stream completes.

## Database

| Table | Purpose |
|-------|---------|
| `conversation_sessions` | Chat sessions (`provider`, `model`, `title`) |
| `conversation_messages` | User/assistant messages per session |
| `ai_requests` | Audit log (provider, status, payload hash, timestamps) |

Only `conversation-service` uses Postgres and Redis. `anthropic-service` has no database access.

## RabbitMQ patterns

Defined in `libs/shared/src/constants/rmq-patterns.ts`:

| Pattern | Direction | Purpose |
|---------|-----------|---------|
| `conversation.handle` | gateway → conversation | Stateless request |
| `conversation.stream` | gateway → conversation | Stateless stream start |
| `session.create` | gateway → conversation | Create session |
| `session.getMessages` | gateway → conversation | List session messages |
| `session.sendMessage` | gateway → conversation | Multi-turn sync chat |
| `session.sendMessageStream` | gateway → conversation | Multi-turn stream |
| `anthropic.invoke` | conversation → anthropic | Sync AI call |
| `anthropic.stream` | conversation → anthropic | Stream AI call |
| `ai.stream.*` | anthropic → conversation | Stream chunk/end/error events |
| `conversation.stream.*` | conversation → gateway | SSE relay events |

## Provider factory

The `provider` field in requests routes to the correct adapter:

- `anthropic` → `anthropic-service` (implemented)
- `openai` → stub for future `openai-service`

Business payloads (`ConversationRequestDto`, session DTOs) are mapped to provider-ready `ProviderInvokeDto` before hitting the adapter.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build all apps |
| `npm run start:dev:gateway` | Gateway with watch |
| `npm run start:dev:conversation` | Conversation service with watch |
| `npm run start:dev:anthropic` | Anthropic service with watch |
| `npm run docker:up` / `docker:down` | Start/stop infrastructure |
| `npm test` | Unit tests |
| `npm run lint` | ESLint |

## Postman

Import the collection and local environment from `postman/`:

- `postman/build-with-claude-api.postman_collection.json`
- `postman/local.postman_environment.json`

Folders: **Health**, **Stateless Conversations** (One Shot, Multi-message, Stream), **Sessions** (Session Management, Session Chat).

Run **Create Session** first; it saves `sessionId` for the session chat requests.

## Testing

```bash
npm test
npm run test:cov
```

## License

UNLICENSED (private)
