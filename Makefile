.PHONY: up down logs test lint fmt

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f backend

test:
	cd backend && python -m pytest -v

lint:
	cd backend && ruff check app/ tests/

fmt:
	cd backend && ruff format app/ tests/

typecheck:
	cd backend && mypy app/

migrate:
	cd backend && alembic upgrade head

migration:
	cd backend && alembic revision --autogenerate -m "$(msg)"
