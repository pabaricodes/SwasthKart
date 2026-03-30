# ADR-004: JWT Stored in HttpOnly Cookie via BFF

## Status
Accepted

## Context
Frontend needs to authenticate API calls. Options:
1. Store JWT in localStorage — vulnerable to XSS
2. Store JWT in HttpOnly cookie — immune to XSS, requires CSRF consideration
3. In-memory only — lost on page refresh

## Decision
BFF gateway sets an **HttpOnly, Secure, SameSite=Strict** cookie named `swasthkart_token` containing the JWT. Token expiry: 1 hour.

## Consequences
- Frontend never touches the token directly — no XSS risk
- SameSite=Strict mitigates CSRF for same-origin requests
- BFF handles cookie lifecycle (set on login, clear on logout)
- Same CloudFront domain for SPA and API — no cross-origin cookie issues
