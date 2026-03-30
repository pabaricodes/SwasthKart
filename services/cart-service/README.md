# Cart Service

Production-ready Cart microservice (Node.js + TypeScript + Express + Prisma + Postgres).

## What it does
- Creates carts
- Adds/updates/removes items
- Validates stock with Inventory
- Pulls product pricing/name/currency from Catalog
- Computes totals
- Supports idempotency on mutation endpoints

## Endpoints
Base: `/v1/carts`
- POST `/v1/carts`
- GET `/v1/carts/:cartId`
- POST `/v1/carts/:cartId/items` (Idempotency-Key supported)
- PUT `/v1/carts/:cartId/items/:sku` (Idempotency-Key supported)
- DELETE `/v1/carts/:cartId/items/:sku`
- POST `/v1/carts/:cartId/clear`
- POST `/v1/carts/:cartId/checkout`

Health:
- GET `/health/live`
- GET `/health/ready`

## Run locally
1) `cp .env.example .env` and update values
2) `docker compose up --build`
3) Migrate DB (first time):
   - `npm i`
   - `npx prisma generate`
   - `npx prisma migrate dev`

## Notes
- Request correlation: we **propagate** `x-request-id` if present; otherwise we generate one.
  In production, your API gateway/BFF should generate and propagate it.
