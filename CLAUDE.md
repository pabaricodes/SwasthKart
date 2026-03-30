# SwasthKart

Health-food e-commerce platform with microservices architecture.

## Architecture

- **Frontend**: React SPA (Vite + TypeScript + React Query + Zustand + Tailwind)
- **BFF Gateway**: Node.js + Express + TypeScript — aggregates backend calls, manages JWT cookies
- **Backend Services**: 7 microservices (identity, catalog, inventory, cart, payment, order, delivery)
- **Databases**: Self-hosted Postgres per service + Redis for cart sessions
- **Event Bus**: Self-hosted Kafka (topics: payment.succeeded, order.placed, order.handed-off)
- **Hosting**: AWS — EKS for backend, S3 + CloudFront for frontend

## Tech Stack by Service

| Service | Language | Framework | DB | ORM/Migrations |
|---------|----------|-----------|-----|----------------|
| identity-service | TypeScript | Express | Postgres | Prisma |
| catalog-service | Python | FastAPI | Postgres | SQLAlchemy + Alembic |
| inventory-service | Java 17 | Spring Boot 3 | Postgres | JPA + Flyway |
| cart-service | TypeScript | Express | Postgres | Prisma |
| payment-service | TypeScript | Express | Postgres | Prisma |
| order-service | TypeScript | Express | Postgres | Prisma |
| delivery-service | TypeScript | Express | Postgres | Prisma |
| bff-gateway | TypeScript | Express | None | — |
| admin-service | TypeScript | Express | None | — |

## Conventions

- All monetary values in **paise** (integer, no floats)
- UUIDs for all entity IDs
- Standard error envelope: `{ error: { code, message, details } }`
- Standard pagination: `{ data: [...], pagination: { page, page_size, total_count, total_pages } }`
- Health endpoints: `/health/live` and `/health/ready` on every service
- JWT: 1hr expiry, HttpOnly cookie via BFF, payload: { user_id, phone_masked, role, iat, exp }
- Structured JSON logging (pino for Node, structlog for Python, logback for Java)

## Key Commands

```bash
make up          # Start all services locally via docker-compose
make down        # Stop all services
make build       # Build all Docker images
make test        # Run all service tests
make seed        # Seed catalog and inventory data
```

## Directory Layout

- `/contracts` — OpenAPI, gRPC proto, Avro event schemas (source of truth)
- `/services` — Microservice source code
- `/frontend` — React SPA
- `/infra/terraform` — AWS infrastructure as code
- `/infra/k8s` — Kubernetes manifests
- `/scripts` — Deploy and seed scripts
- `/docs` — Requirement docs and ADRs
