# 🚀 Onur Dursun — Full Stack Portfolio Monorepo

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Hono.js](https://img.shields.io/badge/Hono-4.x-E36002?style=flat-square&logo=hono&logoColor=white)](https://hono.dev/)
[![Neon Database](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Resend](https://img.shields.io/badge/Resend-Email_API-000000?style=flat-square&logo=resend&logoColor=white)](https://resend.com/)
[![Vitest](https://img.shields.io/badge/Vitest-64_Tests_Passing-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

Modern, yüksek performanslı, kurumsal standartlarda tasarlanmış **Full Stack Portfolyo Monorepo** projesi. Uç noktalarda (Edge) çalışan sunucusuz API mimarisi, gerçek zamanlı veritabanı, 4 farklı interaktif UI sürümü, şifresiz geçici parola (OTP) doğrulaması ve uçtan uca test otomasyonunu bir araya getirir.

---

## 🏛️ Mimari ve Klasör Yapısı (Monorepo Standardı)

Proje, endüstri standardı `apps/*` monorepo yapısına göre ayrıştırılmıştır:

```text
Portfolio-with-react/
├── apps/
│   ├── web/                        # 🌐 Frontend Web Uygulaması (React 18 + Vite + Tailwind CSS)
│   │   ├── src/
│   │   │   ├── Components/         # React bileşenleri (Spotlight Showcase, Oyunlar, Modallar)
│   │   │   │   └── Version4/       # ✨ Ultra-Canlı Cyber-Modern UI (Parçacık ağı, Bento Grid, Kod Terminali)
│   │   │   ├── contexts/           # React Context (AuthContext [OTP], UiVersionContext [Flicker-Free])
│   │   │   ├── locales/            # Çoklu dil destek dosyaları (TR & EN - i18next)
│   │   │   ├── pages/              # Sayfalar (Login [OTP], Register, AdminPanel, BlogList, BlogPost)
│   │   │   ├── test/               # Test konfigürasyonu ve setup dosyaları (setup.ts)
│   │   │   └── lib/                # API istemcisi, markdown ve yardımcı fonksiyonlar
│   │   ├── public/                 # Favicon (organik amblem), ses efektleri ve statik varlıklar
│   │   ├── vite.config.js          # Vite derleyici yapılandırması
│   │   ├── vitest.config.js        # Vitest frontend test yapılandırması (JSDOM ortamı)
│   │   └── package.json            # @portfolio/web bağımlılıkları ve betikleri
│   │
│   └── api/                        # ⚡ Backend Edge API (Cloudflare Workers + Hono + Neon DB)
│       ├── src/
│       │   ├── db/                 # Drizzle ORM şeması (schema.ts) ve Neon bağlantı istemcisi
│       │   ├── lib/                # Resend E-posta servisi (email.ts) [admin@onurd.com.tr]
│       │   ├── middleware/         # JWT kimlik doğrulama, HttpOnly cookie ve yetki kontrolleri
│       │   ├── routes/             # Hono rotaları (auth, portfolio, contact, settings, timeline, blog)
│       │   └── index.ts            # Worker ana giriş noktası
│       ├── wrangler.toml           # Cloudflare Worker ortam ve dağıtım ayarları
│       ├── vitest.config.ts        # Vitest backend test yapılandırması (Node ortamı)
│       └── package.json            # @portfolio/api bağımlılıkları ve betikleri
│
├── Makefile                        # Tek komutla yönetim (dev, build, test, deploy, migrate)
├── package.json                    # Kök monorepo yapılandırması (apps/* çalışma alanları)
├── package-lock.json               # Bağımlılık kilit dosyası
└── README.md                       # Proje dokümantasyonu
```

---

## 🌟 Öne Çıkan Özellikler

1. **Şifresiz 10 Dakikalık Geçici Parola (OTP) Girişi:**
   - Statik şifreler tamamen kaldırılmıştır. Kullanıcı veya admin yalnızca e-postasını girer.
   - Resend API üzerinden `admin@onurd.com.tr` göndericisiyle 6 haneli güvenli kod ve 10 dakikalık geri sayım sayacı çalışır.
   - Tek kullanımlık güvenlik: Başarılı girişte kod veritabanında derhal geçersiz kılınır.

2. **Dinamik UI Sürümleme (Zero Flicker):**
   - Sayfa yenilendiğinde sürüm 1'in görünüp ardından seçili sürüme geçmesi (flicker/flash) senkron `localStorage` önbelleklemesiyle kalıcı olarak çözülmüştür.
   - **Sürüm 1:** Klasik & Sade Portfolyo.
   - **Sürüm 2:** İnteraktif Web Linux Masaüstü.
   - **Sürüm 3:** CyberDeck HUD Arayüzü.
   - **Sürüm 4:** Ultra-Canlı Cyber-Modern (İnteraktif parçacık tuvali, daktilo unvanlar, canlı kod terminali sekmeleri, Bento mimari matrisi).

3. **Mobil Dokunmatik (Touch Swipe) Desteği:**
   - Öne çıkan projeler vitrininde parmakla sağa/sola kaydırarak akıcı şekilde slayt geçişi yapılabilir (`touchAction: 'pan-y'`).

4. **Admin Panelinden Anasayfa Görünürlük Kontrolü:**
   - Projeler admin panelinden tek tıkla anasayfada gösterilebilir veya gizlenebilir (`showOnHome: boolean`).

5. **Çalışan İletişim API'si (Contact):**
   - `POST /api/contact` üzerinden gelen mesajlar Neon PostgreSQL veritabanına kaydedilir ve `admin@onurd.com.tr` üzerinden bildirim e-postası iletilir.

6. **Kapsamlı Test Otomasyonu (Vitest & Testing Library):**
   - 16 test dosyası, **64 detaylı test senaryosu** (%100 geçme oranı).

---

## 🛠️ Kurulum ve Başlangıç

### Gereksinimler
- **Node.js:** v18 veya üzeri (Önerilen: v22+)
- **npm:** v9 veya üzeri

### 1. Depoyu Klonlayın ve Bağımlılıkları Yükleyin
```bash
git clone https://github.com/onurdrsn/Portfolio-with-react.git
cd Portfolio-with-react
make install
# veya: npm install
```

### 2. Ortam Değişkenleri Yapılandırması
`apps/api/.dev.vars` dosyasını oluşturun (yerel geliştirme için):
```env
DATABASE_URL="postgres://kullanici:sifre@ep-xyz.neon.tech/neondb?sslmode=require"
RESEND_API_KEY="re_123456789"
RESEND_FROM="Onur Dursun <admin@onurd.com.tr>"
CONTACT_EMAIL="admin@onurd.com.tr"
JWT_SECRET="guclu-jwt-gizli-anahtari"
REFRESH_TOKEN_SECRET="guclu-refresh-gizli-anahtari"
FRONTEND_URL="http://localhost:5173"
```

---

## ⚡ Çalıştırma ve Geliştirme Komutları

Monorepo kök dizininde `Makefile` veya standart `npm` komutlarını kullanabilirsiniz:

| İşlem | Make Komutu | npm Komutu | Açıklama |
|---|---|---|---|
| **Tümünü Başlat** | `make dev` | `npm run dev` | API ve Web uygulamalarını eşzamanlı başlatır |
| **Sadece Web Başlat** | `make dev-web` | `npm run dev:web` | React + Vite frontend uygulamasını açar (port 5173) |
| **Sadece API Başlat** | `make dev-api` | `npm run dev:api` | Cloudflare Worker API'yi başlatır (port 8787) |
| **Tümünü Derle** | `make build` | `npm run build` | Hem backend hem frontend'i derler |
| **Tüm Testleri Çalıştır**| `make test` | `npm run test` | Vitest ile 64 testi birden koşar |
| **Web Testlerini Çalıştır**| `make test-web`| `npm run test:web`| Frontend React Testing Library testlerini koşar |
| **API Testlerini Çalıştır**| `make test-api`| `npm run test:api`| Backend Hono/Worker testlerini koşar |
| **Veritabanı Göçü** | `make db-push` | `npm run db:push -w portfolio-worker` | Neon DB şemasını eşitler |

---

## 🧪 Test Stratejisi

Tüm testler Vitest tabanlıdır:

- **Birim (Unit) Testleri:** E-posta şablon oluşturucuları, JWT üretimi/doğrulaması, veri filtreleme algoritmaları.
- **Entegrasyon (Integration) Testleri:** Hono rotalarında `app.request()` ile şifresiz OTP talebi, 10 dakika süre aşımı kontrolü, proje gizleme toggle'ı, iletişim formu doğrulama kuralları.
- **Bileşen & Arayüz Testleri:** Dokunmatik kaydırma simülasyonları (`fireEvent.touchStart` / `touchEnd`), tema ve versiyon değiştiriciler, sayaç geri sayımı, sekme geçişleri.
- **E2E & Router Testleri:** Blog içeriklerinden geri dönüş rotası (`/blog`), anasayfada `uiVersion` doğrudan render testleri.

Testleri çalıştırmak için:
```bash
make test
```

---

## 🚢 Dağıtım (Deployment)

Cloudflare ekosistemine doğrudan dağıtım yapılabilir:

```bash
# Frontend'i Cloudflare Pages'e dağıtın
make deploy-web

# Backend API'yi Cloudflare Workers'a dağıtın
make deploy-api
```

---

## 👤 Yazar & İletişim

- **Geliştirici:** Onur Dursun
- **Web Sitesi:** [onurd.com.tr](https://onurd.com.tr)
- **E-posta:** [admin@onurd.com.tr](mailto:admin@onurd.com.tr)
- **GitHub:** [@onurdrsn](https://github.com/onurdrsn)
- **LinkedIn:** [in/odursun](https://linkedin.com/in/odursun)

---
*MIT Lisansı ile lisanslanmıştır.*
