.PHONY: install install-pages install-worker dev dev-pages dev-worker build build-pages build-worker db-push db-studio

# ==========================================
# 📦 KURULUM KOMUTLARI (INSTALL)
# ==========================================

# Her iki projenin bağımlılıklarını kurar
install: install-pages install-worker

install-pages:
	@echo "==> Frontend (Pages) paketleri kuruluyor..."
	cd pages && npm install

install-worker:
	@echo "==> Backend (Worker) paketleri kuruluyor..."
	cd worker && npm install


# ==========================================
# 🚀 GELİŞTİRME KOMUTLARI (DEV)
# ==========================================

dev:
	npx concurrently "make dev-pages" "make dev-worker"

# Frontend uygulamasını ayağa kaldırır (React/Vite)
dev-pages:
	@echo "==> Frontend (Pages) geliştirme sunucusu başlatılıyor..."
	cd pages && npm run dev

# Backend worker uygulamasını lokalde ayağa kaldırır (Wrangler/Hono)
dev-worker:
	@echo "==> Backend (Worker) yerel sunucusu başlatılıyor..."
	cd worker && npm run dev


# ==========================================
# 🔨 DERLEME KOMUTLARI (BUILD)
# ==========================================

# Her iki projeyi canlıya hazır hale getirir
build: build-pages build-worker

# Frontend için production bundle oluşturur
build-pages:
	@echo "==> Frontend derleniyor..."
	cd pages && npm run build

# Cloudflare Worker'ı Cloudflare ağına dağıtır (deploy)
# *Not: Wrangler login işlemi gerektirir
build-worker:
	@echo "==> Backend Worker Cloudflare'e deploy ediliyor..."
	cd worker && npm run deploy


# ==========================================
# 🗄️ VERİTABANI KOMUTLARI (DB)
# ==========================================

# Şema değişikliklerini veritabanına uygular
db-push:
	@echo "==> Veritabanı şeması NeonDB'ye yükleniyor..."
	cd worker && npm run db:push

# Veritabanını görsel bir arayüzle izlemek/düzenlemek için Drizzle Studio açar
db-studio:
	@echo "==> Drizzle Studio tarayıcıda başlatılıyor..."
	cd worker && npm run db:studio
