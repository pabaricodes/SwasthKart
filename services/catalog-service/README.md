SwasthKart – Catalog Service (Production-Ready Notes)

Overview

Catalog Service is a FastAPI-based microservice responsible for: -
Product listing - Filtering (category, dietType) - Pagination (page,
pageSize, total) - Health endpoint - OpenAPI contract export

Architecture Decisions

1.  Layered architecture:

    -   Router (API layer)
    -   Service (business logic)
    -   Repository (data access)
    -   Config (environment handling)

2.  Environment-based DB config: DATABASE_URL is read from environment
    variables. Fallback provided for local development.

3.  Response shape stabilized:

    -   Wrapped response (page, pageSize, total, items)
    -   Pydantic models used for schema enforcement
    -   No raw DB rows returned

4.  Health endpoint added: GET /api/v1/catalog/health

5.  OpenAPI contract frozen: Exported from /openapi.json and versioned
    under: contracts/rest/openapi/catalog-service.openapi.v1.json

Database Setup

Local Postgres container required.

Example: docker run –name catalog-db -e POSTGRES_USER=postgres -e
POSTGRES_PASSWORD=postgres -e POSTGRES_DB=catalog -p 5432:5432 -d
postgres:15

Run locally: source venv/bin/activate uvicorn src.main:app –reload

Production Readiness Steps Completed

-   Removed hardcoded DB URLs
-   Added pagination with total count
-   Added proper response models
-   Added health endpoint
-   Ensured no circular imports
-   Upgraded Python runtime to stable version (3.12)
-   Frozen OpenAPI contract

Issues Faced and Fixes

1.  Python 3.14 incompatibility with FastAPI/Pydantic
    -   Downgraded to Python 3.12 (stable)
2.  Circular import between service and repository
    -   Removed cross-layer import
3.  Missing init.py in config folder
    -   Added package markers for proper module resolution
4.  VS Code interpreter mismatch
    -   Explicitly selected project venv interpreter
5.  PATH and environment confusion
    -   Clarified separation between shell, PATH, and venv

Current Status

Catalog Service is production-ready at MVP level.
