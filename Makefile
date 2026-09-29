.PHONY: install dev dev-web dev-api dev-pages dev-worker build build-web build-api build-pages build-worker test test-web test-api db-migrate-local db-push deploy-web deploy-api deploy-pages deploy-worker clean

# Kurulum
install:
	npm install

# Geliştirici Ortamı (Development)
dev:
	npm run dev

dev-web:
	npm run dev:web

dev-api:
	npm run dev:api

# Geriye dönük uyumluluk takma adları (Aliases)
dev-pages: dev-web
dev-worker: dev-api

# Derleme (Build)
build:
	npm run build

build-web:
	npm run build:web

build-api:
	npm run build:api

build-pages: build-web
	@node scripts/sync-build.cjs
build-worker: build-api

# Testler (Vitest & Testing Library)
test:
	npm run test

test-web:
	npm run test:web

test-api:
	npm run test:api

# Veritabanı (Neon Serverless PostgreSQL - Drizzle Migration)
db-migrate-local:
	npm run db:migrate -w portfolio-worker

db-push:
	npm run db:push -w portfolio-worker

# Dağıtım (Deploy - Cloudflare Pages / Workers)
deploy-web: build-web
	npx wrangler pages deploy apps/web/dist --project-name portfolio-react

deploy-api: build-api
	npx wrangler deploy -c apps/api/wrangler.toml

deploy-pages: deploy-web
deploy-worker: deploy-api

# Temizlik
clean:
	npm run clean
