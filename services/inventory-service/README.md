SwasthKart – Inventory Service (Production-Ready Notes)

Overview

Inventory Service is a Spring Boot (Java 17) microservice responsible
for: - Stock availability lookup - Reservation creation - Reservation
cancellation - Delivery-type logic (INSTANT / SCHEDULED) - Health
endpoint via Actuator - OpenAPI contract export

Architecture Decisions

1.  Clean layered design:

    -   Controller
    -   Service
    -   Repository
    -   Entity
    -   Config (exception handling)

2.  Database migrations via Flyway

    -   Versioned SQL under:
        src/main/resources/db/migration/V1__init.sql

3.  Environment-based configuration: DATABASE_URL DB_USER DB_PASSWORD
    PORT

4.  Hibernate validation mode: ddl-auto: validate (schema must exist)

5.  OpenAPI contract frozen: Exported from:
    http://localhost:8082/v3/api-docs Versioned under:
    contracts/rest/openapi/inventory-service.openapi.v1.yaml

Database Setup

Local Postgres container required (separate from catalog):

docker run –name inventory-db -e POSTGRES_USER=postgres -e
POSTGRES_PASSWORD=postgres -e POSTGRES_DB=inventory -p 5433:5432 -d
postgres:15

Run locally: mvn spring-boot:run

Production Readiness Steps Completed

-   Java runtime pinned to JDK 17 (LTS)
-   Maven configured explicitly
-   Flyway migrations configured correctly
-   Reservation transactional logic implemented
-   Proper validation and error handling added
-   Actuator health endpoint enabled
-   OpenAPI contract frozen

Issues Faced and Fixes

1.  Maven using wrong JDK (Java 25)
    -   Set JAVA_HOME explicitly to Java 17
    -   Updated PATH ordering
2.  Flyway “Unsupported Database” error
    -   Added flyway-database-postgresql dependency
3.  Flyway “No migrations found”
    -   Ensured migration file path is: src/main/resources/db/migration/
    -   Verified resource packaging via Maven
4.  Hibernate schema validation failure
    -   Ensured migration executed before validation
5.  Spring @RequestParam reflection issue
    -   Explicitly named parameters in annotation
6.  Browser URL encoding issue (%22)
    -   Identified trailing encoded quote in query parameter

Current Status

Inventory Service is production-ready at MVP level.
