# BolKese — Kodlama ajanları için çalışma rehberi

## 1. Kapsam ve kaynaklar

BolKese; altın, döviz, Türk lirası ve özel varlık kategorilerini takip eden Türkçe bir portföy uygulamasıdır. Kayıt, giriş, çıkış, kullanıcıya ait varlık yönetimi, portföy özeti ve piyasa fiyatları bulunur. Arayüzdeki “kategori”, veritabanındaki `Asset` kaydıdır; ayrı `Portfolio`, `Category` veya `Transaction` tablosu yoktur.

- İşe ilgili kaynak dosyalarını ve mevcut değişiklikleri inceleyerek başla; kullanıcı değişikliklerini koru.
- Mevcut davranışı kaynak koddan doğrula. `README.md` çalıştırma, `skills.md` tasarım için yardımcı kaynaktır.
- `skills.md` içindeki “backend yok”, “fiyatlar rastgele”, `MARKET_ITEMS` ve “varlıklar yalnızca localStorage'da saklanır” açıklamaları eskidir. Güncel yapı Express/SQLite, altinapi ve `MARKET_WATCHLIST` kullanır. Tasarım önerilerini de kodla karşılaştır.
- Varlıklarım/Piyasalar menüleri ayrı sayfalara yönlendirme yapmaz; seçimi ve bilgilendirme mesajını değiştirir. Mini grafik dekoratiftir, geçmiş fiyat verisi göstermez. Planlanan özellikleri mevcutmuş gibi anlatma.

## 2. Teknoloji ve dosya haritası

Frontend ve backend ayrı npm paketleridir; kökte ortak npm script'i yoktur. İkisi de JavaScript ve ES modules kullanır. Frontend React/JSX, Vite, `@vitejs/plugin-react`, `lucide-react`, global CSS ve React hook'larıyla çalışır. Backend Node.js, Express, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`, `cookie-parser` ve `dotenv` kullanır. TypeScript, Redux, React Router, Tailwind ve ORM yoktur.

Kesin bağımlılık sürümleri için ilgili `package-lock.json` dosyasını oku; `package.json` içindeki `latest` bir sürüm numarası değildir.

| Dosya | Sorumluluk |
| --- | --- |
| `frontend/src/main.jsx` | React kökü, StrictMode ve global CSS |
| `frontend/src/App.jsx` | Oturum başlangıcı, portföy, yardımcı bileşenler, modallar, presetler, yerel kayıt aktarımı |
| `frontend/src/AuthScreen.jsx` | Giriş/kayıt formu ve istek durumu |
| `frontend/src/styles.css` | Tasarım değişkenleri, bileşen stilleri, responsive ve hareket kuralları |
| `frontend/src/api/client.js` | Ortak JSON istekleri, cookie gönderimi, `ApiError` |
| `frontend/src/api/auth.js`, `frontend/src/api/assets.js` | Auth ve varlık API çağrıları |
| `frontend/src/api/lookups.js` | Birim ve sembol lookup listesi |
| `frontend/src/api/prices.js` | Piyasa istekleri, quote dönüşümü, `PriceRequestError` |
| `frontend/src/hooks/useMarketPrices.js` | Fiyat yenileme, snapshot, değişim ve görünürlük takibi |
| `frontend/vite.config.js` | React eklentisi, geliştirme/preview proxy'leri |
| `frontend/nginx.conf`, `frontend/Dockerfile` | Docker arayüz imajı; nginx `/api/` isteklerini backend'e iletir |
| `backend/src/index.js` | Express kurulumu, health endpoint'i, route bağlama, hata middleware'i |
| `backend/src/altinProxy.js` | Docker/doğrudan API için `GET /api/altin` → altinapi; anahtar sunucuda kalır |
| `backend/Dockerfile`, `docker-compose.yml` | nginx + Express paketleme; geliştirme hâlâ iki yerel sunucu |
| `backend/src/auth.js` | JWT imzalama/doğrulama, cookie oluşturma/silme |
| `backend/src/middleware/requireAuth.js` | Cookie/token doğrulama, DB'den kullanıcı yükleme, `req.user` |
| `backend/src/routes/auth.js`, `backend/src/routes/assets.js` | İstek doğrulama, auth ve kullanıcıya bağlı CRUD |
| `backend/src/routes/lookups.js` | `units` / `symbols` okuma |
| `backend/src/seedLookups.js` | Açılışta birim ve 66 altinapi sembolü + TRY doldurma |
| `backend/src/db.js`, `backend/src/schema.sql` | SQLite bağlantısı, başlangıç şeması ve indeks |

## 3. Entity'ler ve veri sözleşmeleri

### User / `users`

| Alan | SQLite tanımı |
| --- | --- |
| `id` | `TEXT PRIMARY KEY`; backend UUID üretir |
| `email` | `TEXT NOT NULL UNIQUE` |
| `password_hash`, `name`, `created_at` | `TEXT NOT NULL` |

E-posta trim edilir ve küçük harfe çevrilir. Kayıtta ad en az 2, şifre en az 8 karakterdir; şifre bcrypt ile hash'lenir. Dışarı verilen kullanıcı nesnesi yalnızca `{ id, email, name }` içerir. `password_hash` istemciye gönderilmez.

### Asset / `assets`

| Alan | SQLite tanımı |
| --- | --- |
| `id` | `TEXT PRIMARY KEY`; backend UUID üretir |
| `user_id` | `TEXT NOT NULL`; `users(id)` foreign key, `ON DELETE CASCADE` |
| `name`, `code`, `unit`, `icon`, `color` | `TEXT NOT NULL` |
| `amount`, `price`, `ask` | `REAL NOT NULL DEFAULT 0` |
| `preset_key` | Nullable `TEXT` |
| `created_at`, `updated_at` | `TEXT NOT NULL`; uygulama ISO zaman damgası üretir |

Bir kullanıcı birden fazla varlığa sahiptir. `user_id` üzerinde `idx_assets_user` indeksi vardır. Kullanıcı/kod çiftinde unique kısıtı yoktur; aynı kodun tek kaydı olduğunu varsayma.

API nesnesi `{ id, name, code, unit, amount, icon, color, key, price, ask, change }` biçimindedir. `preset_key`, API'de `key` olur; `user_id` ve zaman damgaları dışarı verilmez. Backend `change: 0` döndürür; piyasa değişimi frontend'de hesaplanır, DB sütunu değildir.

Yeni oluşturmada `code` `symbols` tablosunda, `unit` `units` tablosunda olmalıdır. Mevcut kayıtlara FK yoktur; eski `VAR` / `TL` satırları durur.

### Unit / `units`

| Alan | SQLite tanımı |
| --- | --- |
| `value` | `TEXT PRIMARY KEY`; `adet`, `kilo`, `gram` |
| `label` | `TEXT NOT NULL`; Adet, Kilo, Gram |

### Symbol / `symbols`

| Alan | SQLite tanımı |
| --- | --- |
| `code` | `TEXT PRIMARY KEY`; altinapi sembolü veya `TRY` |
| `description`, `category` | `TEXT NOT NULL` |

Uygulama açılışında `seedLookups` `INSERT OR REPLACE` ile 3 birim, 66 altinapi sembolü ve `TRY` yazar. Canlı altinapi’den sembol listesi çekilmez.

### Kalıcı olmayan nesneler

- **Quote:** `{ symbol, bid, ask, timestamp, stale }`; hook `change` ekler. Sembole göre `Map` içinde tutulur, SQLite tablosu değildir.
- **Preset:** `{ key, name, code, unit, price, ask, icon, color }`; `App.jsx` içindeki frontend tanımıdır, ayrı tablo değildir.

## 4. Korunacak iş kuralları

- `TRY` için `price` ve `ask` her zaman `1` olmalıdır; backend oluşturma/güncellemede bunu uygular.
- `price` alış/bid, `ask` satış fiyatıdır. Varlık değeri `amount * price`, portföy toplamı bu değerlerin toplamıdır.
- Miktar negatif olamaz. Mevcut backend `Math.max(0, Number(value) || 0)` kullanır; bunu kapsamlı sayısal doğrulama olarak yorumlama.
- Oluşturmada kod trim edilir ve büyük harfe çevrilir; ad, kod ve birim zorunludur. Yeni kayıtta kod `symbols`, birim `units` listesinde olmalıdır. Serbest `VAR` kodu artık oluşturulmaz.
- Frontend eski kod eşleştirmeleri: `XAU`/`GA` → `ALTIN`, `USD` → `USDTRY`, `EUR` → `EURTRY`. Bunlar DB şema migration'ı değildir.
- Canlı fiyat bulunan veya TRY olan varlıkların fiyat alanları arayüzde kilitlenir. Canlı fiyat bulunamadığında uygun akışlarda manuel alış/satış girilebilir. Bu UI kilidini backend yetkilendirmesi gibi değerlendirme.
- `change`, hook açılırken okunan yerel bid snapshot'ına göre yüzde farktır. Snapshot boşsa ilk başarılı sonuç karşılaştırma tabanı olur; bu taban hook boyunca sabit kalır. Her başarılı yenileme sonraki açılış için snapshot yazar.
- `recordedChange` mevcutta `sum(amount * price * ((change || 0) / 100))` ile hesaplanır ve “son kayda göre” gösterilir. Bunu günlük getiri, tarihsel portföy performansı veya gerçekleşmiş kâr/zarar olarak sunma.
- Türkçe içerik, `tr-TR` sayı/zaman biçimi ve `TRY` para birimini koru. Para gösterimi en fazla 2, miktar gösterimi en fazla 4 ondalık kullanır; gösterim yuvarlamasını saklanan veriye uygulama.

## 5. API ve güvenlik

| Yöntem ve yol | Sözleşme |
| --- | --- |
| `GET /api/health` | `{ ok: true }` |
| `POST /api/auth/register` | `{ name, email, password }` → 201, `{ user }` ve oturum cookie'si |
| `POST /api/auth/login` | `{ email, password }` → `{ user }` ve oturum cookie'si |
| `POST /api/auth/logout` | Cookie silinir, `{ ok: true }` |
| `GET /api/auth/me` | `requireAuth` ile `{ user }` |
| `GET /api/lookups` | `requireAuth` ile `{ units, symbols }` |
| `GET /api/assets` | Kullanıcının kayıtları, oluşturulma sırasıyla `{ assets }` |
| `POST /api/assets` | Yeni kayıt → 201, `{ asset }`; sahiplik `req.user.id` üzerinden atanır; geçersiz kod/birim 400 |
| `PATCH /api/assets/:id` | `amount`, `price`, `ask` güncelleme → `{ asset }` |
| `DELETE /api/assets/:id` | Silme → `{ ok: true }` |

- `PATCH` genel metadata düzenleme endpoint'i değildir; mevcutta ad/kod/birim/ikon/renk düzenlemez.
- Varlık route'larının tamamı `requireAuth` ile korunur. Listelemede kullanıcı filtresini, oluştururken sunucudan sahip atamayı, güncelleme/silmede sahiplik kontrolünü koru. Mevcut update/delete: bulunamazsa 404, başka kullanıcıya aitse 403; oturumsuz erişim 401'dir.
- SQL sorgularında parametre bağlama kullan; kullanıcı girdisini SQL metnine birleştirme. Güncelleme/silmede `id` ve `user_id` koşullarını koru.
- JWT'nin `sub` alanı kullanıcı ID'sidir; token ömrü 7 gündür. `bolkese_token` cookie'si HttpOnly, SameSite=Lax, path=/ ve 7 günlük maxAge ile oluşturulur. Ortak frontend istemcisi `credentials: 'include'` kullanır.
- Uygulamanın tanımlı hata yanıtları `{ error: string }` biçimindedir; HTTP durumlarını ve Türkçe mesajları istemciyle uyumlu tut.
- `JWT_SECRET` ve `ALTINAPI_KEY` değerlerini kaynak koda, tarayıcı paketine, Docker imaj katmanına, loglara veya belgelere yazma. JWT'yi localStorage'a taşıma. `.env` dosyaları, backend `data` dizini ve bağımlılıklar ilgili `.gitignore` dosyalarında dışlanır; örnek ortam dosyaları izlenir. Compose kök `.env` üzerinden `JWT_SECRET` ve `ALTINAPI_KEY` okur.
- Mevcut cookie ayarlarında `secure` yoktur; ayrıca rate limiting ve özel CSRF token mekanizması uygulanmış değildir. Bu eksikleri uygulanmış güvenlik özellikleri gibi belgelememe dikkat et; ilgili güvenlik görevlerinde ayrıca değerlendir.

## 6. Piyasa entegrasyonu ve veri kalıcılığı

- `frontend/src/api/prices.js`, toplu `/api/altin/prices` ve tekil `/api/altin/prices/:symbol` çağrılarını yapar. Tekil sorguda 404, `null` olur; 401/403/429/503 için ayrı hata mesajları vardır.
- Vite, `/api/altin` yolunu `https://altinapi.com/api/v1` altına yönlendirir; `ALTINAPI_KEY` proxy tarafında `X-API-Key` başlığına eklenir. Anahtarı `VITE_` değişkeniyle tarayıcıya açma.
- Docker'da Vite yoktur; nginx tüm `/api/` isteklerini Express'e verir. Express `GET /api/altin` yolunu aynı altinapi adresine iletir. Yerel geliştirmede Vite `/api/altin` eşleşmesini önce tutmaya devam eder.
- Diğer `/api` çağrıları `http://localhost:4000` adresine gider. Daha özel `/api/altin` eşleşmesini önce tut. Backend portu değişirse sabit proxy hedefini de değerlendir.
- `useMarketPrices` ilk yüklemede ve 45 saniyelik aralıklarla yeniler. `visibilitychange` gizlenmede zamanlayıcıyı durdurur, görünür olunca yenileyip başlatır. Effect cleanup, hata, yükleniyor, gecikmeli veri ve manuel yenileme davranışlarını koru.
- Canlı fiyatlar React state'ini günceller; her fiyat yenilemesi SQLite'a yazılmaz. Vite dev/preview proxy ayarları üretim dağıtımının sağlandığı anlamına gelmez; paketleme `docker compose` (nginx + Express) iledir.
- DB dosyası `backend/data/bolkese.sqlite` altında oluşturulur; WAL ve foreign key desteği açıktır. `schema.sql` başlangıçta çalıştırılır. `CREATE TABLE IF NOT EXISTS` mevcut tabloları dönüştürmez; şema değişikliği için veriyi koruyan açık migration adımları gerekir. Veritabanını silerek çözüm üretme.
- `bolkese-assets-v2`, eski localStorage varlıklarını hesaba aktarmak içindir. Sunucudan boş liste gelirse kayıtlar sırayla oluşturulur; yerel anahtar tüm aktarım tamamlanınca silinir. İşlem atomik veya idempotent değildir; kısmi başarısızlık/yeniden denemede mükerrer kayıt riski vardır.
- `bolkese-quotes-snapshot-v1` yalnızca fiyat karşılaştırma snapshot'ıdır. Kullanıcıya ait varlıkların ana kalıcılık kaynağı SQLite'tır.

## 7. Kod ve arayüz geliştirme kuralları

- JavaScript/JSX'te ES modules, iki boşluk girinti, tek tırnak ve noktalı virgülsüz mevcut biçemi takip et. Backend yerel import'larında `.js` uzantısını koru.
- Görevin gerektirmediği framework, ORM, state/CSS kütüphanesi veya kapsamlı mimari dönüşüm ekleme. API sözleşmesi değiştiğinde backend ve frontend tüketicilerini birlikte ele al.
- UI değişikliğinde ilgili JSX ve CSS sınıflarını birlikte incele. Mevcut CSS değişkenlerini, Lucide ikonlarını, `IconBadge` ve buton sınıflarını yeniden kullan. Yeni varlık türünde `PRESETS`, `iconMap` ve gerekiyorsa `MARKET_WATCHLIST` uyumunu kontrol et.
- Türkçe metinleri, açık yüzeyleri, mevcut vurgu renklerini ve responsive davranışı koru. Eşikler 1060, 820, 640 px; dar ekran tabanı 320 px'dir.
- Form etiketleri, ikon butonu erişilebilir adları, focus stilleri, modal Escape/dışarı tıklama davranışı, gövde kaydırma kilidi ve reduced-motion desteğini koru.
- Modalda dialog/aria işaretlemeleri vardır; tam odak hapsetme ve önceki odağa dönüş mekanizması mevcut değildir. Eksik erişilebilirlik özelliklerini uygulanmış gibi anlatma.

## 8. Çalıştırma ve doğrulama

Komutları belirtilen paket dizininde çalıştır; iki geliştirme sunucusu için ayrı terminal kullan. Ortam dosyası yoksa ilgili `.env.example` dosyasını temel al; mevcut `.env` değerlerini ezme.

| Çalışma dizini | Komut | Amaç |
| --- | --- | --- |
| `backend` | `npm ci` | Kilit dosyasına göre bağımlılık kurulumu |
| `backend` | `npm run dev` | `node --watch src/index.js` |
| `backend` | `npm start` | `node src/index.js` |
| `frontend` | `npm ci` | Kilit dosyasına göre bağımlılık kurulumu |
| `frontend` | `npm run dev` | Vite geliştirme sunucusu |
| `frontend` | `npm run build` | Üretim derlemesi |
| `frontend` | `npm run preview` | Derlenen frontend'i yerel görüntüleme (Docker dağıtımı değildir) |
| kök | `docker compose up --build` | nginx `:8080` + Express; SQLite named volume |

`backend/.env`: `JWT_SECRET` zorunludur, `PORT` varsayılanı 4000'dir. `frontend/.env`: `ALTINAPI_KEY` yerel Vite fiyat proxy'si içindir. Docker'da aynı anahtar kök `.env` ile backend konteynerine gider. Geliştirme adresleri API için `http://localhost:4000`, frontend için varsayılan `http://localhost:5173`'tür; Compose arayüzü `http://localhost:8080`'dir.

Mevcut kilit dosyalarında Vite 8.3.1 ve React eklentisi Node `^20.19.0 || >=22.12.0`; better-sqlite3 12.11.1 ise `20.x || 22.x || 23.x || 24.x || 25.x || 26.x` ister. İki koşulu birlikte sağlayan bir sürüm kullan; bağımlılıklar değiştiğinde engine alanlarını yeniden doğrula. Bu, makinede kurulu Node sürümünün doğrulandığı anlamına gelmez.

Tanımlı test/lint script'i yoktur; `npm test` veya `npm run lint` uydurma. Değişikliğe uygun kontrolleri seç:

- Frontend kodu değiştiğinde `frontend` dizininde `npm run build` çalıştır.
- Backend JavaScript değiştiğinde depo kökünden ilgili dosya için `node --check backend/src/routes/assets.js` benzeri sözdizimi kontrolü yap; bunun işlevsel test olmadığını belirt.
- Auth/API değişikliğinde kayıt/giriş/çıkış, oturumsuz erişim, farklı kullanıcının varlığına erişim, CRUD ve hata yanıtlarını doğrula. Ayrı test ortamı/verisi kullan; gerçek kullanıcı verisini değiştirme. Mevcut backend başlatıldığında sabit DB yolunu açtığını dikkate al.
- UI değişikliğinde boş/dolu portföy, TRY sabiti, manuel/canlı fiyat, hata/gecikme, miktar güncelleme/silme, bakiye gizleme, modal ve klavye akışlarını kontrol et. Responsive eşiklerin iki yanında ve dar mobil ekranda taşma/yerleşimi incele.
- Yalnızca belge değişikliklerinde kaynaklarla tutarlılık, yollar, komutlar ve diff kontrolü yeterlidir; gereksiz kurulum veya DB başlatma yapma.
- Sonuçta neyin değiştiğini, yapılan kontrolleri ve kalan sınırları kısa raporla. Yapılmayan veya engellenen build, tarayıcı ve işlevsel kontrolleri yapılmış gibi sunma.
