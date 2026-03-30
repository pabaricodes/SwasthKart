.PHONY: up down build test seed smoke-test smoke clean

# Start all services and infrastructure
up:
	docker-compose up -d

# Stop everything
down:
	docker-compose down

# Build all Docker images
build:
	docker-compose build

# Run tests for all services
test:
	@echo "=== Identity Service ==="
	cd services/identity-service && npm test
	@echo "=== Catalog Service ==="
	cd services/catalog-service && python -m pytest tests/
	@echo "=== Inventory Service ==="
	cd services/inventory-service && ./mvnw test
	@echo "=== Cart Service ==="
	cd services/cart-service && npm test
	@echo "=== Payment Service ==="
	cd services/payment-service && npm test
	@echo "=== Order Service ==="
	cd services/order-service && npm test
	@echo "=== Delivery Service ==="
	cd services/delivery-service && npm test
	@echo "=== BFF Gateway ==="
	cd services/bff-gateway && npm test
	@echo "=== Frontend ==="
	cd frontend && npm test

# Seed development data
seed:
	./scripts/seed-data.sh

# Run smoke tests against running services
smoke-test:
	./scripts/smoke-test.sh

# Convenience: bring up, wait, migrate, seed, test
smoke: up
	@echo "Waiting for services to start..."
	@sleep 30
	$(MAKE) seed
	$(MAKE) smoke-test

# Clean all build artifacts and containers
clean:
	docker-compose down -v --remove-orphans
	rm -rf services/*/node_modules services/*/dist
	rm -rf services/catalog-service/.venv
	rm -rf services/inventory-service/target
	rm -rf frontend/node_modules frontend/dist
