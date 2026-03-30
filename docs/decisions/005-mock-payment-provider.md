# ADR-005: Mock Payment Provider for MVP

## Status
Accepted

## Context
No real payment provider (Razorpay, Stripe) integration is needed for development and demo purposes. We need to simulate the redirect → callback flow with controllable error rates.

## Decision
Payment-service includes a **mock payment provider** endpoint that:
1. Accepts a redirect from the frontend
2. Shows a "Processing Payment..." page
3. After 2 seconds, calls back the webhook endpoint
4. Returns success 98% of the time, failure 2% of the time (random)

## Consequences
- Full end-to-end checkout flow can be tested without real money
- 2% error rate allows testing of payment failure → retry UX
- Easy to swap for a real provider later by changing the redirect URL and webhook handler
