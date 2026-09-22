.PHONY: setup dev infra migrate seed build test

setup:
	cp -n .env.example .env || true
	npm install
	docker compose up -d
	npm run db:migrate
	npm run db:seed

dev:
	npm run dev

infra:
	docker compose up -d

migrate:
	npm run db:migrate

seed:
	npm run db:seed

build:
	npm run build

test:
	npm run test
