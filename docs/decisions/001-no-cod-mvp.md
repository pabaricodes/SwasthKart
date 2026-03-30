# ADR-001: No Cash on Delivery for MVP

## Status
Accepted

## Context
The entire checkout flow is built around a payment-first model: the frontend redirects to a payment provider, and the `PaymentSucceeded` Kafka event triggers order creation in order-service. COD would require an alternative order creation path that bypasses payment entirely.

## Decision
Cash on Delivery is **not supported** in the MVP release.

## Consequences
- Simpler order flow — single path through payment → order → delivery
- All orders have a confirmed payment before creation
- COD can be added later as a separate checkout path if needed
