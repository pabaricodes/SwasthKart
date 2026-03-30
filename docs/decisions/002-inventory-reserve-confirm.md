# ADR-002: Stateful Reserve-and-Confirm Inventory Model

## Status
Accepted

## Context
Two models were considered:
1. **Validate-only**: Check stock at cart time, deduct on order creation. Risk: two users can check out the same last item simultaneously.
2. **Reserve-and-confirm**: Reserve stock at checkout, confirm after payment, release on failure/timeout.

## Decision
Use the **reserve-and-confirm** model with a 10-minute TTL on reservations.

## Consequences
- No double-blocks: once reserved, stock is locked for that user
- Stale reservations auto-expire via a scheduled cleanup job
- Optimistic locking on `inventory_items.version` prevents race conditions
- Slightly more complex but eliminates overselling
