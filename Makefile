.PHONY: dev frontend test lint docker clean install help

# ============================================================
# Analisis de Sentimientos — IMDb Movie Reviews
# ============================================================

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# --- Development -----------------------------------------------------------

dev: ## Start FastAPI backend (uvicorn, reload)
	cd backend && uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

frontend: ## Start Angular dev server
	cd frontend && npm start

install: ## Install all dependencies (pip + npm)
	pip install -r requirements.txt
	cd frontend && npm ci

# --- Quality ---------------------------------------------------------------

test: ## Run all tests (backend pytest + frontend karma)
	cd backend && python -m pytest -v --tb=short
	cd frontend && npx ng test --watch=false --browsers=ChromeHeadless

lint: ## Run linters (flake8 + ng lint)
	cd backend && python -m flake8 .
	cd frontend && npx ng lint 2>/dev/null || echo "Angular lint not configured — skipping"

# --- Docker ----------------------------------------------------------------

docker: ## Start full stack via Docker Compose
	docker compose up --build -d

docker-down: ## Stop Docker Compose services
	docker compose down

# --- Cleanup ---------------------------------------------------------------

clean: ## Remove build artifacts, caches, coverage
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name node_modules -prune -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/dist backend/.coverage coverage.xml htmlcov
	@echo "Cleaned."
