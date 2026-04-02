.PHONY: install install-worker install-pages dev dev-pages dev-worker build build-pages build-worker db-migrate-local deploy-pages deploy-worker

# Kurulum Kuralları
install:
	npm install

install-worker:
	cd worker && npm install

install-pages:
	cd pages && npm install

# Geliştirici Ortamı Kuralları (Dev)
dev:
	npx concurrently "make dev-worker" "make dev-pages"

dev-pages:
	npm run dev -w portfolio-react

dev-worker:
	npm run dev -w portfolio-worker

# Derleme Kuralları (Build)
build: build-worker build-pages

build-pages:
	npm run build -w portfolio-react

build-worker: install-worker
	npm run build -w portfolio-worker

# Veritabanı (NeonDB) Göç Kuralı
db-migrate-local:
	npm run db:migrate -w portfolio-worker

# Dağıtım Kuralları (Deploy - Cloudflare Pages / Workers)
deploy-pages: build-pages
	npx wrangler pages deploy pages/dist --project-name portfolio-react

deploy-worker: build-worker
	npx wrangler deploy -c worker/wrangler.toml
